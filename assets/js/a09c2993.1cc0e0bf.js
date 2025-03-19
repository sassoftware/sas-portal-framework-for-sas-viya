"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[899],{7974:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>r,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>h});const o=JSON.parse('{"id":"introduction","title":"Introduction","description":"On this page we will walk through how the portal works. What are pages and what are objects - and a bunch more.","source":"@site/docs/introduction.md","sourceDirName":".","slug":"/introduction","permalink":"/sas-portal-framework-for-sas-viya/introduction","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"sidebar_position":3},"sidebar":"defaultSidebar","previous":{"title":"Setup","permalink":"/sas-portal-framework-for-sas-viya/setup"},"next":{"title":"Introduction to Objects","permalink":"/sas-portal-framework-for-sas-viya/Objects/objects-intro"}}');var a=n(4848),s=n(8453);const i={sidebar_position:3},r="Introduction",l={},h=[{value:"Portal Pages",id:"portal-pages",level:2},{value:"Portal Page Objects",id:"portal-page-objects",level:2},{value:"Deep Dive on the portal-page-layout.json",id:"deep-dive-on-the-portal-page-layoutjson",level:2}];function d(e){const t={code:"code",em:"em",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"introduction",children:"Introduction"})}),"\n",(0,a.jsx)(t.p,{children:"On this page we will walk through how the portal works. What are pages and what are objects - and a bunch more."}),"\n",(0,a.jsx)(t.p,{children:"The structure in SAS Content - the exmaple will follow the provided example SAS Portal setup:"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{children:"SAS Content\n  - Public\n    - Portal <- The entry point for the SAS Portal\n      - Build Portal <- Folder = Page\n      - MAS Tester <- Folder = Page\n      - Use Case 1 <- Folder = Page\n      - VA Test <- Folder = Page\n      - portal-layout.json <- Defines the display order of pages in the Portal\n"})}),"\n",(0,a.jsx)(t.h2,{id:"portal-pages",children:"Portal Pages"}),"\n",(0,a.jsx)(t.p,{children:"Here we will look at the general setup and authroization around pages, the next section will touch on objects."}),"\n",(0,a.jsxs)(t.p,{children:["Now from an authorization perspective the user requires read access to the ",(0,a.jsx)(t.strong,{children:"Portal"})," folder. Folders within this ",(0,a.jsx)(t.strong,{children:"Portal"})," folder are containing the definition of a page within the SAS Portal - so Folder equals Page."]}),"\n",(0,a.jsx)(t.p,{children:"If you want to restrict the access to a page in the SAS Portal to a certain group, than you just have to apply a corresponding rule to the folder within SAS Content."}),"\n",(0,a.jsxs)(t.p,{children:["The ",(0,a.jsx)(t.strong,{children:"portal-layout.json"})," is a file that the portal looks for to order the pages in a specific order. If this file is not available than the pages will be displayed in alpabetical order of the folders in SAS Content. If a user is not allowed to see a page that is listed in the order than that page is just skipped, now error will be displayed to the user."]}),"\n",(0,a.jsx)(t.h2,{id:"portal-page-objects",children:"Portal Page Objects"}),"\n",(0,a.jsx)(t.p,{children:"Let's drill into the setup of the VA Test page:"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{children:"SAS Content\n  - Public\n    - Portal\n      - VA Test\n        - portal-page-layout.json <- Definition of the page\n        - vaReport-example.json <- Definition of a object on the page\n        - vaReportObject-example.json <- Definition of a object on the page\n        - vaReportPage-example.json <- Definition of a object on the page\n"})}),"\n",(0,a.jsxs)(t.p,{children:["Now inside a folder there always has to be a ",(0,a.jsx)(t.strong,{children:"portal-page-layout.json"})," file, if this file doesn't exist than the folder is not considered to be a valid page within the portal and will be skipped. This file defines the display name of the page in the portal, the shorthand of the page (technical attribute), the amount of columns (i.e. how many objects can be displayed next to each other), a contact E-Mail address (leaving this empty will result in no footer for the page) and finaly the display order of objects on a page."]}),"\n",(0,a.jsxs)(t.p,{children:["And then we see three json files in there which correspond to an object on the page. Here you have the ability to go in and apply authorization rules on an individual object level if necessary. If an object is listed in the page order but can not be accessed by the user the interface will not display an error and just skip that object. For a deeper look at the objects check the next corresponding documentation section on ",(0,a.jsx)(t.strong,{children:"Objects"}),"."]}),"\n",(0,a.jsx)(t.h2,{id:"deep-dive-on-the-portal-page-layoutjson",children:"Deep Dive on the portal-page-layout.json"}),"\n",(0,a.jsxs)(t.p,{children:["In this section we will walkthrough the ",(0,a.jsx)(t.strong,{children:"portal-page-layout.json"})," and explain of its different attributes. Please note that while you can create these files by hand, the Portal Builder object can also build them for you."]}),"\n",(0,a.jsxs)(t.p,{children:["Here is the general structure of the ",(0,a.jsx)(t.strong,{children:"portal-page-layout.json"})," - based on the VA Test example page:"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-json",children:'{\n    "general": {\n        "name": "VA Test",\n        "shorthand": "VAT", \n        "visible": true,\n        "numCols": 1,\n        "contact": "david.weik@sas.com"\n    },\n    "objects": [\n        {\n            "name": "Full Report",\n            "uri": "/files/files/258d1a39-9b7d-4277-95ad-486004031dd9"\n        },\n        {\n            "name": "Just a Page",\n            "uri": "/files/files/81d2a29f-6462-455d-ac44-58f312eac9bb"\n        },\n        {\n            "name": "Just an Object",\n            "uri": "/files/files/6ede652c-aa54-4dbd-8237-1be08e268ab6"\n        }\n    ]\n}\n'})}),"\n",(0,a.jsxs)(t.p,{children:["The ",(0,a.jsx)(t.strong,{children:"general"})," section defines how the page shows up in the portal and defines how the objects on the page are organized:"]}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"name"}),", defines the name of the page inside of the Portal. This will be displayed in the tab heading. You can define any string length, but long names can lead to UX shorting. The name attribute is ",(0,a.jsx)(t.em,{children:"required"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"shorthand"}),", defines the technical ID of the portal page. The shorthand can not contain any blanks. The shorthand attribute is ",(0,a.jsx)(t.em,{children:"required"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"visible"}),", has been added as a potential future extension of the portal and is currently not used. The visible attribute is ",(0,a.jsx)(t.em,{children:"required"})," and should be defaulted to ",(0,a.jsx)(t.em,{children:"true"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"numCols"}),", defines the number of columns you want objects to be ordered into on the page. The number of rows is inferred from the number of objects and their specified width. The numberCols attribute is ",(0,a.jsx)(t.em,{children:"required"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"contact"}),", enables you to specify a contact E-Mail address as a responsible party for the page at the bottom of the page. When a users clicks on the E-Mail address is clicked a E-Mail draft opens up that has the page name as a subject line. The contact attribute is ",(0,a.jsx)(t.em,{children:"optional"}),"."]}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["The ",(0,a.jsx)(t.strong,{children:"object"})," section defines the order that objects are displayed on the page. It is a list of the objects where each object represents one object that is displayed and has the following two attributes:"]}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"name"}),", this name is not used in displaying the object and only serves as a human-readable attribute to help understand the organization. THe name attribute is ",(0,a.jsx)(t.em,{children:"required"}),"."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"uri"}),", here you have to specify the full ",(0,a.jsx)(t.em,{children:"/files/files/uuid"})," of the object to be displayed."]}),"\n"]}),"\n",(0,a.jsxs)(t.p,{children:["Technically speaking the ",(0,a.jsx)(t.strong,{children:"object"})," section is optional, but this would than create just a blank page."]})]})}function c(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>r});var o=n(6540);const a={},s=o.createContext(a);function i(e){const t=o.useContext(s);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),o.createElement(s.Provider,{value:t},e.children)}}}]);