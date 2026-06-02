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

// Initialize application state from config
initAppState(config);

// Set the portal name in the navbar
const portalNameEl = document.getElementById('PORTALNAME');
if (portalNameEl) {
  portalNameEl.innerText = config.portalName;
}

const portalContainer = document.getElementById('SASPORTAL');
const loginButton = document.getElementById('SASLOGIN') as HTMLButtonElement;

if (portalContainer && loginButton) {
  authWithViya(loginButton, portalContainer);
}

// Initialize tab deep-linking
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTabsAndDeeplinks);
} else {
  initializeTabsAndDeeplinks();
}
