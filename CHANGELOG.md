# Changelog

## SAS Portal Framework for SAS Viya v2.1.0

- Change: Job definitions rendered from a JSON prompt get a **Reset** button that restores the prompt's default values (keeping the compute session); HTML/XML prompt jobs get one that reloads the form
- Change: Double-clicking a job in the SAS Content Job object no longer opens it in a new SAS Viya tab; set `openOnDoubleClick: 1` to restore the old behavior
- Change: The SAS Content Job object unloads the displayed job when the user navigates to another folder (including via the breadcrumb)
- Change: New `persistentSession`/`computeContext` attributes on the SAS Content Job object keep one compute session alive for all selected jobs
- Change: The portal is configured at runtime from a `config.json` next to `index.html` on the web server (template: `config.example.json` in the zip), so admins no longer need to rebuild to change `portalFolderUri`, `portalName`, `viyaHost`, or `showViyaLink`; `src/config.ts` remains the built-in defaults
- Change: New `showViyaLink` setting to hide the "Go to SAS Viya" link in the header
- Docs: New pages for the Job Definition object (`jobDefinition`, previously undocumented) and a shared Job Prompts reference covering display modes, the supported JSON prompt controls, how values reach the job, and compute sessions
- Fix: The SAS Content Job object now actually reuses its compute session when switching between jobs — previously every job selection terminated the previous session and started a new one
- Fix: JSON prompt forms no longer start duplicate compute sessions when controls request the session while it is still being created, and a session still being created when a form is discarded is terminated once it exists
- Fix: A slow-loading job can no longer replace a job selected after it in the SAS Content Job object
- Fix: SAS Content Job and SAS Content VA Report objects now render their content browser reliably — with Content SDK 1.1 the `sas-content-area` silently skipped its first render when it connected before its `sas-content-group` had mounted, leaving the browser empty
- Fix: The SAS Content Job object builds the correct SAS Content path for the selected job (it read the folder ancestors in the wrong format and order, so Job Execution got `/<job name>` and failed with "Unable to get job definition")
- Fix: Dynamic dropdowns fed by a column selector are populated again after a form is re-rendered with warm caches
- Fix: Compute sessions are now actually terminated when the page is closed or reloaded (the DELETE is sent with `keepalive`; previously the browser cancelled it, so sessions lingered until their idle timeout and could exhaust a context's server limit)
- Fix: A failed compute session creation (e.g. the context's server limit is reached) is now reported as "Failed to start compute session" instead of a "ready" session with an `undefined` ID
- Fix: A dynamic dropdown's displayed value is now also its submitted value — previously a required dynamic dropdown showed its first option but failed validation until the user changed it

## SAS Portal Framework for SAS Viya v2.0.1

- Fix: Commit the docs page `website/docs/editing-content.md`, which an over-broad root `.gitignore` rule (`docs/`) had silently excluded — its absence broke the `../editing-content` link and failed the GitHub Pages build. The rule is now anchored to `/docs/` so it no longer matches `website/docs/`.
- Change: Migrate the deprecated top-level `onBrokenMarkdownLinks` Docusaurus option to `markdown.hooks.onBrokenMarkdownLinks` (removed in Docusaurus v4).
- Security: Resolve all Dependabot alerts in build/dev-time dependencies — bump Vite to 8.x (pulling in patched esbuild and PostCSS) and pin `serialize-javascript` (>=7.0.7) and `uuid` (>=14) in the docs toolchain via overrides. No change to the shipped portal bundle.

## SAS Portal Framework for SAS Viya v2.0.0

- Change: Full rewrite from vanilla JavaScript to TypeScript with ES modules
- Change: Added Vite build pipeline with production bundling and zip output
- Change: Centralized HTTP client with automatic CSRF token handling (replaces duplicated logic across 24 files)
- Change: Replaced global variables (`window.VIYA`, `document.csrfToken`, etc.) with typed AppState singleton
- Change: Consolidated 62 utility files into 12 cohesive API modules
- Change: Replaced object type switch statement with extensible object type registry
- Change: Added full type definitions for all SAS Viya API interactions
- Remove: Portal Builder object (deprecated in v1.4.0, use JSON file editing in SAS Studio instead)
- Security: HTML-escape all author/user-supplied values rendered via innerHTML in the Data Product Marketplace and the Prompt Builder experiment tracker, and sanitize link URLs (block `javascript:` schemes) — closes stored-XSS vectors
- Security: Render the LLM response in the Prompt Builder via the DOM/textContent so a response containing `</script>` can no longer break out of the zero-md block
- Security: Replace `eval()` of definition-supplied code in the Run Custom Code object with an isolated `Function` scope
- Fix: Restore SCR scoring — inputs now render, submitted values are read correctly, and scored results are appended (broken by the v2 accordion/table redesign)
- Fix: Restore number-typing, labels, and the input field-name mapping in the shared accordion input renderer (affected SCR and MAS scoring)
- Fix: Restore the full DS2 reserved-word list and the empty-name fallback in the variable/package-name validators
- Fix: Correct the RAG Builder generated config to read `SERVER_PORT`/`SERVER_USER`/`SERVER_PW` (was reading `SERVER_HOST` for all three, breaking SingleStore/pgVector auth)
- Fix: HTTP JSON helpers now throw on non-OK responses instead of parsing error bodies as success
- Fix: One failing object no longer blanks the rest of a portal page (per-object error isolation in the page generator)
- Fix: Data Product Marketplace checkout button is correctly disabled for an empty cart; the Registry no longer mis-deletes on an unmatched edit and awaits its saves
- Fix: Prompt Builder experiment data is kept per object instance instead of on a shared `window` global
- Change: Centralized the `escapeHtml`/`sanitizeUrl` helpers and the ambient Bootstrap typing; removed dead code (legacy `js/`, `config.js`, duplicated assets, the removed Portal Builder artifact, unused `bootstrap` dependency) and stray debug logging

## SAS Portal Framework for SAS Viya v1.5.0

For more information on the Prompt Builder object please take a look at [SAS Agentic AI Accelerator project](https://github.com/sassoftware/sas-agentic-ai-accelerator).

- Change: The Prompt Builder object now supports the new deploymentType parameter, which enables the differently structured endpoints
- Change: The Prompt Builder object now manifests prompts so that they can pull the LLM Container Path from an environment variable

## SAS Portal Framework for SAS Viya v1.4.0

Deprication Warning: The Portal Builder Object will be deprecated in an upcoming release. With the avaialbility of JSON file editing in SAS Studio (since the 2025.06 release) that is the new preferred version and since updating the Portal Builder object is very complex, this object will be deprecated. Note with the next version a warning text will also appear at the top of the object - no new features will be added.

- Add: SAS Content VA Report Object
- Add: SAS Content Job Object

## SAS Portal Framework for SAS Viya v1.3.0

- Add: RAG Builder object
- Change: The Prompt Builder object now filters for projects with the Prompt-Engineering tag
- Change: The Prompt Builder object now supports deprecation of LLMs
- Fix: Instead of using hyphens, invalid characters are removed fully for *validate-python-package-name.js*
- Add: Deep-Linking support for Tabs
- Change: SAS Logo for documentation - implementing [SAS logomark needs updating](https://github.com/sassoftware/sas-portal-framework-for-sas-viya/issues/7)
- Add: Source code headers to include copyright and license information
- Fix: Now when the local of the user isn't supported the Portal defaults to English

## SAS Portal Framework for SAS Viya v1.2.2

- Fix: Prompt Builder now prevents the creation of scoring files with invalid Python package names
- Add: validate-python-package-name utility function
- Change: For variables in a manifested prompt auto trimming was added to remove leading and trailing blanks

## SAS Portal Framework for SAS Viya v1.2.1

- Fix: The SCR Module Scorer object had a bug where it would parse a string beginning with a number as a number and remove the text

## SAS Portal Framework for SAS Viya v1.2.0

- Add: all currently supported objects to the Portal Builder object

## SAS Portal Framework for SAS Viya v1.1.0

- Add: Data Product Registry object
- Add: Data Product Marketplace object
- Add: documentation for the Run Custom Code object
- Add: docuemntation for the Data Product Registry object
- Add: docuemntation for the Data Product Marketplace object
- Add: get-formatted-datetime utility function
- Add: copy-file utility function
- Add: copy-report utility function
- Add: Prompt Builder object
- Change: Provided updates to the global.css file to support special cases from the Data Product Marketplace object

## SAS Portal Framework for SAS Viya v1.0.4

- Add: The SCR Module Scorer object has been added
- Add: New utility function getSCRMetadata, retrieves the inputs and outputs of a SCR endpoint
- Add: New utility function scoreSCR, which enables you to score a SCR endpoint

## SAS Portal Framework for SAS Viya v1.0.3

- Add: The MAS Module Scorer object now provides the ability to delete MAS Modules
- Add: New utility functions:
    - createCASSession, handles the creation of a CAS session
    - terminateCASSession, handles the termination of a CAS session
    - terminateSASSession, handles the termination of a SAS session
    - getAllURLSearchParams, retrieves the parameters in the URL of the page
- Change: The createSASSession utility no longer auto register a window.onbeforeunload for the termination as that can be easily overwritten
- BF: The submitSASCode utility no implements the waiting for a job completion correctly
- Add New Object runCustomCode, a complex new object type that provides the capability to run code on page load, trigger actions and trigger code on page unload

## SAS Portal Framework for SAS Viya v1.0.2

- Add: Documentation page - [SAS Portal Framework Documentation](https://sassoftware.github.io/sas-portal-framework-for-sas-viya/)

## SAS Portal Framework for SAS Viya v1.0.1

- BF: Report Width was created in the wrong data type from the Portal Builder
- BF: The Portal-Content-EM.json now no longer introduces an unnecessary Authroziation Rule into your environment

## SAS Portal Framework for SAS Viya v1.0

-   Initial Version
