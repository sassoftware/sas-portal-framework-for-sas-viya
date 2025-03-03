/**
 * Add a Body to an existing Accordion Item
 *
 * @param {String} baselineID - ID of the complete accordion
 * @param {String} itemID - ID for the individual accordion item
 * @param {String} bodyType - Defines the type of content in the Accordion Element - valid values [table, code, input]
 * @param {Object} bodyContent - The object containing the content for the Accordion
 * @param {String} downloadButtonText - Text for the Download Button - Optional
 * @param {String} codeClipboardButtonText - Text for the Code Clipboard Button - Optional
 * @param {Boolean} skipButtons - Ability to not have buttons created - Optional
 *
 * Doesn't return anything, as the function directly appends to an accordion element
 */
function addAccordionBody(
  baselineID,
  itemID,
  bodyType,
  bodyContent,
  downloadButtonText = '',
  codeClipboardButtonText = '',
  skipButtons = false
) {
  // Get the Accordion Body Container element
  let accordionBodyContainer = document.getElementById(
    `${baselineID}-${itemID}`
  );

  // Empty the Element
  accordionBodyContainer.innerHTML = '';

  // Accordion Body
  let accordionItemBody = document.createElement('div');
  accordionItemBody.setAttribute('class', 'accordion-body');

  switch (bodyType) {
    case 'table':
      if (!skipButtons) {
        // Add Download Button
        let tableCopyButton = document.createElement('button');
        tableCopyButton.setAttribute('type', 'button');
        tableCopyButton.setAttribute('class', 'btn btn-primary');
        tableCopyButton.innerText = downloadButtonText;
        tableCopyButton.onclick = function () {
          let downloadTableObject = document.getElementById(
            `${baselineID}-${itemID}-table-root`
          );
          let tableData = convertTableToCSV(downloadTableObject);
          downloadAsFile(`${itemID}.csv`, 'text/csv', tableData);
        };
        accordionItemBody.appendChild(tableCopyButton);
      }
      // Add the table to the accordion item
      createTable(
        accordionItemBody,
        `${baselineID}-${itemID}`,
        bodyContent?.headers,
        bodyContent?.content
      );
      break;
    case 'code':
      if (!skipButtons) {
        // Add code to clipboard button
        let codeClipboardButton = document.createElement('button');
        codeClipboardButton.setAttribute('type', 'button');
        codeClipboardButton.setAttribute('class', 'btn btn-primary');
        codeClipboardButton.innerText = codeClipboardButtonText;
        codeClipboardButton.onclick = function () {
          navigator.clipboard.writeText(bodyContent.trim());
        };
        accordionItemBody.appendChild(codeClipboardButton);
        // Add code to download button
        let codeDownloadButton = document.createElement('button');
        codeDownloadButton.setAttribute('type', 'button');
        codeDownloadButton.setAttribute('class', 'btn btn-primary');
        codeDownloadButton.innerText = downloadButtonText;
        codeDownloadButton.onclick = function () {
          downloadAsFile(`${itemID}.sas`, 'text/plain', bodyContent.trim());
        };
        accordionItemBody.appendChild(codeDownloadButton);
      }
      // Add source code to the accordion item
      let codeSource = document.createElement('p');
      codeSource.style.whiteSpace = 'pre';
      codeSource.innerText = bodyContent.trim();
      accordionItemBody.appendChild(codeSource);
      break;
    case 'input':
      let accordionInputForm = document.createElement('form');
      accordionInputForm.setAttribute('id', `${baselineID}-${itemID}-form`);
      for (const input in bodyContent) {
        let inputElement = bodyContent[input];
        let additionalInput = document.createElement('input');
        if (
          inputElement?.type === 'integer' ||
          inputElement?.type === 'decimal'
        ) {
          additionalInput.type = 'number';
        } else {
          additionalInput.type = 'text';
        }
        additionalInput.className = 'form-control';
        additionalInput.placeholder = inputElement?.name;
        additionalInput.id = inputElement?.name;
        // Add Label for input
        let inputLabel = document.createElement('label');
        inputLabel.for = inputElement?.name;
        inputLabel.innerText = `${inputElement?.name}:`;
        inputLabel.style.textTransform = 'capitalize';
        accordionInputForm.append(inputLabel);
        accordionInputForm.append(additionalInput);
        // Add a newline between input
        let breaker = document.createElement('br');
        accordionInputForm.append(breaker);
      }
      accordionItemBody.appendChild(accordionInputForm);
      break;
  }
  accordionBodyContainer.appendChild(accordionItemBody);
}
