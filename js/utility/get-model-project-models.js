/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of Model Manager project models
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} projectID - UUID of the Model Manager project
 * @param {String} query - Optional - Add a query to filter the results
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @returns {Promise/Array of Model Manager Project Models} - Returns a Promise that should resolve into a list of Model Manager Project Models
 */
async function getModelProjectModels(
    VIYAHOST,
    projectID,
    query = '',
    start = 0,
    limit = 50
) {
    let models = [];

    // Call the model repository project endpoint to get all models
    const modelsResponse = await fetch(
        `${VIYAHOST}/modelRepository/projects/${projectID}/models?start=${start}&limit=${limit}&filter=${query}`,
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
    const modelContents = await modelsResponse.json();
    for (const model of await modelContents?.items) {
        let currentModel = {};
        currentModel['id'] = model?.id;
        currentModel['name'] = model?.name;
        models.push(currentModel);
    }

    // Make more calls if more projects exist
    if (modelContents?.items?.length > 0) {
        let startCounter = modelContents?.start + limit;
        const additionalModels = await getModelProjectModels(
            VIYAHOST,
            projectID,
            query,
            startCounter,
            limit
        );
        models.push(...additionalModels);
    }
    return models;
}
