/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a Data Product Marketplace Object
 *
 * @param {Object} dataProductMarketplaceObject - Contains the definition of the Data Product Marketplace Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} dataProductMarketplaceInterfaceText -  Contains all of the Data Product Marketplace relevant language interface
 * @returns a Data Product Marketplace Object
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

    // Retrieve the Data Product Schema
    let dataProductSchemaJSON = await getFileContent(
        window.VIYA,
        dataProductMarketplaceObject.dataProductSchemaURI
    );
    let dataProductSchema = await dataProductSchemaJSON.json();

    // Retrieve the existing Data Products
    let existingDataProducts = await getFolderContent(
        window.VIYA,
        `${dataProductMarketplaceObject?.dataProductFolderURI}`,
        '?filter=eq(name,"data-products.json")'
    );
    // Get the existing data products
    if (existingDataProducts?.length > 0) {
        let existingDataProductsResponse = await getFileContent(
            window.VIYA,
            existingDataProducts[0]?.uri
        );
        dataProducts = await existingDataProductsResponse.json();
    } else {
        // Set length to zero if there are no data products or the user can not read the file
        dataProducts = [];
    }

    // Add the search bar containt + content
    let dpmSearchBarContainer = document.createElement("div");
    dpmSearchBarContainer.classList = "md-3 iput-group search-bar";
    let dpmSearchBar = document.createElement("input");
    dpmSearchBar.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-searchInput`;
    dpmSearchBar.type = "search";
    dpmSearchBar.classList = "form-control";
    dpmSearchBar.placeholder =
        dataProductMarketplaceInterfaceText?.searchBarPlaceholder;
    let dpmSearchBarButton = document.createElement("button");
    dpmSearchBarButton.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-searchButton`;
    dpmSearchBarButton.type = "button";
    dpmSearchBarButton.classList = "btn btn-primary";
    dpmSearchBarButton.innerText =
        dataProductMarketplaceInterfaceText?.searchText;
    dpmSearchBarContainer.appendChild(dpmSearchBar);
    dpmSearchBarContainer.appendChild(dpmSearchBarButton);

    // Container for search results
    let dpmSearchResultContainer = document.createElement("div");
    let dpmSearchResultHeader = document.createElement("h3");
    dpmSearchResultHeader.innerText =
        dataProductMarketplaceInterfaceText?.searchResultHeader;
    let dpmAccordion = document.createElement("div");
    dpmAccordion.classList = "accordion accordion-flush";
    dpmAccordion.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-accordion`;
    let dpmNoResultMessage = document.createElement("div");
    dpmNoResultMessage.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-noResultMessage`;
    dpmNoResultMessage.classList = "alert alert-info text-center mt-3 d-none";
    dpmNoResultMessage.innerText =
        dataProductMarketplaceInterfaceText?.noResultMessage;
    dpmSearchResultContainer.appendChild(dpmSearchResultHeader);
    dpmSearchResultContainer.appendChild(dpmAccordion);
    dpmSearchResultContainer.appendChild(dpmNoResultMessage);

    // Container for Cart
    let dpmCartContainer = document.createElement("div");
    let dpmCartHeader = document.createElement("h3");
    dpmCartHeader.innerText = dataProductMarketplaceInterfaceText?.cartHeader;
    let dpmCartSection = document.createElement("div");
    dpmCartSection.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartSection`;
    dpmCartSection.classList = "p-3 border mb-4";
    let dpmCartList = document.createElement("ul");
    dpmCartList.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartList`;
    dpmCartList.classList = "list-unstyled";
    let dpmEmptyCartMessage = document.createElement("li");
    dpmEmptyCartMessage.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-emptyCartMessage`;
    dpmEmptyCartMessage.classList = "text-muted text-center";
    dpmEmptyCartMessage.innerText =
        dataProductMarketplaceInterfaceText?.emptyCartMessage;
    let dpmCheckoutContainer = document.createElement("div");
    dpmCheckoutContainer.classList = "d-grid gap-2";
    let dpmCheckoutButton = document.createElement("button");
    dpmCheckoutButton.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-checkoutButton`;
    dpmCheckoutButton.classList = "btn btn-purchase";
    dpmCheckoutButton.type = "button";
    dpmCheckoutButton.disabled = true;
    dpmCheckoutButton.innerText =
        dataProductMarketplaceInterfaceText?.checkoutButton;
    dpmCheckoutButton.style.width = "30%";
    dpmCheckoutButton.style.color = "white";
    dpmCheckoutButton.style.justifyContent = "center";
    dpmCartList.appendChild(dpmEmptyCartMessage);
    dpmCartSection.appendChild(dpmCartList);
    dpmCheckoutContainer.appendChild(dpmCheckoutButton);
    dpmCartSection.appendChild(dpmCheckoutContainer);
    dpmCartContainer.appendChild(dpmCartHeader);
    dpmCartContainer.appendChild(dpmCartSection);

    // Container for Confirmation Modal
    let dpmConfirmationModalContainer = document.createElement("div");
    let dpmConfirmationModal = document.createElement("div");
    dpmConfirmationModal.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModal`;
    dpmConfirmationModal.classList = "modal fade";
    dpmConfirmationModal.tabIndex = "-1";
    dpmConfirmationModal.setAttribute(
        "aria-labelledby",
        `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModalLabel`
    );
    dpmConfirmationModal.ariaHidden = "true";
    let dpmConfirmationModalDialog = document.createElement("div");
    dpmConfirmationModalDialog.classList =
        "modal-dialog modal-dialog-centered modal-lg";
    let dpmConfirmationModalContent = document.createElement("div");
    dpmConfirmationModalContent.classList = "modal-content";
    let dpmConfirmationHeader = document.createElement("div");
    dpmConfirmationHeader.classList = "modal-header";
    let dpmConfirmationHeaderHeading = document.createElement("h5");
    dpmConfirmationHeaderHeading.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModalLabel`;
    dpmConfirmationHeaderHeading.classList = "modal-title";
    dpmConfirmationHeaderHeading.innerText =
        dataProductMarketplaceInterfaceText?.confirmationHeaderHeading;
    let dpmConfirmationDismissHeader = document.createElement("button");
    dpmConfirmationDismissHeader.type = "button";
    dpmConfirmationDismissHeader.classList = "btn-close";
    dpmConfirmationDismissHeader.setAttribute("data-bs-dismiss", "modal");
    dpmConfirmationDismissHeader.ariaLabel = "Close";
    let dpmConfirmationModalBody = document.createElement("div");
    dpmConfirmationModalBody.classList = "modal-body";
    let dpmConfirmationModalBodyMessage = document.createElement("p");
    dpmConfirmationModalBodyMessage.innerText =
        dataProductMarketplaceInterfaceText?.confirmationModalBodyMessage;
    let dpmConfirmationModalBodyList = document.createElement("ul");
    dpmConfirmationModalBodyList.id = `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationLinkList`;
    dpmConfirmationModalBodyList.classList = "list-group";
    let dpmConfirmationModalFooter = document.createElement("div");
    dpmConfirmationModalFooter.classList = "modal-footer";
    let dpmConfirmationModalFooterButton = document.createElement("button");
    dpmConfirmationModalFooterButton.classList = "btn btn-secondary";
    dpmConfirmationModalFooterButton.type = "button";
    dpmConfirmationModalFooterButton.setAttribute("data-bs-dismiss", "modal");
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
    let cartItems = [];

    // --- Helper Functions ---
    /**
     * Helper to get display value for various field types.
     * @param {Object} fieldSchema - The schema definition for the field.
     * @param {any} value - The raw value from the product data.
     * @returns {string} The formatted display value.
     */
    function getDisplayValue(fieldSchema, value) {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) &&
                value.length === 0 &&
                fieldSchema.type !== "multiselect")
        ) {
            return "N/A"; // Or an empty string, depending on preference
        }

        if (fieldSchema.type === "dropdown" || fieldSchema.type === "radio") {
            const option = fieldSchema.options.find(
                (opt) => opt.value === value
            );
            return option ? option.label : value;
        } else if (fieldSchema.type === "multiselect") {
            if (Array.isArray(value)) {
                return (
                    value
                        .map((val) => {
                            const option = fieldSchema.options.find(
                                (opt) => opt.value === val
                            );
                            return option ? option.label : val;
                        })
                        .join(", ") || "N/A"
                );
            }
            return value || "N/A";
        } else if (fieldSchema.type === "checkbox") {
            return value
                ? dataProductMarketplaceInterfaceText?.chexboxYes
                : dataProductMarketplaceInterfaceText?.chexboxNo;
        } else if (fieldSchema.type === "url") {
            return `<a href="${value}" target="_blank">${value}</a>`;
        } else if (fieldSchema.id === "creationDate") {
            try {
                const date = new Date(value);
                return date.toLocaleDateString();
            } catch (e) {
                return value;
            }
        }
        return value;
    }

    /**
     * Renders search results in an accordion.
     * @param {Array} results - Array of data product objects to display.
     */
    function renderSearchResults(results) {
        dpmAccordion.innerHTML = ""; // Clear existing items

        if (results.length === 0) {
            dpmNoResultMessage.classList.remove("d-none");
            // Add a placeholder item if no results to keep accordion structured
            const placeholderItem = document.createElement("div");
            placeholderItem.className = "accordion-item";
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
            dpmNoResultMessage.classList.add("d-none");
        }

        results.forEach((product, index) => {
            const accordionItem = document.createElement("div");
            accordionItem.className = "accordion-item";

            let headerDetailsHtml = "";
            // Dynamically build header information based on accordionHeaderFields
            dataProductMarketplaceObject?.dataProductHeaderAttributes.forEach(
                (fieldId) => {
                    const fieldSchema = dataProductSchema.find(
                        (s) => s.id === fieldId
                    );
                    if (fieldSchema) {
                        const displayValue = getDisplayValue(
                            fieldSchema,
                            product[fieldId]
                        );
                        headerDetailsHtml += `<span>${fieldSchema.label}: <span class="badge bg-secondary">${displayValue}</span></span>`;
                    }
                }
            );
            if (headerDetailsHtml) {
                headerDetailsHtml = `<p>${headerDetailsHtml
                    .split("</span></span>")
                    .join("</span></span> | ")}</p>`;
                headerDetailsHtml = headerDetailsHtml.replace(
                    / \| <\/p>$/,
                    "</p>"
                );
            }

            // Construct accordion header
            accordionItem.innerHTML = `
                        <h2 class="accordion-header" id="heading${
                            product.productName.replace(/ /g, "-") ||
                            `product-${index}`
                        }">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${
                                product.productName.replace(/ /g, "-") ||
                                `product-${index}`
                            }" aria-expanded="false" aria-controls="collapse${
                product.productName.replace(/ /g, "-") || `product-${index}`
            }">
                                <div class="product-header-info">
                                    <h5>${product.productName}</h5>
                                    ${headerDetailsHtml}
                                </div>
                            </button>
                        </h2>
                        <div id="collapse${
                            product.productName.replace(/ /g, "-") ||
                            `product-${index}`
                        }" class="accordion-collapse collapse" aria-labelledby="heading${
                product.productName.replace(/ /g, "-") || `product-${index}`
            }" data-bs-parent="#${paneID}-obj-${
                dataProductMarketplaceObject?.id
            }-accordion">
                            <div class="accordion-body">
                                <div class="product-details-content">
                                    <!-- Other details will be injected here -->
                                </div>
                                <!-- Add to Cart Button for this product at the bottom -->
                                <div class="button-container">
                                    <button class="btn btn-sm btn-add-to-cart" data-product-id="${
                                        product.productName
                                    }">
                                        <!-- Text will be updated by updateAddToCartButtonState -->
                                    </button>
                                </div>
                            </div>
                        </div>
                `;
            dpmAccordion.appendChild(accordionItem);

            // Populate the product details content inside the accordion body
            const productDetailsContent = accordionItem.querySelector(
                ".product-details-content"
            );

            // Update the Add to Cart button state within this accordion item
            const addToCartButtonInBody =
                accordionItem.querySelector(".btn-add-to-cart");
            if (addToCartButtonInBody) {
                // Check if the button exists before trying to update it
                updateAddToCartButtonState(
                    product.productName,
                    addToCartButtonInBody
                );
            }

            dataProductSchema.forEach((field) => {
                // Skip fields already shown in the header (and productName which is the title)
                if (
                    [
                        "productName",
                        "accessUrl",
                        ...dataProductMarketplaceObject?.dataProductHeaderAttributes,
                    ].includes(field.id)
                ) {
                    return;
                }

                const value = product[field.id];
                if (
                    value === undefined ||
                    value === null ||
                    value === "" ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    return; // Skip empty fields
                }

                const detailItem = document.createElement("div");
                detailItem.className = "detail-item";
                detailItem.innerHTML = `<strong>${
                    field.label
                }:</strong> ${getDisplayValue(field, value)}`;
                productDetailsContent.appendChild(detailItem);
            });
        });
    }

    /**
     * Renders the current items in the cart.
     */
    function renderCart() {
        // Ensure dpmCartList and dpmCheckoutButton are properly referenced
        const cartList = document.getElementById(
            `${paneID}-obj-${dataProductMarketplaceObject?.id}-cartList`
        );
        const purchaseButton = document.getElementById(
            `${paneID}-obj-${dataProductMarketplaceObject?.id}-checkoutButton`
        );

        if (!cartList || !purchaseButton) {
            console.error("Cart elements not found for rendering.");
            return;
        }

        cartList.innerHTML = ""; // Clear existing items
        if (cartItems.length >= 0) {
            purchaseButton.disabled = false;
            cartItems.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.className = "cart-item";
                listItem.innerHTML = `
                            <span>${item.productName}</span>
                            <button class="btn btn-sm btn-outline-danger btn-remove-from-cart" data-product-id="${item.productName}">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="10" height="10" viewBox="0 0 50 50"><path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"></path></svg>
                            </button>
                        `;
                cartList.appendChild(listItem);
            });
        }

        // Update Add to Cart button states in the accordion bodies
        dataProducts.forEach((product) => {
            // Select button by its specific class within the accordion body
            const button = document.querySelector(
                `#collapse${product.productName.replace(
                    / /g,
                    "-"
                )} .btn-add-to-cart` // Corrected ID usage for accordion collapse
            );
            if (button) {
                updateAddToCartButtonState(product.productName, button);
            }
        });
    }

    /**
     * Renders the purchased assets list and populates the modal.
     */
    function renderPurchasedAssets() {
        const confirmationModalBodyList = document.getElementById(
            `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationLinkList`
        );
        if (!confirmationModalBodyList) {
            console.error("Confirmation modal body list not found.");
            return;
        }

        confirmationModalBodyList.innerHTML = ""; // Clear existing modal links

        if (cartItems.length > 0) {
            cartItems.forEach((item) => {
                // List item for the modal
                const modalListItem = document.createElement("li");
                modalListItem.className = "list-group-item";
                modalListItem.innerHTML = `
                            <strong>${item.productName}:</strong> <br>
                            ${
                                item.accessUrl // Use accessUrl from schema, not accessUrl from item
                                    ? `<a href="${item.accessUrl}" target="_blank" class="purchased-asset-link">${item.accessUrl}</a>`
                                    : "<em>No access URL provided.</em>"
                            }
                        `;
                confirmationModalBodyList.appendChild(modalListItem);
            });
        }
    }

    /**
     * Updates the state of an "Add to Cart" button.
     * @param {string} productName - The Name of the product.
     * @param {HTMLElement} buttonElement - The specific button element to update.
     */
    function updateAddToCartButtonState(productName, buttonElement) {
        const isInCart = cartItems.some(
            (item) => item.productName === productName
        ); // Match by productName
        if (isInCart) {
            buttonElement.textContent =
                dataProductMarketplaceInterfaceText?.alreadyInCart;
            buttonElement.disabled = true;
            buttonElement.classList.remove("btn-add-to-cart");
            buttonElement.classList.add("btn-secondary");
        } else {
            buttonElement.innerHTML =
                dataProductMarketplaceInterfaceText?.addToCart;
            buttonElement.disabled = false;
            buttonElement.classList.remove("btn-secondary");
            buttonElement.classList.add("btn-add-to-cart");
        }
    }

    /**
     * Handles the search functionality.
     */
    function handleSearch() {
        const query = dpmSearchBar.value.toLowerCase().trim();
        const filteredProducts = dataProducts.filter((product) => {
            // Check if any field in the schema matches the query
            return dataProductSchema.some((field) => {
                const value = product[field.id];
                if (value === undefined || value === null) {
                    return false;
                }

                // Handle different data types for matching
                if (typeof value === "string" || typeof value === "number") {
                    return String(value).toLowerCase().includes(query);
                } else if (Array.isArray(value)) {
                    // For arrays (like tags), check if any element matches
                    return value.some((item) =>
                        String(item).toLowerCase().includes(query)
                    );
                } else if (typeof value === "boolean") {
                    // For boolean, check if 'true' or 'false' matches
                    return String(value).toLowerCase().includes(query);
                }
                return false;
            });
        });
        renderSearchResults(filteredProducts);
    }

    /**
     * Handles adding a product to the cart. This function is now called directly from the onclick in HTML.
     * @param {Event} event - The click event from the "Add to Cart" button.
     */
    function handleAddToCart(event) {
        // Get the product ID from the button's data-product-id attribute
        const productName =
            event.target.closest(".btn-add-to-cart").dataset.productId;
        const productToAdd = dataProducts.find(
            (p) => p.productName === productName
        ); // Find by productName

        if (
            productToAdd &&
            !cartItems.some((item) => item.productName === productName) // Check if already in cart by productName
        ) {
            cartItems.push(productToAdd);
            renderCart();
        }
    }

    /**
     * Handles removing a product from the cart.
     * @param {Event} event - The click event from the "Remove from Cart" button.
     */
    function handleRemoveFromCart(event) {
        event.stopPropagation();
        const productName = event.target.closest(".btn-remove-from-cart")
            .dataset.productId;
        cartItems = cartItems.filter(
            (item) => item.productName !== productName
        );
        renderCart();
        updateAddToCartButtonState(
            productName,
            document.querySelector(`button[data-product-id="${productName}"]`)
        );
        if (cartItems.length === 0) {
            dpmCartList.innerHTML = "";
            dpmCartList.appendChild(dpmEmptyCartMessage);
            dpmCheckoutButton.disabled = true;
        }
    }

    /**
     * Handles the purchase of all items in the cart.
     */
    async function handlePurchase() {
        if (cartItems.length === 0) {
            return;
        }

        renderPurchasedAssets();
        const confirmationModalElement = document.getElementById(
            `${paneID}-obj-${dataProductMarketplaceObject?.id}-confirmationModal`
        );
        const bsModal = new bootstrap.Modal(confirmationModalElement);
        bsModal.show();
        renderCart();

        // Save the purchase to SAS
        let dataProductUsers;
        // Retrieve the existing Data Product Users
        let existingDataProductUsers = await getFolderContent(
            window.VIYA,
            `${dataProductMarketplaceObject?.dataProductFolderURI}`,
            '?filter=eq(name,"data-product-users.json")'
        );
        // Check if there is already a file in place
        let dateProductUsersFileURI;
        if (existingDataProductUsers?.length > 0) {
            let existingDataProductUserResponse = await getFileContent(
                window.VIYA,
                existingDataProductUsers[0]?.uri
            );
            dataProductUsers = await existingDataProductUserResponse.json();
            dateProductUsersFileURI = existingDataProductUsers[0]?.uri;
        } else {
            dataProductUsers = [];
            const jsonstringContentObject = JSON.stringify(dataProductUsers);
            const blobContentObject = new Blob([jsonstringContentObject], {
                type: "text/json",
            });
            // Create the new File
            let createdDataProductUserFileResp = await createFile(
                window.VIYA,
                dataProductMarketplaceObject?.dataProductFolderURI,
                blobContentObject,
                "data-product-users.json"
            );
            let createdDataProductsUserFile =
                await createdDataProductUserFileResp.json();
            dateProductUsersFileURI = `/files/files/${createdDataProductsUserFile.id}`;
        }
        const jsonstringUsersContentObject = JSON.stringify(
            dataProductUsers.concat(cartItems.map((product) => {
                return {
                    purchaseDate: getFormattedDatetime(),
                    productName: product.productName,
                    userName: window.userName,
                };
            }))
        );
        const blobContentUsersObject = new Blob([jsonstringUsersContentObject], {
            type: "text/json",
        });
        updateFileContent(window.VIYA, dateProductUsersFileURI, blobContentUsersObject);
    }

    // Search bar events
    dpmSearchBarButton.addEventListener("click", handleSearch);
    dpmSearchBar.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    // Event delegation for clicks within the accordion (for "Add to Cart" buttons)
    dpmAccordion.addEventListener("click", (event) => {
        const addToCartBtn = event.target.closest(".btn-add-to-cart");
        if (addToCartBtn && !addToCartBtn.disabled) {
            event.stopPropagation();
            handleAddToCart(event);
        }
    });

    // Event delegation for clicks within the cart (for "Remove from Cart" buttons)
    dpmCartSection.addEventListener("click", (event) => {
        const removeFromCartBtn = event.target.closest(".btn-remove-from-cart");
        if (removeFromCartBtn) {
            handleRemoveFromCart(event);
            return;
        }
    });

    // Purchase button event
    dpmCheckoutButton.addEventListener("click", handlePurchase);

    // --- Initial Render ---
    renderSearchResults(dataProducts);
    renderCart();

    dpmContainer.appendChild(dpmSearchBarContainer);
    dpmContainer.appendChild(dpmSearchResultContainer);
    dpmContainer.appendChild(document.createElement("br"));
    dpmContainer.appendChild(dpmCartContainer);
    dpmContainer.appendChild(dpmConfirmationModalContainer);

    return dpmContainer;
}
