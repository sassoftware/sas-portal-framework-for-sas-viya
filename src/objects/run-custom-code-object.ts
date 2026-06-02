/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import type { ObjectDefinition } from '../types';
import { getAllURLSearchParams } from '../util/url-params';
import {
  getComputeContexts,
  createSASSession,
  submitSASCode,
  terminateSASSession,
} from '../api/compute-api';

/**
 * Evaluate an author-supplied code template (typically a template literal that
 * references `searchParams`) in an isolated function scope. This replaces the
 * legacy eval() so the template cannot reach the surrounding closure, and
 * avoids the bundler's eval() warnings.
 */
function evaluateCodeTemplate(
  template: string | undefined,
  searchParams: Record<string, string>
): string[] {
  if (!template) return [];
  const result = new Function('searchParams', `return (${template});`)(searchParams);
  return Array.isArray(result) ? (result as string[]) : [String(result)];
}

registerObjectType({
  type: 'runCustomCode',
  async build(definition: ObjectDefinition, paneID: string): Promise<HTMLElement> {
    const appState = getAppState();
    const def = definition as Record<string, unknown>;

    // Run Custom Code Container
    const runCustomCodeContainer = document.createElement('div');
    runCustomCodeContainer.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    // Get URL search parameters for code evaluation
    const searchParams = getAllURLSearchParams();

    // Retrieve the compute context
    const computeContexts = await getComputeContexts(
      `eq(name,'${definition?.computeContext ?? ''}')`
    );
    if (computeContexts.length === 0) {
      console.error(
        `No compute context found matching '${definition?.computeContext ?? ''}'`
      );
      return runCustomCodeContainer;
    }
    const computeContextID = computeContexts[0]!.id;

    // Check if a SAS Session already exists
    if (!appState.sasSessionId) {
      appState.sasSessionId = await createSASSession(
        computeContextID,
        'portalSession'
      );
    }

    // Submit the code. The definition's `code` is an author-authored template
    // evaluated in an isolated scope (see evaluateCodeTemplate).
    const response = await submitSASCode(
      appState.sasSessionId,
      evaluateCodeTemplate(def?.code as string, searchParams)
    );

    // Check if the user has specified an action
    if (definition?.action) {
      switch (definition.action) {
        case 'reloadReport': {
          const el = document.getElementById(definition?.actionElement ?? '') as HTMLElement & {
            getReportHandle: () => Promise<{ reloadReport: () => void }>;
          };
          el?.getReportHandle().then((reportHandle) => {
            reportHandle.reloadReport();
          });
          break;
        }
        case 'refreshData': {
          const el = document.getElementById(definition?.actionElement ?? '') as HTMLElement & {
            getReportHandle: () => Promise<{ refreshData: () => void }>;
          };
          el?.getReportHandle().then((reportHandle) => {
            reportHandle.refreshData();
          });
          break;
        }
        default:
          console.log(
            `The ${definition.action} isn't supported at this time.`
          );
      }
    }

    // Check if the user wants an unload event
    const unloadCode = evaluateCodeTemplate(def?.unloadCode as string, searchParams);
    if (unloadCode && unloadCode.length > 0) {
      window.addEventListener('beforeunload', function () {
        const state = getAppState();
        if (state.sasSessionId) {
          submitSASCode(
            state.sasSessionId,
            evaluateCodeTemplate(def?.unloadCode as string, searchParams)
          );
          terminateSASSession(state.sasSessionId);
        }
      });
    }

    return runCustomCodeContainer;
  },
});
