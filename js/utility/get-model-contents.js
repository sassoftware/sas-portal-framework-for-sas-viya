/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of Model Manager project models
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - UUID of the Model Manager project
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @returns {Promise/Array of Model Manager Project Models} - Returns a Promise that should resolve into a list of Model Manager Project Models
 */
async function getModelContents(
    VIYAHOST,
    modelID,
    start = 0,
    limit = 100
) {
    let modelContents = [];

    // Call the contents of a model
    const modelContentsResponse = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/contents?start=${start}&limit=${limit}`,
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
    const modelContentsItems = await modelContentsResponse.json();
    for (const modelContent of modelContentsItems?.items) {
        let currentModelContent = {};
        currentModelContent['id'] = modelContent?.id;
        currentModelContent['name'] = modelContent?.name;
        currentModelContent['role'] = modelContent?.role;
        currentModelContent['fileURI'] = modelContent?.fileUri;
        modelContents.push(currentModelContent);
    }
    /*
    The API endpoint currently doesn't respect the start parameter and rather always returns all items
    // Make more calls if more projects exist
    if (modelContentsItems?.items?.length > 0) {
        let startCounter = modelContentsItems?.start + limit;
        const additionalModels = await getModelContents(
            VIYAHOST,
            modelID,
            startCounter,
            limit
        );
        modelContents.push(...additionalModels);
    }
    */
    return modelContents;
}