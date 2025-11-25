/**
* =====================================================================================
*  Script Name      : MR Key & Value Character Limit Test
*  Script ID        : mr_key_value_charlimit_test
*  Deployment Name  : Key Value Char Limit Test Deployment
*  Deployment ID    : custdeploy_key_value_charlimit_test
*
*  Description
*  -------------------------------------------------------------------------------------
*  This Map/Reduce script is intentionally designed to reproduce and demonstrate the
*  following Map/Reduce character limit errors:
*
*      • KEY_LENGTH_IS_OVER_3000_BYTES  
*      • VALUE_LENGTH_IS_OVER_10_MB
*
*  Why these errors occur:
*  -------------------------------------------------------------------------------------
*  • In mapContext.write(), NetSuite imposes strict limits:
*       → Key length must be **< 3000 characters**
*       → Value size must be **< 10 MB**
*
*  • This script deliberately generates:
*       → 3 keys larger than 3000 characters (3.5k+)  
*       → 2 values larger than 10 MB (11 MB)  
*
*  • When the Map stage runs, NetSuite validates each write() and throws:
*         KEY_LENGTH_IS_OVER_3000_BYTES  
*         VALUE_LENGTH_IS_OVER_10_MB
*
*  Purpose
*  -------------------------------------------------------------------------------------
*  ✔ Demonstrate real NetSuite key/value character-size restrictions  
*  ✔ Provide a reproducible sandbox test for M/R write() validation  
*  ✔ Help developers understand hard limits during serialization  
*  ✔ Useful for engineering experiments on how NetSuite handles large payloads  
*
*  Key Learning
*  -------------------------------------------------------------------------------------
*  • Never pass large data inside "key" — keep keys short and simple  
*  • Avoid sending large JSON or concatenated strings as values  
*  • Use record.load(), lookupFields(), or smaller chunks instead of massive strings  
*  • Heavy data → store in custom record / file cabinet, not map/reduce key-values  
*
*  Notes
*  -------------------------------------------------------------------------------------
*  • This script WILL ALWAYS FAIL — it is **intentionally built to hit the errors**  
*  • Do NOT use in production — sandbox only  
*  • Useful for training, demos, and limit validation  
*
* =====================================================================================
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/

define(['N/record', 'N/search', 'N/log'], function (record, search, log) {

    function getInputData() {
        // Just return dummy data – 5 entries
        try {
            
            var inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            log.debug('GET INPUT DATA', 'inputArray: ' + inputArray);
            log.debug("GET INPUT DATA", "Returning input array of length: " + inputArray.length);
            return inputArray;

        } catch (e) {
            log.error("GET INPUT DATA ERROR", e);
        }
    }

    function map(context) {

        try {

            log.debug("MAP STAGE", "Context Value: " + context.value);
            log.debug("MAP STAGE", "Context Key: " + context.key);  
            
            const idx = parseInt(context.value, 10);

            log.debug("REDUCE STAGE", "Processing idx: " + idx);

            // --- Create oversized key ( > 3000 chars ) ---
            const bigKey = 'K'.repeat(3500);     // 3.5k chars → KEY_LENGTH_IS_OVER_3000_BYTES

            // --- Create oversized value ( > 10MB ) ---
            const bigValue = 'V'.repeat(11 * 1024 * 1024);  // 11MB → VALUE_LENGTH_IS_OVER_10_MB

            /**
             * For 5 items: 
             * 1 → hit key error
             * 2 → hit key error
             * 3 → hit key error
             * 4 → hit value error
             * 5 → hit value error
             * 6+ → normal processing
             *      
             */

            switch (idx) {

                case 1:
                case 2:
                case 3:
                    // Oversized key → KEY_LENGTH_IS_OVER_3000_BYTES
                    context.write({
                        key: bigKey,
                        value: "Test small value"
                    });
                    break;

                case 4:
                case 5:
                    // Oversized value → VALUE_LENGTH_IS_OVER_10_MB
                    context.write({
                        key: "NORMAL_KEY_" + idx,
                        value: bigValue
                    });
                    break;
                default:
                    log.debug("REDUCE STAGE", "No action for idx: " + idx);
                    context.write({
                        key: idx,
                        value: "Test Value"
                    });
                    break;
            }

        } catch (e) {
            log.error("MAP ERROR", e);
            throw e;
        }
    }

    function reduce(context) {
        try {

            log.debug("REDUCE STAGE", "Key: " + context.key + ", key : " + context.key);
            log.debug("REDUCE STAGE", "Key: " + context.Values + ", Values : " + context.values);

            
            const rec = record.create({
                type: 'customrecord_persisted_data_record',
                isDynamic: true
            });

            // Set name field = key
            rec.setValue({
                fieldId: 'name',
                value: context.key
            });

            for(let i=134; i<145; i++) 
            {
                log.debug("Setting field custrecord"+i, "TEST DATA");
                
                rec.setValue({
                    fieldId: 'custrecord'+i,
                    value: 'TEST DATA'
                });
            }

            const recId = rec.save();
            log.debug("Record Created", "ID: " + recId);
            
            context.write({
                key: context.key,
                value: context.values
            });

        } catch (e) {
            log.error("REDUCE ERROR", e);
            throw e;
        }
    }

    function summarize(summary) {
        try {
            log.audit("Usage", summary.usage);
            log.audit("Concurrency", summary.concurrency);
            log.audit("Yields", summary.yields);

            var mapErrorCount = 0;
            // Log only the name and description of each error thrown
            summary.mapSummary.errors.iterator().each(
                function(key, error, executionNo) {
                    var errorObject = JSON.parse(error);
                    log.error({
                        title: 'Map error for key: ' + key + ', execution no. ' + executionNo,
                        details: errorObject.name + ': ' + errorObject.message
                    });
                    mapErrorCount++;
                    return true;
                }
            );

            // Log only the name and description of each error thrown.

            var reduceErrorCount = 0;
            summary.reduceSummary.errors.iterator().each(function(key, error, executionNo) {
                var errorObject = JSON.parse(error);
                log.error({
                    title: 'Reduce error for key: ' + key + ', execution no. ' + executionNo,
                    details: errorObject.name + ': ' + errorObject.message
                });
                reduceErrorCount++;

                return true;
            });

            // Calculate and log the total number of errors encountered during the map stage
            
            log.audit({
                title: 'Map & Reduce stage errors',
                details: 'Total number of errors mapErrorCount : ' + mapErrorCount + ' | reduceErrorCount : ' + reduceErrorCount    
            });


            var reduceKeys = [];

            summary.reduceSummary.keys.iterator().each(function (key){
                reduceKeys.push(key);
                return true;
            });

            log.debug({
                title: 'Reduce stage keys',
                details: reduceKeys
            });


            // Create a log entry for each key. The entry shows whether the reduce function was executed successfully for that key.

            summary.reduceSummary.keys.iterator().each(function (key, executionCount, completionState){

                log.debug({
                    title: 'Reduce key ' + key,
                    details: 'Outcome for reduce key ' + key + ': ' + completionState + ' // Number of attempts used: ' + executionCount
                });

                return true;

            });


            var mapKeys = [];

            summary.mapSummary.keys.iterator().each(function (key){
                mapKeys.push(key);
                return true;
            });

            log.debug({
                title: 'Map stage keys',
                details: mapKeys
            });


            // Create a log entry for each key. The entry shows whether the reduce function was executed successfully for that key.

            summary.mapSummary.keys.iterator().each(function (key, executionCount, completionState){

                log.debug({
                    title: 'Map key ' + key,
                    details: 'Outcome for Map key ' + key + ': ' + completionState + ' // Number of attempts used: ' + executionCount
                });

                return true;

            });
        
        }catch (e) { 
            log.error("SUMMARIZE ERROR", e);
        }

    }
    
    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
