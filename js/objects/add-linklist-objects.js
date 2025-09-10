/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a Link List Object
 *
 * @param {Object} linkListObject - Contains the definition of the LinkList Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a link list object
 */
async function addLinkListObject(linkListObject, paneID) {
  let linkListContainer = document.createElement('ul');
  linkListContainer.setAttribute('id', `${paneID}-obj-${linkListObject?.id}`);

  // Get link behavior behavior
  let clickBehaviorTab = linkListObject?.clickBehavior == 'tab' ? true : false;

  // Add the actual text content to the script tag
  for (k in linkListObject?.links) {
    let linkElement = document.createElement('li');
    let link = document.createElement('a');
    link.setAttribute('href', linkListObject?.links[k]?.link);
    if (clickBehaviorTab) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
    link.innerText = linkListObject?.links[k]?.displayText;
    linkElement.appendChild(link);
    linkListContainer.appendChild(linkElement);
  }

  return linkListContainer;
}
