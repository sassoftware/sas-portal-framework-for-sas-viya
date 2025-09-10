/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of MAS modules
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} masInterfaceText - Contains all of the MAS relevant language interface
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @param {Boolean} first - Optional - Specify if it is the first request or a subsquent - default is true
 * @returns {Promise/Array of MAS Modules} - Returns a Promise that should resolve into a list of MAS modules
 */
async function getAllMasModules(
    VIYAHOST,
    masInterfaceText,
    start = 0,
    limit = 20,
    first = true
) {
    let masModules = [];

    // If it is the first call, then append an explainer text
    if (first) {
        masModules.push({
            value: masInterfaceText?.moduleSelect,
            innerHTML: masInterfaceText?.moduleSelect,
        });
    }

    // Call the MAS service for all the modules
    const moduleResponse = await fetch(
        `${VIYAHOST}/microanalyticScore/modules?start=${start}&limit=${limit}`,
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
    const moduleContents = await moduleResponse.json();
    for (const module of moduleContents?.items) {
        let currentModule = {};
        currentModule['value'] = module?.id;
        currentModule['innerHTML'] = module?.name;
        masModules.push(currentModule);
    }

    // Make more calls if more modules exist
    if (moduleContents?.items?.length > 0) {
        let startCounter = moduleContents?.start + limit;
        const additionalModules = await getAllMasModules(
            VIYAHOST,
            masInterfaceText,
            startCounter,
            limit,
            false
        );
        masModules.push(...additionalModules);
    }

    return masModules;
}
