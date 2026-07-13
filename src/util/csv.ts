/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Convert an HTML table element to a CSV string.
 */
export function convertTableToCSV(htmlTableElement: HTMLElement): string {
  const rows = htmlTableElement.querySelectorAll('tr');
  const csv: string[] = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td, th');
    const rowData: string[] = [];
    cells.forEach((cell) => {
      rowData.push(cell.textContent ?? '');
    });
    csv.push(rowData.join(','));
  });

  return csv.join('\n');
}
