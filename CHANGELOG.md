# Changelog

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
