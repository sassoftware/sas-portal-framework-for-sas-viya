/**
 * Delete a specifc client
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} clientID - The ID of the client that should be deleted
 * @param {String} accessToken - This endpoint requires an accessToken with elevated privilege rights so a token is passed explicitly
 * @returns {Promise/Object of Client deletion Response} - Returns a Promise that should resolve into a message if the client was deleted or not
 */
async function deleteOAuthClient(VIYAHOST, clientID, accessToken) {
    const oauthClientResponse = await fetch(
        `${VIYAHOST}/SASLogon/oauth/clients/${clientID}`,
        {
            // mode: 'no-cors',
            method: 'delete',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Requested-With': 'XMLHttpRequest',
            },
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
