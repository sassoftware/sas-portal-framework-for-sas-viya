/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaGet } from './http-client';

interface MLPAProject {
  id: string;
  name: string;
  analyticsProjectID: string;
}

/**
 * Create a Machine Learning Pipeline Automation project.
 */
export async function createMLPA(
  dataTableUri: string,
  name: string,
  description: string,
  analyticsProjectAttributes: Record<string, unknown>,
  settings: Record<string, unknown> = { autoRun: true, maxModelingTime: 10 },
  type: string = 'predictive'
): Promise<MLPAProject> {
  const body = {
    dataTableUri,
    type,
    name,
    description,
    settings,
    analyticsProjectAttributes,
  };

  let response = await viyaFetch('/mlPipelineAutomation/projects', {
    method: 'POST',
    body: JSON.stringify(body),
    accept: 'application/vnd.sas.analytics.ml.pipeline.automation.project+json',
  });

  // Handle HTTP 449 with retry
  if (response.status === 449) {
    const retryUrl = new URL(response.url);
    const params = retryUrl.searchParams.toString();
    response = await viyaFetch(
      `/mlPipelineAutomation/projects?${params}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        accept:
          'application/vnd.sas.analytics.ml.pipeline.automation.project+json',
      }
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    analyticsProjectID: data.analyticsProjectAttributes?.analyticsProjectId ?? '',
  };
}

/**
 * Get the state of an MLPA project.
 */
export async function getMachineLearningPipelineAutomationState(
  mlpaProjectID: string
): Promise<string> {
  const response = await viyaFetch(
    `/mlPipelineAutomation/projects/${mlpaProjectID}/state`,
    { accept: 'text/plain' }
  );
  return response.text();
}

/**
 * Get data mining project summary report.
 */
export async function getDataMiningProjectSummaryReport(
  dataMiningProjectID: string
): Promise<unknown> {
  return viyaGet(
    `/dataMiningProjectResources/projects/${dataMiningProjectID}/summaryReports`
  );
}

/**
 * Get data mining project resources document.
 */
export async function getDataMiningProjectResourcesDocument(
  documentPath: string
): Promise<unknown> {
  return viyaGet(documentPath);
}

/**
 * Publish or register the MLPA champion model.
 */
export async function publishMLPAChampion(
  mlpaProjectID: string,
  action: string = 'register',
  destinationName: string = 'maslocal'
): Promise<unknown> {
  const destParam =
    action === 'publish' ? `&destinationName=${destinationName}` : '';
  const response = await viyaFetch(
    `/mlPipelineAutomation/projects/${mlpaProjectID}/models/@championModel?action=${action}${destParam}`,
    { method: 'PUT' }
  );
  return response.json();
}
