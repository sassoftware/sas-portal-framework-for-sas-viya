/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import type { ObjectDefinition } from '../types';

registerObjectType({
  type: 'vaReport',
  async build(definition: ObjectDefinition, paneID: string): Promise<HTMLElement> {
    const { config } = getAppState();
    const def = definition as Record<string, unknown>;
    const container = document.createElement('div');
    container.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    const viyaURL = (def.viyaURL as string) ?? config.viyaHost;
    const authType = (def.authenticationType as string) ?? 'credentials';
    const reportURI = def.reportURI as string ?? '';
    const height = (def.reportHeight as string) ?? (def.height as string) ?? '600px';

    let reportElement: HTMLElement;
    if (def.pageName) {
      reportElement = document.createElement('sas-report-page');
      (reportElement as HTMLElement & { pageName: string }).pageName = def.pageName as string;
    } else if (def.objectName) {
      reportElement = document.createElement('sas-report-object');
      (reportElement as HTMLElement & { objectName: string }).objectName = def.objectName as string;
    } else {
      reportElement = document.createElement('sas-report');
    }

    reportElement.setAttribute('authenticationType', authType);
    reportElement.setAttribute('url', viyaURL);
    reportElement.setAttribute('reportUri', reportURI);
    reportElement.style.height = height;

    if (def.hideNavigation) {
      reportElement.setAttribute('hideNavigation', '');
    }

    container.appendChild(reportElement);
    return container;
  },
});
