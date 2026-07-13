/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authenticate with Viya using the SAS Logon Manager via the SAS Auth Browser SDK.
 */

import { getAppState } from '../state/app-state';
import { addUserProfile } from './user-profile';
import { generatePortal } from './portal-generator';

export async function authWithViya(
  loginButton: HTMLButtonElement,
  portalContainer: HTMLElement
): Promise<void> {
  const { config } = getAppState();

  const instance = sasAuthBrowser.createCookieAuthenticationCredential({
    url: config.viyaHost,
  });

  const renderPortal = () => {
    addUserProfile(loginButton);
    generatePortal(portalContainer).catch((error) => {
      console.error('Failed to generate the portal.', error);
    });
  };

  try {
    await instance.checkAuthenticated();
    renderPortal();
  } catch {
    loginButton.onclick = async () => {
      await instance.loginPopup();
      renderPortal();
    };
  }
}
