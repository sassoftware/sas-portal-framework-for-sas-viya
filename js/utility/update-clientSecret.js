/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Update a client secret
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} clientID - The client ID
 * @param {String} clientSecretBody - The new client secret and app definition {"clientId": "myclientid", "secret": "new-secret"}
 * @param {String} accessToken - This endpoint requires an accessToken with elevated privilege rights so a token is passed explicitly
 * @returns {Promise/Object of Client creations Response} - Returns a Promise that should resolve into a message if the client secret was updated or not
 */
async function updateSecretOAuthClient(
    VIYAHOST,
    clientID,
    clientSecretBody,
    accessToken
) {
    const oauthClientResponse = await fetch(
        `${VIYAHOST}/SASLogon/oauth/clients/${clientID}/secret`,
        {
            // mode: 'no-cors',
            method: 'put',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: clientSecretBody,
        }
    );

    return {
        responseCode:
            oauthClientResponse?.status === 200
                ? '--bs-success, green'
                : '--bs-danger, red',
        responseText: `${oauthClientResponse?.status}${
            oauthClientResponse?.statusText === ''
                ? ''
                : `: ${oauthClientResponse?.statusText}`
        }`,
    };
}
