/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Add the Users Profile Image and basic information to the header - replaces the Login Button.
 */

import { getAppState } from '../state/app-state';
import { getUserInfo } from '../api/identity-api';
import { getInterfaceLanguage } from '../i18n/i18n';

export async function addUserProfile(
  loginButton: HTMLElement
): Promise<void> {
  const state = getAppState();
  const userInfo = await getUserInfo();
  const text = await getInterfaceLanguage();

  const userInfoContainer = document.createElement('div');

  const viyaEnvironmentLink = document.createElement('a');
  viyaEnvironmentLink.href = state.config.viyaHost;
  viyaEnvironmentLink.style.paddingRight = '16px';
  viyaEnvironmentLink.innerText = `${text?.goToViyaText}`;
  viyaEnvironmentLink.setAttribute('target', '_blank');
  viyaEnvironmentLink.setAttribute('rel', 'noopener noreferrer');

  const logOutLink = document.createElement('a');
  logOutLink.innerText = `${text?.logOutText} ${userInfo?.name}`;
  logOutLink.href = 'javascript:;';
  logOutLink.title = `${text?.logOutText} ${userInfo?.name}`;
  logOutLink.id = 'logoutLink';

  userInfoContainer.appendChild(viyaEnvironmentLink);
  userInfoContainer.appendChild(logOutLink);

  loginButton.outerHTML = userInfoContainer.outerHTML;

  const logoutEl = document.getElementById('logoutLink');
  if (logoutEl) {
    logoutEl.onclick = async () => {
      const instance = sasAuthBrowser.createCookieAuthenticationCredential({
        url: state.config.viyaHost,
      });
      await instance.logout();
      window.location.reload();
    };
  }

  // Save the user id to app state
  state.userName = userInfo?.id ?? null;
}
