/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generate the Portal based on a Target SAS Viya Content Folder.
 */

import { getAppState } from '../state/app-state';
import { getFolderContent } from '../api/folders-api';
import { getFileContent } from '../api/files-api';
import { getInterfaceLanguage } from '../i18n/i18n';
import { generateTabs } from './tab-generator';
import { generatePanes } from './pane-generator';
import type { PortalLayout, FolderMemberReference, PageLayout } from '../types';

export async function generatePortal(
  portalContainer: HTMLElement
): Promise<void> {
  const { config } = getAppState();

  // Add the Navbar to the Portal Container
  const portalNavBar = document.createElement('ul');
  portalNavBar.classList.add('nav', 'nav-tabs');
  portalNavBar.setAttribute('id', 'SASPORTALNAVBAR');
  portalNavBar.setAttribute('role', 'tablist');
  portalContainer.appendChild(portalNavBar);

  // Add the Tab Container to the Portal Container
  const portalTabContainer = document.createElement('div');
  portalTabContainer.setAttribute('class', 'tab-content');
  portalTabContainer.setAttribute('id', 'SASPORTALTABCONTAINER');
  portalContainer.appendChild(portalTabContainer);

  const interfaceText = await getInterfaceLanguage();

  const portalLayout = await getFolderContent(
    `/folders/folders/${config.portalFolderUri}`,
    '?filter=eq(name,"portal-layout.json")'
  );

  // Check if there is a special order or alphabetical is used
  let potentialPages: FolderMemberReference[];
  if (portalLayout && portalLayout.length > 0) {
    const layoutResponse = await getFileContent(portalLayout[0]!.uri);
    const portalPageJSON: PortalLayout = await layoutResponse.json();
    potentialPages = portalPageJSON?.displayOrder ?? [];
  } else {
    potentialPages =
      (await getFolderContent(
        `/folders/folders/${config.portalFolderUri}`,
        '?filter=eq(contentType,folder)&sortBy=name&limit=1000'
      )) ?? [];
  }

  // Get and Generate the actual Portal Content
  let firstTab = true;
  for (const page of potentialPages) {
    const potentialPageContent = await getFolderContent(page?.uri);
    if (!potentialPageContent) continue;

    for (const item of potentialPageContent) {
      if (item?.name === 'portal-page-layout.json') {
        const active = firstTab;
        if (firstTab) firstTab = false;

        const portalPageLayout = await getFileContent(item.uri);
        const layout: PageLayout = await portalPageLayout.json();
        generateTabs(layout.general, portalNavBar, active);
        generatePanes(layout, portalTabContainer, active, interfaceText);
      }
    }
  }
}
