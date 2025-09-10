/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a SAS Session - if you use this function you should check if window.SASSESSION already exists, if so use that instead
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} computeContextID - ID of the SAS Compute Context
 * @param {String} sessionName - Name of the Session
 * @param {String} sessionDescription - Optional, Description for the Session
 * @param {Object} sessionAttributes - Optional, specify context attributes as an Object with the attribute name as the key and the value as the value
 * @param {Array of Strings} sessionEnvironmentOptions - Optional, specify an array of SAS System options
 * @param {Array of Strings} sessionEnvironmentAutoexecLines - Optional, specify lines of SAS code to be run as a autoexec
 *
 * @returns {String} - returns the SAS Session ID
 */
async function createSASSession(
    VIYAHOST,
    computeContextID,
    sessionName,
    sessionDescription = '',    
    sessionAttributes = {},
    sessionEnvironmentOptions = [],
    sessionEnvironmentAutoexecLines = []
) {
    let SESSIONRESPONSE = await fetch(
        `${VIYAHOST}/compute/contexts/${computeContextID}/sessions`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',

                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify({
                version: 1,
                name: sessionName,
                description: sessionDescription,
                attributes: sessionAttributes,
                environment: {
                    options: sessionEnvironmentOptions,
                    autoExecLines: sessionEnvironmentAutoexecLines,
                },
            }),
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
                `${VIYAHOST}/compute/contexts/${computeContextID}/sessions`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',

                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        version: 1,
                        name: sessionName,
                        description: sessionDescription,
                        attributes: sessionAttributes,
                        environment: {
                            options: sessionEnvironmentOptions,
                            autoExecLines: sessionEnvironmentAutoexecLines,
                        },
                    }),
                }
            );
        }
    }

    let SESSIONJSON = await SESSIONRESPONSE.json();
    return SESSIONJSON?.id;
}
