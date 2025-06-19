/**
 * Generate the actual Portal Pages
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} layout - The full content of portal-page-layout.json for each page
 * @param {HTMLDivElement} paneContainer - A HTML Div Element that will contain the Page content
 * @param {Object} interfaceText - Contains all of the static language interface
 */
async function generatePages(VIYAHOST, layout, paneContainer, interfaceText) {
    // Add a row with the column scaling
    let row = document.createElement('div');
    row.setAttribute('class', `row row-cols-${layout?.general?.numCols}`);
    row.setAttribute('id', `${layout?.general?.shorthand}-row`);
    paneContainer.appendChild(row);

    for (currObj in layout?.objects) {
        let currentObjectContent = await getFileContent(
            VIYAHOST,
            layout?.objects[currObj]?.uri
        );
        let currentObjectDefinition = await currentObjectContent.json();

        // Translate Object Width
        let objectWidth;
        switch (currentObjectDefinition?.width) {
            case 0:
                objectWidth = 12;
                break;
            case 1:
                objectWidth = 9;
                break;
            case 2:
                objectWidth = 8;
                break;
            case 3:
                objectWidth = 6;
                break;
            case 4:
                objectWidth = 4;
                break;
            case 5:
                objectWidth = 3;
                break;
            default:
                objectWidth = 'auto';
        }

        // Generate the object with its width
        let newObjectElement = document.createElement('div');
        newObjectElement.setAttribute('class', `col-${objectWidth}`);
        // Check if user has set an explicit height for the object
        if (currentObjectDefinition?.height) {
            newObjectElement.style.height = currentObjectDefinition?.height;
        }
        // Generate the card for the content
        let newCard = document.createElement('div');
        newCard.setAttribute('class', 'card h-100');
        newCard.style.overflow = 'scroll';
        // Add a border if the user wants one
        if (currentObjectDefinition?.objectBorder === true) {
            newCard.style.border = `1px solid var(--bs-primary, lightgray)`;
        }
        // Generate the card body for the content
        let newCardBody = document.createElement('div');
        newCardBody.setAttribute('class', 'card-body');

        // Add the Name of the object as a Heading
        if (currentObjectDefinition?.showNameOnPage === true) {
            let heading = document.createElement('p');
            heading.setAttribute('class', 'fs-2');
            heading.innerText = currentObjectDefinition?.name;
            newCardBody.appendChild(heading);
        }

        // Handle different Object types
        let content;
        switch (currentObjectDefinition?.type) {
            case 'text':
                content = await addTextObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand
                );
                break;
            case 'linkList':
                content = await addLinkListObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand
                );
                break;
            case 'interactiveContent':
                content = await addInteractiveContentObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand
                );
                break;
            case 'vaReport':
                content = await addVAReportObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand
                );
                break;
            case 'portalBuilder':
                content = await addPortalBuilderObject(
                    currentObjectContent,
                    layout?.general?.shorthand
                );
                break;
            case 'masScore':
                content = await addMASScoreObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand,
                    interfaceText?.masScore
                );
                break;
            case 'clientAdministrator':
                content = await addClientAdministrator(
                    currentObjectDefinition,
                    layout?.general?.shorthand,
                    interfaceText?.clienAdministrator
                );
                break;
            case 'runCustomCode':
                content = await addRunCustomCode(
                    currentObjectDefinition,
                    layout?.general?.shorthand
                );
                break;
            case 'scrScore':
                content = await addSCRScoreObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand,
                    interfaceText?.scrScore
                );
                break;
            case 'dataProductRegistry':
                content = await addDataProductRegistryObject(
                    currentObjectDefinition,
                    layout?.general?.shorthand,
                    interfaceText?.dataProductRegistry
                );
                break;
            default:
                content = document.createElement('p');
                content.innerText = interfaceText?.undefinedObjectText;
        }

        // Add the content to the new object
        newCardBody.appendChild(content);
        newCard.appendChild(newCardBody);
        newObjectElement.appendChild(newCard);

        // Add the new object to the row
        row.appendChild(newObjectElement);
    }

    // Add Contact Information for the page
    if (layout?.general?.contact) {
        const SPACER = document.createElement('hr');
        paneContainer.appendChild(SPACER);
        const CONTACT = document.createElement('p');
        CONTACT.innerHTML = `${interfaceText?.contactMessage} <a href='mailto:${layout?.general?.contact}?subject=${layout?.general?.name}'>${layout?.general?.contact}</a>`;
        paneContainer.appendChild(CONTACT);
    }
}
