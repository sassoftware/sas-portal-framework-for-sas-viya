---
sidebar_position: 5
---

# Interactive Content

The Interactive Content object enables you to embed interactive content from other websites. This object is primarily meant to include SAS Viya Job Execution Engine Jobs (SAS Jobs), SAS 9.4 Stored Processes (STP) and SAS 9.4 WRS Reports. But you can also include links to other web content here.

In order to create a interactive content object you have to set the objects type to *interactiveContent*, specify link, configure its exception behavior and indicate if it is SAS Viya content - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 1,
    "objectBorder": false,
    "type": "interactiveContent",
    "link": "URL",
    "exception": {
        "isException": 0,
        "width": 0,
        "height": 0
    },
    "isViyaContent": true
}
```
- **link**, contains the fully qualified URL (except if it is SAS Viya content, than only use the link relative link to the content) to the content which will be displayed here - the URL can be URL encoded, but it doesn't have to be - recommended is to not use the encoded URL. The link attribute is **required**.
- **exception**, is used when you want to include a URL that throws a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) exception. Such an exception leads to the circumstance that the height and width of the content can not be determined dynamically and thus would default to rather small values. If CORS is not an issue this argument is completely optional - the default value for **isException** is 0, then it is assumed that CORS is not an issue and the width and height are determined based on the content, setting the value to 1 indicates that a CORS exception is expected and the values in the width and height are used as pixel values. The exception attribute is *optional* and should only be used if there is no way to resolve the CORS exception otherwise.
**isViyaContent**, makes interactive content that you display using this object independent of your SAS Viya environment and rather enables you to tell the SAS Portal to use the SAS Viya host URL used by the Portal itself. If you specify a value of *true* then you will not need to specify the SAS Viya host it will be added for you, just start your link with a / and then relative to your SAS Viya host. If you specify *false* then you have to provide an absolute URL. The isViyaContent attribute is *required*.