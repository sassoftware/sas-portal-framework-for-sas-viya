/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a Portal Builder Object
 *
 * @param {Object} portalBuilderObject - Contains the definition of the Portal Builder Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a Portal Builder
 */
async function addPortalBuilderObject(portalBuilderObject, paneID) {
  // Create the Zero MD Container
  let portalBuilder = document.createElement('object');
  portalBuilder.setAttribute('id', `${paneID}-obj-${portalBuilderObject?.id}`);
  portalBuilder.setAttribute('data', './static/portalBuilder.html');
  portalBuilder.style.width = '100%';
  portalBuilder.style.height = '1000px';

  return portalBuilder;
}
