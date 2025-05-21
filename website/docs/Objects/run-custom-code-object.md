---
sidebar_position: 8
---

# Run Custom Code

The Portal Builder is a very special element that allows the user to edit the structure of the portal. This is a tool meant for developers and administrators of a portal to develop and enhance it. Please ensure that the access rights for this application are set correctly and also that the developers can write to the necessary folder in SAS Content.

In order to create a Portal Builder object you have to set the objects type to *portalBuilder*, there are no additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 0,
    "type": "runCustomCode",
    "computeContext": "SAS Studio compute context",
    "code": "[`%let user='${searchParams.user}';`,\"proc print data=sashelp.class; run; quit;\"]",
    "action": "refreshData",
    "actionElement": "WTU-obj-RUB-element",
    "unloadCode": "[]"
}
```