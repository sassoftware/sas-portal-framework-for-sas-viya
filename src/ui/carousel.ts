/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create a Bootstrap carousel.
 */
export function createCarousel(
  carouselContainer: HTMLElement,
  baseCarouselID: string,
  darkCarousel: string = 'carousel-dark'
): void {
  const carousel = document.createElement('div');
  carousel.setAttribute('id', `${baseCarouselID}-carousel`);
  carousel.setAttribute('class', `carousel slide ${darkCarousel}`);

  const inner = document.createElement('div');
  inner.setAttribute('class', 'carousel-inner');
  inner.setAttribute('id', `${baseCarouselID}-carousel-inner`);
  carousel.appendChild(inner);

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.setAttribute('class', 'carousel-control-prev');
  prevButton.setAttribute('type', 'button');
  prevButton.setAttribute(
    'data-bs-target',
    `#${baseCarouselID}-carousel`
  );
  prevButton.setAttribute('data-bs-slide', 'prev');
  prevButton.innerHTML =
    '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';
  carousel.appendChild(prevButton);

  // Next button
  const nextButton = document.createElement('button');
  nextButton.setAttribute('class', 'carousel-control-next');
  nextButton.setAttribute('type', 'button');
  nextButton.setAttribute(
    'data-bs-target',
    `#${baseCarouselID}-carousel`
  );
  nextButton.setAttribute('data-bs-slide', 'next');
  nextButton.innerHTML =
    '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';
  carousel.appendChild(nextButton);

  carouselContainer.appendChild(carousel);
}

/**
 * Add an item to a Bootstrap carousel.
 */
export function addItemToCarousel(
  innerCarouselElement: HTMLElement,
  carouselItemContent: HTMLElement,
  isFirst: boolean = false
): void {
  const item = document.createElement('div');
  item.setAttribute(
    'class',
    `carousel-item ${isFirst ? 'active' : ''}`
  );
  item.appendChild(carouselItemContent);
  innerCarouselElement.appendChild(item);
}
