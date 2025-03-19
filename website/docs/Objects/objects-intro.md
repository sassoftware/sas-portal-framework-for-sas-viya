---
sidebar_position: 1
---

# Introduction to Objects

Objects are the heart and sould of the SAS Portal. Each object type enables different interactions and offers different capabilities. Because of that each object type will have its own page that explains further the specific configuration options that are available for it.

This page explains the attributes that are shared by all object types, so that each object type page can focus only on the additional attributes.

While you can write this objects by hand, you can also use the Portal Builder object, which enables you to build this objects in a visual way directly from within the portal.

## Shared Attributes

Below we take at the shared attributes of all object types:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 1,
    "height": "700vh",
    "objectBorder": false,
    "type": "objectType"
}
```

- **name**, specifies the name of the object in the UI and is always added as a heading in the object. The name attribute is *required*.
- **id**, is a technical attribute that has to be unique within a page and can not contain blanks or special characters. The id attribute is *required*.
- **width**, specifies how much of the n columns (specified in the general page definition) the object can take up in the UI. The minimum value is 0 and the maximum is 5. The width attribute is *required*. Here is a list of the value break downs:
    - **"auto"**, let object grow as big as needed by its content
    - **0**, make the object take up a whole row
    - **1**, make the object take up 75% of the row
    - **2**, make the object take up 66% of the row
    - **3**, make the object take up 50% of the row
    - **4**, make the object take up 33% of the row
    - **5**, make the object take up 25% of the row

- **height**, specifies the objects height, this will set the height for the whole row that this object is in. It is required to specify both the value and the unit of measurement - while any valid unit of measurement is acceptable, it is recommended to use vh as it is allows for the most consistent look across devices. Note that if your object is bigger then the allotted space then you will see an additional scrolling bar for that element. The height attribute is *optional*, if no provided the portal will try and figure out an appropriate height.
- **objectBorder**, enables you to add an optional border around the object. The border color is set to be either the CSS variable value of *--bs-primary* or if that variable is not available it defaults to lightgray. The objectBorder attribute is *optional*, if set to true a border is added to the object.
- **type**, specifies the type of the object within the UI - that means what content it can contain and display. Please refer to the corresponding page for each types special attributes. The type attribute is *required*.