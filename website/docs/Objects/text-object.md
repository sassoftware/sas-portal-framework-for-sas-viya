---
sidebar_position: 2
---

# Text Object

The text object type enables you display custom text. The text can include lists, links, highlights etc. For more information on how to style the text see the subchapter below.

In order to create a text object you have to set the objects type to *text* and add the additional attribute *content* - example:
```json
{
    "name": "Display Name",
    "id": "Object ID",
    "width": 1,
    "objectBorder": false,
    "type": "text",
    "content": "Hello World"
}
```

- **content**, contains the text that will be displayed in the object. The content attribute is *required*.

## Text Styling

To enable things like lists, clickable links, bold, italic, etc. you have to use *Markdown* syntax in the content attribute - here is a list of the most commonly used syntax elements:
- Headings are denoted with a hashtag (#) and multiple hashtags specify the level of the heading.
- Bold text is surrounded by double asterisks (**).
- Italic text is surrounded by underscores (_).
- Links can be included by surrounding the display text in square brackets ([]) and the following with round brackets (()).
- To embed images use the link syntax but add an exclamation mark (!) in front.