/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add a Table to an element
 * 
 * @param {HTMLElement} tableContainer - Element that will contain the table
 * @param {String} baseTableID - ID of baseline element that will contain the table
 * @param {Array} tableHeaders - Array of Strings that make up the headers for the table
 * @param {Array of Array} tableBodyContent - Array of Array where each element is a row in the table
 *
 * Doesn't return anything, as the function directly appends to an element
 */
function createTable(
  tableContainer,
  baseTableID,
  tableHeaders,
  tableBodyContent
) {
  // Create a new table
  let table = document.createElement('table');
  table.setAttribute('id', `${baseTableID}-table-root`);
  table.setAttribute('class', 'table table-striped');

  // Create table headers
  let tableHeader = document.createElement('thead');
  let tableHeaderRow = document.createElement('tr');

  // Create a header column for each header
  for (header in tableHeaders) {
    let tableHead = document.createElement('th');
    tableHead.setAttribute('scope', 'col');
    tableHead.innerText = tableHeaders[header];
    tableHeaderRow.appendChild(tableHead);
  }

  // Append the header to the table
  tableHeader.appendChild(tableHeaderRow);
  table.appendChild(tableHeader);

  // Create table body
  let tableBody = document.createElement('tbody');
  tableBody.setAttribute('id', `${baseTableID}-table`);
  table.appendChild(tableBody);

  addRowToTable(tableBody, tableBodyContent);

  // Append table to the table container
  tableContainer.appendChild(table);
}
