---
sidebar_position: 11
---

# Data Product Marketplace

The Data Product Marketplace object enables users to search data products in their environment. For this two things are requires for the users of this object:

1. Users that make use of the Data Product Registry in order to create new Data Products.
2. A folder in which the user can write needs to be provided (see blow).

It is thus recommended to create a special group - e.g. Data Product Users - in order to provide the ability to subscribe to new data products.

In order to create a Data Product Marketplace object you have to set the objects type to *dataProductMarketplace*, there are additional attributes - example:
```json
{
    "name": "Data Product Marketplace",
    "id": "dpm",
    "width": 0,
    "objectBorder": false,
    "type": "dataProductMarketplace",
    "dataProductSchemaURI": "/files/files/UUID",
    "dataProductFolderURI": "/folders/folders/UUID",
    "dataProductHeaderAttributes": ["dataType", "sensitivityLevel"]
}
```
- **dataProductSchemaURI**, here you have to provide the URI of the uploaded Data Product Schema - see Data Product Registry.
- **dataProductFolderURI**, specify the URI of the folder where the data product owner list is to be stored. In this folder a file will be created called *data-product-users.json*, this file contains all of the users of data products. You can turn this into a SAS table using the code provided at the bottom of this page.
- **dataProductHeaderAttributes**, here you can specify a list of attributes from the Data Product Schema that are to be shown in the header of each data product. It is recommended to not provide more than three.

## Data Product Owner Table

To turn the *data-product-users.json* into a table use the following code:

```sas
* Adjust this path as necessary for your environment;
filename dtOwnrs filesrvc folderPath='/Public/Portal/DPR' filename='data-product-users.json';
libname dtOwnrs json;

data work.data_products;
    set dtOwnrs.root(drop=ordinal_root);
run;

* Clean up;
filename dtOwnrs clear;
libname dtOwnrs clear;
```