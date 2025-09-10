/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of available Compute Contexts or a filtered version
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} query - Optional - Add a query to filter the results
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @returns {Promise/Array of Compute Contexts} - Returns a Promise that should resolve into a list of available Compute Contexts
 */
async function getComputeContext(VIYAHOST, query = '', start = 0, limit = 20) {
    let computeContexts = [];

    // Call the compute service for all the modules
    const commputeContextResponse = await fetch(
        `${VIYAHOST}/compute/contexts?start=${start}&limit=${limit}&filter=${query}`,
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
    const commputeContext = await commputeContextResponse.json();
    for (const context of commputeContext?.items) {
        let currentContext = {};
        currentContext['id'] = context?.id;
        currentContext['name'] = context?.name;
        computeContexts.push(currentContext);
    }

    // Make more calls if more compute contexts exist
    if (commputeContext?.items?.length === limit) {
        let startCounter = commputeContext?.start + limit;
        const additionalContexts = await getAllComputeContexts(
            VIYAHOST,
            query,
            startCounter,
            limit
        );
        computeContexts.push(...additionalContexts);
    }

    return computeContexts;
}
