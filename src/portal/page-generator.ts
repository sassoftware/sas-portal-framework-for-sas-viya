/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generate the actual Portal Pages using the object type registry.
 */

import type { PageLayout, ObjectDefinition, InterfaceText } from '../types';
import { getFileContent } from '../api/files-api';
import { getObjectBuilder } from '../objects/registry';

export async function generatePages(
  layout: PageLayout,
  paneContainer: HTMLElement,
  interfaceText: InterfaceText
): Promise<void> {
  const row = document.createElement('div');
  row.setAttribute('class', `row row-cols-${layout?.general?.numCols}`);
  row.setAttribute('id', `${layout?.general?.shorthand}-row`);
  paneContainer.appendChild(row);

  for (const objRef of layout?.objects ?? []) {
    let currentObjectDefinition: ObjectDefinition;
    try {
      const currentObjectContent = await getFileContent(objRef?.uri);
      if (!currentObjectContent.ok) {
        throw new Error(
          `Request for ${objRef?.uri} failed with HTTP ${currentObjectContent.status}`
        );
      }
      currentObjectDefinition = await currentObjectContent.json();
    } catch (error) {
      // Skip this object rather than aborting the whole page render.
      console.error(
        `Skipping object ${objRef?.uri}: could not load its definition.`,
        error
      );
      continue;
    }

    // Translate Object Width
    let objectWidth: number | string;
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

    const newObjectElement = document.createElement('div');
    newObjectElement.setAttribute('class', `col-${objectWidth}`);
    if (currentObjectDefinition?.height) {
      newObjectElement.style.height = currentObjectDefinition.height;
    }

    const newCard = document.createElement('div');
    newCard.setAttribute('class', 'card h-100');
    newCard.style.overflow = 'scroll';
    if (currentObjectDefinition?.objectBorder === true) {
      newCard.style.border = '1px solid var(--bs-primary, lightgray)';
    }

    const newCardBody = document.createElement('div');
    newCardBody.setAttribute('class', 'card-body');

    if (currentObjectDefinition?.showNameOnPage === true) {
      const heading = document.createElement('p');
      heading.setAttribute('class', 'fs-2');
      heading.innerText = currentObjectDefinition?.name;
      newCardBody.appendChild(heading);
    }

    // Use the object type registry instead of a switch statement
    const builder = getObjectBuilder(currentObjectDefinition?.type);
    let content: HTMLElement;
    if (builder) {
      try {
        content = await builder.build(
          currentObjectDefinition,
          layout?.general?.shorthand,
          interfaceText
        );
      } catch (error) {
        // A single failing object must not blank the rest of the page.
        console.error(
          `Object "${currentObjectDefinition?.id ?? ''}" (type "${currentObjectDefinition?.type ?? ''}") failed to render.`,
          error
        );
        content = document.createElement('p');
        content.innerText = interfaceText?.undefinedObjectText;
      }
    } else {
      content = document.createElement('p');
      content.innerText = interfaceText?.undefinedObjectText;
    }

    newCardBody.appendChild(content);
    newCard.appendChild(newCardBody);
    newObjectElement.appendChild(newCard);
    row.appendChild(newObjectElement);
  }

  // Add Contact Information for the page
  if (layout?.general?.contact) {
    const spacer = document.createElement('hr');
    paneContainer.appendChild(spacer);
    const contact = document.createElement('p');
    contact.innerHTML = `${interfaceText?.contactMessage} <a href='mailto:${layout.general.contact}?subject=${layout.general.name}'>${layout.general.contact}</a>`;
    paneContainer.appendChild(contact);
  }
}
