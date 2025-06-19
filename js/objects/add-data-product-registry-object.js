/**
 * Create a Data Product Registry Object
 *
 * @param {Object} dataProductRegistryObject - Contains the definition of the Data Product Registry Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a Data Product Registry Object
 */
async function addDataProductRegistryObject(dataProductRegistryObject, paneID) {
  // Create the Data Product Registry Container
  let dprContainer = document.createElement('div');
  dprContainer.id = `${paneID}-obj-${textObject?.id}`;

  return dprContainer;
}
