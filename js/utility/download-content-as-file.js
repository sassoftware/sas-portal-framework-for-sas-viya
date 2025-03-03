/**
 * Download content as a file to the local systen
 *
 * @param {String} fileName - Name of the file, including file extension (should match the file type)
 * @param {String} fileType - MIME File type, e.g. text/csv or text/plain
 * @param {String} fileContent - The actual content of the file
 */
function downloadAsFile(fileName, fileType, fileContent) {
  let tmpLink = document.createElement('a');
  tmpLink.setAttribute(
    'href',
    `data:${fileType};charset=utf-8, ${encodeURIComponent(fileContent)}`
  );
  tmpLink.setAttribute('download', fileName);
  document.body.appendChild(tmpLink);
  tmpLink.click();
  document.body.removeChild(tmpLink);
}
