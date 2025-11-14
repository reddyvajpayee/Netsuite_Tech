/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Vajpayee R
 * 
 * Script Name   : SL_Precise_EmployeePagination_v2
 * Script ID     : customscript_sl_employeepagination
 * Deployment ID : customdeploy_sl_employeepagination
 */

define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/redirect', 'N/url'],
function (ui, search, runtime, redirect, url) {

    function onRequest(context) {
        try {
            log.debug('Suitelet Triggered', `Method: ${context.request.method}`);

            if (context.request.method === 'GET') {

                // Define pagination variables
                var pageSize = 50;
                var currentPage = parseInt(context.request.parameters.page) || 1;
                if (currentPage < 1 || isNaN(currentPage)) currentPage = 1;

                log.debug('Pagination Params', {
                    pageSize: pageSize,
                    currentPage: currentPage
                });

                //Create form
                var form = ui.createForm({
                    title: 'Employee Records — Pagination Demo'
                });

                var pageField = form.addField({
                    id: 'custpage_page_index',
                    type: ui.FieldType.INTEGER,
                    label: 'Page Number'
                });
                pageField.defaultValue = currentPage;
                form.addSubmitButton({ label: 'Go to Page' });

                //pageField.updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN });


                //Header
                form.addField({
                    id: 'custpage_header',
                    type: ui.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue = `
                    <div style="padding:10px 0; font-size:16px; font-weight:600; color:#1a237e;">
                        Explore Employee Data Seamlessly — Powered by runPaged()
                    </div>`;

                // Employee Search
                var empSearch = search.create({
                    type: 'customrecord_employee_record',
                    columns: ['custrecord_employee_id', 'name']
                });

                var pagedData = empSearch.runPaged({ pageSize: pageSize });
                var totalPages = pagedData.pageRanges.length;
                var totalCount = pagedData.count;

                log.debug('Paged Search Info', {
                    totalRecords: totalCount,
                    totalPages: totalPages
                });

                if (currentPage > totalPages) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;

                var pageRange = pagedData.pageRanges[currentPage - 1];
                var page = pagedData.fetch({ index: pageRange.index });

                // 🔹 Build safe URLs for navigation
                var baseUrl = url.resolveScript({
                    scriptId: 'customscript_sl_employeepagination',
                    deploymentId: 'customdeploy_sl_employeepagination'
                });
                var prevUrl = `${baseUrl}&page=${currentPage > 1 ? currentPage - 1 : 1}`;
                var nextUrl = `${baseUrl}&page=${currentPage < totalPages ? currentPage + 1 : totalPages}`;

                log.debug('Navigation URLs', { prevUrl: prevUrl, nextUrl: nextUrl });

                // 🔹 Navigation bar
                var navHtml = `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
                        <div style="font-size:14px;">
                            Showing page <b>${currentPage}</b> of <b>${totalPages}</b>
                            (${totalCount} total employees)
                        </div>
                        <div>
                            <button type="button" style="background:#1976d2;color:white;border:none;padding:6px 12px;
                                border-radius:4px;cursor:pointer;"
                                onclick="window.location='${prevUrl}'">&laquo; Prev</button>
                            <button type="button" style="background:#1976d2;color:white;border:none;padding:6px 12px;
                                border-radius:4px;cursor:pointer;"
                                onclick="window.location='${nextUrl}'">Next &raquo;</button>
                        </div>
                    </div>`;

                form.addField({
                    id: 'custpage_navbar',
                    type: ui.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue = navHtml;

                // 🔹 Sublist
                var sublist = form.addSublist({
                    id: 'custpage_emp_list',
                    type: ui.SublistType.LIST,
                    label: 'Employee Data'
                });

                sublist.addField({
                    id: 'custpage_emp_id',
                    type: ui.FieldType.TEXT,
                    label: 'Employee ID'
                });

                sublist.addField({
                    id: 'custpage_emp_name',
                    type: ui.FieldType.TEXT,
                    label: 'Employee Name'
                });

                var line = 0;
                page.data.forEach(function (result) {
                    sublist.setSublistValue({
                        id: 'custpage_emp_id',
                        line: line,
                        value: result.getValue('custrecord_employee_id') || ''
                    });
                    sublist.setSublistValue({
                        id: 'custpage_emp_name',
                        line: line,
                        value: result.getValue('name') || ''
                    });
                    line++;
                });

                log.debug('Sublist Populated', `Displayed ${line} employee records on page ${currentPage}`);

                // 🔹 Footer
                form.addField({
                    id: 'custpage_footer',
                    type: ui.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue = `
                    <div style="padding-top:10px;text-align:center;color:#455a64;font-size:12px;">
                        Page ${currentPage} of ${totalPages} | Total Records: ${totalCount}
                    </div>`;

                context.response.writePage(form);
                log.debug('Page Rendered Successfully', `Displayed page ${currentPage}`);

            } else {
                // 🔹 POST Redirect
                var newPage = parseInt(context.request.parameters.custpage_page_index) || 1;
                if (newPage < 1) newPage = 1;

                log.debug('POST Request Triggered', `Redirecting to page ${newPage}`);

                redirect.toSuitelet({
                    scriptId: 'customscript_sl_employeepagination',
                    deploymentId: 'customdeploy_sl_employeepagination',
                    parameters: { page: newPage }
                });
            }

        } catch (e) {
            log.error('Error in Suitelet', e);
            throw e;
        }
    }

    return { onRequest: onRequest };
});
