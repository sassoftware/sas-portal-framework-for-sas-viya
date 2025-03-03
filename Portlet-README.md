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
    "type": "text|linkList|ContentTree|ContentArea|VAReport|ReportPackage|Job|STP|BIPTree|WRSReport|CASTable|ComputeTable|CopyStaticPage|masScore"
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

### Content Group VA Report [DEV]

The **Content Group VA Report** object gives you the ability to let users navigate through the SAS Content Tree, open up folders and select VA reports that are displayed below the content selection area.

```json
{
	"name" : "Heading of Object",
	"id": "ID of the object",
	"width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
	"type": "contentGroupReport",
	"locations": ["myFolder", "favorites", "history", "root", "trash"]
}
```

The **width** for this object can only be 0 as it is a very big element that doesn't nicely play with responsive design. The **width** attribute is required.

The **locations** is an array of possible navigation targets that are made accessible through the SAS Content Tree in this element. The first element will be the default navigation target. The **locations** attribute is required.

Location explainer:

-   **myFolder** - represents the each individual users _My Folder_ area inside of SAS Content
-   **favorites** - represents the collection that a user has marked as favorites inside of SAS Content
-   **history** - gives access to the list of recent interactions with SAS Content of the user
-   **root** - gives access to the top navigation of the SAS Content Tree and all subfolders the user has access to
-   **trash** - gives access to the Recycle Bin where previously deleted from SAS Content by the user

### Content Group Job [DEV]

The **Content Group Job** object gives you the ability to let users navigate through the SAS Content Tree, open up folders and select SAS Jobs that are displayed below the content selection area.

```json
{
	"name" : "Heading of Object",
	"id": "ID of the object",
	"width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
	"type": "contentGroupJob",
	"locations": ["myFolder", "favorites", "history", "root", "trash"]
}
```

The attributes are the same as for the **Content Group VA Report**, please refer to that section for more information.

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
    "authenticationType": "guest|credentials",
    "viyaURL": true|"Viya-Host-URL",
    "reportURI": "Report URI of the VA Report",
    "hideNavigation": true|false|"auto",
    "pageName": "ID of the VA Report page",
    "objectName": "ID of the VA Report object",
    "reportHeight": "valueUnit",
    "reportHandle": [{"handleName": "exportPDF", "options": {}}, ...]
}
```

The **authenticationType** attribute specifies how the to authenticate the request against SAS Viya. If _guest_ is specified the user is automatically signed in as guest (please note that reports have to specifically be made available for guest read access), if _credentials_ is specified the user login is used. The **authenticationType** attribute is optional and will default to _credentials_.

The **viyaURL** attribute specifies the base URL for the SAS Viya environment which hosts the specified report. If _true_ is used then the report is assumed to be on the base environment for the portal - otherwise specify the according URL. The **viyaURL** attribute is optional and will default to _true_.

The **reportURI** is the ID of the element from VA that you want to display inside of this object. The **reportURI** attribute is required - you have to specify the full /reports/reports/\<uri\>. You can get this URI Copy link menu option.

The **hideNavigation** attribute hides or shows the page navigation tabs. _false_ provides an application-like experience, whereas _true_ provides a clean look which displays a single page. The _'auto'_ option displays tabs only for reports with more than one section. The **hideNavigation** attribute is optional and defaults to _'auto'_.

The **pageName** attribute is used if you only want to display a single page contained within the report. The **pageName** attribute is optional, please note if you also specify the **hideNavigation** or **objectName** attributes they will be ignored. You can get this via the Copy link menu option of a page.

The **objectName** attribute is used if you only want to display a single object contained within the report. The **objectName** attribute is optional, note that if you specify a **pageName** this attribute will be ignored - also the **hideNavigation** attribute will be ignored. You can get this via the Copy link menu option of an individual object.

The **reportHeight** attribute enables you to specify a different height for the report then the surrounding object. Note that the surrounding object **height** should be bigger/equal to the **reportHeight**. It is recommended to use _vh_ as a unit for the object and _px_ for the actual report. The **reportHeight** object is optional - it defaults to the object **height**.

#### Report Handle [DEV]

The **reportHandle** lets you define what is available in the context menu of the **VA Report** object. The following for are available:

-   **exportPDF** - enables the user to download a PDF of the report, please see the **exportPDF Options** section to learn how you can configure this further
-   **exportData** - enables the user to download the underlying data as a csv file, please see the **exportData Options** section to learn how you can configure this further
-   **refreshData** - refreshes the data for all objects inside of the **VA Report** object
-   **reloadData** - this reloads all of the data and objects inside of the **VA Report** object and also resets all filters and parameters

You can specify anywhere from zero (0) to all four (4) handlers. The default is zero. The **reportHandle** attribute is required.

**exportPDF Options** enables you to further customize how the generated PDFs look like:

-   **paperSize** - determines the size of the document - the following values are accepted: letter _(default)_, legal, ledger, A3 or A4 - for advanced users there is also custom:
    -   width - any number
    -   height - any number
    -   units - 'inches' _(default)_ or 'centimeters'
-   **orientation** - determines the orientation of the page - the following values are accepted: landscape _(default)_ or portrait
-   **margin** - determines the margins of the page - the following values are accepted:
    -   top: 0.25 _(default)_ - any number
    -   bottom: 0.25 _(default)_ - any number
    -   left: 0.25 _(default)_ - any number
    -   right: 0.25 _(default)_ - any number
    -   units: 'inches' _(default)_ or 'centimeters'
-   **showPageNumbers** - determines if the page numbers are shown - the following values are accepted: true _(default)_ or false
-   **showEmptyRowsAndColumns** - determines if empty rows in list tables / crosstabs are shown - the following values are accepted: true or false _(default)_
-   **includeTableOfContents** - determines if a table of contents is added - the following values are accepted: true or false _(default)_
-   **includeAppendix** - determines if an appendix is added which contains information about filters, parameters, etc. - the following values are accepted: true _(default)_ or false
-   **includeComments** - determines if comments are added to the appendix, only available if **includeAppendix** is true - the following values are accepted: true or false _(default)_
-   **includeDetailsTable** - determines if detail tables for each object are included in the appendix, only available if **includeAppendix** is true - the following values are accepted: true or false _(default)_
-   **expandClippedContent** - determines if you can see all content of tables, crosstabs, gauges and containers, for this each object is printed on its own page - the following values are accepted: true or false _(default)_
-   **includeCoverPage** - determines if a cover page is added to the PDF - the following values are accepted: true _(default)_ or false
-   **coverPageText** - adds an additional Text to the cover page, only available if **includeCoverPage** is true - the following values are allowed: any string, _default_ is ''
-   **includeReportObjects** - enables you to restrict the objects that are exported (this also influences the other options like **includeAppendix**) - the following values are accepted: list of VA elements in quotes - the _default_ is an empty list which will export all shown elements
-   **enablePDFAcessibleTags** - determines if the PDF should contain accessibility markup for screen readers and assistive technology - the following values are accepted: true _(default)_ or false

**exportDataOptions** enables you to further customize how the exported data looks like:

-   **columns** - specify a list of column labels to subset which columns are exported - the _default_ is an empty list which means all columns are exported
-   **startRow** - determines which row the data should start with - the _default_ is 0
-   **endRow** - determines which row of the data should be the last - the _default_ is the index of the last row
-   **formattedData** - determines if the unformatted or formatted data is exported - the following values are accepted: true _(default)_ or false
-   **detailedData** - determines if the aggregated/filtered data or the unaggregated data is exported - the following values are accepted: true or false _(default)_

### Report Package [DEV]

The **Report Package** object enables you to add a VA Report Package to your page. For this to be available you will have to implement a process that generates the report package, transfers it to the webserver and unzips it at the right location.

```json
{
	"name" : "Heading of Object",
	"id": "ID of the object",
	"width": 1,
    "height": "heightUnit",
    "objectBorder": true|false,
	"type": "reportPackage",
	"path": "./<path-to-index.html>"
}
```

The **path** attribute enables you to specify the path to the index.html of the report package - for creating a report package please refer to the next subchapter. The **path** attribute is required.

#### Creating a Report Package

While you can create report packages interactively in the SAS VA interface we will ignore that and look at the two options suited for automation:

1. SAS Viya CLI **(recommended)**, this command line interface could be installed directly on the webserver - you can download it on the [SAS Support page](https://support.sas.com/downloads/package.htm?pid=2512), then [create a profile](https://go.documentation.sas.com/doc/en/sasadmincdc/default/calcli/n1e2dehluji7jon1gk69yggc6i28.htm#p17rei99cguhqdn13m8vgg81nlax), install the reports plugin (see first command), then cd into the target directory (second command), next export the package (third command) and finally unzip it (fourth command):

    ```bash
    # Install the reports plugin
    sas-viya plugins install --repo SAS reports
    # Change into the target directory on the webserver
    cd <target-path>
    # Export the report package
    sas-viya reports build-package -id <report-URI> --output-file <name> --data-level offline
    # Unzip the report package
    unzip <name>.zip
    ```

2. The second option is to use the SAS Viya API (only for advanced users), first you need to make sure you can [generate an access token](https://blogs.sas.com/content/sgf/2023/02/07/authentication-to-sas-viya/) to SAS Viya and then make use of the _{viya-host}/visualAnalytics/reports/{report-URI}/package_ API, documented [here](https://developer.sas.com/apis/rest/Visualization/#export-a-report-package).

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

### Interactive Content List [DEV]

The **Interactive Content List** expands on the idea of the **Interactive Content** object by adding a list of clickable links on the left hand side and on the right hand side display the content of the last clicked link from the list.

```json
{
	"name" : "Heading of Object",
	"id": "ID of the object",
	"width": 1,
    "height": "heightUnit",
    "objectBorder": true|false,
	"type": "interactiveContentList",
    "links": [{"displayText": "Display text", "link": "url"}]
}
```

For the **width** attribute please note that it is assumed that the list of links will take up around one third of the space and the display of the actual content two thirds.

The **links** attribute takes a list of objects. Each object has two attributes, **displayText** which is the text the user should see and **link** which is the actual link that opens when clicked. The **links** attribute is required.

### Portal Builder [DEV]

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

### CAS Table [DEV]

### Compute Table [DEV]

### Copy Static Page [DEV]

```javascript
fetch('google.com')
    .then(function (response) {
        // When the page is loaded convert it to text
        return response.text();
    })
    .then(function (html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, 'text/html');

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        console.log(doc);
    })
    .catch(function (err) {
        console.log('Failed to fetch page: ', err);
    });
```

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

### End to End

The **End to End** module enables users to combine LLMs together with SAS Viya APIs and SDK to auto search the SAS Information Catalog, generate SQL queries, visually explore datasets, recommend data quality workflows, build models and publish models.

```json
{
    "name": "End to End",
    "id": "E2E",
    "width": 0,
    "height": "heightUnit",
    "objectBorder": true|false,
    "type": "endToEnd",
    "model": "modelName",
    "apiEndpoint": "endpointType",
    "apiKey": "Bearer <key-value>"
}

```

The **model** attribute enables you to specify a certain LLM model within the API endpoint that you want to use - note that different models come with different costs. See the next attribute for a links to the model types for each endpoint. The **model** attribute is required.

The **apiEndpoint** specifies which LLM service you want to make use. Currently the following values are allowed:

-   _openai_ - Find the current list of allowed models names and when they are deprecated here: https://platform.openai.com/docs/deprecations
-   _TGWUI_ - This is an integration for the following: https://github.com/oobabooga/text-generation-webui - please use the model as the full API endpoint, the API key can be left blank.

Overtime additional endpoints will be added to help you use the best models for your requirements and save costs. The **apiEndpoint** attribute is required.

The **apiKey** contains the full value, including Bearer, of the services API key. The **apiKey** attribute is required.

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
