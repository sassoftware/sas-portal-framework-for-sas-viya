/**
 * Create a Text Object
 *
 * @param {Object} textObject - Contains the definition of the Text Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a text object
 */
async function addTextObject(textObject, paneID) {
  // Create the Zero MD Container
  let mdContainer = document.createElement('zero-md');
  mdContainer.setAttribute('id', `${paneID}-obj-${textObject?.id}`);

  // Add the actual text content to the script tag
  let mdContent = document.createElement('script');
  mdContent.setAttribute('type', 'text/markdown');
  mdContent.text = textObject?.content;

  mdContainer.appendChild(mdContent);

  return mdContainer;
}
