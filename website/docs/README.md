---
sidebar_position: 1
---

# SAS Portal Framework for SAS Viya

Welcome to the SAS Portal Framework for SAS Viya or SAS Portal for short. The SAS Portal enables you to structure and combine content elements like Reports, Text, List and more into pages. Users of the SAS Portal have to log in with SAS Viya and have to be authorized for each page. Authentication and authorization is handled by SAS Viya, all content structure resides within SAS Viya.

The SAS Portal includes the following features:
- 10+ objects that enable to integration of different types of content
- Create pages by combining objects
- Manage access to pages or even objects within a page by applying authorization rules to SAS Content

Here is a screenshot of one page from the included example portal:
![Example Portal](https://raw.githubusercontent.com/sassoftware/sas-portal-framework-for-sas-viya/refs/heads/main/img/example-portal.png)

## Multi-Language Support

The baseline interface comes with native multi language support. The displayed language is determined by the users browsers language. Then a file from the languages folder is loaded. The portal comes with *English* and *German* support, if you want to add an additional language just copy the public/language/en.json file, rename it to the desired lowercase [ISO-639-1 language code](https://en.wikipedia.org/wiki/ISO_639-1) and the translate the values of the attributes.