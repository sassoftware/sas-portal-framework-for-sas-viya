---
sidebar_position: 15
---

# Job Prompts

This page explains how the [Job Definition](./job-definition-object.md) and [SAS Content Job](./content-job-object.md) objects display and run a SAS Job Definition. It applies to both objects; their own pages only cover their configuration attributes.

## How a Job Is Displayed

The portal looks at the properties of the job definition to decide how to show it:

| Job definition has | Displayed as |
| --- | --- |
| An HTML form (`form` property) | SAS Job Execution in an embedded frame |
| A JSON prompt (`prompts_v2` property) | A native portal form |
| An XML prompt (`prompts` property) | SAS Job Execution in an embedded frame |
| None of the above | A message that the job has no prompt to display |

If a job has more than one of these, the first matching row wins (an HTML form takes priority over a JSON prompt, which takes priority over an XML prompt).

### Embedded SAS Job Execution

HTML forms and XML prompts are rendered by SAS Job Execution itself, exactly as they would be when opening the job in SAS Viya. The **Reset** button above the frame reloads it, which restores the form's default values.

### JSON Prompt Form

A JSON prompt is rendered by the portal as a form, using the same page, section and control structure as SAS Studio custom steps. Below the form there are:

- **Run**, submits the job through SAS Job Execution with the current values and shows its output below. Required controls are checked first; if any is empty, a message lists the missing fields.
- **Reset**, restores every control to the default values defined in the prompt and clears the output. The compute session is kept, so this is instant.
- **Show SAS Log**, when checked the SAS log of the run is shown in a second tab next to the output, with errors, warnings and notes highlighted.

A status indicator above the form shows whether the compute session is starting, ready, or failed to start.

## Supported JSON Prompt Controls

A prompt consists of one or more pages (shown as tabs when there is more than one) containing controls. Sections (`section`) group controls in a collapsible card; set `open` to `true` to have it expanded initially. Any control with `"visible": false` is hidden but still keeps and submits its value.

| Control type | Rendered as | Value sent to the job |
| --- | --- | --- |
| `text` | Static text | — |
| `link` | A link that opens in a new browser tab | — |
| `textfield` | Single-line text input | The text |
| `textarea` | Multi-line text input | The text |
| `numberfield` | Number input (`min`, `max` and `integer` are applied to the input) | The number |
| `numstepper` | Number input with step buttons (`min`, `max` and `stepsize` are applied to the input) | The number |
| `checkbox` | Checkbox | `1` when checked, `0` otherwise |
| `colorpicker` | Color picker | The color (e.g. `#336699`) |
| `datetime` | Date, time, month or date-time picker (via `subtype`) | The selected value |
| `path` | Text input for a file or folder path (via `pathtype`) | The path |
| `dropdown` | Single-choice dropdown | The selected value |
| `radiogroup` | Radio buttons | The selected value |
| `list` | Multi-select list | The selected values, separated by spaces |
| `inputtable` | Library and table selection | `LIBRARY.TABLE` |
| `outputtable` | Library and table name inputs | `LIBRARY.TABLE` |
| `libraryselector` | Library selection | The library name |
| `columnselector` | Column selection from the table chosen in an `inputtable` (set via `table`) | The selected column names, separated by spaces |
| `newcolumn` | Fields to define a new column (name, label, type, length, format, informat) | The column name |
| `optiontable` | Editable table of rows | The rows as JSON |

Libraries, tables and columns are read from the compute session, so these lists fill in once the session is ready.

A `dropdown` or `list` can get its items from another control instead of a fixed list by setting `"items": { "ref": "<control id>" }`. When it references a `columnselector`, it lists the distinct values of the selected column in the selected table — for example, to let users pick a region from the data itself.

Controls of a type not listed here are shown as a placeholder noting the unsupported type.

## How Values Reach the Job

When the user clicks **Run**, every control's value is passed to the job as a parameter named after the control's `id`, so the SAS program can read it as a macro variable of the same name (e.g. `&dropdown1`). Values are converted as listed in the table above.

Every control is always sent, even when empty, so that a value from a previous run in the same compute session is cleared rather than reused.

The job runs with a timeout of 10 minutes.

## Compute Sessions

JSON prompt forms need a compute session to read libraries, tables and columns and to run the job. The session is started as soon as the form is shown, using the compute context named in the job definition (or the *SAS Studio compute context* if it names none), so it is usually ready by the time the user has filled in the form.

- The session is kept alive while the page is open, so it does not time out while the user is filling in the form.
- It is terminated when the page is closed or reloaded.
- If the session cannot be started (for example because the compute context has reached its limit of servers), the status indicator shows that it failed. Check the browser console for the reason reported by SAS Viya.

The **Job Definition** object starts one session per object. The **SAS Content Job** object shares one session across all the jobs a user selects in it, and only replaces it when a job needs a different compute context — or always uses one named context with its `persistentSession` option. See the [SAS Content Job](./content-job-object.md) page.
