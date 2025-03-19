---
sidebar_position: 3
---

# Link List

The link list object enables you to display an amount of links that are clickable and you can specify if the links should open in a new tab or if the page should be opened on the current page (back navigation is then handled through the browsers back functionality).

In order to create a link list object you have to set the objects type to *linkList*, specify the clickBehavior and specify the links - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 1,
    "objectBorder": false,
    "type": "linkList",
    "clickBehavior": "tab",
    "links": [
        {
            "displayText": "Display text",
            "link": "https://sas.com"
        }
    ]
}
```

- **clickBehavior**, specify how the user is navigated when clicking a link from the list. The acceptable values are *same* - to open links in the same browser window - and *tab* -  to open up the links in a new browser tab. The clickBehavior attribute is *required*.
- **links**, takes a list of objects. Each object has two attributes, *displayText* which is the text the user should see and *link* which is the actual URL that opens when clicked. The links attribute is *required*.