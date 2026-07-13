/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch } from './http-client';

/**
 * Create a report with data from a CAS table.
 */
export async function createReportWithData(
  resultReportName: string,
  libraryName: string,
  tableName: string,
  folderID: string = '/folders/folders/@myFolder',
  resultReportNameConflict: string = 'replace',
  casServer: string = 'cas-shared-default'
): Promise<unknown> {
  const response = await viyaFetch('/reportOperations/reports', {
    method: 'POST',
    body: JSON.stringify({
      resultReportName,
      resultFolder: folderID,
      resultNameConflict: resultReportNameConflict,
      dataSources: [
        {
          namePattern: 'uniqueName',
          purpose: 'original',
          casResource: {
            server: casServer,
            library: libraryName,
            table: tableName,
          },
        },
      ],
    }),
    contentType: 'application/vnd.sas.report.operations.request+json',
  });
  return response.json();
}

/**
 * Copy a VA report to a target folder.
 */
export async function copyReport(
  reportUUID: string,
  targetParentFolderURI: string,
  resultNameConflict: string = 'rename'
): Promise<Response> {
  return viyaFetch(
    `/visualAnalytics/reports/${reportUUID}/copy`,
    {
      method: 'PUT',
      body: JSON.stringify({
        resultFolder: targetParentFolderURI,
        resultNameConflict,
      }),
    }
  );
}

/**
 * Refresh/reload a full VA report element on the page.
 */
export function refreshVAReport(objectID: string): void {
  const reportElement = document.querySelector(
    `sas-report[id="${objectID}"]`
  ) as HTMLElement & { reloadReport?: () => void } | null;
  if (reportElement?.reloadReport) {
    reportElement.reloadReport();
  }
}
