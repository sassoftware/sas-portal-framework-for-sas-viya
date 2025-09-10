/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generates a Pane for each page
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} layout - The full content of portal-page-layout.json for each page
 * @param {HTMLDivElement} portalTabContainer - A HTML Div Element that will contain the Tabs for each pane
 * @param {boolean} active - If true it is the first Pane and will be activated and shown
 * @param {Object} interfaceText - Contains all of the static language interface
 */
function generatePanes(
  VIYAHOST,
  layout,
  portalTabContainer,
  active,
  interfaceText
) {
  // Create Tab List Element
  let pagePane = document.createElement('div');
  pagePane.setAttribute(
    'class',
    `tab-pane fade ${active ? 'active show' : ''}`
  );
  pagePane.setAttribute('id', `${layout?.general?.shorthand}-pane`);
  pagePane.setAttribute('role', 'tabpanel');
  pagePane.setAttribute('aria-labelledby', layout?.general?.shorthand);
  pagePane.setAttribute('tabindex', '0');

  // Add a heading to the page
  if (layout?.general?.showNameOnPage) {
    let pageContent = document.createElement('div');
    pageContent.setAttribute('class', 'container-fluid text-center fs-1');
    pageContent.setAttribute('id', `${layout?.general?.shorthand}-content`);
  
    pageContent.innerText = layout.general.name;
    pagePane.appendChild(pageContent);
  }
  portalTabContainer.appendChild(pagePane);

  generatePages(VIYAHOST, layout, pagePane, interfaceText);
}
