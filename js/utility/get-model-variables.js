/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of Model Manager project models
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - UUID of the SAS Model Manager model
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 1000
 * @returns {Promise/Array of SAS Model Manager Model Variables} - Returns a Promise that should resolve into a list of SAS Model Manager Model Variables
 */
async function getModelVariables(
    VIYAHOST,
    modelID,
    start = 0,
    limit = 1000
) {

    // Get the variables of a model
    const modelVariablesResponse = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/variables?start=${start}&limit=${limit}`,
        {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
    );

    // Parse the response
    const modelVariablesItems = await modelVariablesResponse.json();
    return modelVariablesItems?.items;
}