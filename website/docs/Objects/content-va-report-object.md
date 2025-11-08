---
sidebar_position: 12
---

# SAS Content Visual Analytics Report

The SAS Content Visual Analytics Report object combines two elements:
1. A SAS Content navigation object where you can click through folders and select a SAS Visual Analytics report (a simple click loads the report below and a double click opens it in a new browser tab).
2. Here the SAS Visual Analytics report is displayed.

This combined object enables end administrators to provide the easy ability to provide dynamic report selection to the user.

In order to create a SAS Content Visual Analytics Report object you have to set the objects type to *sasContentVAReport*, there are additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Report Navigation",
    "id": "RNA",
    "width": 0,
    "height": "80vh",
    "type": "sasContentVAReport",
    "reportName": 1,
    "folderFilter": "/folders/folders/<uri>"
}
```

- **reportName**, specify if you want to see the name of the report above the report itself. Set the value to 1 if you want to see it and 0 if you don't want to see it. Optional, if not present the report name will not be displayed.
- **folderFilter**, specify the URI of a folder in order to set it as the initial navigation point. If this is set the user will not be able to go outside of that initial folder. Optional, if not present the navigation defaults to working of the root of SAS Content.