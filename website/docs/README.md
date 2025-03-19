---
sidebar_position: 1
---

# SAS Portal Framework for SAS Viya

Welcome to the SAS Portal Framework for SAS Viya or SAS Portal for short. The SAS Portal enables you to build out pages that display your content in a structured fashion.

The SAS Portal includes the following features:
- Structure content into Pages through Objects
- Integrates with the SAS Viya authentication & authorization
- Provides a visual builder tool

Here is a screenshot of one page from the included example portal:
![Example Portal](https://raw.githubusercontent.com/sassoftware/sas-portal-framework-for-sas-viya/refs/heads/main/img/example-portal.png)

## Multi-Language Support

The baseline interface comes with native multi language support. The displayed language is determined by the users browsers language. Then a file from the languages folder is loaded. The portal comes with *English* and *German* support, if you want to add an additional language just copy the language/en.json file, rename it to the desired lowercase [ISO-639-1 language code](https://en.wikipedia.org/wiki/ISO_639-1) and the translate the values of the attributes.