/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generates a Pane for each page.
 */

import type { PageLayout, InterfaceText } from '../types';
import { generatePages } from './page-generator';

export function generatePanes(
  layout: PageLayout,
  portalTabContainer: HTMLElement,
  active: boolean,
  interfaceText: InterfaceText
): void {
  const pagePane = document.createElement('div');
  pagePane.setAttribute(
    'class',
    `tab-pane fade ${active ? 'active show' : ''}`
  );
  pagePane.setAttribute('id', `${layout?.general?.shorthand}-pane`);
  pagePane.setAttribute('role', 'tabpanel');
  pagePane.setAttribute('aria-labelledby', layout?.general?.shorthand);
  pagePane.setAttribute('tabindex', '0');

  if (layout?.general?.showNameOnPage) {
    const pageContent = document.createElement('div');
    pageContent.setAttribute('class', 'container-fluid text-center fs-1');
    pageContent.setAttribute(
      'id',
      `${layout?.general?.shorthand}-content`
    );
    pageContent.innerText = layout.general.name;
    pagePane.appendChild(pageContent);
  }
  portalTabContainer.appendChild(pagePane);

  generatePages(layout, pagePane, interfaceText);
}
