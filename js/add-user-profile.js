/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add the Users Profile Image and basic information to the header - replaces the Login Button
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {HTMLDivElement} SASLOGIN - A HTML Div Element that contains the Login Button
 */
async function addUserProfile(VIYAHOST, SASLOGIN) {
    let userInfo = await getUserInfo(VIYAHOST);
    let text = await getInterfaceLanguage();

    let userInfoContainer = document.createElement('div');
    let viyaEnvironmentLink = document.createElement('a');
    viyaEnvironmentLink.href = VIYAHOST;
    viyaEnvironmentLink.style.paddingRight = '16px';
    viyaEnvironmentLink.innerText = `${text?.goToViyaText}`;
    viyaEnvironmentLink.setAttribute('target', '_blank');
    viyaEnvironmentLink.setAttribute('rel', 'noopener noreferrer');

    let logOutLink = document.createElement('a');
    logOutLink.innerText = `${text?.logOutText} ${userInfo?.name}`;
    logOutLink.href = 'javascript:;';
    logOutLink.title = `${text?.logOutText} ${userInfo?.name}`;
    logOutLink.id = 'logoutLink';

    userInfoContainer.appendChild(viyaEnvironmentLink);
    userInfoContainer.appendChild(logOutLink);

    SASLOGIN.outerHTML = userInfoContainer.outerHTML;
    document.getElementById('logoutLink').onclick = async () => {
        const instance = sasAuthBrowser.createCookieAuthenticationCredential({
            url: VIYAHOST,
        });
        await instance.logout();
        window.location.reload();
    };

    // Save the user id so its globally accesible
    window.userName = userInfo?.id;
}
