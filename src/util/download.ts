/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Download content as a file by creating a temporary link and clicking it.
 */
export function downloadAsFile(
  fileName: string,
  fileType: string,
  fileContent: string
): void {
  const link = document.createElement('a');
  link.setAttribute(
    'href',
    `data:${fileType};charset=utf-8,${encodeURIComponent(fileContent)}`
  );
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
