/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import { resolveJobDefinitionPath, getJobDefinition } from '../api/job-definitions-api';
import { renderPromptForm, determineRenderMode } from '../ui/prompt-renderer';
import type { ObjectDefinition, InterfaceText } from '../types';

registerObjectType({
  type: 'jobDefinition',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const { config } = getAppState();
    const container = document.createElement('div');
    container.setAttribute('id', `${paneID}-obj-${definition.id}`);

    const contentPath = definition.contentPath;
    const i18n = interfaceText?.jobDefinition as Record<string, string> | undefined;

    if (!contentPath) {
      const errorEl = document.createElement('p');
      errorEl.innerText = i18n?.errorText ?? 'Unable to load the job definition. Please verify the content path is correct.';
      container.appendChild(errorEl);
      return container;
    }

    // Show loading indicator
    const loadingEl = document.createElement('p');
    loadingEl.innerText = i18n?.loadingText ?? 'Loading job definition...';
    container.appendChild(loadingEl);

    try {
      // Resolve the content path to a job definition URI
      console.log(`[jobDefinition] Resolving content path: ${contentPath}`);
      const definitionUri = await resolveJobDefinitionPath(contentPath);
      if (!definitionUri) {
        console.log(`[jobDefinition] Could not resolve path to a job definition URI`);
        loadingEl.innerText = i18n?.errorText ?? 'Unable to load the job definition. Please verify the content path is correct.';
        return container;
      }
      console.log(`[jobDefinition] Resolved to URI: ${definitionUri}`);

      // Fetch the job definition to inspect its properties
      const jobDef = await getJobDefinition(definitionUri);
      const renderMode = determineRenderMode(jobDef.properties);
      console.log(`[jobDefinition] Properties:`, jobDef.properties);
      console.log(`[jobDefinition] Property names:`, jobDef.properties?.map((p) => p.name));
      console.log(`[jobDefinition] Render mode: ${renderMode}`);

      // Remove loading indicator
      container.removeChild(loadingEl);

      if (renderMode === 'iframe') {
        // Render via SAS Job Execution iframe (HTML form or XML prompt)
        const encodedPath = encodeURIComponent(contentPath);
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `${config.viyaHost}/SASJobExecution/?_program=${encodedPath}`);
        iframe.style.width = '100%';
        iframe.style.height = definition.height ?? '600px';
        iframe.style.border = 'none';
        container.appendChild(iframe);
      } else if (renderMode === 'json') {
        // JSON prompt: render interactive form from prompt_v2
        const result = await renderPromptForm(jobDef, `${paneID}-obj-${definition.id}`, contentPath, i18n ?? {});
        container.appendChild(result.element);
      } else {
        // No renderable prompt
        const noPromptEl = document.createElement('p');
        noPromptEl.innerText = i18n?.noPromptText ?? 'This job definition does not have a renderable prompt.';
        container.appendChild(noPromptEl);
      }
    } catch (e) {
      console.log('Error building job definition object:', e);
      loadingEl.innerText = i18n?.errorText ?? 'Unable to load the job definition. Please verify the content path is correct.';
    }

    return container;
  },
});
