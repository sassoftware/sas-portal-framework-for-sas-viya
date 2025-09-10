/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns a list of available OAuth Clients
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} oauthClientSelectorText - Interface language for the first selector element
 * @param {Integer} start - Optional - Specify from where the request should start - default is 1
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 100
 * @param {Boolean} first - Optional - Specify if it is the first request or a subsquent - default is true
 * @returns {Promise/Array of OAuth Clients} - Returns a Promise that should resolve into a list of available OAuth Clients
 */
async function getAllOAuthClients(
    VIYAHOST,
    oauthClientSelectorText,
    start = 1,
    limit = 100,
    first = true
) {
    let oauthClients = [];

    // If it is the first call, then append an explainer text
    if (first) {
        oauthClients.push({
            value: oauthClientSelectorText,
            innerHTML: oauthClientSelectorText,
        });
    }

    // Call the oauth service for all clients
    const oauthClientResponse = await fetch(
        `${VIYAHOST}/SASLogon/oauth/clients?startIndex=${start}&limit=${limit}`,
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
    const oauthClient = await oauthClientResponse.json();
    for (const client of oauthClient?.resources) {
        let currentClient = {};
        currentClient['value'] = client?.client_id;
        currentClient['innerHTML'] = client?.client_id;
        oauthClients.push(currentClient);
    }

    // Make more calls if more oauth clients exist
    if (oauthClient?.resources?.length > 0) {
        let startCounter = oauthClient?.startIndex + limit;
        const additionalClients = await getAllOAuthClients(
            VIYAHOST,
            oauthClientSelectorText,
            startCounter,
            limit,
            false
        );
        oauthClients.push(...additionalClients);
    }

    return oauthClients;
}
