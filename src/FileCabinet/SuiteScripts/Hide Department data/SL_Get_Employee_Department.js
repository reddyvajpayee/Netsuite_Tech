/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @ScriptName SL_Get_Employee_Department
 * @ScriptId customscript_sl_get_employee_department
 * @DeploymentId customdeploy_sl_get_employee_department
 * @Version 1.0.0
 * @Description
 *   Suitelet (POST Endpoint) – Secure Employee Department Lookup
 *
 *   Purpose:
 *     • Provide a secure server-side endpoint for fetching the logged-in
 *       employee’s Department, since Client Scripts cannot directly access
 *       employee records due to permission/security limitations.
 *
 *   Behavior:
 *     • Accepts only POST requests.
 *     • Receives `employeeId` in JSON body.
 *     • Uses search.lookupFields() to fetch the Department from the
 *       employee record.
 *     • Returns a JSON response: { "department": "<Department Name>" }
 *
 *   Why It's Needed:
 *     • Client Script requires department context to filter sublist lines
 *       in view mode based on department visibility rules.
 *     • Prevents exposing employee or role data directly in the browser.
 *
 *   Response Example:
 *     POST Body:
 *       { "employeeId": 1234 }
 *
 *     JSON Response:
 *       { "department": "Finance" }
 *
 *   Governance:
 *     • Extremely lightweight.
 *
 *   Dependencies:
 *     • Used by Client Script: CS_Hide_Sublist_Lines_View
 *     • Triggered indirectly by User Event: UES_Hide_Sublist_Lines_On_View
 * 
 * 
 */

define(['N/search'], function (search) {

    function onRequest(context) {

        log.debug("debug", "SL_Get_Employee_Department - onRequest started");
        if (context.request.method == 'POST') 
        {

            var req = JSON.parse(context.request.body);
            var employeeId = req.employeeId;

            log.debug("Fetching department for Employee ID: " + employeeId);

            var dept = getEmployeeDepartment(employeeId);

            log.debug("Department found: " + dept);

            var responseBody = {
                department: dept
            };

            context.response.write(JSON.stringify(responseBody));
        }
    }

    function getEmployeeDepartment(empId) {

        try {
            var result = search.lookupFields({
                type: 'employee',
                id: empId,
                columns: ['department']
            });

            // Result returns: { department: [ { value: 'xx', text: 'Dept Name' } ] }
            if (result.department && result.department.length > 0) 
            {
                return result.department[0].text;
            }

            return null;

        } catch (e) {
            log.error("Error fetching department for employee " + empId, e);
            return null;
        }
    }

    return { onRequest };
});
