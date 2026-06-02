/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * JSON prompt renderer — orchestrates parsing, state management, session lifecycle,
 * and dispatches to individual control builders.
 */

import { getComputeContexts, createSASSession, terminateSASSession, keepSessionAlive, getSessionJobs, getJobLog } from '../api/compute-api';
import type { LogLine } from '../api/compute-api';
import { buildJobExecutionUrl } from '../api/job-execution-api';
import { controlBuilders } from './prompt-controls';
import type {
  JobDefinition,
  PromptDefinition,
  PromptControl,
  PromptPage,
  PromptState,
} from '../types';

/**
 * Determine the render mode from a job definition's properties array.
 * Priority: form (HTML) > prompt_v2 (JSON) > prompt (XML).
 */
export function determineRenderMode(
  properties: Array<{ name: string; value: string }> | undefined
): 'iframe' | 'json' | 'none' {
  if (!properties || properties.length === 0) {
    return 'none';
  }

  const hasForm = properties.some((p) => p.name === 'form');
  const hasPromptV2 = properties.some((p) => p.name === 'prompts_v2' || p.name === 'prompt_v2');
  const hasPrompt = properties.some((p) => p.name === 'prompts' || p.name === 'prompt');

  if (hasForm) return 'iframe';
  if (hasPromptV2) return 'json';
  if (hasPrompt) return 'iframe';
  return 'none';
}

/**
 * Parse the prompt_v2 JSON string from a job definition's properties.
 */
function parsePromptV2(jobDef: JobDefinition): PromptDefinition | null {
  const prop = jobDef.properties?.find((p) => p.name === 'prompts_v2' || p.name === 'prompt_v2');
  if (!prop?.value) return null;

  try {
    return JSON.parse(prop.value) as PromptDefinition;
  } catch (e) {
    console.log('[promptRenderer] Failed to parse prompt_v2 JSON:', e);
    return null;
  }
}

/**
 * Extract the compute context name from the job definition's _contextName property.
 */
export function getContextName(jobDef: JobDefinition): string {
  const prop = jobDef.properties?.find((p) => p.name === '_contextName');
  return prop?.defaultValue ?? prop?.value ?? 'SAS Studio compute context';
}

/**
 * Create the PromptState, seeded with initial values from the prompt definition.
 */
function createPromptState(
  prompt: PromptDefinition,
  contextName: string,
  i18n: Record<string, string>
): PromptState {
  return {
    values: { ...(prompt.values ?? {}) },
    sessionId: null,
    contextName,
    libraries: null,
    tableCache: new Map(),
    columnCache: new Map(),
    listeners: new Map(),
    i18n,
    controlDefs: new Map(),
  };
}

/**
 * Lazily create a compute session. Returns the session ID.
 */
export async function ensureSession(state: PromptState): Promise<string> {
  if (state.sessionId) return state.sessionId;

  console.log(`[promptRenderer] Resolving compute context: ${state.contextName}`);
  const contexts = await getComputeContexts(
    `eq(name,'${state.contextName}')`
  );
  if (!contexts.length) {
    throw new Error(`Compute context '${state.contextName}' not found`);
  }

  const contextId = contexts[0].id;
  console.log(`[promptRenderer] Creating session for context ${contextId}`);
  state.sessionId = await createSASSession(contextId, 'portal-prompt-session');
  console.log(`[promptRenderer] Session created: ${state.sessionId}`);
  return state.sessionId;
}

/**
 * Notify all listeners registered for a control name.
 */
export function notifyListeners(
  state: PromptState,
  controlName: string,
  value: unknown
): void {
  const cbs = state.listeners.get(controlName);
  if (cbs) {
    for (const cb of cbs) {
      cb(value);
    }
  }
}

/**
 * Register a listener for changes on a specific control.
 */
export function addListener(
  state: PromptState,
  controlName: string,
  callback: (value: unknown) => void
): void {
  if (!state.listeners.has(controlName)) {
    state.listeners.set(controlName, new Set());
  }
  state.listeners.get(controlName)!.add(callback);
}

/**
 * Render a single control by dispatching to the appropriate builder.
 */
function renderControl(
  control: PromptControl,
  state: PromptState
): HTMLElement {
  // Register control definition for cross-control lookups
  state.controlDefs.set(control.id, control);

  // Handle sections (layout containers with children)
  if (control.type === 'section') {
    return renderSection(control, state);
  }

  const builder = controlBuilders[control.type];
  let el: HTMLElement;
  if (builder) {
    el = builder(control, state);
  } else {
    // Unknown control type — show a placeholder
    el = document.createElement('div');
    el.className = 'mb-3 text-muted';
    el.textContent = `[${state.i18n.unsupportedControl ?? 'Unsupported control type'}: ${control.type}]`;
  }

  // Hide the control if visible is false (still rendered so values and listeners work)
  if (control.visible === false || control.visible === 'false') {
    el.style.display = 'none';
  }

  return el;
}

/**
 * Render a collapsible section.
 */
function renderSection(
  control: PromptControl,
  state: PromptState
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'card mb-3';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.style.cursor = 'pointer';

  const collapseId = `section-${control.id}`;
  header.setAttribute('data-bs-toggle', 'collapse');
  header.setAttribute('data-bs-target', `#${collapseId}`);
  header.textContent = control.label ?? control.id;
  wrapper.appendChild(header);

  const collapseDiv = document.createElement('div');
  collapseDiv.id = collapseId;
  collapseDiv.className = control.open ? 'collapse show' : 'collapse';

  const body = document.createElement('div');
  body.className = 'card-body';

  if (control.children) {
    for (const child of control.children) {
      body.appendChild(renderControl(child, state));
    }
  }

  collapseDiv.appendChild(body);
  wrapper.appendChild(collapseDiv);
  return wrapper;
}

/**
 * Render a single page's children.
 */
function renderPageContent(
  page: PromptPage,
  state: PromptState
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-3';

  for (const child of page.children) {
    container.appendChild(renderControl(child, state));
  }

  return container;
}

/**
 * Render log lines into a styled <pre> block with colour-coded line types.
 */
function renderLogContent(lines: LogLine[]): HTMLElement {
  const pre = document.createElement('pre');
  pre.className = 'p-3 bg-light border rounded';
  pre.style.maxHeight = '500px';
  pre.style.overflow = 'auto';
  pre.style.fontSize = '0.85rem';
  pre.style.whiteSpace = 'pre-wrap';

  for (const entry of lines) {
    const span = document.createElement('span');
    span.textContent = entry.line + '\n';
    // Colour-code by type
    if (entry.type === 'error') {
      span.style.color = '#dc3545';
      span.style.fontWeight = 'bold';
    } else if (entry.type === 'warning') {
      span.style.color = '#fd7e14';
    } else if (entry.type === 'note') {
      span.style.color = '#0d6efd';
    } else if (entry.type === 'title') {
      span.style.fontWeight = 'bold';
    }
    // 'source' and 'normal' keep default colour
    pre.appendChild(span);
  }

  return pre;
}

/**
 * Render the results area: output iframe, optional log tab.
 */
function renderResults(
  container: HTMLElement,
  outputUrl: string,
  logLines: LogLine[] | null,
  i18n: Record<string, string>
): void {
  container.innerHTML = '';

  if (logLines && logLines.length > 0) {
    // Tabbed layout: Output | SAS Log
    const tabId = `results-${Date.now()}`;

    const navTabs = document.createElement('ul');
    navTabs.className = 'nav nav-tabs';
    navTabs.setAttribute('role', 'tablist');

    const outputLi = document.createElement('li');
    outputLi.className = 'nav-item';
    outputLi.setAttribute('role', 'presentation');
    const outputBtn = document.createElement('button');
    outputBtn.className = 'nav-link active';
    outputBtn.id = `${tabId}-output-tab`;
    outputBtn.setAttribute('data-bs-toggle', 'tab');
    outputBtn.setAttribute('data-bs-target', `#${tabId}-output`);
    outputBtn.setAttribute('type', 'button');
    outputBtn.setAttribute('role', 'tab');
    outputBtn.textContent = i18n.outputTab ?? 'Output';
    outputLi.appendChild(outputBtn);
    navTabs.appendChild(outputLi);

    const logLi = document.createElement('li');
    logLi.className = 'nav-item';
    logLi.setAttribute('role', 'presentation');
    const logBtn = document.createElement('button');
    logBtn.className = 'nav-link';
    logBtn.id = `${tabId}-log-tab`;
    logBtn.setAttribute('data-bs-toggle', 'tab');
    logBtn.setAttribute('data-bs-target', `#${tabId}-log`);
    logBtn.setAttribute('type', 'button');
    logBtn.setAttribute('role', 'tab');
    logBtn.textContent = i18n.logTab ?? 'SAS Log';
    logLi.appendChild(logBtn);
    navTabs.appendChild(logLi);

    container.appendChild(navTabs);

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';

    // Output tab
    const outputPane = document.createElement('div');
    outputPane.className = 'tab-pane fade show active pt-2';
    outputPane.id = `${tabId}-output`;
    outputPane.setAttribute('role', 'tabpanel');
    const iframe = document.createElement('iframe');
    iframe.src = outputUrl;
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    const iframeWrap = document.createElement('div');
    iframeWrap.className = 'border rounded';
    iframeWrap.appendChild(iframe);
    outputPane.appendChild(iframeWrap);
    tabContent.appendChild(outputPane);

    // Log tab
    const logPane = document.createElement('div');
    logPane.className = 'tab-pane fade pt-2';
    logPane.id = `${tabId}-log`;
    logPane.setAttribute('role', 'tabpanel');
    logPane.appendChild(renderLogContent(logLines));
    tabContent.appendChild(logPane);

    container.appendChild(tabContent);
  } else {
    // Output only — no tabs needed
    const iframe = document.createElement('iframe');
    iframe.src = outputUrl;
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    const iframeWrap = document.createElement('div');
    iframeWrap.className = 'border rounded';
    iframeWrap.appendChild(iframe);
    container.appendChild(iframeWrap);
  }
}

/**
 * Check that all required controls have a non-empty value in state.
 * Returns a list of labels for controls that are missing values.
 */
function validateRequired(state: PromptState): string[] {
  const missing: string[] = [];
  for (const [, control] of state.controlDefs) {
    if (!control.required) continue;
    const val = state.values[control.id];
    if (val == null) {
      missing.push(control.label ?? control.id);
    } else if (typeof val === 'string' && val.trim() === '') {
      missing.push(control.label ?? control.id);
    } else if (Array.isArray(val) && val.length === 0) {
      missing.push(control.label ?? control.id);
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as Record<string, unknown>;
      if ('library' in obj && 'table' in obj) {
        if (!obj.library || !obj.table) {
          missing.push(control.label ?? control.id);
        }
      } else if ('value' in obj && !obj.value) {
        missing.push(control.label ?? control.id);
      }
    }
  }
  return missing;
}

/** Options for renderPromptForm */
export interface RenderPromptFormOptions {
  /** Pre-existing session to reuse (skips creating a new one) */
  existingSessionId?: string;
  /** If true, the caller owns the session — renderPromptForm won't register
   *  a beforeunload cleanup and won't terminate the session on cleanup(). */
  externalSession?: boolean;
}

/** Result returned by renderPromptForm */
export interface RenderPromptFormResult {
  element: HTMLElement;
  state: PromptState;
  /** Tears down the keepalive timer and (unless externalSession) the session. */
  cleanup: () => void;
}

/**
 * Main entry point: render a JSON prompt form from a job definition.
 * The contentPath is required to submit the job via SAS Job Execution.
 */
export async function renderPromptForm(
  jobDef: JobDefinition,
  containerId: string,
  contentPath: string,
  i18n: Record<string, string> = {},
  options: RenderPromptFormOptions = {}
): Promise<RenderPromptFormResult> {
  const wrapper = document.createElement('div');
  wrapper.id = containerId + '-prompt-wrapper';

  const form = document.createElement('div');
  form.id = containerId + '-prompt-form';

  const noopResult: RenderPromptFormResult = {
    element: wrapper,
    state: createPromptState({ pages: [], values: {} }, '', i18n),
    cleanup: () => {},
  };

  const prompt = parsePromptV2(jobDef);
  if (!prompt) {
    const errorEl = document.createElement('p');
    errorEl.textContent = i18n.parseError ?? 'Unable to parse the job definition prompt.';
    form.appendChild(errorEl);
    wrapper.appendChild(form);
    return noopResult;
  }

  console.log('[promptRenderer] Parsed prompt definition:', prompt);

  const contextName = getContextName(jobDef);
  const state = createPromptState(prompt, contextName, i18n);

  // If a pre-existing session is provided, inject it into state
  if (options.existingSessionId) {
    state.sessionId = options.existingSessionId;
  }

  // Session status indicator (above the form)
  const sessionIndicator = document.createElement('div');
  sessionIndicator.className = 'd-flex align-items-center gap-2 mb-3 text-muted small';
  sessionIndicator.innerHTML =
    '<div class="spinner-border spinner-border-sm" role="status"></div>' +
    `<span>${i18n.sessionStarting ?? 'Starting compute session...'}</span>`;
  wrapper.appendChild(sessionIndicator);

  // Session cleanup and keepalive teardown
  let keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  const cleanupHandler = () => {
    if (keepaliveTimer) {
      clearInterval(keepaliveTimer);
      keepaliveTimer = null;
    }
    if (!options.externalSession && state.sessionId) {
      console.log(`[promptRenderer] Cleaning up session: ${state.sessionId}`);
      terminateSASSession(state.sessionId);
      state.sessionId = null;
    }
  };

  if (!options.externalSession) {
    window.addEventListener('beforeunload', cleanupHandler);
  }

  // Start the compute session eagerly so it's ready when the user clicks Run
  ensureSession(state)
    .then(() => {
      sessionIndicator.innerHTML =
        `<span class="text-success">&#9679;</span>` +
        `<span>${i18n.sessionReady ?? 'Compute session ready'}</span>`;
      // Start keepalive — ping the session every 60 seconds to prevent idle timeout
      keepaliveTimer = setInterval(() => {
        if (state.sessionId) {
          keepSessionAlive(state.sessionId).catch((e) =>
            console.log('[promptRenderer] Session keepalive failed:', e)
          );
        }
      }, 60_000);
    })
    .catch((e) => {
      console.log('[promptRenderer] Eager session creation failed:', e);
      sessionIndicator.innerHTML =
        `<span class="text-danger">&#9679;</span>` +
        `<span>${i18n.sessionFailed ?? 'Failed to start compute session'}</span>`;
    });

  // Render pages
  if (prompt.pages.length === 1) {
    // Single page — render directly without tabs
    form.appendChild(renderPageContent(prompt.pages[0], state));
  } else {
    // Multiple pages — render as Bootstrap tabs
    const navTabs = document.createElement('ul');
    navTabs.className = 'nav nav-tabs';
    navTabs.setAttribute('role', 'tablist');

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';

    for (let i = 0; i < prompt.pages.length; i++) {
      const page = prompt.pages[i];
      const isActive = i === 0;
      const tabId = `prompt-tab-${page.id}`;
      const paneId = `prompt-pane-${page.id}`;

      // Tab header
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.setAttribute('role', 'presentation');

      const button = document.createElement('button');
      button.className = isActive ? 'nav-link active' : 'nav-link';
      button.id = tabId;
      button.setAttribute('data-bs-toggle', 'tab');
      button.setAttribute('data-bs-target', `#${paneId}`);
      button.setAttribute('type', 'button');
      button.setAttribute('role', 'tab');
      button.textContent = page.label;
      li.appendChild(button);
      navTabs.appendChild(li);

      // Tab pane
      const pane = document.createElement('div');
      pane.className = isActive ? 'tab-pane fade show active' : 'tab-pane fade';
      pane.id = paneId;
      pane.setAttribute('role', 'tabpanel');
      pane.appendChild(renderPageContent(page, state));
      tabContent.appendChild(pane);
    }

    form.appendChild(navTabs);
    form.appendChild(tabContent);
  }

  wrapper.appendChild(form);

  // Visual separator between the prompt form and execution controls
  const separator = document.createElement('hr');
  separator.className = 'my-3';
  wrapper.appendChild(separator);

  // ---------------------------------------------------------------------------
  // Run button, log checkbox, and status area
  // ---------------------------------------------------------------------------
  const toolbar = document.createElement('div');
  toolbar.className = 'd-flex align-items-center gap-3 mb-3';

  const runButton = document.createElement('button');
  runButton.type = 'button';
  runButton.className = 'btn btn-primary';
  runButton.textContent = i18n.runButton ?? 'Run';

  const logCheckWrapper = document.createElement('div');
  logCheckWrapper.className = 'form-check';
  const logCheckbox = document.createElement('input');
  logCheckbox.type = 'checkbox';
  logCheckbox.className = 'form-check-input';
  logCheckbox.id = containerId + '-show-log';
  const logCheckLabel = document.createElement('label');
  logCheckLabel.className = 'form-check-label';
  logCheckLabel.setAttribute('for', logCheckbox.id);
  logCheckLabel.textContent = i18n.showLogCheckbox ?? 'Show SAS Log';
  logCheckWrapper.appendChild(logCheckbox);
  logCheckWrapper.appendChild(logCheckLabel);

  const statusEl = document.createElement('span');
  statusEl.className = 'text-muted small';

  toolbar.appendChild(runButton);
  toolbar.appendChild(logCheckWrapper);
  toolbar.appendChild(statusEl);
  wrapper.appendChild(toolbar);

  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = containerId + '-results';
  wrapper.appendChild(resultsContainer);

  // Submit handler
  runButton.addEventListener('click', async () => {
    // Validate required fields before submitting
    const missingFields = validateRequired(state);
    if (missingFields.length > 0) {
      statusEl.textContent = '';
      resultsContainer.innerHTML = '';
      const alert = document.createElement('div');
      alert.className = 'alert alert-warning';
      alert.textContent = `${i18n.requiredFieldsMissing ?? 'Please fill in all required fields'}: ${missingFields.join(', ')}`;
      resultsContainer.appendChild(alert);
      return;
    }

    runButton.disabled = true;
    statusEl.textContent = i18n.submittingStatus ?? 'Submitting job...';
    resultsContainer.innerHTML = '';

    // Show a spinner
    const spinner = document.createElement('div');
    spinner.className = 'd-flex align-items-center gap-2 text-muted';
    spinner.innerHTML =
      '<div class="spinner-border spinner-border-sm" role="status"></div>' +
      `<span>${i18n.runningSpinner ?? 'Running job, please wait...'}</span>`;
    resultsContainer.appendChild(spinner);

    try {
      const includeLog = logCheckbox.checked;
      const startTime = Date.now();
      const sessionId = await ensureSession(state);
      console.log('[promptRenderer] Submitting job with values:', state.values, 'includeLog:', includeLog, 'sessionId:', sessionId);

      // Record jobs in session before submission so we can find the new one
      const jobsBefore = includeLog ? await getSessionJobs(sessionId) : [];
      const jobIdsBefore = new Set(jobsBefore.map((j) => j.id));

      // Build the SAS Job Execution URL — all parameter keys are always sent
      // (even when empty) to clear macro variables from previous runs.
      const jobUrl = buildJobExecutionUrl(contentPath, state.values, sessionId);
      console.log('[promptRenderer] Job execution URL:', jobUrl);

      // Create a hidden iframe to execute the job — we use its onload to
      // know when execution finishes, then show the results.
      const execIframe = document.createElement('iframe');
      execIframe.style.display = 'none';
      execIframe.src = jobUrl;
      document.body.appendChild(execIframe);

      await new Promise<void>((resolve) => {
        execIframe.addEventListener('load', () => resolve());
      });

      // Remove the hidden iframe — we'll show a visible one with the same URL
      document.body.removeChild(execIframe);

      // Fetch log from compute session if requested
      let logLines: LogLine[] | null = null;
      if (includeLog) {
        try {
          // Retry a few times — the job may not appear in the listing immediately
          let newJob: { id: string; state: string } | undefined;
          for (let attempt = 0; attempt < 5; attempt++) {
            const jobsAfter = await getSessionJobs(sessionId);
            newJob = jobsAfter.find((j) => !jobIdsBefore.has(j.id));
            if (newJob) break;
            console.log(`[promptRenderer] Job not found yet, retrying (${attempt + 1}/5)...`);
            await new Promise((r) => setTimeout(r, 1000));
          }
          if (newJob) {
            console.log(`[promptRenderer] Fetching log for job ${newJob.id}`);
            logLines = await getJobLog(sessionId, newJob.id);
            console.log(`[promptRenderer] Log lines: ${logLines.length}`);
          } else {
            console.log('[promptRenderer] Could not identify the new job for log retrieval');
          }
        } catch (logErr) {
          console.log('[promptRenderer] Failed to fetch log:', logErr);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      statusEl.textContent = `${i18n.completedStatus ?? 'Completed'} (${elapsed}s)`;
      renderResults(resultsContainer, jobUrl, logLines, i18n);
    } catch (e) {
      console.log('[promptRenderer] Job execution failed:', e);
      resultsContainer.innerHTML = '';
      const errorEl = document.createElement('div');
      errorEl.className = 'alert alert-danger';
      errorEl.textContent = `${i18n.jobFailedPrefix ?? 'Job execution failed'}: ${e instanceof Error ? e.message : String(e)}`;
      resultsContainer.appendChild(errorEl);
      statusEl.textContent = i18n.failedStatus ?? 'Failed';
    } finally {
      runButton.disabled = false;
    }
  });

  return { element: wrapper, state, cleanup: cleanupHandler };
}
