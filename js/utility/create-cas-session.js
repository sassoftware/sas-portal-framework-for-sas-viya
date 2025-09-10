/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a CAS Session
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} casServer - The CAS server on which the session should be created
 * @returns {String} - returns the CAS Session ID
 */
async function createCASSession(VIYAHOST, casServer) {
    let SESSIONRESPONSE = await fetch(
        `${VIYAHOST}/casManagement/servers/${casServer}/sessions`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
        }
    );
    if (!SESSIONRESPONSE.ok) {
        if (
            SESSIONRESPONSE.status === 403 &&
            SESSIONRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = SESSIONRESPONSE.headers.get('x-csrf-header');
            let t = SESSIONRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            SESSIONRESPONSE = await fetch(
                `${VIYAHOST}/casManagement/servers/${casServer}/sessions`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                }
            );
        }
    }

    let SESSIONJSON = await SESSIONRESPONSE.json();
    return SESSIONJSON?.id;
}
