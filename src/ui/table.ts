/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create a Bootstrap-styled table.
 */
export function createTable(
  tableContainer: HTMLElement,
  baseTableID: string,
  tableHeaders: string[],
  tableBodyContent: string[][]
): void {
  const table = document.createElement('table');
  table.setAttribute('class', 'table table-striped');
  table.setAttribute('id', `${baseTableID}-table`);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const header of tableHeaders) {
    const th = document.createElement('th');
    th.innerText = header;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.setAttribute('id', `${baseTableID}-tableBody`);
  addRowToTable(tbody, tableBodyContent);
  table.appendChild(tbody);

  tableContainer.appendChild(table);
}

/**
 * Add rows to a table body element.
 */
export function addRowToTable(
  tableBodyElement: HTMLElement,
  tableBodyContents: string[][],
  resetContent: boolean = false
): void {
  if (resetContent) {
    tableBodyElement.innerHTML = '';
  }

  for (const rowData of tableBodyContents) {
    const row = document.createElement('tr');
    for (const cellData of rowData) {
      const cell = document.createElement('td');
      cell.innerText = cellData;
      row.appendChild(cell);
    }
    tableBodyElement.appendChild(row);
  }
}
