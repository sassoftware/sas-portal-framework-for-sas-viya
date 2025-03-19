---
sidebar_position: 4
---

# SAS Visual Analytics Report

The VA Report object gives you the ability to display a VA Report element (report, page, object).

In order to create a SAS Visual Analytics report object you have to set the objects type to *vaReport*, specify report URI, the page or object and a height for the report - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 1,
    "objectBorder": false,
    "type": "vaReport",
    "reportURI": "/reports/reports/uuid",
    "pageName": "ID of the VA report page",
    "objectName": "ID of the VA report object",
    "reportHeight": "700px"
}
```

- **reportURI**, is the URI of the report that you want to display inside of this object. The reportURI attribute is **required** - you have to specify the full */reports/reports/uuid*. You can get this URI by using the *Copy link* menu option in SAS Visual Analytics.
- **pageName**, is used if you only want to display a single page contained within the report. The pageName attribute is *optional*. You can get this via the *Copy link* menu option of a page.
- **objectName**, attribute is used if you only want to display a single object contained within the report. The objectName attribute is *optional*, note that if you specify a pageName this attribute will be ignored. You can get this via the *Copy link* menu option of an individual object.
- **reportHeight**, attribute enables you to specify a different height for the report then the surrounding object. Note that the surrounding object height should be bigger/equal to the reportHeight. It is recommended to use vh as a unit for the object and px for the actual report. The reportHeight object is *optional* - it defaults to the object height.