/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a SAS Visual Analytics report
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} resultReportName - The name for the report
 * @param {String} libraryName - Name of the library the table is stored in
 * @param {String} tableName - Name of the table
 * @param {String} parentFolderURI - The full /folders/folders URI of the parent folder - the default is myFolder of the current user
 * @param {String} resultReportNameConflict - What should happen when a report with the name already exists in the folder - default replace
 * @param {String} casServer - Name of the CAS server - default is cas-shared-default
 * @returns {Promise/Object of User Infos} - Returns a Promise that should resolve into a newly created report
 */
async function createReportWithData(
    VIYAHOST,
    resultReportName,
    libraryName,
    tableName,
    folderID = '/folders/folders/@myFolder',
    resultReportNameConflict = 'replace',
    casServer = 'cas-shared-default'
) {
    let CREATEREPORTRESPONSE = await fetch(
        `${VIYAHOST}/reportOperations/reports`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Authorization: `Bearer ${window.TOKENAUTHVALUE}`,
                Accept: 'application/vnd.sas.report.operations.results+json, application/json, application/vnd.sas.report.operations.error+json, application/vnd.sas.error+json',
                'Content-Type':
                    'application/vnd.sas.report.operations.request+json',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            body: `{"version": 1,"resultFolder": "${folderID}","resultReportName": "${resultReportName}","resultNameConflict": "${resultReportNameConflict}","operations": [{"addData": {"cas": {"server": "${casServer}", "library": "${libraryName}", "table": "${tableName}"}}}]}`,
            redirect: 'follow',
        }
    );
    if (!CREATEREPORTRESPONSE.ok) {
        if (
            CREATEREPORTRESPONSE.status === 403 &&
            CREATEREPORTRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = CREATEREPORTRESPONSE.headers.get('x-csrf-header');
            let t = CREATEREPORTRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            CREATEREPORTRESPONSE = await fetch(
                `${VIYAHOST}/reportOperations/reports`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        Authorization: `Bearer ${window.TOKENAUTHVALUE}`,
                        Accept: 'application/vnd.sas.report.operations.results+json, application/json, application/vnd.sas.report.operations.error+json, application/vnd.sas.error+json',
                        'Content-Type':
                            'application/vnd.sas.report.operations.request+json',
                        'X-CSRF-TOKEN': t,
                    },
                    body: `{"version": 1,"resultFolder": "${folderID}","resultReportName": "${resultReportName}","resultNameConflict": "${resultReportNameConflict}","operations": [{"addData": {"cas": {"server": "${casServer}", "library": "${libraryName}", "table": "${tableName}"}}}]}`,
                    redirect: 'follow',
                }
            );
        }
    }

    console.log(CREATEREPORTRESPONSE);
    let CREATEREPORTRESPONSEJSON = await CREATEREPORTRESPONSE.json();
    console.log(CREATEREPORTRESPONSEJSON);
    return CREATEREPORTRESPONSEJSON;
}
