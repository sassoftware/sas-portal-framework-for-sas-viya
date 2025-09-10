/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generate a Tab for each Page in the Portal
 * @param {Object} layout - General attribute content of the portal-page-layout.json for each page
 * @param {HTMLUListElement} portalNavBar - A HTML UL List Element that will contain the Portal Tab Bar
 * @param {boolean} active - If true it is the first Tab and will be activated
 */
function generateTabs(general, portalNavBar, active) {
  // Create Tab List Element
  let pageTab = document.createElement('li');
  pageTab.setAttribute('class', 'nav-item');
  pageTab.setAttribute('role', 'presentation');

  let button = document.createElement('button');
  button.setAttribute('class', `nav-link ${active ? 'active' : ''}`);
  button.setAttribute('id', general?.shorthand);
  button.setAttribute('data-bs-toggle', 'tab');
  button.setAttribute('data-bs-target', `#${general?.shorthand}-pane`);
  button.setAttribute('type', 'button');
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', `${general?.shorthand}-pane`);
  button.setAttribute('aria-selected', 'true');
  button.innerText = general?.name;

  pageTab.appendChild(button);
  portalNavBar.appendChild(pageTab);
}
