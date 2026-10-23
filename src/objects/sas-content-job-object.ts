/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import { getJobDefinition } from '../api/job-definitions-api';
import {
  renderPromptForm,
  renderJobIframe,
  determineRenderMode,
  getContextName,
  createContextSession,
} from '../ui/prompt-renderer';
import type { RenderPromptFormResult } from '../ui/prompt-renderer';
import { terminateSASSession, keepSessionAlive } from '../api/compute-api';
import { viyaGet } from '../api/http-client';
import { renderWhenGroupReady } from '../ui/content-sdk';
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
      isFolder?: boolean;
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
  onBreadcrumbSelect: (value: { breadcrumbPath: ContentSelectionItem[] }) => void;
}

function isFolder(item: ContentSelectionItem): boolean {
  return item.resource?.type?.isFolder === true || item.resource?.type?.sasType === 'folder';
}

function isTextInput(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
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
    const objectID = `${paneID}-obj-${definition?.id}`;

    const sasContentJobContainer = document.createElement('div');
    sasContentJobContainer.setAttribute('id', objectID);

    let lastSelected: ContentSelectionItem | null = null;

    // ---- Job display area ----
    const sasContentJobName = document.createElement('h3');
    const jobContainer = document.createElement('div');
    jobContainer.style.height = (def?.height as string) ?? '75vh';
    jobContainer.style.display = 'none';

    // Track the current prompt renderer result so we can clean up on selection change
    let currentResult: RenderPromptFormResult | null = null;
    // Incremented whenever the job area changes, so a slow load can't render over a newer one
    let loadToken = 0;

    const clearJob = () => {
      loadToken++;
      if (currentResult) {
        currentResult.cleanup();
        currentResult = null;
      }
      if (def?.jobName === 1) {
        sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText ?? '';
      }
      jobContainer.style.display = 'none';
      jobContainer.replaceChildren();
    };

    const showJobError = () => {
      const errorEl = document.createElement('p');
      errorEl.className = 'text-danger';
      errorEl.innerText = jobI18n?.errorText ?? 'Unable to load the job definition.';
      jobContainer.replaceChildren(errorEl);
    };

    // ---- Compute session ----
    // One session owned by this object and shared by every JSON-prompt job it renders.
    // By default it follows each job's compute context; with persistentSession it
    // always uses the configured computeContext.
    let persistentContext: string | undefined;
    if (def?.persistentSession === 1) {
      persistentContext = definition.computeContext;
      if (!persistentContext) {
        console.log('[sasContentJob] persistentSession requires computeContext, falling back to per-context sessions');
      }
    }
    let session: { contextName: string; id: Promise<string> } | null = null;
    let keepaliveTimer: ReturnType<typeof setInterval> | null = null;

    const endSession = () => {
      if (keepaliveTimer) {
        clearInterval(keepaliveTimer);
        keepaliveTimer = null;
      }
      if (session) {
        session.id.then((sessionId) => terminateSASSession(sessionId)).catch(() => {});
        session = null;
      }
    };

    const acquireSession = (jobContextName: string): Promise<string> => {
      const contextName = persistentContext ?? jobContextName;
      if (session?.contextName === contextName) {
        console.log(`[sasContentJob] Reusing session (context: ${contextName})`);
        return session.id;
      }
      if (session) {
        console.log(`[sasContentJob] Context changed from "${session.contextName}" to "${contextName}", terminating old session`);
      }
      endSession();

      const id = createContextSession(contextName);
      session = { contextName, id };
      id.then((sessionId) => {
        if (session?.id !== id) return;
        // Ping every 60 seconds so the session survives while the user browses folders
        keepaliveTimer = setInterval(() => {
          keepSessionAlive(sessionId).catch((e) =>
            console.log('[sasContentJob] Session keepalive failed:', e)
          );
        }, 60_000);
      }).catch((e) => {
        console.log('[sasContentJob] Session creation failed:', e);
        // Let the next job retry
        if (session?.id === id) session = null;
      });
      return id;
    };

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearJob();
      endSession();
    });

    /**
     * Reconstruct the SAS Content path for a job definition.
     * Uses the ancestors API to get the folder hierarchy, then appends the job name.
     */
    async function resolveContentPath(jobDefUri: string, jobName: string): Promise<string | null> {
      try {
        // Plain application/json returns a bare array; the typed media type wraps it in { ancestors }
        const ancestorsData = await viyaGet<{
          ancestors?: Array<{ name: string }>;
        }>(
          `/folders/ancestors?childUri=${encodeURIComponent(jobDefUri)}`,
          'application/vnd.sas.content.folder.ancestor+json'
        );

        if (!ancestorsData?.ancestors?.length) {
          console.log('[sasContentJob] No ancestors found, falling back to root');
          return '/' + jobName;
        }

        // ancestors is ordered leaf → root; reverse it to build the path and append the job name
        const folderPath = ancestorsData.ancestors.map((a) => a.name).reverse().join('/');
        return '/' + folderPath + '/' + jobName;
      } catch (e) {
        console.log('[sasContentJob] Failed to resolve content path:', e);
        return null;
      }
    }

    // ---- Job loading ----
    const loadJob = async (job: ContentSelectionItem) => {
      clearJob();
      const token = loadToken;

      // resource.id may be a full URI (e.g. "/jobDefinitions/definitions/UUID") or just the UUID
      const resourceId = job.resource.id;
      const jobDefUri = resourceId.startsWith('/') ? resourceId : `/jobDefinitions/definitions/${resourceId}`;

      // Update job name header
      if (def?.jobName === 1) {
        sasContentJobName.innerText = job.name;
      }

      // Show loading indicator
      jobContainer.style.display = 'block';
      const loadingEl = document.createElement('p');
      loadingEl.className = 'text-muted';
      loadingEl.innerText = jobI18n?.loadingText ?? 'Loading job definition...';
      jobContainer.replaceChildren(loadingEl);

      try {
        // Fetch the full job definition
        const jobDef = await getJobDefinition(jobDefUri);
        const renderMode = determineRenderMode(jobDef.properties);
        console.log(`[sasContentJob] Job "${job.name}" render mode: ${renderMode}`, 'links:', jobDef.links);

        // Resolve the content path for SAS Job Execution
        const contentPath = await resolveContentPath(jobDefUri, job.name);
        if (token !== loadToken) return;
        if (!contentPath) {
          showJobError();
          return;
        }
        console.log(`[sasContentJob] Resolved content path: ${contentPath}`);

        if (renderMode === 'json') {
          const result = await renderPromptForm(
            jobDef,
            `${objectID}-job`,
            contentPath,
            jobI18n,
            { externalSession: acquireSession(getContextName(jobDef)) }
          );
          if (token !== loadToken) {
            result.cleanup();
            return;
          }
          currentResult = result;
          jobContainer.replaceChildren(result.element);
        } else if (renderMode === 'iframe') {
          // Render via SAS Job Execution iframe (HTML form or XML prompt)
          const encodedPath = encodeURIComponent(contentPath);
          jobContainer.replaceChildren(
            renderJobIframe(`${viyaHost}/SASJobExecution/?_program=${encodedPath}`, jobI18n)
          );
        } else {
          // No renderable prompt
          const noPromptEl = document.createElement('p');
          noPromptEl.innerText = jobI18n?.noPromptText ?? 'This job definition does not have a renderable prompt.';
          jobContainer.replaceChildren(noPromptEl);
        }
      } catch (e) {
        console.log('[sasContentJob] Error loading job definition:', e);
        if (token === loadToken) showJobError();
      }
    };

    // ---- SAS Content browser ----
    const sasContentGroup = document.createElement('sas-content-group') as SasContentGroupElement;
    sasContentGroup.id = `${objectID}-cg`;
    sasContentGroup.className = 'col-12';
    sasContentGroup.setAttribute('url', viyaHost);
    sasContentGroup.initialFilterValue = {
      queryModeFilter: "or(eq(contentType,'jobDefinition'),eq(contentType,'folder'))",
    };

    const folderFilter = def?.folderFilter as string | undefined;
    const startLocation: ContentFilterValue =
      folderFilter && folderFilter.length > 0
        ? { type: 'folderUri', value: folderFilter }
        : { type: 'persistentLocation', value: 'root' };
    sasContentGroup.initialNavigationValue = {
      location: startLocation,
      locationContextPath: [startLocation],
      locations: [startLocation],
    };

    const sasContentArea = document.createElement('sas-content-area') as SasContentAreaElement;
    sasContentArea.id = `${objectID}-ca`;
    sasContentArea.setAttribute('url', viyaHost);
    sasContentArea.setAttribute('selection-mode', 'single');
    sasContentArea.setAttribute('initial-selection-index', '0');
    sasContentArea.onSelect = (value: ContentSelectionItem[]) => {
      lastSelected = value?.[0] ?? null;
      if (lastSelected?.resource?.type?.sasType === 'jobDefinition') {
        loadJob(lastSelected);
      } else {
        // No job selected or not a job definition
        clearJob();
      }
    };
    sasContentArea.onBreadcrumbSelect = () => {
      // The SDK navigates to the selected folder and clears the selection
      lastSelected = null;
      clearJob();
    };

    // Opening an item (double-click or Enter) navigates into a folder; for a job the
    // SDK opens it in a new SAS Viya tab, with no option to turn that off — so we
    // swallow those events unless openOnDoubleClick is set.
    const onOpenGesture = (event: Event) => {
      if (!sasContentArea.contains(event.target as Node)) return;
      if (event instanceof KeyboardEvent && (event.key !== 'Enter' || isTextInput(event.target))) return;
      if (!lastSelected) return;

      if (isFolder(lastSelected)) {
        lastSelected = null;
        clearJob();
      } else if (lastSelected.resource?.type?.sasType === 'jobDefinition' && def?.openOnDoubleClick !== 1) {
        event.stopPropagation();
        event.preventDefault();
      }
    };
    // Capture phase on an ancestor runs before the SDK's own handlers
    sasContentJobContainer.addEventListener('dblclick', onOpenGesture, true);
    sasContentJobContainer.addEventListener('keydown', onOpenGesture, true);

    // ---- Assemble DOM ----
    sasContentGroup.appendChild(sasContentArea);

    if (def?.jobName === 1) {
      sasContentJobName.id = `${objectID}-jn`;
      sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText ?? '';
      sasContentGroup.appendChild(sasContentJobName);
    }

    sasContentGroup.appendChild(jobContainer);
    sasContentJobContainer.appendChild(sasContentGroup);
    renderWhenGroupReady(sasContentGroup, sasContentArea);

    return sasContentJobContainer;
  },
});
