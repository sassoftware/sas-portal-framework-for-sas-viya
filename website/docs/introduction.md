---
sidebar_position: 3
---

# Introduction

On this page we will walk through how the portal works. What are pages and what are objects - and a bunch more.

The structure in SAS Content - the exmaple will follow the provided example SAS Portal setup:

```
SAS Content
  - Public
    - Portal <- The entry point for the SAS Portal
      - Build Portal <- Folder = Page
      - MAS Tester <- Folder = Page
      - Use Case 1 <- Folder = Page
      - VA Test <- Folder = Page
      - portal-layout.json <- Defines the display order of pages in the Portal
```

## Portal Pages

Here we will look at the general setup and authroization around pages, the next section will touch on objects.

Now from an authorization perspective the user requires read access to the **Portal** folder. Folders within this **Portal** folder are containing the definition of a page within the SAS Portal - so Folder equals Page.

If you want to restrict the access to a page in the SAS Portal to a certain group, than you just have to apply a corresponding rule to the folder within SAS Content.

The **portal-layout.json** is a file that the portal looks for to order the pages in a specific order. If this file is not available than the pages will be displayed in alpabetical order of the folders in SAS Content. If a user is not allowed to see a page that is listed in the order than that page is just skipped, now error will be displayed to the user.

## Portal Page Objects

Let's drill into the setup of the VA Test page:

```
SAS Content
  - Public
    - Portal
      - VA Test
        - portal-page-layout.json <- Definition of the page
        - vaReport-example.json <- Definition of a object on the page
        - vaReportObject-example.json <- Definition of a object on the page
        - vaReportPage-example.json <- Definition of a object on the page
```

Now inside a folder there always has to be a **portal-page-layout.json** file, if this file doesn't exist than the folder is not considered to be a valid page within the portal and will be skipped. This file defines the display name of the page in the portal, the shorthand of the page (technical attribute), the amount of columns (i.e. how many objects can be displayed next to each other), a contact E-Mail address (leaving this empty will result in no footer for the page) and finaly the display order of objects on a page.

And then we see three json files in there which correspond to an object on the page. Here you have the ability to go in and apply authorization rules on an individual object level if necessary. If an object is listed in the page order but can not be accessed by the user the interface will not display an error and just skip that object. For a deeper look at the objects check the next corresponding documentation section on **Objects**.

## Deep Dive on the portal-page-layout.json

In this section we will walkthrough the **portal-page-layout.json** and explain of its different attributes. Please note that while you can create these files by hand, the Portal Builder object can also build them for you.

Here is the general structure of the **portal-page-layout.json** - based on the VA Test example page:
```json
{
    "general": {
        "name": "VA Test",
        "shorthand": "VAT", 
        "visible": true,
        "numCols": 1,
        "contact": "david.weik@sas.com"
    },
    "objects": [
        {
            "name": "Full Report",
            "uri": "/files/files/258d1a39-9b7d-4277-95ad-486004031dd9"
        },
        {
            "name": "Just a Page",
            "uri": "/files/files/81d2a29f-6462-455d-ac44-58f312eac9bb"
        },
        {
            "name": "Just an Object",
            "uri": "/files/files/6ede652c-aa54-4dbd-8237-1be08e268ab6"
        }
    ]
}
```

The **general** section defines how the page shows up in the portal and defines how the objects on the page are organized:
- **name**, defines the name of the page inside of the Portal. This will be displayed in the tab heading. You can define any string length, but long names can lead to UX shorting. The name attribute is *required*.
- **shorthand**, defines the technical ID of the portal page. The shorthand can not contain any blanks. The shorthand attribute is *required*.
- **visible**, has been added as a potential future extension of the portal and is currently not used. The visible attribute is *required* and should be defaulted to *true*.
- **numCols**, defines the number of columns you want objects to be ordered into on the page. The number of rows is inferred from the number of objects and their specified width. The numberCols attribute is *required*.
- **contact**, enables you to specify a contact E-Mail address as a responsible party for the page at the bottom of the page. When a users clicks on the E-Mail address is clicked a E-Mail draft opens up that has the page name as a subject line. The contact attribute is *optional*.

The **object** section defines the order that objects are displayed on the page. It is a list of the objects where each object represents one object that is displayed and has the following two attributes:
- **name**, this name is not used in displaying the object and only serves as a human-readable attribute to help understand the organization. THe name attribute is *required*.
- **uri**, here you have to specify the full */files/files/uuid* of the object to be displayed.

Technically speaking the **object** section is optional, but this would than create just a blank page.