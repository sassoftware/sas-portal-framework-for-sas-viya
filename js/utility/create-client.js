/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a new client
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} clientDefinition - The definition of the client that should be created
 * @param {String} accessToken - This endpoint requires an accessToken with elevated privilege rights so a token is passed explicitly
 * @returns {Promise/Object of Client creations Response} - Returns a Promise that should resolve into a message if the client was created or not
 */
async function createOAuthClient(VIYAHOST, clientDefinition, accessToken) {
    const oauthClientResponse = await fetch(
        `${VIYAHOST}/SASLogon/oauth/clients`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: clientDefinition,
        }
    );

    return {
        responseCode:
            oauthClientResponse?.status === 201
                ? '--bs-success, green'
                : '--bs-danger, red',
        responseText: `${oauthClientResponse?.status}${
            oauthClientResponse?.statusText === ''
                ? ''
                : `: ${oauthClientResponse?.statusText}`
        }`,
    };
}
