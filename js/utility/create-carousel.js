/**
 * Add a Table to an element
 * @param {HTMLElement} carouselContainer - Element that will contain the table
 * @param {String} baseCarouselID - ID of baseline element that will contain the table
 * @param {String} darkCarousel - Optional, sets the theme of the carousel to dark by default - set the value to '' if you do not want the dark theme
 *
 * Doesn't return anything, as the function directly appends a carousel
 */
function createCarousel(
  carouselContainer,
  baseCarouselID,
  darkCarousel = 'carousel-dark'
) {
  // Create a new table
  let carouselContainerDiv = document.createElement('div');
  carouselContainerDiv.id = `${baseCarouselID}-carousel-root`;
  carouselContainerDiv.classList = [`carousel slide ${darkCarousel}`];

  // Add container into which the carousel items will be added
  let carouselContainerInner = document.createElement('div');
  carouselContainerInner.id = `${baseCarouselID}-carousel`;
  carouselContainerInner.classList = ['carousel-inner text-center'];

  // Add navigation buttons to the carousel
  let previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.id = `${baseCarouselID}-carousel-prev`;
  previousButton.setAttribute(
    'data-bs-target',
    `#${baseCarouselID}-carousel-root`
  );
  previousButton.setAttribute('data-bs-slide', 'prev');
  let previousIcon = document.createElement('span');
  previousIcon.classList = ['carousel-control-prev-icon'];
  previousIcon.ariaHidden = true;
  let previousLabel = document.createElement('span');
  previousLabel.classList = ['visually-hidden'];
  previousLabel.innerText = 'Previous';
  previousButton.appendChild(previousIcon);
  previousButton.appendChild(previousLabel);

  let nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.id = `${baseCarouselID}-carousel-next`;
  nextButton.setAttribute('data-bs-target', `#${baseCarouselID}-carousel-root`);
  nextButton.setAttribute('data-bs-slide', 'next');
  let nextIcon = document.createElement('span');
  nextIcon.classList = ['carousel-control-next-icon'];
  nextIcon.ariaHidden = true;
  let nextLabel = document.createElement('span');
  nextLabel.classList = ['visually-hidden'];
  nextLabel.innerText = 'Next';
  nextButton.appendChild(nextIcon);
  nextButton.appendChild(nextLabel);

  // Build carousel baseline
  carouselContainerDiv.appendChild(previousButton);
  carouselContainerDiv.appendChild(nextButton);
  carouselContainerDiv.appendChild(carouselContainerInner);

  // Append carousel to the container
  carouselContainer.appendChild(carouselContainerDiv);
}
