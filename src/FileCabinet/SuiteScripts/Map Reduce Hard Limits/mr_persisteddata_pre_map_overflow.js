/**
* =====================================================================================
*  Script Name      : MR Persisted Data Pre-Map Overflow Test
*  Script ID        : mr_persisteddata_pre_map_overflow
*  Deployment Name  : Persisted Data Pre-Map Test Deployment
*  Deployment ID    : custdeploy_persisteddata_pre_map_overflow
*
*  Description
*  -------------------------------------------------------------------------------------
*  This Map/Reduce script is intentionally designed to reproduce and analyze the
*  "PERSISTED_DATA_LIMIT_FOR_MAPREDUCE_SCRIPT_EXCEEDED" error that occurs **before**
*  the MAP stage executes.
*
*  Why the error occurs BEFORE map():
*  -------------------------------------------------------------------------------------
*  • getInputData() returns a search containing **~13 lakh (1.3 million)** records.
*  • Each record includes many columns (internalid, name, scriptid, custrecordXXX…).
*  • NetSuite internally loads the entire search result set into persisted storage
*    *before invoking map()*.
*
*  NetSuite counts all search results as:
*     → "Total size of all keys and values not yet mapped"
*
*  Since the combined size of all rows + column values exceeds the hard
*  **200 MB persisted data limit**, the script fails immediately upon transitioning
*  from getInputData() to map(), *even though map() never runs*.
*
*  Purpose
*  -------------------------------------------------------------------------------------
*  ✔ Demonstrate how large search result sets affect persisted data usage  
*  ✔ Analyze pre-map persisted storage behavior  
*  ✔ Understand limitations of Map/Reduce for high-volume datasets  
*  ✔ Useful for engineering experiments on M/R scaling behavior  
*
*  Notes
*  -------------------------------------------------------------------------------------
*  • The error happens BEFORE map(), so map/reduce logic is irrelevant to failure.  
*  • This script is not intended for production — sandbox testing only.  
*  • Ideal for studying NetSuite M/R hard limits when handling large searches.  
*
* =====================================================================================
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/

define(['N/record', 'N/search', 'N/log'], function (record, search, log) {

    function getInputData() {
        try {
            return search.create({
                type: "customrecord3144",
                filters: [
                    ["custrecord145", "is", "F"]
                ],
                columns: [
                    "internalid",
                    "name",
                    "scriptid",
                    "custrecord136",
                    "custrecord137",
                    "custrecord138",
                    "custrecord139",
                    "custrecord140",
                    "custrecord141",
                    "custrecord142",
                    "custrecord143",
                    "custrecord134",
                    "custrecord144",
                    "custrecord135",
                    "custrecord145"
                ]
              
            });


        } catch (e) {
            log.error("GET INPUT DATA ERROR", e);
        }
    }

    // ----------------------------------------
    // MAP STAGE → Extract all column values, concat, and emit
    // ----------------------------------------

    function map(context) {
        try {
            const result = JSON.parse(context.value);
            const internalId = result.id;
            const columns = result.values;

            let concatString = "";

            // Loop through all returned columns dynamically
            for (let colName in columns) {
                concatString += (columns[colName] || "") + "|";
            }

            // Remove last pipe
            concatString = concatString.replace(/\|$/, "");

            log.debug("MAP: writing", { key: internalId, value: concatString });

            context.write({
                key: internalId,
                value: concatString
            });

        } catch (e) {
            log.error("MAP ERROR", e);
            throw e;
        }
    }

    // ----------------------------------------
    // REDUCE STAGE → Update record using submitFields()
    // ----------------------------------------

    function reduce(context) {
        try {
            const internalId = context.key;
            const concatString = context.values.join(" || ");

            log.debug("REDUCE: Updating Record", {
                id: internalId,
                concatenatedValue: concatString
            });

            // SubmitFields update
            record.submitFields({
                type: 'customrecord3144',
                id: internalId,
                values: {
                    custrecord145: true                         // example update
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

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

    }

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});
