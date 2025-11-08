---
sidebar_position: 14
---

# Portal Builder

**NOTE:** This object is considered deprecated starting with version 1.4.0, is no longer supported and will be removed in the future.

The Portal Builder is a very special element that allows the user to edit the structure of the portal. This is a tool meant for developers and administrators of a portal to develop and enhance it. Please ensure that the access rights for this application are set correctly and also that the developers can write to the necessary folder in SAS Content.

In order to create a Portal Builder object you have to set the objects type to *portalBuilder*, there are no additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 0,
    "objectBorder": false,
    "type": "portalBuilder",
}
```