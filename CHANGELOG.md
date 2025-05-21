# Changelog

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
