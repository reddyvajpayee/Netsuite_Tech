/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @ScriptName CS_Hide_Sublist_Lines_View
 * @ScriptId customscript_cs_hide_sublist_lines_view
 * @DeploymentId customdeploy_cs_hide_sublist_lines_view
 * @Version 1.0.0
 * @Description
 *   Client Script – Dynamic UI Filtering (View Mode Only)
 *
 *   This script hides sublist lines that do not belong to
 *   the logged-in employee’s department. It is triggered
 *   only in VIEW mode and is injected by a User Event Script.
 *
 *   Technical Highlights:
 *     • Calls a Suitelet (POST) to securely fetch
 *       the employee’s department using lookupFields.
 *     • Waits for NetSuite’s machine table to render and
 *       uses DOM operations to evaluate each <tr> row.
 *     • Hides rows where the “Department” column text
 *       does NOT match the employee’s department.
 *     • Administrator (role ID = 3) bypass enabled.
 *     • Zero data manipulation; pure UI masking.
 *
 *   Use Cases:
 *     • Department-based sublist visibility
 *     • Sensitive fields hidden in view-only screens
 *     • Role-driven UI personalization
 *
 *   Notes:
 *     • Works only after being injected via UE beforeLoad.
 *     • Requires Suitelet script: SL_Get_Employee_Department
 */

define(['N/runtime', 'N/search', 'N/https', 'N/url'], function (runtime, search, https, url) {

    try
    {
               
        var userObj = runtime.getCurrentUser();
        log.debug('Internal ID of current user role: ' + userObj.role);    

        var suiteletUrl = url.resolveScript({
                                scriptId: 'customscript_sl_get_employee_department',
                                deploymentId: 'customdeploy_sl_get_employee_department',
                                returnExternalUrl: false
                            });
        try
        {
            var response = https.post({
                url: suiteletUrl,
                body: JSON.stringify({ employeeId: userObj.id }) // current user id
            });
        }
        catch(e){
            log.error("Error in debug log before Suitelet Call", e.toString());
        }
        
        var data = JSON.parse(response.body);
        
        var empDept = data.department;
        console.log("Department from Suitelet =", empDept);

        // pageInit now runs in VIEW mode due to UE override
        if(userObj.role != 3) // Administrator role bypass
        hideOtherDepartments(empDept);
    }
    catch(e)
    {   
        //alert("Error in CS_Hide_Sublist_Lines_View pageInit : "+e.toString());    
        log.error("Error in CS_Hide_Sublist_Lines_View pageInit", e.toString());
    }


    function pageInit(context) 
    {

        try
        {    
      
        }
        catch(e){       
        log.error("Error in CS_Hide_Sublist_Lines_View pageInit", e.toString());
        }
      
    }

   
    function hideOtherDepartments(currentRoleName) 
    {

        // Select all rows in the machine table
        const rows = document.querySelectorAll("tr.uir-machine-row");

        rows.forEach(row => {

            // Find department cell in that row
            const deptCell = row.querySelector("td[data-ns-tooltip='Department']");
            if (!deptCell) return;

            var deptText = deptCell.innerText.trim();

            // Hide if NOT matching current role
            if (deptText !== currentRoleName) {
                row.style.display = "none";
            }
        });
    }



    return { pageInit };
});
