/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add carousel items to a carousel
 *
 * @param {HTMLElement} innerCarouselElement - A div with the the carousel-inner class
 * @param {HTMLElement} carouselItemContent - A HTML element that contains the content of the accordion item
 * @param {Boolean} isFirst - Optional, default is false - set to true if it is the item you want to be active
 * @param {Integer} carouselIndex - Optional, default is -1 - used to add an index to a carousel item
 *
 * Doesn't return anything, as the function directly appends to a carousel element
 */
function addItemToCarousel(
  innerCarouselElement,
  carouselItemContent,
  isFirst = false,
  carouselIndex
) {
  let carouselItemContainer = document.createElement('div');
  carouselItemContainer.classList = [
    `carousel-item${isFirst ? ' active' : ''}`,
  ];
  carouselItemContainer.value = carouselIndex;

  carouselItemContainer.appendChild(carouselItemContent);
  // Append the item to the carousel
  innerCarouselElement.appendChild(carouselItemContainer);
}
