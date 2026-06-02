/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaGet } from './http-client';
import type { ComputeContext } from '../types/compute';
import type { SasApiCollection } from '../types/api';

interface ComputeContextOption {
  id: string;
  name: string;
}

/**
 * Get compute contexts with optional filter and pagination.
 */
export async function getComputeContexts(
  query: string = '',
  start: number = 0,
  limit: number = 20
): Promise<ComputeContextOption[]> {
  const data = await viyaGet<SasApiCollection<ComputeContext>>(
    `/compute/contexts?start=${start}&limit=${limit}&filter=${query}`
  );

  let contexts: ComputeContextOption[] = [];
  if (data?.items) {
    for (const item of data.items) {
      contexts.push({ id: item.id, name: item.name });
    }
  }

  // Recursive pagination
  if (data?.items && data.items.length === limit) {
    const more = await getComputeContexts(query, start + limit, limit);
    contexts = contexts.concat(more);
  }

  return contexts;
}

/**
 * Create a new SAS compute session.
 */
export async function createSASSession(
  computeContextID: string,
  sessionName: string,
  sessionDescription: string = '',
  sessionAttributes: Record<string, unknown> = {},
  sessionEnvironmentOptions: string[] = [],
  sessionEnvironmentAutoexecLines: string[] = []
): Promise<string> {
  const response = await viyaFetch(
    `/compute/contexts/${computeContextID}/sessions`,
    {
      method: 'POST',
      body: JSON.stringify({
        version: 1,
        name: sessionName,
        description: sessionDescription,
        attributes: sessionAttributes,
        environment: {
          options: sessionEnvironmentOptions,
          autoExecLines: sessionEnvironmentAutoexecLines,
        },
      }),
    }
  );
  const session = await response.json();
  return session.id;
}

/**
 * Submit SAS code to a session and optionally wait for completion.
 */
export async function submitSASCode(
  sessionID: string,
  code: string[],
  attributes: Record<string, unknown> = { resetLogLinesNumbers: true },
  waitForCompletion: boolean = true
): Promise<string> {
  const response = await viyaFetch(
    `/compute/sessions/${sessionID}/jobs`,
    {
      method: 'POST',
      body: JSON.stringify({ code, attributes }),
    }
  );
  const job = await response.json();
  const jobID = job.id;

  if (waitForCompletion) {
    let state = await getSASJobState(sessionID, jobID);
    while (
      state !== 'completed' &&
      state !== 'error' &&
      state !== 'canceled' &&
      state !== 'failed' &&
      state !== 'warning' &&
      state !== 'done'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      state = await getSASJobState(sessionID, jobID);
    }
  }

  return jobID;
}

/**
 * Get the state of a SAS job.
 */
export async function getSASJobState(
  sasSessionID: string,
  sasJobID: string,
  eTag: string = ''
): Promise<string> {
  const waitParam = eTag ? '?wait=30' : '';
  const headers: Record<string, string> = {};
  if (eTag) {
    headers['If-None-Match'] = eTag;
  }

  const response = await viyaFetch(
    `/compute/sessions/${sasSessionID}/jobs/${sasJobID}/state${waitParam}`,
    { accept: 'text/plain', headers }
  );
  return response.text();
}

/**
 * List jobs in a compute session, most recent first.
 */
export async function getSessionJobs(
  sessionId: string
): Promise<Array<{ id: string; state: string }>> {
  const data = await viyaGet<SasApiCollection<{ id: string; state: string }>>(
    `/compute/sessions/${sessionId}/jobs?sortBy=creationTimeStamp:descending&limit=10`
  );
  return data?.items ?? [];
}

export interface LogLine {
  line: string;
  type?: string;
}

/**
 * Get the log for a compute session job.
 */
export async function getJobLog(
  sessionId: string,
  jobId: string,
  start: number = 0,
  limit: number = 10000
): Promise<LogLine[]> {
  const data = await viyaGet<SasApiCollection<LogLine>>(
    `/compute/sessions/${sessionId}/jobs/${jobId}/log?start=${start}&limit=${limit}`
  );
  return data?.items ?? [];
}

/**
 * Ping a compute session to keep it alive (resets idle timeout).
 * Returns the session state string (e.g. 'idle', 'running').
 */
export async function keepSessionAlive(
  sessionId: string
): Promise<string> {
  const data = await viyaGet<{ state?: string }>(
    `/compute/sessions/${sessionId}`
  );
  return data?.state ?? 'unknown';
}

/**
 * Terminate a SAS compute session.
 */
export async function terminateSASSession(
  sasSessionID: string
): Promise<number> {
  const response = await viyaFetch(
    `/compute/sessions/${sasSessionID}`,
    { method: 'DELETE' }
  );
  return response.status;
}
