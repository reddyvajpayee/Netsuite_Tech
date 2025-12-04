/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @ScriptName UES_Hide_Sublist_Lines_On_View
 * @ScriptId customscript_ues_hide_sublist_lines_view
 * @DeploymentId customdeploy_ues_hide_sublist_lines_view
 * @Version 1.0.0
 * @Description
 *   User Event Script – Injects Client Script into the form during VIEW mode.
 *
 *   Purpose:
 *     • Ensure the Client Script (CS_Hide_Sublist_Lines_View) is executed
 *       even in VIEW mode, where NetSuite normally does not trigger client scripts.
 *     • Enables UI-only filtering of machine-table sublists based on Department.
 *
 *   Behavior:
 *     • Runs only in beforeLoad and only when context.type === VIEW.
 *     • Dynamically attaches the Client Script using:
 *         context.form.clientScriptModulePath
 *     • No modifications are made to the record or sublists server-side.
 *
 *
 */

define([], function () {

    function beforeLoad(context) {

        try {
            log.debug("debug", "UES_Hide_Sublist_Lines_On_View - beforeLoad started");

            if (context.type === context.UserEventType.VIEW) 
            {
               
                // Attach client script to run in View mode
                context.form.clientScriptModulePath = 'SuiteScripts/Custom Budget/Client Scripts/CS_Hide_Sublist_Lines_View.js';
            }
        } catch (e) {
            // In case log is not available, we silently catch the error
            log.error("Error in UES_Hide_Sublist_Lines_On_View beforeLoad", e.toString());
        }
      
    }

    return { beforeLoad };
});
