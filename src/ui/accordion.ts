/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { createTable } from './table';
import { convertTableToCSV } from '../util/csv';
import { downloadAsFile } from '../util/download';

/**
 * Create a Bootstrap accordion item.
 */
export function createAccordionItem(
  accordionContainer: HTMLElement,
  baselineID: string,
  itemID: string,
  interfaceText: Record<string, string> | string
): void {
  const accordionItem = document.createElement('div');
  accordionItem.setAttribute('class', 'accordion-item');

  const accordionHeader = document.createElement('h2');
  accordionHeader.setAttribute('class', 'accordion-header');

  const accordionButton = document.createElement('button');
  accordionButton.setAttribute('class', 'accordion-button collapsed');
  accordionButton.setAttribute('type', 'button');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute(
    'data-bs-target',
    `#${baselineID}-${itemID}-accordionBody`
  );
  accordionButton.setAttribute('aria-expanded', 'false');
  accordionButton.setAttribute(
    'aria-controls',
    `${baselineID}-${itemID}-accordionBody`
  );

  if (typeof interfaceText === 'object') {
    accordionButton.innerText = interfaceText[itemID] ?? itemID;
  } else {
    accordionButton.innerText = interfaceText;
  }

  accordionHeader.appendChild(accordionButton);
  accordionItem.appendChild(accordionHeader);

  const accordionCollapse = document.createElement('div');
  accordionCollapse.setAttribute('id', `${baselineID}-${itemID}-accordionBody`);
  accordionCollapse.setAttribute('class', 'accordion-collapse collapse');
  accordionCollapse.setAttribute(
    'data-bs-parent',
    `#${baselineID}-accordion`
  );

  const accordionBody = document.createElement('div');
  accordionBody.setAttribute('class', 'accordion-body');
  accordionBody.setAttribute('id', `${baselineID}-${itemID}-content`);

  accordionCollapse.appendChild(accordionBody);
  accordionItem.appendChild(accordionCollapse);
  accordionContainer.appendChild(accordionItem);
}

/**
 * Add body content to an existing accordion item.
 */
export function addAccordionBody(
  baselineID: string,
  itemID: string,
  bodyType: string,
  bodyContent: unknown,
  downloadButtonText: string = '',
  codeClipboardButtonText: string = '',
  skipButtons: boolean = false
): void {
  const contentContainer = document.getElementById(
    `${baselineID}-${itemID}-content`
  );
  if (!contentContainer) return;

  // Clear previous content
  contentContainer.innerHTML = '';

  switch (bodyType) {
    case 'table': {
      const tableData = bodyContent as {
        headers: string[];
        content: string[][];
      };
      createTable(
        contentContainer,
        `${baselineID}-${itemID}`,
        tableData.headers,
        tableData.content
      );

      if (!skipButtons && downloadButtonText) {
        const downloadButton = document.createElement('button');
        downloadButton.setAttribute('class', 'btn btn-outline-primary btn-sm');
        downloadButton.innerText = downloadButtonText;
        downloadButton.onclick = () => {
          const table = document.getElementById(
            `${baselineID}-${itemID}-table`
          );
          if (table) {
            const csv = convertTableToCSV(table);
            downloadAsFile(`${baselineID}-${itemID}.csv`, 'text/csv', csv);
          }
        };
        contentContainer.appendChild(downloadButton);
      }
      break;
    }
    case 'code': {
      const codeElement = document.createElement('pre');
      codeElement.innerText = bodyContent as string;
      contentContainer.appendChild(codeElement);

      if (!skipButtons && codeClipboardButtonText) {
        const clipboardButton = document.createElement('button');
        clipboardButton.setAttribute(
          'class',
          'btn btn-outline-primary btn-sm'
        );
        clipboardButton.innerText = codeClipboardButtonText;
        clipboardButton.onclick = () => {
          navigator.clipboard.writeText(bodyContent as string);
        };
        contentContainer.appendChild(clipboardButton);
      }
      break;
    }
    case 'input': {
      // bodyContent may be an array of { name, type } (MAS step inputs) or an
      // object map keyed by field name with { type } values (SCR PCRInput).
      type InputField = { name?: string; type?: string };
      const fields: Array<{ key: string; field: InputField }> = Array.isArray(
        bodyContent
      )
        ? (bodyContent as InputField[]).map((field, i) => ({
            key: String(i),
            field: field ?? {},
          }))
        : Object.entries(
            (bodyContent ?? {}) as Record<string, InputField>
          ).map(([key, field]) => ({ key, field: field ?? {} }));

      for (const { key, field } of fields) {
        const fieldName = field.name ?? key;
        const isNumeric = field.type === 'integer' || field.type === 'decimal';

        const inputGroup = document.createElement('div');
        inputGroup.setAttribute('class', 'input-group mb-3');

        const label = document.createElement('span');
        label.setAttribute('class', 'input-group-text');
        label.style.textTransform = 'capitalize';
        label.innerText = `${fieldName}:`;

        const input = document.createElement('input');
        input.setAttribute('type', isNumeric ? 'number' : 'text');
        input.setAttribute('class', 'form-control');
        input.setAttribute('id', fieldName);
        input.setAttribute('placeholder', fieldName);

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        contentContainer.appendChild(inputGroup);
      }
      break;
    }
  }
}
