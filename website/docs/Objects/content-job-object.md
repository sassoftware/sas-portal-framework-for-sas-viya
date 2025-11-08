---
sidebar_position: 13
---

# SAS Content Job

The SAS Content Job object combines two elements:
1. A SAS Content navigation object where you can click through folders and select a SAS Job Definition (a simple click loads the job below and a double click opens it in a new browser tab).
2. Here the SAS Job Definition is displayed.

This combined object enables end administrators to provide the easy ability to provide dynamic job selection to the user.

In order to create a SAS Content Job object you have to set the objects type to *sasContentJob*, there are additional attributes, but the width has to be 0 - example:
```json
{
    "name": "Job Navigation",
    "id": "jNA",
    "width": 0,
    "height": "80vh",
    "type": "sasContentJob",
    "jobName": 1,
    "folderFilter": "/folders/folders/<uri>"
}
```

- **jobName**, specify if you want to see the name of the job above the job itself. Set the value to 1 if you want to see it and 0 if you don't want to see it. Optional, if not present the job name will not be displayed.
- **folderFilter**, specify the URI of a folder in order to set it as the initial navigation point. If this is set the user will not be able to go outside of that initial folder. Optional, if not present the navigation defaults to working of the root of SAS Content.