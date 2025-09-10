/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a copy of the report
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} reportUUID - Only the UUID of the report that you want copied
 * @param {String} targetParentFolderURI - The full /folders/folders URI of the target parent folder
 * @param {String} resultNameConflict - Optinal, default is rename - other allowed: abort and replace
 * @returns {Promise/Object of Folder} - Returns a Promise that should resolve into the copied report response
 */
async function copyReport(
    VIYAHOST,
    reportUUID,
    targetParentFolderURI,
    resultNameConflict = 'rename'
) {
    let COPYREPORTRESPONSE = await fetch(
        `${VIYAHOST}/visualAnalytics/reports/${reportUUID}/copy`,
        {
            // mode: 'no-cors',
            method: 'put',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: `{"resultFolder":"${targetParentFolderURI}","resultNameConflict":"${resultNameConflict}"}`,
            credentials: 'include',
            redirect: 'follow',
        }
    );
    if (!COPYREPORTRESPONSE.ok) {
        if (
            COPYREPORTRESPONSE.status === 403 &&
            COPYREPORTRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = COPYREPORTRESPONSE.headers.get('x-csrf-header');
            let t = COPYREPORTRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            COPYREPORTRESPONSE = await fetch(
                `${VIYAHOST}/visualAnalytics/reports/${reportUUID}/copy`,
                {
                    method: 'put',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    body: `{"resultFolder":"${targetParentFolderURI}","resultNameConflict":"${resultNameConflict}"}`,
                    credentials: 'include',
                    redirect: 'follow',
                }
            );
        }
    }
    return COPYREPORTRESPONSE;
}