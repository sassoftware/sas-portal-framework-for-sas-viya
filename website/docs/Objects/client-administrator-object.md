---
sidebar_position: 7
---

# Client Administrator

The Client Administrator object enables you to view, edit, create and delete REST applications registered with SAS Viya. Please note that for most of the utilities that this tool provides *SAS Administrator* group member ship is required.

In order to create a Client Administrator object you have to set the objects type to *clientAdministrator*, there are no additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 0,
    "objectBorder": false,
    "type": "clientAdministrator",
}
```