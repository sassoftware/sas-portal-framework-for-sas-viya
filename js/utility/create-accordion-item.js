/**
 * Add elements to an accordion element
 *
 * @param {HTMLElement} accordionContainer - HTMLElement that is setup for a Bootstrap accordion
 * @param {String} baselineID - ID of the complete accordion
 * @param {String} itemID - ID for the individual accordion item
 * @param {Object/String} interfaceText - Contains all of the accordion header language - or just a header string
 *
 * Doesn't return anything, as the function directly appends to the accordionContainer element
 */
function createAccordionItem(
  accordionContainer,
  baselineID,
  itemID,
  interfaceText
) {
  // Accordion Item
  let arcordionItem = document.createElement('div');
  arcordionItem.setAttribute('class', 'accordion-item');

  // Accordion Header
  let arcordionItemHeader = document.createElement('h2');
  arcordionItemHeader.setAttribute('class', 'accordion-header');

  // Accordion Button
  let arcordionItemHeaderButton = document.createElement('button');
  arcordionItemHeaderButton.setAttribute('class', 'accordion-button collapsed');
  arcordionItemHeaderButton.setAttribute('type', 'button');
  arcordionItemHeaderButton.setAttribute('data-bs-toggle', 'collapse');
  arcordionItemHeaderButton.setAttribute(
    'data-bs-target',
    `#${baselineID}-${itemID}`
  );
  arcordionItemHeaderButton.innerText =
    typeof interfaceText == 'object'
      ? `${interfaceText[itemID]}`
      : interfaceText;

  // Accordion Body Container
  let arcordionItemBodyContainer = document.createElement('div');
  arcordionItemBodyContainer.setAttribute('id', `${baselineID}-${itemID}`);
  arcordionItemBodyContainer.setAttribute(
    'class',
    'accordion-collapse collapse'
  );
  arcordionItemBodyContainer.setAttribute(
    'data-bs-parent',
    `#${baselineID}-accordion`
  );

  // Append the Accordion Item
  arcordionItemHeader.appendChild(arcordionItemHeaderButton);
  arcordionItem.appendChild(arcordionItemHeader);
  arcordionItem.appendChild(arcordionItemBodyContainer);
  accordionContainer.appendChild(arcordionItem);
}
