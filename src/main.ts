/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Main entry point for the SAS Portal Framework.
 * Initializes app state, authenticates with Viya, and renders the portal.
 */

import { config } from './config';
import { initAppState } from './state/app-state';
import { authWithViya } from './portal/auth';
import { initializeTabsAndDeeplinks } from './portal/deeplink';
import { loadRuntimeConfig } from './portal/runtime-config';

// Import all object builders so they self-register with the object type registry
import './objects/text-object';
import './objects/linklist-object';
import './objects/interactive-content-object';
import './objects/va-report-object';
import './objects/mas-score-object';
import './objects/client-admin-object';
import './objects/run-custom-code-object';
import './objects/scr-score-object';
import './objects/data-product-registry-object';
import './objects/data-product-marketplace-object';
import './objects/prompt-builder-object';
import './objects/rag-builder-object';
import './objects/sas-content-va-report-object';
import './objects/sas-content-job-object';
import './objects/job-definition-object';

async function startPortal(): Promise<void> {
  // Initialize application state from config.json on the web server, falling back to src/config.ts
  const appConfig = await loadRuntimeConfig(config);
  initAppState(appConfig);

  // Set the portal name in the navbar
  const portalNameEl = document.getElementById('PORTALNAME');
  if (portalNameEl) {
    portalNameEl.innerText = appConfig.portalName;
  }

  const portalContainer = document.getElementById('SASPORTAL');
  const loginButton = document.getElementById('SASLOGIN') as HTMLButtonElement;

  if (portalContainer && loginButton) {
    authWithViya(loginButton, portalContainer);
  }
}

startPortal();

// Initialize tab deep-linking
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTabsAndDeeplinks);
} else {
  initializeTabsAndDeeplinks();
}
