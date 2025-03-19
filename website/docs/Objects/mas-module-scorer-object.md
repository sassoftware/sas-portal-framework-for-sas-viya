---
sidebar_position: 6
---

# MAS Module Scorer

The MAS Module Scorer enables you to quickly test and validate your published SAS Intelligent Decisioning decisions and SAS Model Manager models that have been published to MAS (SAS **M**icro **A**nalytic **S**ervice) - link to the (SAS documentation)[https://go.documentation.sas.com/doc/en/mascdc/default/masag/titlepage.htm].

In order to create a MAS Module Scorer object you have to set the objects type to *masScore*, there are no additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 0,
    "objectBorder": false,
    "type": "masScore",
}
```