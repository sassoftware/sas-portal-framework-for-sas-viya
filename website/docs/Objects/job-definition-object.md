---
sidebar_position: 14
---

# Job Definition

The Job Definition object displays one specific SAS Job Definition on a page, so users can fill in its prompt and run it without leaving the portal. Use it when a page is built around a fixed job; if users should pick from several jobs in a folder, use the [SAS Content Job](./content-job-object.md) object instead.

How the job is shown depends on its prompt:
- A job with a **JSON prompt** is rendered as a native portal form with **Run** and **Reset** buttons, an optional SAS log, and the output shown below the form.
- A job with an **HTML form** or an **XML prompt** is shown through SAS Job Execution in an embedded frame, with a **Reset** button that reloads the form.

See [Job Prompts](./job-prompts.md) for the details of both modes, the supported JSON prompt controls, and how compute sessions are handled.

In order to create a Job Definition object you have to set the objects type to *jobDefinition* and specify the path of the job in SAS Content - example:
```json
{
    "name": "Car Report",
    "id": "CRJ",
    "width": 0,
    "height": "600px",
    "type": "jobDefinition",
    "contentPath": "/Public/Content/SAS Jobs/Car Job"
}
```

- **contentPath**, the full path of the job definition in SAS Content, starting with a `/` and ending with the job's name (e.g. `/Public/Content/SAS Jobs/Car Job`). The path is case sensitive and must match the folder and job names exactly. The contentPath attribute is *required*, if it is missing or does not point to a job definition an error message is shown instead.
- **height**, for jobs shown through SAS Job Execution (HTML form or XML prompt) this sets the height of the embedded frame. Optional, defaults to `600px`. JSON prompt forms grow with their content.

The compute session for a JSON prompt is started as soon as the page loads, using the compute context the job definition specifies (or the *SAS Studio compute context* if it specifies none), so the form is ready when the user clicks **Run**. The session is kept alive while the page is open and terminated when the page is closed.
