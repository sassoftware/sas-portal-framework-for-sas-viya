/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * SAS Job Execution helpers — builds submission URLs and serializes prompt values.
 */

import { getAppState } from '../state/app-state';

/**
 * Serialize PromptState values into flat string parameters for SAS Job Execution.
 *
 * SAS Job Execution creates a SAS macro variable for each parameter. The naming
 * convention is:
 *   - simple values → string as-is
 *   - inputtable / outputtable { library, table } → "LIBRARY.TABLE"
 *   - columnselector / list [{ value }] → space-separated values
 *   - radiogroup / dropdown { value } → the value string
 *   - checkbox boolean → "1" / "0"
 */
export function serializePromptValues(
  values: Record<string, unknown>
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    // Skip internal prompt state keys (e.g. _debug) — these are not SAS macro variables
    if (key.startsWith('_')) continue;

    // Always include the key (even when empty) so that macro variables from a
    // previous run in the same session are explicitly cleared.
    if (value == null || value === '') {
      params[key] = '';
      continue;
    }

    if (typeof value === 'string') {
      params[key] = value;
    } else if (typeof value === 'number') {
      params[key] = String(value);
    } else if (typeof value === 'boolean') {
      params[key] = value ? '1' : '0';
    } else if (Array.isArray(value)) {
      // Array of { value: string } objects (columnselector, list, libraryselector)
      const vals = value.map((v) =>
        typeof v === 'object' && v !== null
          ? String((v as Record<string, unknown>).value ?? '')
          : String(v)
      );
      params[key] = vals.join(' ');
    } else if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if ('library' in obj && 'table' in obj) {
        // inputtable / outputtable → "LIBRARY.TABLE"
        params[key] = `${obj.library}.${obj.table}`;
      } else if ('value' in obj) {
        // Single value wrapper (radiogroup, dropdown)
        params[key] = String(obj.value ?? '');
      } else {
        // Complex object — serialize as JSON for the SAS program to parse
        params[key] = JSON.stringify(value);
      }
    }
  }

  return params;
}

/**
 * Build the full SAS Job Execution URL for displaying output in an iframe.
 *
 * The URL is loaded directly by the browser so SAS Job Execution renders the
 * result page (HTML output, links to additional files, etc.).
 *
 * All known parameter keys are always sent (even when empty) so that macro
 * variables from a previous run in the same session are explicitly cleared.
 */
export function buildJobExecutionUrl(
  contentPath: string,
  values: Record<string, unknown>,
  sessionId: string
): string {
  const { config } = getAppState();
  const params = serializePromptValues(values);

  const query = new URLSearchParams();
  query.set('_program', contentPath);
  query.set('_action', 'execute');
  query.set('_sessionId', sessionId);
  query.set('_timeout', '600');

  for (const [key, val] of Object.entries(params)) {
    query.set(key, val);
  }

  return `${config.viyaHost}/SASJobExecution/?${query.toString()}`;
}
