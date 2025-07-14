---
sidebar_position: 9
---

# Run Custom Code

The Run Custom Code is an advanced element that allows for the execution of SAS code implicitly when the portal is started and when it is left. In addition it can grab URL parameters to inject variables into the code. This can be usful to apply custom loading logics for data assets or preparing other resources for users in the background

In order to create a Run Custom Code object you have to set the objects type to *runCustomCode*, there are additional attributes, but the width has to be 0 - example:
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

- **computeContext**, specify the name of the compute context that you want to use for this specific run custom code object. Please ensure the correct spelling and capitalization.
- **code**, here you can specifc your code. Make sure that you escape double quotes with a \ and to make use of url parameters us the following within your code **"${searchParams.urlParameter}"**.
- **action**, this enables you trigger something additionally after the code has run to completion. There currently is two actions available:
        1. **refreshData**, enables you to target a VA report object on the page and reload the data of the element.
        2. **reloadReport**, enabley you to target a VA report object on the apge and reload the whole element.
- **actionElement**, specify the element that you want to target.
- **unloadCode**, similiar to the code attribute, but while be run when the user leaves the page.