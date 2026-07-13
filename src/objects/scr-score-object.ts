/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition, InterfaceText } from '../types';
import { getSCRMetadata, scoreSCR } from '../api/scr-api';
import { addAccordionBody } from '../ui/accordion';
import { createTable, addRowToTable } from '../ui/table';

registerObjectType({
  type: 'scrScore',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const scrInterfaceText = (interfaceText?.scrScore ?? {}) as Record<string, string>;
    const objId = definition?.id;

    // Create SCR Score Container
    const scrContainer = document.createElement('div');
    scrContainer.setAttribute('id', `${paneID}-obj-${objId}`);

    // Create the Input Heading
    const inputHeader = document.createElement('h3');
    inputHeader.innerText = scrInterfaceText?.inputHeader ?? '';

    // Create the Input Container. The id carries the `-inputs-content` suffix
    // that addAccordionBody() targets when it fills the input fields.
    const scrInputContainer = document.createElement('div');
    scrInputContainer.id = `${paneID}-obj-${objId}-inputs-content`;

    // Create the Output Heading
    const outputHeader = document.createElement('h3');
    outputHeader.innerText = scrInterfaceText?.outputHeader ?? '';

    // Create the Output Container
    const scrOutputContainer = document.createElement('div');
    scrOutputContainer.id = `${paneID}-obj-${objId}-outputs`;

    // Create the Score Button
    const scrScoreButton = document.createElement('button');
    scrScoreButton.type = 'button';
    scrScoreButton.id = `${paneID}-obj-${objId}-score`;
    scrScoreButton.setAttribute('class', 'btn btn-primary');
    scrScoreButton.innerText = scrInterfaceText?.scoreButton ?? '';
    scrScoreButton.onclick = async function () {
      const self = this as unknown as HTMLButtonElement;
      self.disabled = true;
      self.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${scrInterfaceText?.runStatus ?? ''}`;
      const inputContainer = document.getElementById(
        `${paneID}-obj-${objId}-inputs-content`
      );
      const values = Array.from(
        inputContainer?.querySelectorAll('input') ?? []
      ).map((input) => ({
        name: input.id,
        value: isNaN(Number(input.value))
          ? input.value
          : parseFloat(input.value),
      }));

      const currentSCR = (document.getElementById(
        `${paneID}-obj-${objId}-endpoint`
      ) as HTMLInputElement).value;
      const scrResponse = (await scoreSCR(currentSCR, values)) as { data: Record<string, unknown> };
      const scrResultTableBody = document.getElementById(
        `${paneID}-obj-${objId}-outputs-table-tableBody`
      );
      if (scrResultTableBody) {
        addRowToTable(scrResultTableBody, [Object.values(scrResponse?.data ?? {}) as string[]]);
      }
      self.disabled = false;
      self.innerText = scrInterfaceText?.scoreButton ?? '';
    };

    // Add the SCR Module Input Selector
    const scrEndpointInput = document.createElement('input');
    scrEndpointInput.type = 'text';
    scrEndpointInput.className = 'form-control';
    scrEndpointInput.placeholder = 'https://example.com/SCR';
    scrEndpointInput.id = `${paneID}-obj-${objId}-endpoint`;
    scrEndpointInput.onblur = async function () {
      const self = this as unknown as HTMLInputElement;
      const scrDefinition = await getSCRMetadata(self.value);
      // Reset containers
      const scrInContainer = document.getElementById(
        `${paneID}-obj-${objId}-inputs-content`
      );
      if (scrInContainer) scrInContainer.innerHTML = '';
      const scrOutContainer = document.getElementById(
        `${paneID}-obj-${objId}-outputs`
      );
      if (scrOutContainer) scrOutContainer.innerHTML = '';

      if (scrDefinition.length === 1) {
        const scrError = document.createElement('p');
        scrError.style.color = 'red';
        scrError.innerText = scrDefinition[0] as string;
        scrInContainer?.appendChild(scrError);
      } else {
        // Create the inputs
        addAccordionBody(
          `${paneID}-obj-${objId}`,
          'inputs',
          'input',
          scrDefinition[0]
        );
        // Create the outputs. The field name is either a `name` property on
        // each entry or, failing that, the map key itself.
        const outputFields = scrDefinition[1] as Record<string, { name?: string } | undefined>;
        if (scrOutContainer) {
          createTable(
            scrOutContainer,
            `${paneID}-obj-${objId}-outputs-table`,
            Object.entries(outputFields).map(([key, field]) => field?.name ?? key),
            []
          );
        }
      }
    };

    // Add Label for input
    const scrEndpointInputLabel = document.createElement('label');
    scrEndpointInputLabel.htmlFor = `${paneID}-obj-${objId}-endpoint`;
    scrEndpointInputLabel.innerText = `${scrInterfaceText?.endpoint ?? ''}:`;
    scrEndpointInputLabel.style.textTransform = 'capitalize';

    // Create result
    scrContainer.appendChild(scrEndpointInputLabel);
    scrContainer.appendChild(scrEndpointInput);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(inputHeader);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrInputContainer);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrScoreButton);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(outputHeader);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrOutputContainer);

    return scrContainer;
  },
});
