/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import { getJobDefinition } from '../api/job-definitions-api';
import {
  renderPromptForm,
  determineRenderMode,
  getContextName,
  ensureSession,
} from '../ui/prompt-renderer';
import type { RenderPromptFormResult } from '../ui/prompt-renderer';
import { terminateSASSession } from '../api/compute-api';
import { viyaGet } from '../api/http-client';
import type { ObjectDefinition, InterfaceText, PromptState } from '../types';

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

registerObjectType({
  type: 'sasContentJob',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const { config } = getAppState();
    const viyaHost = config.viyaHost;
    const def = definition as Record<string, unknown>;
    const scjInterfaceText = (interfaceText?.sasContentJob ?? {}) as Record<string, string>;
    const jobI18n = (interfaceText?.jobDefinition ?? {}) as Record<string, string>;

    const sasContentJobContainer = document.createElement('div');
    sasContentJobContainer.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    // ---- SAS Content browser ----
    const sasContentGroup = document.createElement('sas-content-group') as SasContentGroupElement;
    sasContentGroup.id = `${paneID}-obj-${definition?.id}-cg`;
    sasContentGroup.className = 'col-12';
    sasContentGroup.setAttribute('url', viyaHost);
    sasContentGroup.initialFilterValue = {
      queryModeFilter: "or(eq(contentType,'jobDefinition'),eq(contentType,'folder'))",
    };

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

    // ---- Job display area ----
    const sasContentJobName = document.createElement('h3');
    const jobContainer = document.createElement('div');
    jobContainer.style.height = (def?.height as string) ?? '75vh';
    jobContainer.style.display = 'none';

    // Track the current prompt renderer result so we can clean up on selection change
    let currentResult: RenderPromptFormResult | null = null;
    // Track a shared session state for reuse across jobs with the same compute context
    let sharedState: PromptState | null = null;

    const cleanupCurrentJob = () => {
      if (currentResult) {
        currentResult.cleanup();
        currentResult = null;
      }
    };

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      cleanupCurrentJob();
      if (sharedState?.sessionId) {
        terminateSASSession(sharedState.sessionId);
        sharedState = null;
      }
    });

    /**
     * Reconstruct the SAS Content path for a job definition.
     * Uses the ancestors API to get the folder hierarchy, then appends the job name.
     */
    async function resolveContentPath(jobDefUri: string, jobName: string): Promise<string | null> {
      try {
        const ancestorsData = await viyaGet<{
          ancestors?: Array<{ name: string }>;
        }>(`/folders/ancestors?childUri=${encodeURIComponent(jobDefUri)}`);

        if (!ancestorsData?.ancestors?.length) {
          console.log('[sasContentJob] No ancestors found, falling back to root');
          return '/' + jobName;
        }

        // ancestors is ordered root → leaf; build the path and append the job name
        const folderPath = ancestorsData.ancestors.map((a) => a.name).join('/');
        return '/' + folderPath + '/' + jobName;
      } catch (e) {
        console.log('[sasContentJob] Failed to resolve content path:', e);
        return null;
      }
    }

    // ---- Selection handler ----
    const sasContentArea = document.createElement('sas-content-area') as SasContentAreaElement;
    sasContentArea.id = `${paneID}-obj-${definition?.id}-ca`;
    sasContentArea.setAttribute('url', viyaHost);
    sasContentArea.setAttribute('selection-mode', 'single');
    sasContentArea.setAttribute('initial-selection-index', '0');
    sasContentArea.onSelect = async (value: ContentSelectionItem[]) => {
      if (!value?.length || value[0]?.resource?.type?.sasType !== 'jobDefinition') {
        // No job selected or not a job definition
        cleanupCurrentJob();
        if (def?.jobName === 1) {
          sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText ?? '';
        }
        jobContainer.style.display = 'none';
        jobContainer.innerHTML = '';
        return;
      }

      const job = value[0];
      // resource.id may be a full URI (e.g. "/jobDefinitions/definitions/UUID") or just the UUID
      const resourceId = job.resource.id;
      const jobDefUri = resourceId.startsWith('/') ? resourceId : `/jobDefinitions/definitions/${resourceId}`;

      // Update job name header
      if (def?.jobName === 1) {
        sasContentJobName.innerText = job.name;
      }

      // Show loading indicator
      jobContainer.style.display = 'block';
      jobContainer.innerHTML = '';
      const loadingEl = document.createElement('p');
      loadingEl.className = 'text-muted';
      loadingEl.innerText = jobI18n?.loadingText ?? 'Loading job definition...';
      jobContainer.appendChild(loadingEl);

      try {
        // Fetch the full job definition
        const jobDef = await getJobDefinition(jobDefUri);
        const renderMode = determineRenderMode(jobDef.properties);
        console.log(`[sasContentJob] Job "${job.name}" render mode: ${renderMode}`, 'links:', jobDef.links);

        // Resolve the content path for SAS Job Execution
        const contentPath = await resolveContentPath(jobDefUri, job.name);
        if (!contentPath) {
          jobContainer.innerHTML = '';
          const errorEl = document.createElement('p');
          errorEl.className = 'text-danger';
          errorEl.innerText = jobI18n?.errorText ?? 'Unable to load the job definition.';
          jobContainer.appendChild(errorEl);
          return;
        }
        console.log(`[sasContentJob] Resolved content path: ${contentPath}`);

        // Clean up the previous prompt renderer
        cleanupCurrentJob();
        jobContainer.innerHTML = '';

        if (renderMode === 'json') {
          // Determine if we can reuse the existing session
          const newContextName = getContextName(jobDef);
          let existingSessionId: string | undefined;

          if (sharedState?.sessionId && sharedState.contextName === newContextName) {
            // Same compute context — reuse the session
            existingSessionId = sharedState.sessionId;
            console.log(`[sasContentJob] Reusing session ${existingSessionId} (same context: ${newContextName})`);
          } else if (sharedState?.sessionId) {
            // Different compute context — terminate old session
            console.log(`[sasContentJob] Context changed from "${sharedState.contextName}" to "${newContextName}", terminating old session`);
            terminateSASSession(sharedState.sessionId);
            sharedState = null;
          }

          const result = await renderPromptForm(
            jobDef,
            `${paneID}-obj-${definition.id}-job`,
            contentPath,
            jobI18n,
            {
              existingSessionId,
              externalSession: !!existingSessionId,
            }
          );

          currentResult = result;

          // If this was a fresh session, track it for sharing
          if (!existingSessionId) {
            // Wait for the session to be created, then store state for sharing
            ensureSession(result.state)
              .then(() => {
                sharedState = result.state;
              })
              .catch(() => {});
          } else {
            sharedState = result.state;
          }

          jobContainer.appendChild(result.element);
        } else if (renderMode === 'iframe') {
          // Render via SAS Job Execution iframe (HTML form or XML prompt)
          const encodedPath = encodeURIComponent(contentPath);
          const iframe = document.createElement('iframe');
          iframe.src = `${viyaHost}/SASJobExecution/?_program=${encodedPath}`;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          jobContainer.appendChild(iframe);
        } else {
          // No renderable prompt
          const noPromptEl = document.createElement('p');
          noPromptEl.innerText = jobI18n?.noPromptText ?? 'This job definition does not have a renderable prompt.';
          jobContainer.appendChild(noPromptEl);
        }
      } catch (e) {
        console.log('[sasContentJob] Error loading job definition:', e);
        jobContainer.innerHTML = '';
        const errorEl = document.createElement('p');
        errorEl.className = 'text-danger';
        errorEl.innerText = jobI18n?.errorText ?? 'Unable to load the job definition.';
        jobContainer.appendChild(errorEl);
      }
    };

    // ---- Assemble DOM ----
    sasContentGroup.appendChild(sasContentArea);

    if (def?.jobName === 1) {
      sasContentJobName.id = `${paneID}-obj-${definition?.id}-jn`;
      sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText ?? '';
      sasContentGroup.appendChild(sasContentJobName);
    }

    sasContentGroup.appendChild(jobContainer);
    sasContentJobContainer.appendChild(sasContentGroup);

    return sasContentJobContainer;
  },
});
