/**
 * Add rows to a table
 *
 * @param {HTMLElement} tableBodyElement - Table body element to which the rows should be added
 * @param {Array of Array} tableBodyContents - Array of Array where each element is a row in the table
 * @param {Boolean} resetContent - Reset the content of the table before adding new content - optional, default is false
 *
 * Doesn't return anything, as the function directly appends to a table element
 */
function addRowToTable(
  tableBodyElement,
  tableBodyContents,
  resetContent = false
) {
  // Optionally reset the content of the table body
  if (resetContent) {
    tableBodyElement.innerHTML = '';
  }

  // Iterate overall rows
  for (const tableRow in tableBodyContents) {
    // Add a new row to the table
    let currentTableRowContent = tableBodyContents[tableRow];
    let currentTableRow = document.createElement('tr');

    // Add a new cell to the row
    for (const tableCell in currentTableRowContent) {
      let currentTableCell = document.createElement('td');
      currentTableCell.innerText = currentTableRowContent[tableCell];

      // Append the cell to the row
      currentTableRow.appendChild(currentTableCell);
    }

    // Append the row to the table
    tableBodyElement.appendChild(currentTableRow);
  }
}
