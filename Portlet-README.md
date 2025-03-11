# Portlet README

[TOC]

## General Structure in SAS Content

You need to define an entry point in SAS Content - e.g _/Public/Portal_. Under this folder you can then place a folder for each Portal Page you want to be added to the Portal. A Portal Page folder must always contain at least a file named _portal-page-layout.json_ which defines the Portal Pages general layout. At the same level as the Portal Pages you can include a file called _portal-layout.json_:

**SAS Content**

**-- Public**

**---- Portal**

**------ portal-layout.json**

**------ Use Case 1**

**-------- portal-page-layout.json**

**-------- uc-1object-1.json**

**------ Use Case 2**

**-------- portal-page-layout.json**

**-------- uc2-object-1.json**

## General Portal Layout

If you use the _portal-layout.json_ then you have to include all pages in this order or the pages will not appear. But this file is optional if you do not use it the pages will be ordered by their name. Please note that users will still need access to the folders and its contents in order to see the actual portal pages, even if you specify a custom order. The structure of the file is simple:

```json
{
  "displayOrder": [
    {
      "name": "Page Name",
      "uri": "The full /folders/folders URI of the page folder"
    },
	...
  ]
}

```

The **displayOrder** attribute contains a list of objects that describe the pages. The **pageName** is only used for the easier communication to administrators of the portal in the **Portal Builder** and is not used by the actual code - it is recommended to have the name match the folder name that contains the page. The **uri** is the folder URI of each page displayed in the portal. The **displayOrder** attribute and all of its attributes are required.

## General Portal Page Structure

Here we define the general setup (stored in the _portal-page-layout.json_) of the Portal Page and the way its content is laid out. Lets first take a look at the general structure:

```json
{
  "general": {
    "name": "Name of the Portal Page",
    "shorthand": "ID and Search Term for the Portal Page",
    "visible": true|false,
    "showNameOnPage": true|false,
    "numCols": numberOfColumns,
    "contact": "noreply@sas.com"
  },
  "objects": [{
      "name": "Heading of Object",
      "uri": "The full /files/files URI of the object"
    }, ...]
}
```

The **name** of the Portal Page defines the name of the Portal Page inside of the Portal application. This will be displayed in the tab Heading, it will also be the heading inside of the portlet and it will be the name by which this Portal Page can be searched by. You can define any string length, but long names can lead to UX shorting. The **name** attribute is required.

The **shorthand** attribute will be used as the Portal Pages ID and Search Key in the Portal. The **shorthand** can not contain any blanks . The **shorthand** attribute is required.

The **visible** attribute defines whether or not this Portal Page should show up in the users Portal application by default or if the user has to search for it first to add it. The attribute can have the value _true_, shows up, or _false_, has to be searched for. The **visible** attribute is required.

The **showNameOnPage** attribute defines whether or not this Portal Page should show the tab name as an additional heading on the page. The **showNameOnPage** attribute is optional and defaults to _false_, thus the tab name will not be repeated as a page name, if set to _true_ it will.

The attribute **numCols** is the number of columns you want your Portal Page to have. The number of rows is inferred from the number of objects. The **numCols** attribute is required.

The **contact** attribute enables you the specify a contact mail address for somebody responsible for this Portal Page. The information is specified at the bottom of the Portlet. The **contact** attribute is optional.

The **objects** attribute contains an array of all the different objects that make up this Portal Page. The order of the objects defines the order in which objects are displayed. The **objects** attribute is optional, but then the Portlet would be almost blank.

## General Object Structure

Each object is its own json file inside of SAS Content. Technically they can be stored anywhere but for consistency and ease of administration it is recommended to store object definitions inside of the use case folder they belong to. When adding an object make sure that its name and uri is added to the _portal-page-layout.json_ objects attribute list at the place you desire it to appear by default.

Objects are their own files to allow fine grained authorization control over all objects inside of a Portal Page.

Each object describes one element inside of the Portal Page. Lets first take a look at the general structure of the default attributes of each object:

```json
  {
    "name": "Heading of Object",
    "id": "ID of the object",
    "wdith": 2,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "text|linkList|vaReport|interactiveContent||masScore|clientAdministrator|portalBuilder"
  }
```

The **name** of the object specifies the name of the object in the UI and is always added as a heading in the object. The **name** attribute is required.

The **ID** is a technical attribute that has to be unique and can not contain blanks or special characters. The **ID** attribute is required.

The **width** specifies how much of the n columns (specified in the general portlet definition) the object should take up in the UI. The minimum value is 0 and the maximum is 5. The **width** attribute is required. Here is a list of the value break downs:

-   **auto** - let object grow as big as needed by its content
-   **0** - make the object take up a whole row
-   **1** - make the object take up 75% of the row
-   **2** - make the object take up 66% of the row
-   **3** - make the object take up 50% of the row
-   **4** - make the object take up 33% of the row
-   **5** - make the object take up 25% of the row

The **height** attributes specifies the objects height, this will set the height for the whole row that this object is in. It is required to specify both the value and the unit of measurement - while any valid unit of measurement is acceptable, it is recommended to use _vh_ as it is allows for the most consistent look across devices. Note that if your object is bigger then the allotted space then you will see an additional scrolling bar for that element. The **height** attribute is optional, if no provided the portal will try and figure out an appropriate height.

The **objectBorder** attributes enables you to add an optional border around an object. The border color is set to be either the CSS variable value of _--bs-primary_ or if that variable is not available it defaults to _lightgray_. The **objectBorder** attribute is optional, if set to _true_ a border is added to the object.

The **type** specifies the type of the object within the UI - that means what content it can contain and display. Please refer to the corresponding subchapter for each types special attributes. The **type** attribute is required.

### Text

The **text** object enables you to display any text inside of an object.

```json
{
    "name": "Heading of Object",
    "id": "ID of the object",
    "width": 2,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "text",
    "content": "Welcome to the **SAS Portal**. \n\n This is your introduction to the SAS Portal concept page. It is build using SAS Viya and you can find more information [here](https://developer.sas.com/guides/viya-sdk-javascript.html)."
}
```

Specify all the text inside of the **content** attribute. For text styling please see the subchapter _Text Rendering_. The **content** attribute is required.

#### Text Rendering

To enable rich text support we make use of the markdown syntax.

Headings are denoted with a hashtag (#) and multiple hashtags specify the level of the heading.

Bold text is surrounded by double asterisks (\*\*).

Italic text is surrounded by underscores (\_).

Links can be included by surrounding the display text in square brackets ([]) and the following with round brackets (()).

To embed images use the link syntax but add an exclamation mark (!) in front.

https://github.com/zerodevx/zero-md

### Link List

The **Link List** object enables you to display an amount of links that are clickable and you can specify if the links should open in a new tab or if the page should be opened on the current page (back navigation is then handled through the browsers back functionality).

```json
  {
    "name": "Heading of Object",
    "id": "ID of the object",
    "wdith": 1,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "linkList",
    "clickBehavior": "same|tab",
    "links": [{"displayText": "Display text", "link": "https://..."}]
  }
```

The **clickBehavior** attribute can be _same_ to open links in the same browser window or _tab_ to open up the links in a new browser tab. The **clickBehavior** attribute is required.

The **links** attribute takes a list of objects. Each object has two attributes, **displayText** which is the text the user should see and **link** which is the actual link that opens when clicked. The **links** attribute is required.

### VA Report

The **VA Report** object gives you the ability to display a VA Report element (report, page, object). As an add-on you can also enable context menus do allow the following operations: exportData, exportPDF, refreshData, reloadData.

```json
{
    "name" : "Heading of Object",
    "id": "ID of the object",
    "width": 1,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "vaReport",
    "reportURI": "Report URI of the VA Report",
    "pageName": "ID of the VA Report page",
    "objectName": "ID of the VA Report object",
    "reportHeight": "valueUnit",
}
```

The **reportURI** is the ID of the element from VA that you want to display inside of this object. The **reportURI** attribute is required - you have to specify the full /reports/reports/\<uri\>. You can get this URI Copy link menu option.

The **pageName** attribute is used if you only want to display a single page contained within the report. The **pageName** attribute is optional, please note if you also specify the **hideNavigation** or **objectName** attributes they will be ignored. You can get this via the Copy link menu option of a page.

The **objectName** attribute is used if you only want to display a single object contained within the report. The **objectName** attribute is optional, note that if you specify a **pageName** this attribute will be ignored - also the **hideNavigation** attribute will be ignored. You can get this via the Copy link menu option of an individual object.

The **reportHeight** attribute enables you to specify a different height for the report then the surrounding object. Note that the surrounding object **height** should be bigger/equal to the **reportHeight**. It is recommended to use _vh_ as a unit for the object and _px_ for the actual report. The **reportHeight** object is optional - it defaults to the object **height**.

### Interactive Content

The **Interactive Content** object enables you to embed interactive content from other websites. This object is primarily meant to include SAS Viya Job Execution Engine Jobs (SAS Jobs), SAS Stored Processes (STP), SAS 9.4 BIP Tree and SAS 9.4 WRS Reports.

```json
{
	"name" : "Heading of Object",
	"id": "ID of the object",
	"width": 1,
    "height": "heightUnit",
    "objectBorder": true|false,
	"type": "interactiveContent",
	"link": "url",
    "exception": {
        "isException": 0,
        "width": 0,
        "height": 0
    },
    "isViyaContent": true
}
```

The **link** attribute contains the fully qualified URL to the content which will be displayed here - the URL can be URL encoded, but it doesn't have to be - recommended is to not use the encoded URL. The **link** attribute is required.

The **exception** attribute is used when you want to include a URL that throws a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) exception. Such an exception leads to the circumstance that the height and width of the content can not be determined dynamically and thus would default to rather small values. If _CORS_ is not an issue this argument is completely optional - the default value for **isException** is 0, then it is assumed that _CORS_ is not an issue and the width and height are determined based on the content, setting the value to 1 indicates that a _CORS_ exception is expected and the values in the **width** and **height** are used as pixel values. The **exception** attribute is optional and should only be used if there is no way to resolve the _CORS_ exception otherwise.

The **isViyaContent** attribute makes interactive content that you display using this object independent of your SAS Viya environment and rather enables you to tell the SAS Portal to use the SAS Viya host URL used by the Portal itself. If you specify a value of _true_ then you will not need to specify the SAS Viya host it will be added for you, just start your link with a / and then relative to your SAS Viya host. If you specify _false_ then you have to provide an absolute URL. The **isViyaContent** attribute is required.

### Portal Builder

The **Portal Builder** is a very special element that allows the user to edit the structure of the portal. This is a tool meant for developers and administrators of a portal to develop and enhance it. Please ensure that the access rights for this application are set correctly and also that the developers can write to the necessary folder in SAS Content.

```json
{
    "name": "Heading of Object",
    "id": "ID of the object",
    "width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "portalBuilder"
}
```

The **width** attribute has to be 0 has the **Portal Builder** is a full website that is integrated.

### MAS Module Scorer

The **MAS Module Scorer** enables you to quickly test and validate your published SAS Intelligent Decisioning decisions and SAS Model Manager models that have been published to MAS (SAS **M**icro **A**nalytic **S**ervice) - link to the [SAS documentation](https://go.documentation.sas.com/doc/en/mascdc/default/masag/titlepage.htm).

```json
{
    "name": "MAS Scorer",
    "id": "MASS",
    "width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "masScore"
}
```

The **width** is only allows for the value 0, as the element takes up a lot of space. The **width** attribute is required.

### Client Administrator

The **Client Administrator** enables you to view, edit, create and delete applications registered with SAS Viya. Please note that for most of the utilities that this tool provides SAS Administrator group member ship is required.

```json
{
    "name": "OAuth Client Administrator",
    "id": "OCA",
    "width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "clientAdministrator",
}
```

The Client Administrator has no additional attributes for configuration.
