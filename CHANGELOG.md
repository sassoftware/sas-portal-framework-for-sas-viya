# Changelog

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
