/**
 * Returns information of a specific OAuth Clients
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} oauthClientName - Name of the specific OAuth Client
 * @returns {Promise/Object of OAuth Client Definition} - Returns a Promise that should resolve into an object containing all OAuth Client information
 */
async function getSpecificOAuthClients(VIYAHOST, oauthClientName) {
    // Call the MAS service for all the modules
    const oauthClientResponse = await fetch(
        `${VIYAHOST}/SASLogon/oauth/clients/${oauthClientName}`,
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

    return oauthClient;
}
