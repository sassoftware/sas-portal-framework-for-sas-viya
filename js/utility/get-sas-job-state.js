/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Get the state of a SAS Job Project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} sasSessionID  - The SAS Session ID in which the SAS Jobs runs
 * @param {String} sasJobID  - The SAS Job ID of which you want the state
 * @param {String} ETag - Optional ETag to synchronously wait for the job to change state, empty by default
 *
 * @returns {Promise/String} - Returns a promise that if successfull contains the SAS Job State
 */
async function getSASJobState(VIYAHOST, sasSessionID, sasJobID, ETag = '') {
    let STATE;
    if (ETag == '') {
        STATE = await fetch(
            `${VIYAHOST}/compute/sessions/${sasSessionID}/jobs/${sasJobID}/state`,
            {
                // mode: 'no-cors',
                method: 'get',
                headers: {
                    Accept: 'text/plain',
                },
                credentials: 'include',
                redirect: 'follow',
            }
        );
    } else {
        STATE = await fetch(
            `${VIYAHOST}/compute/sessions/${sasSessionID}/jobs/${sasJobID}/state?wait=30}`,
            {
                // mode: 'no-cors',
                method: 'get',
                headers: {
                    Accept: 'text/plain',
                    'If-None-Match': ETag,
                },
                credentials: 'include',
                redirect: 'follow',
            }
        );
    }
    return await STATE.text();
}
