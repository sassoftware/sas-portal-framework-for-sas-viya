/**
 * Create a Data Product Registry Object
 *
 * @param {Object} dataProductMarketplaceObject - Contains the definition of the Data Product Registry Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} dataProductRegistryInterfaceText -  Contains all of the Data Product Registry relevant language interface
 * @returns a Data Product Registry Object
 */
async function addDataProductMarketplaceObject(
    dataProductMarketplaceObject,
    paneID,
    dataProductMarketplaceInterfaceText
) {
    // Create the data product list
    let dataProducts;
    // Create the Data Product Marketplace Container
    let dpmContainer = document.createElement("div");
    dpmContainer.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}`;

    return dpmContainer;
}
