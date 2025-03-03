/**
 * Take a valid HTML table and return it as a valid csv string
 *
 * @param {HTMLElement} htmlTableElement - The root table element which is to be converted
 * @returns Returns a string containing a valid csv
 */
function convertTableToCSV(htmlTableElement) {
  let csvData = [];

  // Get all data from the table element
  let rows = htmlTableElement.getElementsByTagName('tr');
  for (let row = 0; row < rows.length; row++) {
    // Get all cell data
    let cells = rows[row].querySelectorAll('td,th');
    let csvRowData = [];
    for (let cell = 0; cell < cells.length; cell++) {
      // Get the text of each cell and add it to the row data
      csvRowData.push(cells[cell].innerHTML);
    }
    csvData.push(csvRowData);
  }

  // Create csv output
  csvData = csvData.join('\n');
  return csvData;
}
