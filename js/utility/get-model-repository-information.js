/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a the information of Model Manager Project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelRepositoryID - The UUID of the SAS Model Manager Repository
 * @returns {Promise/Object of Model Manager Repository} - Returns a Promise that should resolve into the definition of the specified SAS Model Manager repostiory
 */
async function getModelRepositoryInformation(
    VIYAHOST,
    modelRepositoryID
) {
    // Call the model repository endpoint to get the model repository information
    const modelRepositoryInformationResponse = await fetch(
        `${VIYAHOST}/modelRepository/repositories/${modelRepositoryID}`,
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
    const modelRepositoryInformationObject = await modelRepositoryInformationResponse.json();
    return modelRepositoryInformationObject;
}
