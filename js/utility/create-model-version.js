/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a new SAS Model Manager model
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - The ID of the model for which the version should be increased
 * @param {String} versionUpdateType - Indicate how the version should be increased, can be minor or major. Default: minor
 * @returns {Promise/Object of Model} - Returns a Promise that should resolve into the model information
 */
async function createModelVersion(
    VIYAHOST,
    modelID,
    versionUpdateType = 'minor'
) {
    let CREATEMODELVERSIONRESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/modelVersions`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/vnd.sas.models.model.version',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify({Option: versionUpdateType}),
            redirect: 'follow',
        }
    );
    if (!CREATEMODELVERSIONRESPONSE.ok) {
        if (
            CREATEMODELVERSIONRESPONSE.status === 403 &&
            CREATEMODELVERSIONRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = CREATEMODELVERSIONRESPONSE.headers.get('x-csrf-header');
            let t = CREATEMODELVERSIONRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            CREATEMODELVERSIONRESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/models/${modelID}/modelVersions`,
                {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/vnd.sas.models.model.version+json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify({Option: versionUpdateType}),
                    redirect: 'follow',
                }
            );
        }
    }
    let CREATEMODELRESPONSVERSIONEJSON = await CREATEMODELVERSIONRESPONSE.json();
    return CREATEMODELRESPONSVERSIONEJSON;
}
