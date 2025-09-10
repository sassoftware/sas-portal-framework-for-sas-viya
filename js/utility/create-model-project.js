/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a new SAS Model Manager project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} projectDefinition - The definition of the SAS Model Manager project - for supported arguments see: https://developers.sas.com/rest-apis/modelRepository-v8?operation=createProject
 * @returns {Promise/Object of Project} - Returns a Promise that should resolve into the project information
 */
async function createModelProject(
    VIYAHOST,
    projectDefinition
) {
    let CREATEPROJECTRESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/projects`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify(projectDefinition),
            redirect: 'follow',
        }
    );
    if (!CREATEPROJECTRESPONSE.ok) {
        if (
            CREATEPROJECTRESPONSE.status === 403 &&
            CREATEPROJECTRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = CREATEPROJECTRESPONSE.headers.get('x-csrf-header');
            let t = CREATEPROJECTRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            CREATEPROJECTRESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/projects`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify(projectDefinition),
                    redirect: 'follow',
                }
            );
        }
    }
    let CREATEPROJECTRESPONSEJSON = await CREATEPROJECTRESPONSE.json();
    return CREATEPROJECTRESPONSEJSON;
}
