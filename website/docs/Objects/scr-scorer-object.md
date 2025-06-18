---
sidebar_position: 7
---

# SCR Scorer

The SCR Scorer enables you to quickly test and validate your published SAS Intelligent Decisioning decisions and SAS Model Manager models that have been published to SCR (**S**AS **C**ontainer **R**untime) - link to the (SAS documentation)[https://go.documentation.sas.com/doc/en/mascrtcdc/default/mascrtag/n0tufu0e8nshc5n1krk26hvjctbk.htm].

In order to create a SCR Scorer object you have to set the objects type to *scrScore*, there are no additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 0,
    "objectBorder": false,
    "type": "scrScore",
}
```