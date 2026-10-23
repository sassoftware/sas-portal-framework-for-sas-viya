---
sidebar_position: 13
---

# SAS Content Job

The SAS Content Job object combines two elements:
1. A SAS Content navigation object where you can click through folders and select a SAS Job Definition (a simple click loads the job below). The **Refresh** button above it reloads the folder contents, keeping the folder you are in.
2. Here the SAS Job Definition is displayed. Its **Reset** button restores the job's default values. The job is unloaded again when you navigate to another folder.

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
- **openOnDoubleClick**, set the value to 1 to let a double click (or Enter) on a job open it in a new SAS Viya browser tab. Optional, if not present double-clicking a job does nothing beyond loading it.
- **persistentSession**, set the value to 1 to keep one compute session alive for every job selected in this object, regardless of the compute context each job specifies. Requires **computeContext**. Optional, if not present the session is still shared between jobs but is replaced when a job uses a different compute context.
- **computeContext**, the name of the compute context used for the persistent session (e.g. `SAS Studio compute context`). Only used together with **persistentSession**.

Example with a persistent compute session:
```json
{
    "name": "Job Navigation",
    "id": "jNA",
    "width": 0,
    "height": "80vh",
    "type": "sasContentJob",
    "jobName": 1,
    "persistentSession": 1,
    "computeContext": "SAS Studio compute context"
}
```