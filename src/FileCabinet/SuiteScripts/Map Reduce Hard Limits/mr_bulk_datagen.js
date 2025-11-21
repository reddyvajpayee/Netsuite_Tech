/**
* =====================================================================================
*  Script Name      : Bulk Data Generator – Map/Reduce
*  Script ID        : mr_bulk_datagen
*  Deployment Name  : Bulk Data Generator MR Deployment
*  Deployment ID    : custdeploy_bulk_datagen_mr
*
*  Description
*  -------------------------------------------------------------------------------------
*  This Map/Reduce script is used purely for **large-scale data generation**.  
*  Its purpose is to create a massive number of customrecord3144 records for testing,
*  demo environments, stress-free data load scenarios, and bulk data availability.
*
*  What this script does:
*  - Generates ~15,00,000 record on multiple runs(3 runs).
*  - Creates customrecord3144 records for each input.
*  - Populates fields custrecord134–custrecord144 with dummy “TEST DATA”.
*  - Does NOT test limits, does NOT accumulate persisted data intentionally,
*    and does NOT attempt to trigger any Map/Reduce errors.
*
*  Use Cases:
*  -------------------------------------------------------------------------------------
*  ✔ Populate environments with bulk sample/test data  
*  ✔ Performance benchmarking for record creation  
*  ✔ Functional testing that requires large data sets  
*  ✔ QA testing of saved searches, workflows, SuiteScripts, integrations  
*
*  Notes:
*  -------------------------------------------------------------------------------------
*  • Safe to run in sandbox only (recommended) due to high data volume.  
*  • Reduce stage is removed intentionally since only map-stage record creation is needed.  
*  • No error simulation or persisted-data manipulation is performed.
*
* =====================================================================================
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/


define(['N/record'], function(record) {

    function getInputData() {

        try {

             let inputs = [];
            // Generate MORE items with SMALLER values that still accumulate
            for (let i = 0; i < 500000; i++) {  // More iterations
                inputs.push({
                    key: i,  // Group items by key
                });
            }
           // return inputs;

            log.debug("Total input lines generated", inputs.length);
            log.debug("Sample input lines", inputs);

            return inputs;

        } catch (e) 
        {
            log.error("GET INPUT DATA ERROR OUTER", e);
        }
    }

    function map(context) {

        try {
            log.debug("Map called", "Key: " + context.key);


            const rec = record.create({
                type: 'customrecord3144',
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
                value:  1
            });

        } catch (e) {
            log.error("MAP ERROR OUTER", e);
            log.error("MAP ERROR", context.error);
            throw e;
        }



    }
    
    function reduce(context) {
        // We intentionally DO NOTHING HERE
        // So values accumulate in persisted data storage\
        try {

            log.debug("Reduce called", "Key: " + context.key + " | Values count: " + context.values.length);
        
            // Write accumulated values to persist them
            let allValues = context.values;
            // Create the custom record
            const rec = record.create({
                type: 'customrecord3144',
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
            log.audit("Record Created", "ID: " + recId);
            
            context.write({
                key: context.key,
                value: recId  // This persists and accumulates
            });
        } catch (e) {
            log.error("REDUCE ERROR OUTER", e);
            log.error("REDUCE ERROR", context.error);

            throw e;
        }



    }

    function summarize(summary) {
        try {
            var type = summary.toString();
            log.audit(type + ' Usage Consumed', summary.usage);
            log.audit(type + ' Concurrency Number ', summary.concurrency);
            log.audit(type + ' Number of Yields', summary.yields);

            log.error('Input Error', summary.inputSummary.error);

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

           
        } catch (error) {
            log.error("SUMMARY ERROR OUTER", error);
            log.error("SUMMARY ERROR", summary.error);
        }
    }

    function generateBlob(sizeBytes) {
        // Use a base string and repeat it
        const baseString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const repeatCount = Math.ceil(sizeBytes / baseString.length);
        const blob = (baseString.repeat(repeatCount)).substring(0, sizeBytes);
        return blob;
        
    }


    return {
        getInputData,
        map,
        //reduce,
        summarize
    };
});