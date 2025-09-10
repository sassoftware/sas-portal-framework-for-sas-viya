/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a new SAS Model Manager model
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} modelDefinition - The definition of the SAS Model Manager model - for supported arguments see: https://developer.sas.com/rest-apis/modelRepository-v8?operation=createModel
 * @returns {Promise/Object of Project} - Returns a Promise that should resolve into the model information
 */
async function createModel(
    VIYAHOST,
    modelDefinition
) {
    let CREATEMODELRESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/models`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/vnd.sas.models.model+json',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify(modelDefinition),
            redirect: 'follow',
        }
    );
    if (!CREATEMODELRESPONSE.ok) {
        if (
            CREATEMODELRESPONSE.status === 403 &&
            CREATEMODELRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = CREATEMODELRESPONSE.headers.get('x-csrf-header');
            let t = CREATEMODELRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            CREATEMODELRESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/models`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/vnd.sas.models.model+json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify(modelDefinition),
                    redirect: 'follow',
                }
            );
        }
    }
    let CREATEMODELRESPONSEJSON = await CREATEMODELRESPONSE.json();
    return CREATEMODELRESPONSEJSON;
}
