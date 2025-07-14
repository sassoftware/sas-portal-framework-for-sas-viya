# Changelog

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
