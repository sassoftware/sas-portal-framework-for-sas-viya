/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authenticate with Viya enables you to Authenticate with SAS Viya using the SAS Logon Manager
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {HTMLDivElement} SASLOGIN - A HTML Div Element that contains the Login Button
 * @param {String} portalFolderURI - The full URI for the folder that contains all Portal Use Cases(e.g. /folders/foldesr/<Folder-URI>)
 * @param {HTMLDivElement} portalContainer - A HTML Div Element that will contain the Portal
 */
async function authWithViya(
    VIYAHOST,
    SASLOGIN,
    portalFolderURI,
    portalContainer
) {
    const instance = sasAuthBrowser.createCookieAuthenticationCredential({
        url: VIYAHOST,
    });

    try {
        // Before calling any SAS Viya API endpoints, first ensure that a user is authenticated.
        await instance.checkAuthenticated();

        // Replace Login with User Profile Image
        addUserProfile(VIYAHOST, SASLOGIN);
        // Generate the Portal Content
        generatePortal(VIYAHOST, portalFolderURI, portalContainer);
    } catch {
        // NOTE: A button is used so that the browser does not block the popup.
        SASLOGIN.onclick = async () => {
            // Open a popup and navigate to the logon endpoint.
            // Once the user has logged in, the popup will automatically close.
            await instance.loginPopup();

            // Replace Login with User Profile Image
            addUserProfile(VIYAHOST, SASLOGIN);
            // Generate the Portal Content
            generatePortal(VIYAHOST, portalFolderURI, portalContainer);
        };
    }
}
