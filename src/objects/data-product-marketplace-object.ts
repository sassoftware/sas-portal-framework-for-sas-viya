/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Create a Data Product Marketplace Object
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition, InterfaceText, DataProductMarketplaceText } from '../types';
import { getAppState } from '../state/app-state';
import { getFileContent, createFile, updateFileContent } from '../api/files-api';
import { getFolderContent } from '../api/folders-api';
import { getFormattedDatetime } from '../util/datetime';
import { escapeHtml, sanitizeUrl, safeId } from '../ui/dom-helpers';

interface FieldOption {
  value: string;
  label: string;
}

interface SchemaField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  options?: FieldOption[];
}

interface DataProduct {
  productName: string;
  accessUrl?: string;
  [key: string]: unknown;
}

registerObjectType({
  type: 'dataProductMarketplace',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const dataProductMarketplaceObject = definition;
    const dataProductMarketplaceInterfaceText = (interfaceText?.dataProductMarketplace ?? {}) as DataProductMarketplaceText;

    // Create the data product list
    let dataProducts: DataProduct[];
    // Create the Data Product Marketplace Container
    const dpmContainer = document.createElement('div');
    dpmContainer.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}`;

    // Retrieve the Data Product Schema
    const dataProductSchemaJSON = await getFileContent(
      dataProductMarketplaceObject.dataProductSchemaURI as string
    );
    const dataProductSchema: SchemaField[] = await dataProductSchemaJSON.json();

    // Retrieve the existing Data Products
    const existingDataProducts = await getFolderContent(
      `${dataProductMarketplaceObject?.dataProductFolderURI}`,
      '?filter=eq(name,"data-products.json")'
    );
    // Get the existing data products
    if (existingDataProducts && existingDataProducts.length > 0) {
      const existingDataProductsResponse = await getFileContent(
        existingDataProducts[0]!.uri
      );
      dataProducts = await existingDataProductsResponse.json();
    } else {
      dataProducts = [];
    }

    // Add the search bar container + content
    const dpmSearchBarContainer = document.createElement('div');
    dpmSearchBarContainer.className = 'md-3 iput-group search-bar';
    const dpmSearchBar = document.createElement('input');
    dpmSearchBar.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-searchInput`;
    dpmSearchBar.type = 'search';
    dpmSearchBar.className = 'form-control';
    dpmSearchBar.placeholder =
      dataProductMarketplaceInterfaceText?.searchBarPlaceholder;
    const dpmSearchBarButton = document.createElement('button');
    dpmSearchBarButton.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-searchButton`;
    dpmSearchBarButton.type = 'button';
    dpmSearchBarButton.className = 'btn btn-primary';
    dpmSearchBarButton.innerText =
      dataProductMarketplaceInterfaceText?.searchText;
    dpmSearchBarContainer.appendChild(dpmSearchBar);
    dpmSearchBarContainer.appendChild(dpmSearchBarButton);

    // Container for search results
    const dpmSearchResultContainer = document.createElement('div');
    const dpmSearchResultHeader = document.createElement('h3');
    dpmSearchResultHeader.innerText =
      dataProductMarketplaceInterfaceText?.searchResultHeader;
    const dpmAccordion = document.createElement('div');
    dpmAccordion.className = 'accordion accordion-flush';
    dpmAccordion.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-accordion`;
    const dpmNoResultMessage = document.createElement('div');
    dpmNoResultMessage.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-noResultMessage`;
    dpmNoResultMessage.className = 'alert alert-info text-center mt-3 d-none';
    dpmNoResultMessage.innerText =
      dataProductMarketplaceInterfaceText?.noResultMessage;
    dpmSearchResultContainer.appendChild(dpmSearchResultHeader);
    dpmSearchResultContainer.appendChild(dpmAccordion);
    dpmSearchResultContainer.appendChild(dpmNoResultMessage);

    // Container for Cart
    const dpmCartContainer = document.createElement('div');
    const dpmCartHeader = document.createElement('h3');
    dpmCartHeader.innerText = dataProductMarketplaceInterfaceText?.cartHeader;
    const dpmCartSection = document.createElement('div');
    dpmCartSection.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartSection`;
    dpmCartSection.className = 'p-3 border mb-4';
    const dpmCartList = document.createElement('ul');
    dpmCartList.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartList`;
    dpmCartList.className = 'list-unstyled';
    const dpmEmptyCartMessage = document.createElement('li');
    dpmEmptyCartMessage.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-emptyCartMessage`;
    dpmEmptyCartMessage.className = 'text-muted text-center';
    dpmEmptyCartMessage.innerText =
      dataProductMarketplaceInterfaceText?.emptyCartMessage;
    const dpmCheckoutContainer = document.createElement('div');
    dpmCheckoutContainer.className = 'd-grid gap-2';
    const dpmCheckoutButton = document.createElement('button');
    dpmCheckoutButton.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-checkoutButton`;
    dpmCheckoutButton.className = 'btn btn-purchase';
    dpmCheckoutButton.type = 'button';
    dpmCheckoutButton.disabled = true;
    dpmCheckoutButton.innerText =
      dataProductMarketplaceInterfaceText?.checkoutButton;
    dpmCheckoutButton.style.width = '30%';
    dpmCheckoutButton.style.color = 'white';
    dpmCheckoutButton.style.justifyContent = 'center';
    dpmCartList.appendChild(dpmEmptyCartMessage);
    dpmCartSection.appendChild(dpmCartList);
    dpmCheckoutContainer.appendChild(dpmCheckoutButton);
    dpmCartSection.appendChild(dpmCheckoutContainer);
    dpmCartContainer.appendChild(dpmCartHeader);
    dpmCartContainer.appendChild(dpmCartSection);

    // Container for Confirmation Modal
    const dpmConfirmationModalContainer = document.createElement('div');
    const dpmConfirmationModal = document.createElement('div');
    dpmConfirmationModal.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModal`;
    dpmConfirmationModal.className = 'modal fade';
    dpmConfirmationModal.tabIndex = -1;
    dpmConfirmationModal.setAttribute(
      'aria-labelledby',
      `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModalLabel`
    );
    dpmConfirmationModal.ariaHidden = 'true';
    const dpmConfirmationModalDialog = document.createElement('div');
    dpmConfirmationModalDialog.className =
      'modal-dialog modal-dialog-centered modal-lg';
    const dpmConfirmationModalContent = document.createElement('div');
    dpmConfirmationModalContent.className = 'modal-content';
    const dpmConfirmationHeader = document.createElement('div');
    dpmConfirmationHeader.className = 'modal-header';
    const dpmConfirmationHeaderHeading = document.createElement('h5');
    dpmConfirmationHeaderHeading.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModalLabel`;
    dpmConfirmationHeaderHeading.className = 'modal-title';
    dpmConfirmationHeaderHeading.innerText =
      dataProductMarketplaceInterfaceText?.confirmationHeaderHeading;
    const dpmConfirmationDismissHeader = document.createElement('button');
    dpmConfirmationDismissHeader.type = 'button';
    dpmConfirmationDismissHeader.className = 'btn-close';
    dpmConfirmationDismissHeader.setAttribute('data-bs-dismiss', 'modal');
    dpmConfirmationDismissHeader.ariaLabel = 'Close';
    const dpmConfirmationModalBody = document.createElement('div');
    dpmConfirmationModalBody.className = 'modal-body';
    const dpmConfirmationModalBodyMessage = document.createElement('p');
    dpmConfirmationModalBodyMessage.innerText =
      dataProductMarketplaceInterfaceText?.confirmationModalBodyMessage;
    const dpmConfirmationModalBodyList = document.createElement('ul');
    dpmConfirmationModalBodyList.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationLinkList`;
    dpmConfirmationModalBodyList.className = 'list-group';
    const dpmConfirmationModalFooter = document.createElement('div');
    dpmConfirmationModalFooter.className = 'modal-footer';
    const dpmConfirmationModalFooterButton = document.createElement('button');
    dpmConfirmationModalFooterButton.className = 'btn btn-secondary';
    dpmConfirmationModalFooterButton.type = 'button';
    dpmConfirmationModalFooterButton.setAttribute('data-bs-dismiss', 'modal');
    dpmConfirmationModalFooterButton.innerText =
      dataProductMarketplaceInterfaceText?.modalFooterButton;

    dpmConfirmationHeader.appendChild(dpmConfirmationHeaderHeading);
    dpmConfirmationHeader.appendChild(dpmConfirmationDismissHeader);
    dpmConfirmationModalContent.appendChild(dpmConfirmationHeader);
    dpmConfirmationModalBody.appendChild(dpmConfirmationModalBodyMessage);
    dpmConfirmationModalBody.appendChild(dpmConfirmationModalBodyList);
    dpmConfirmationModalContent.appendChild(dpmConfirmationModalBody);
    dpmConfirmationModalFooter.appendChild(dpmConfirmationModalFooterButton);
    dpmConfirmationModalContent.appendChild(dpmConfirmationModalFooter);
    dpmConfirmationModalDialog.appendChild(dpmConfirmationModalContent);
    dpmConfirmationModal.appendChild(dpmConfirmationModalDialog);
    dpmConfirmationModalContainer.appendChild(dpmConfirmationModal);

    // Store for the currently selected items
    let cartItems: DataProduct[] = [];

    // --- Helper Functions ---
    /**
     * Helper to get a display value for various field types. The returned
     * string is always HTML-safe: text is escaped and URLs are sanitized, so
     * callers may interpolate it directly into innerHTML.
     */
    function getDisplayValue(fieldSchema: SchemaField, value: unknown): string {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) &&
          value.length === 0 &&
          fieldSchema.type !== 'multiselect')
      ) {
        return 'N/A';
      }

      if (fieldSchema.type === 'dropdown' || fieldSchema.type === 'radio') {
        const option = (fieldSchema.options ?? []).find(
          (opt) => opt.value === value
        );
        return escapeHtml(option ? option.label : String(value));
      } else if (fieldSchema.type === 'multiselect') {
        if (Array.isArray(value)) {
          return (
            escapeHtml(
              (value as string[])
                .map((val) => {
                  const option = (fieldSchema.options ?? []).find(
                    (opt) => opt.value === val
                  );
                  return option ? option.label : val;
                })
                .join(', ')
            ) || 'N/A'
          );
        }
        return escapeHtml(String(value)) || 'N/A';
      } else if (fieldSchema.type === 'checkbox') {
        return escapeHtml(
          value
            ? dataProductMarketplaceInterfaceText?.chexboxYes
            : dataProductMarketplaceInterfaceText?.chexboxNo
        );
      } else if (fieldSchema.type === 'url') {
        return `<a href="${sanitizeUrl(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
      } else if (fieldSchema.id === 'creationDate') {
        try {
          const date = new Date(value as string);
          return escapeHtml(date.toLocaleDateString());
        } catch {
          return escapeHtml(String(value));
        }
      }
      return escapeHtml(String(value));
    }

    /**
     * Renders search results in an accordion.
     */
    function renderSearchResults(results: DataProduct[]): void {
      dpmAccordion.innerHTML = '';

      if (results.length === 0) {
        dpmNoResultMessage.classList.remove('d-none');
        const placeholderItem = document.createElement('div');
        placeholderItem.className = 'accordion-item';
        placeholderItem.innerHTML = `
                    <h2 class="accordion-header" id="headingNoResults">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNoResults" aria-expanded="false" aria-controls="collapseNoResults">
                            <div class="product-header-info">
                                <h5>${dataProductMarketplaceInterfaceText?.noResultHeader}</h5>
                                <p>${dataProductMarketplaceInterfaceText?.noResultDescription}</p>
                            </div>
                        </button>
                    </h2>
                    <div id="collapseNoResults" class="accordion-collapse collapse" aria-labelledby="headingNoResults" data-bs-parent="#${paneID}-obj-${dataProductMarketplaceObject?.id}-accordion">
                        <div class="accordion-body text-center text-muted">
                            ${dataProductMarketplaceInterfaceText?.noResultBody}
                        </div>
                    </div>
            `;
        dpmAccordion.appendChild(placeholderItem);
        return;
      } else {
        dpmNoResultMessage.classList.add('d-none');
      }

      results.forEach((product, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        let headerDetailsHtml = '';
        // Dynamically build header information based on accordionHeaderFields
        const headerAttrs = dataProductMarketplaceObject?.dataProductHeaderAttributes as string[] | undefined;
        (headerAttrs ?? []).forEach(
          (fieldId: string) => {
            const fieldSchema = dataProductSchema.find(
              (s) => s.id === fieldId
            );
            if (fieldSchema) {
              const displayValue = getDisplayValue(
                fieldSchema,
                product[fieldId]
              );
              headerDetailsHtml += `<span>${escapeHtml(fieldSchema.label)}: <span class="badge bg-secondary">${displayValue}</span></span>`;
            }
          }
        );
        if (headerDetailsHtml) {
          headerDetailsHtml = `<p>${headerDetailsHtml
            .split('</span></span>')
            .join('</span></span> | ')}</p>`;
          headerDetailsHtml = headerDetailsHtml.replace(
            / \| <\/p>$/,
            '</p>'
          );
        }

        const productId = safeId(product.productName) || `product-${index}`;

        // Construct accordion header. productName is author-supplied, so it is
        // HTML-escaped in every text/attribute context; productId is slugified.
        accordionItem.innerHTML = `
                    <h2 class="accordion-header" id="heading${productId}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${productId}" aria-expanded="false" aria-controls="collapse${productId}">
                            <div class="product-header-info">
                                <h5>${escapeHtml(product.productName)}</h5>
                                ${headerDetailsHtml}
                            </div>
                        </button>
                    </h2>
                    <div id="collapse${productId}" class="accordion-collapse collapse" aria-labelledby="heading${productId}" data-bs-parent="#${paneID}-obj-${dataProductMarketplaceObject?.id}-accordion">
                        <div class="accordion-body">
                            <div class="product-details-content">
                                <!-- Other details will be injected here -->
                            </div>
                            <!-- Add to Cart Button for this product at the bottom -->
                            <div class="button-container">
                                <button class="btn btn-sm btn-add-to-cart" data-product-id="${escapeHtml(product.productName)}">
                                    <!-- Text will be updated by updateAddToCartButtonState -->
                                </button>
                            </div>
                        </div>
                    </div>
            `;
        dpmAccordion.appendChild(accordionItem);

        // Populate the product details content inside the accordion body
        const productDetailsContent = accordionItem.querySelector(
          '.product-details-content'
        ) as HTMLElement;

        // Update the Add to Cart button state within this accordion item
        const addToCartButtonInBody =
          accordionItem.querySelector('.btn-add-to-cart') as HTMLButtonElement | null;
        if (addToCartButtonInBody) {
          updateAddToCartButtonState(
            product.productName,
            addToCartButtonInBody
          );
        }

        dataProductSchema.forEach((field) => {
          // Skip fields already shown in the header (and productName which is the title)
          if (
            [
              'productName',
              'accessUrl',
              ...(headerAttrs ?? []),
            ].includes(field.id)
          ) {
            return;
          }

          const value = product[field.id];
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
          ) {
            return;
          }

          const detailItem = document.createElement('div');
          detailItem.className = 'detail-item';
          detailItem.innerHTML = `<strong>${escapeHtml(field.label)}:</strong> ${getDisplayValue(field, value)}`;
          productDetailsContent.appendChild(detailItem);
        });
      });
    }

    /**
     * Renders the current items in the cart.
     */
    function renderCart(): void {
      const cartList = document.getElementById(
        `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartList`
      );
      const purchaseButton = document.getElementById(
        `${paneID}-obj-${dataProductMarketplaceObject?.id}-checkoutButton`
      ) as HTMLButtonElement | null;

      if (!cartList || !purchaseButton) {
        console.error('Cart elements not found for rendering.');
        return;
      }

      cartList.innerHTML = '';
      if (cartItems.length > 0) {
        purchaseButton.disabled = false;
        cartItems.forEach((item) => {
          const listItem = document.createElement('li');
          listItem.className = 'cart-item';
          listItem.innerHTML = `
                        <span>${escapeHtml(item.productName)}</span>
                        <button class="btn btn-sm btn-outline-danger btn-remove-from-cart" data-product-id="${escapeHtml(item.productName)}">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="10" height="10" viewBox="0 0 50 50"><path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"></path></svg>
                        </button>
                    `;
          cartList.appendChild(listItem);
        });
      } else {
        cartList.appendChild(dpmEmptyCartMessage);
        purchaseButton.disabled = true;
      }

      // Update Add to Cart button states in the accordion bodies
      dataProducts.forEach((product) => {
        const button = document.querySelector(
          `#collapse${safeId(product.productName)} .btn-add-to-cart`
        ) as HTMLButtonElement | null;
        if (button) {
          updateAddToCartButtonState(product.productName, button);
        }
      });
    }

    /**
     * Renders the purchased assets list and populates the modal.
     */
    function renderPurchasedAssets(): void {
      const confirmationModalBodyList = document.getElementById(
        `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationLinkList`
      );
      if (!confirmationModalBodyList) {
        console.error('Confirmation modal body list not found.');
        return;
      }

      confirmationModalBodyList.innerHTML = '';

      if (cartItems.length > 0) {
        cartItems.forEach((item) => {
          const modalListItem = document.createElement('li');
          modalListItem.className = 'list-group-item';
          modalListItem.innerHTML = `
                        <strong>${escapeHtml(item.productName)}:</strong> <br>
                        ${
                          item.accessUrl
                            ? `<a href="${sanitizeUrl(item.accessUrl)}" target="_blank" rel="noopener noreferrer" class="purchased-asset-link">${escapeHtml(item.accessUrl)}</a>`
                            : '<em>No access URL provided.</em>'
                        }
                    `;
          confirmationModalBodyList.appendChild(modalListItem);
        });
      }
    }

    /**
     * Updates the state of an "Add to Cart" button.
     */
    function updateAddToCartButtonState(
      productName: string,
      buttonElement: HTMLButtonElement
    ): void {
      const isInCart = cartItems.some(
        (item) => item.productName === productName
      );
      if (isInCart) {
        buttonElement.textContent =
          dataProductMarketplaceInterfaceText?.alreadyInCart;
        buttonElement.disabled = true;
        buttonElement.classList.remove('btn-add-to-cart');
        buttonElement.classList.add('btn-secondary');
      } else {
        buttonElement.innerHTML =
          dataProductMarketplaceInterfaceText?.addToCart;
        buttonElement.disabled = false;
        buttonElement.classList.remove('btn-secondary');
        buttonElement.classList.add('btn-add-to-cart');
      }
    }

    /**
     * Handles the search functionality.
     */
    function handleSearch(): void {
      const query = dpmSearchBar.value.toLowerCase().trim();
      const filteredProducts = dataProducts.filter((product) => {
        return dataProductSchema.some((field) => {
          const value = product[field.id];
          if (value === undefined || value === null) {
            return false;
          }

          if (typeof value === 'string' || typeof value === 'number') {
            return String(value).toLowerCase().includes(query);
          } else if (Array.isArray(value)) {
            return value.some((item) =>
              String(item).toLowerCase().includes(query)
            );
          } else if (typeof value === 'boolean') {
            return String(value).toLowerCase().includes(query);
          }
          return false;
        });
      });
      renderSearchResults(filteredProducts);
    }

    /**
     * Handles adding a product to the cart.
     */
    function handleAddToCart(event: Event): void {
      const target = event.target as HTMLElement;
      const btn = target.closest('.btn-add-to-cart') as HTMLElement | null;
      if (!btn) return;
      const productName = (btn as HTMLElement).dataset.productId;
      const productToAdd = dataProducts.find(
        (p) => p.productName === productName
      );

      if (
        productToAdd &&
        !cartItems.some((item) => item.productName === productName)
      ) {
        cartItems.push(productToAdd);
        renderCart();
      }
    }

    /**
     * Handles removing a product from the cart.
     */
    function handleRemoveFromCart(event: Event): void {
      event.stopPropagation();
      const target = event.target as HTMLElement;
      const btn = target.closest('.btn-remove-from-cart') as HTMLElement | null;
      if (!btn) return;
      const productName = btn.dataset.productId!;
      cartItems = cartItems.filter(
        (item) => item.productName !== productName
      );
      renderCart();
      const addBtn = document.querySelector(
        `button[data-product-id="${productName}"]`
      ) as HTMLButtonElement | null;
      if (addBtn) {
        updateAddToCartButtonState(productName, addBtn);
      }
      if (cartItems.length === 0) {
        dpmCartList.innerHTML = '';
        dpmCartList.appendChild(dpmEmptyCartMessage);
        dpmCheckoutButton.disabled = true;
      }
    }

    /**
     * Handles the purchase of all items in the cart.
     */
    async function handlePurchase(): Promise<void> {
      if (cartItems.length === 0) {
        return;
      }

      renderPurchasedAssets();
      const confirmationModalElement = document.getElementById(
        `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModal`
      );
      if (confirmationModalElement) {
        const bsModal = new bootstrap.Modal(confirmationModalElement);
        bsModal.show();
      }
      renderCart();

      // Save the purchase to SAS
      let dataProductUsers: Record<string, unknown>[];
      // Retrieve the existing Data Product Users
      const existingDataProductUsers = await getFolderContent(
        `${dataProductMarketplaceObject?.dataProductFolderURI}`,
        '?filter=eq(name,"data-product-users.json")'
      );
      // Check if there is already a file in place
      let dateProductUsersFileURI: string;
      if (existingDataProductUsers && existingDataProductUsers.length > 0) {
        const existingDataProductUserResponse = await getFileContent(
          existingDataProductUsers[0]!.uri
        );
        dataProductUsers = await existingDataProductUserResponse.json();
        dateProductUsersFileURI = existingDataProductUsers[0]!.uri;
      } else {
        dataProductUsers = [];
        const jsonstringContentObject = JSON.stringify(dataProductUsers);
        const blobContentObject = new Blob([jsonstringContentObject], {
          type: 'text/json',
        });
        // Create the new File
        const createdDataProductUserFileResp = await createFile(
          dataProductMarketplaceObject?.dataProductFolderURI as string,
          blobContentObject,
          'data-product-users.json'
        );
        const createdDataProductsUserFile =
          await createdDataProductUserFileResp.json();
        dateProductUsersFileURI = `/files/files/${createdDataProductsUserFile.id}`;
      }
      const jsonstringUsersContentObject = JSON.stringify(
        dataProductUsers.concat(
          cartItems.map((product) => {
            return {
              purchaseDate: getFormattedDatetime(),
              productName: product.productName,
              userName: getAppState().userName,
            };
          })
        )
      );
      const blobContentUsersObject = new Blob([jsonstringUsersContentObject], {
        type: 'text/json',
      });
      await updateFileContent(dateProductUsersFileURI, blobContentUsersObject);
    }

    // Search bar events
    dpmSearchBarButton.addEventListener('click', handleSearch);
    dpmSearchBar.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });

    // Event delegation for clicks within the accordion (for "Add to Cart" buttons)
    dpmAccordion.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const addToCartBtn = target.closest('.btn-add-to-cart') as HTMLButtonElement | null;
      if (addToCartBtn && !addToCartBtn.disabled) {
        event.stopPropagation();
        handleAddToCart(event);
      }
    });

    // Event delegation for clicks within the cart (for "Remove from Cart" buttons)
    dpmCartSection.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const removeFromCartBtn = target.closest('.btn-remove-from-cart');
      if (removeFromCartBtn) {
        handleRemoveFromCart(event);
        return;
      }
    });

    // Purchase button event
    dpmCheckoutButton.addEventListener('click', handlePurchase);

    // --- Initial Render ---
    renderSearchResults(dataProducts);
    renderCart();

    dpmContainer.appendChild(dpmSearchBarContainer);
    dpmContainer.appendChild(dpmSearchResultContainer);
    dpmContainer.appendChild(document.createElement('br'));
    dpmContainer.appendChild(dpmCartContainer);
    dpmContainer.appendChild(dpmConfirmationModalContainer);

    return dpmContainer;
  },
});
