---
sidebar_position: 10
---

# Data Product Registry

The Data Product Registry object enables users to add data products to their environment. For this two things are requires for the users of this object:

1. A data product schema has to be provided (see below).
2. A folder in which the user can write needs to be provided (see blow).

It is thus recommended to create a special group - e.g. Data Product Creators - in order to provide the ability to create new data products. Please note that users of the data products need to be able to read in that folder.

In order to create a Data Product Registry object you have to set the objects type to *dataProductRegistry*, there are additional attributes - example:
```json
{
    "name": "Data Product Registry",
    "id": "dpr",
    "width": 0,
    "objectBorder": false,
    "type": "dataProductRegistry",
    "dataProductSchemaURI": "/files/files/UUID",
    "dataProductFolderURI": "/folders/folders/UUID",
    "dataProductNewFolderParentURI": "/folders/folders/UUID",
    "dataProductCopyContent": ["/files/files/UUID", "/reports/reports/UUID"]
}
```
- **dataProductSchemaURI**, here you have to provide the URI of the uploaded Data Product Schema (see below).
- **dataProductFolderURI**, specify the URI of the folder where the data product list is to be stored. In this folder a file will be created called *data-products.json*, this file contains all of the registered data products. You can turn this into a SAS table using the code provided at the bottom of this page.
- **dataProductNewFolderParentURI**, optional - specify if you want to have a folder in SAS Content to be created for you with the same name as the data product - please note that this requires the user to have write access for that folder.
- **dataProductCopyContent**, optional - for this to work you also need to set a dataProductNewFolderParentURI. If you specify it can specify content inside of SAS Content that you want to be copied into the folder that was created for the data product - currently only file and report content is supported.

## Data Product Schema

There is no one correct definition of what you need or should know about a data product, thus this framework provides you a flexible method of adding a data product schema. Below you will find a big example json detailing all of the different options within this schema. The first two elements (*productName* and *accessUrl*) are required as they provide essential technical elements for the framework.

```json
[
    {
        "id": "productName",
        "label": "Product Name",
        "type": "text",
        "required": true,
        "placeholder": "Enter the name of your data product",
        "validation": {
            "minLength": 3,
            "maxLength": 100,
            "pattern": "^[a-zA-Z0-9 -]+$"
        },
        "description": "A unique and descriptive name for the data product."
    },
    {
        "id": "accessUrl",
        "label": "Access URL",
        "type": "url",
        "required": true,
        "placeholder": "https://data-product.example.com/access",
        "description": "URL to access the data product or its documentation."
    },
    {
        "id": "description",
        "label": "Description",
        "type": "textarea",
        "required": false,
        "placeholder": "Provide a detailed description of the data product",
        "validation": {
            "maxLength": 500
        },
        "description": "A brief overview of the data product's purpose and content."
    },
    {
        "id": "dataType",
        "label": "Data Type",
        "type": "dropdown",
        "required": true,
        "options": [
            { "value": "relational", "label": "Relational Database" },
            { "value": "nosql", "label": "NoSQL Database" },
            { "value": "api", "label": "API Endpoint" },
            { "value": "file", "label": "File Storage" },
            { "value": "streaming", "label": "Streaming Data" }
        ],
        "description": "The primary type of data storage or access method."
    },
    {
        "id": "sensitivityLevel",
        "label": "Sensitivity Level",
        "type": "radio",
        "required": true,
        "options": [
            { "value": "public", "label": "Public" },
            { "value": "internal", "label": "Internal Only" },
            { "value": "confidential", "label": "Confidential" },
            { "value": "restricted", "label": "Restricted" }
        ],
        "defaultValue": "internal",
        "description": "The sensitivity classification of the data."
    },
    {
        "id": "ownerEmail",
        "label": "Owner Email",
        "type": "email",
        "required": true,
        "placeholder": "e.g., owner@example.com",
        "validation": {
            "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        "description": "The email address of the data product owner."
    },
    {
        "id": "tags",
        "label": "Tags",
        "type": "multiselect",
        "required": false,
        "options": [
            { "value": "sales", "label": "Sales" },
            { "value": "marketing", "label": "Marketing" },
            { "value": "finance", "label": "Finance" },
            { "value": "operations", "label": "Operations" },
            { "value": "customer-data", "label": "Customer Data" }
        ],
        "description": "Keywords to categorize and search for the data product."
    },
    {
        "id": "creationDate",
        "label": "Creation Date",
        "type": "date",
        "required": true,
        "defaultValue": "today",
        "description": "The date the data product was created."
    },
    {
        "id": "isActive",
        "label": "Is Active?",
        "type": "checkbox",
        "required": false,
        "defaultValue": true,
        "description": "Indicates if the data product is currently active."
    },
    {
        "id": "costCenter",
        "label": "Cost Center",
        "type": "number",
        "required": false,
        "placeholder": "e.g., 12345",
        "validation": {
            "min": 1000,
            "max": 99999
        },
        "description": "The internal cost center associated with this data product."
    }
]
```

## Data Products Table

To turn the *data-products.json* into a table use the following code:

```sas
* Adjust this path as necessary for your environment;
filename dtPrdkts filesrvc folderPath='/Public/Portal/DPR' filename='data-products.json';
libname dtPrdkts json;

* Macro to take the additional table data and join it back to the original table;
%macro _add_json_data(tableName, numberOfColumns);
    %local tableName numberOfColumns i;
    
    * Turn the different columns into one column;
    data work._temp_data;
        length &tableName. $32000.;
        set dtPrdkts.&tableName.;

        &tableName. = catx(' | ', of &tableName.:);
        keep ordinal_root &tableName.;
    run;

    * Join the data back to the base;
    proc sql noPrint noWarnrecurs;
        create table work.data_products as
            select a.*,
                b.&tableName.
                from work.data_products as a
                    left join work._temp_data as b
                        on a.ordinal_root EQ b.ordinal_root;
    quit;

    * Clean up;
    proc datasets library=work noList;
        delete _temp_data;
    run; quit;
%mend _add_json_data;

* Retrieve the structure of the JSON and check for additional tables;
proc sql noPrint;
    create table work._json_tables_info as
        select memname, nvar
            from dictionary.tables
                where libname = upcase("dtPrdkts")
                    and memname not in ('ALLDATA', 'ROOT');
quit;

* Handle the case if there are arrays in the JSON;
%if &SQLOBS. GE 1 %then %do;
    %put NOTE: Further processing will be done - there were &SQLOBS. tables found to process;
    data work.data_products;
        set dtPrdkts.root;
    run;
    
    data _null_;
        set work._json_tables_info;
        * Substract 2 from nvar for the two ordinal_* variables;
        args = compress('%nrstr(%_add_json_data(' || lowcase(memname) || ',' || nvar - 2 || '))');
        call execute(args);
    run;
%end;
%else %do;
    %put NOTE: No additional tables found so no further processing is done;
    data work.data_products;
        set dtPrdkts.root;
    run;
%end;

* Remove the ordinal_root artifact;
data sasdata.KONTOUR_DPE_MASTER; * #GERMHN, 20.6.25, alt: work.data_products;
    set work.data_products(drop=ordinal_root);
run;

* Clean up;
filename dtPrdkts clear;
libname dtPrdkts clear;
%sysmacdelete _add_json_data;
proc datasets library=work noList;
    delete _json_tables_info;
run; quit;
```