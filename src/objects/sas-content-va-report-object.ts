/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import type { ObjectDefinition, InterfaceText } from '../types';

interface ContentFilterValue {
  type: string;
  value: string;
}

interface ContentSelectionItem {
  name: string;
  resource: {
    id: string;
    type: {
      sasType: string;
    };
  };
}

interface SasContentGroupElement extends HTMLElement {
  initialFilterValue: { queryModeFilter: string };
  initialNavigationValue: {
    location: ContentFilterValue;
    locationContextPath: ContentFilterValue[];
    locations: ContentFilterValue[];
  };
}

interface SasContentAreaElement extends HTMLElement {
  onSelect: (value: ContentSelectionItem[]) => void;
}

interface SasReportElement extends HTMLElement {
  reportUri: string;
}

registerObjectType({
  type: 'sasContentVAReport',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const { config } = getAppState();
    const viyaHost = config.viyaHost;
    const def = definition as Record<string, unknown>;
    const scvarInterfaceText = (interfaceText?.sasContentVAReport ?? {}) as Record<string, string>;

    const sasContentVAReportContainer = document.createElement('div');
    sasContentVAReportContainer.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    const sasContentGroup = document.createElement('sas-content-group') as SasContentGroupElement;
    sasContentGroup.id = `${paneID}-obj-${definition?.id}-cg`;
    sasContentGroup.className = 'col-12';
    sasContentGroup.setAttribute('url', viyaHost);
    sasContentGroup.initialFilterValue = {
      queryModeFilter: "or(eq(contentType,'report'),eq(contentType,'folder'))",
    };

    // Check if a folder filter has been specified
    const folderFilter = def?.folderFilter as string | undefined;
    if (folderFilter && folderFilter.length > 0) {
      const folderFilterValue: ContentFilterValue = {
        type: 'folderUri',
        value: folderFilter,
      };
      sasContentGroup.initialNavigationValue = {
        location: folderFilterValue,
        locationContextPath: [folderFilterValue],
        locations: [folderFilterValue],
      };
    } else {
      const sasContentIdentifier: ContentFilterValue = {
        type: 'persistentLocation',
        value: 'root',
      };
      sasContentGroup.initialNavigationValue = {
        location: sasContentIdentifier,
        locationContextPath: [sasContentIdentifier],
        locations: [sasContentIdentifier],
      };
    }

    // VA Report Header
    const sasContentReportName = document.createElement('h3');
    const sasReport = document.createElement('sas-report') as SasReportElement;

    const sasContentArea = document.createElement('sas-content-area') as SasContentAreaElement;
    sasContentArea.id = `${paneID}-obj-${definition?.id}-ca`;
    sasContentArea.setAttribute('url', viyaHost);
    sasContentArea.setAttribute('selection-mode', 'single');
    sasContentArea.setAttribute('initial-selection-index', '0');
    sasContentArea.onSelect = (value: ContentSelectionItem[]) => {
      let reportUri = '';
      if (value && value.length > 0 && value[0]?.resource?.type?.sasType === 'report') {
        if (def?.reportName === 1) {
          sasContentReportName.innerText = value[0].name;
        }
        reportUri = value[0].resource.id;
      } else {
        if (def?.reportName === 1) {
          sasContentReportName.innerText = scvarInterfaceText?.reportNotSelectedText ?? '';
        }
      }
      sasReport.reportUri = reportUri;
    };

    sasContentGroup.appendChild(sasContentArea);

    // VA Report display
    if (def?.reportName === 1) {
      sasContentReportName.id = `${paneID}-obj-${definition?.id}-rn`;
      sasContentReportName.innerText = scvarInterfaceText?.reportNotSelectedText ?? '';
      sasContentGroup.appendChild(sasContentReportName);
    }
    sasReport.id = `${paneID}-obj-${definition?.id}-sr`;
    sasReport.setAttribute('url', viyaHost);
    sasReport.setAttribute('hideNavigation', 'auto');
    sasReport.setAttribute('authenticationType', 'credentials');
    sasReport.style.height = '75vh';
    sasContentGroup.appendChild(sasReport);

    sasContentVAReportContainer.appendChild(sasContentGroup);

    return sasContentVAReportContainer;
  },
});
