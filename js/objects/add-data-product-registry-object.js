/**
 * Create a Data Product Registry Object
 *
 * @param {Object} dataProductRegistryObject - Contains the definition of the Data Product Registry Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} dataProductRegistryInterfaceText -  Contains all of the Data Product Registry relevant language interface
 * @returns a Data Product Registry Object
 */
async function addDataProductRegistryObject(
    dataProductRegistryObject,
    paneID,
    dataProductRegistryInterfaceText
) {
    // Create the data product list
    let dataProducts;
    // Create the Data Product Registry Container
    let dprContainer = document.createElement("div");
    dprContainer.id = `${paneID}-obj-${dataProductRegistryObject?.id}`;

    // Create a heading for the editing
    const dprTitle = document.createElement("h2");

    // Variable to hold the name of the product currently being edited
    let currentEditingProductName = null;

    // Retrieve the Data Product Schema
    let dataProductSchemaJSON = await getFileContent(
        window.VIYA,
        dataProductRegistryObject.dataProductSchemaURI
    );
    let dataProductSchema = await dataProductSchemaJSON.json();

    // Retrieve the existing Data Products
    let existingDataProducts = await getFolderContent(
        window.VIYA,
        `${dataProductRegistryObject?.dataProductFolderURI}`,
        '?filter=eq(name,"data-products.json")'
    );
    // Check if there is already a file in place
    let dateProductFileURI;
    if (existingDataProducts?.length > 0) {
        let existingDataProductsResponse = await getFileContent(
            window.VIYA,
            existingDataProducts[0]?.uri
        );
        dataProducts = await existingDataProductsResponse.json();
        dateProductFileURI = existingDataProducts[0]?.uri;
    } else {
        dataProducts = [];
        const jsonstringContentObject = JSON.stringify(dataProducts);
        const blobContentObject = new Blob([jsonstringContentObject], {
            type: "text/json",
        });
        // Create the new File
        let createdDataProductsFileResp = await createFile(
            window.VIYA,
            dataProductRegistryObject?.dataProductFolderURI,
            blobContentObject,
            "data-products.json"
        );
        let createdDataProductstFile = await createdDataProductsFileResp.json();
        dateProductFileURI = `/files/files/${createdDataProductstFile.id}`;
    }

    // Create the form element
    const form = document.createElement("form");
    form.id = `${paneID}-obj-${dataProductRegistryObject?.id}-dataProductForm`;
    form.noValidate = true;

    /**
     * Generates an input element based on the field configuration.
     * @param {Object} field - The field configuration object from JSON.
     * @returns {HTMLElement} The generated input element.
     */
    function createInputElement(field) {
        let inputElement;

        switch (field.type) {
            case "text":
            case "email":
            case "url":
            case "number":
            case "password":
                inputElement = document.createElement("input");
                inputElement.type = field.type;
                inputElement.className = "form-control rounded-md";
                // Apply validation attributes
                if (field.validation) {
                    if (field.validation.minLength)
                        inputElement.minLength = field.validation.minLength;
                    if (field.validation.maxLength)
                        inputElement.maxLength = field.validation.maxLength;
                    if (field.validation.pattern)
                        inputElement.pattern = field.validation.pattern;
                    if (field.validation.min !== undefined)
                        inputElement.min = field.validation.min;
                    if (field.validation.max !== undefined)
                        inputElement.max = field.validation.max;
                }
                if (field.defaultValue !== undefined)
                    inputElement.value = field.defaultValue;
                break;
            case "textarea":
                inputElement = document.createElement("textarea");
                inputElement.className = "form-control rounded-md";
                inputElement.rows = 3; // Default rows for textarea
                if (field.validation && field.validation.maxLength)
                    inputElement.maxLength = field.validation.maxLength;
                if (field.defaultValue !== undefined)
                    inputElement.value = field.defaultValue;
                break;
            case "dropdown":
            case "multiselect":
                inputElement = document.createElement("select");
                inputElement.className = "form-select rounded-md";
                if (field.type === "multiselect") {
                    inputElement.multiple = true;
                }
                // Add a default "Choose..." option for single select dropdowns
                if (field.type === "dropdown" && !field.required) {
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Choose...";
                    inputElement.appendChild(defaultOption);
                }
                field.options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    if (
                        field.defaultValue !== undefined &&
                        field.defaultValue === option.value
                    ) {
                        optionElement.selected = true;
                    }
                    // Handle multiselect default values (array of values)
                    if (
                        field.type === "multiselect" &&
                        Array.isArray(field.defaultValue) &&
                        field.defaultValue.includes(option.value)
                    ) {
                        optionElement.selected = true;
                    }
                    inputElement.appendChild(optionElement);
                });
                break;
            case "radio":
                // Radio buttons are handled slightly differently as they need a container div for each option
                const radioGroup = document.createElement("div");
                field.options.forEach((option) => {
                    const formCheck = document.createElement("div");
                    formCheck.className = "form-check";

                    const radioInput = document.createElement("input");
                    radioInput.className = "form-check-input";
                    radioInput.type = "radio";
                    radioInput.name = field.id; // All radios in a group must have the same name
                    radioInput.id = `${field.id}-${option.value}`;
                    radioInput.value = option.value;
                    if (field.required) radioInput.required = true;
                    if (
                        field.defaultValue !== undefined &&
                        field.defaultValue === option.value
                    ) {
                        radioInput.checked = true;
                    }

                    const radioLabel = document.createElement("label");
                    radioLabel.className = "form-check-label";
                    radioLabel.htmlFor = `${field.id}-${option.value}`;
                    radioLabel.textContent = option.label;

                    formCheck.appendChild(radioInput);
                    formCheck.appendChild(radioLabel);
                    radioGroup.appendChild(formCheck);
                });
                inputElement = radioGroup; // This will be the container for radio buttons
                break;
            case "checkbox":
                inputElement = document.createElement("input");
                inputElement.type = "checkbox";
                inputElement.className = "form-check-input";
                if (field.defaultValue !== undefined)
                    inputElement.checked = field.defaultValue;
                break;
            case "date":
                inputElement = document.createElement("input");
                inputElement.type = "date";
                inputElement.className = "form-control rounded-md";
                if (field.defaultValue === "today") {
                    inputElement.valueAsDate = new Date(); // Set current date
                } else if (field.defaultValue) {
                    inputElement.value = field.defaultValue;
                }
                break;
            default:
                console.warn(
                    `Unknown field type: ${field.type}. Skipping field with id: ${field.id}`
                );
                return null;
        }

        inputElement.id = field.id;
        inputElement.name = field.id; // Important for form submission handling
        if (field.required && field.type !== "radio")
            inputElement.required = true; // Radio group handled separately
        if (field.placeholder) inputElement.placeholder = field.placeholder;

        return inputElement;
    }

    // --- Product Selector Dropdown ---
    const productSelectorGroup = document.createElement("div");
    productSelectorGroup.className = "mb-4";

    const productSelectorLabel = document.createElement("label");
    productSelectorLabel.htmlFor = "productSelector";
    productSelectorLabel.className = "form-label";
    productSelectorLabel.textContent =
        dataProductRegistryInterfaceText?.productSelector;
    productSelectorGroup.appendChild(productSelectorLabel);

    const productSelector = document.createElement("select");
    productSelector.id = "productSelector";
    productSelector.className = "form-select rounded-md";
    productSelectorGroup.appendChild(productSelector);

    // Add "New Product" option
    const newOption = document.createElement("option");
    newOption.value = "new";
    newOption.textContent =
        dataProductRegistryInterfaceText?.productSelectorNew;
    productSelector.appendChild(newOption);

    // Populate existing products
    if (dataProducts && dataProducts.length > 0) {
        dataProducts.forEach((product) => {
            const option = document.createElement("option");
            option.value = product.productName;
            option.textContent = product.productName;
            productSelector.appendChild(option);
        });
    }

    form.appendChild(productSelectorGroup); // Add selector to the form

    // Iterate through the schema and build the form
    dataProductSchema.forEach((field) => {
        const formGroup = document.createElement("div");
        formGroup.className = "mb-3"; // Bootstrap margin-bottom for spacing

        // Create label (unless it's a standalone checkbox)
        if (!(field.type === "checkbox")) {
            const labelElement = document.createElement("label");
            labelElement.htmlFor = field.id;
            labelElement.className = "form-label";
            labelElement.textContent = field.label;
            if (field.required) {
                labelElement.innerHTML += ' <span class="text-danger">*</span>'; // Add required asterisk
            }
            formGroup.appendChild(labelElement);
        }

        const inputElement = createInputElement(field);

        if (inputElement) {
            if (field.type === "radio") {
                // For radio, the inputElement is a div containing all radios
                formGroup.appendChild(inputElement);
            } else if (field.type === "checkbox") {
                const formCheck = document.createElement("div");
                formCheck.className = "form-check";

                const labelElement = document.createElement("label");
                labelElement.htmlFor = field.id;
                labelElement.className = "form-check-label";
                labelElement.textContent = field.label;

                formCheck.appendChild(inputElement); // checkbox input
                formCheck.appendChild(labelElement); // checkbox label
                formGroup.appendChild(formCheck);
            } else {
                formGroup.appendChild(inputElement);
            }

            // Add description text
            if (field.description) {
                const descriptionText = document.createElement("div");
                descriptionText.className = "form-text";
                descriptionText.textContent = field.description;
                formGroup.appendChild(descriptionText);
            }

            form.appendChild(formGroup);
        }
    });

    // Add a submit button
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "btn btn-primary";
    submitButton.textContent =
        dataProductRegistryInterfaceText?.registerProduct;
    form.appendChild(submitButton);

    // Add event listeners for input changes to provide immediate feedback
    form.addEventListener("input", function (event) {
        // Check validity on input for immediate feedback
        const target = event.target;
        if (target.matches(".form-control, .form-select")) {
            if (target.required && !target.value) {
                target.setCustomValidity(
                    dataProductRegistryInterfaceText?.validationRequired
                );
            } else if (
                target.pattern &&
                !new RegExp(target.pattern).test(target.value)
            ) {
                target.setCustomValidity(
                    dataProductRegistryInterfaceText?.validationPattern
                );
            } else {
                target.setCustomValidity(""); // Clear custom validation message
            }
        }
    });

    // Form Submission Handling
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add("was-validated");
            return;
        }

        const formData = {};
        dataProductSchema.forEach((field) => {
            const input = form.elements[field.id];

            if (!input) {
                if (field.type === "radio") {
                    const checkedRadio = document.querySelector(
                        `input[name="${field.id}"]:checked`
                    );
                    if (checkedRadio) {
                        formData[field.id] = checkedRadio.value;
                    }
                }
                return;
            }

            if (field.type === "checkbox") {
                formData[field.id] = input.checked;
            } else if (field.type === "multiselect") {
                // For multiselect, collect all selected options
                const selectedOptions = Array.from(input.options)
                    .filter((option) => option.selected)
                    .map((option) => option.value);
                formData[field.id] = selectedOptions;
            } else {
                formData[field.id] = input.value;
            }
        });

        if (currentEditingProductName) {
            formData.productName = currentEditingProductName; // Add the ID for updating
            // Find the index of the product to update
            const productIndex = dataProducts.findIndex(p => p.productName === currentEditingProductName);
            dataProducts[productIndex] = { ...dataProducts[productIndex], ...formData };
        } else {
            dataProducts.push(formData);
        }

        const jsonstringContentObject = JSON.stringify(dataProducts);
        const blobContentObject = new Blob([jsonstringContentObject], {
            type: "text/json",
        });
        updateFileContent(window.VIYA, dateProductFileURI, blobContentObject);

        // Reset form validation state after successful submission
        form.classList.remove("was-validated");
        productSelector.value = "new";
        loadProductForEditing("new");
    });

    /**
     * Loads product data into the form for editing, or clears the form for a new entry.
     * @param {string} productName - The productName of the product to load, or 'new' to clear the form.
     */
    function loadProductForEditing(productName) {
        currentEditingProductName = productName === "new" ? null : productName;
        const productToLoad = dataProducts.find((p) => p.productName === productName);

        // Update the H2 title based on selection
        if (productToLoad) {
            dprTitle.textContent = `${dataProductRegistryInterfaceText?.editProduct}: ${productToLoad.productName}`;
        } else {
            dprTitle.textContent =
                dataProductRegistryInterfaceText?.registerProduct;
        }

        dataProductSchema.forEach((field) => {
            const input = form.elements[field.id]; // Access by name

            if (!input) {
                // Special handling for radio buttons
                if (field.type === "radio") {
                    const radioInputs = document.querySelectorAll(
                        `input[name="${field.id}"]`
                    );
                    radioInputs.forEach((radio) => {
                        radio.checked = false; // Uncheck all first
                        if (
                            productToLoad &&
                            productToLoad[field.id] === radio.value
                        ) {
                            radio.checked = true;
                        } else if (
                            !productToLoad &&
                            field.defaultValue !== undefined &&
                            field.defaultValue === radio.value
                        ) {
                            radio.checked = true; // Apply default if new product
                        }
                    });
                }
                return;
            }

            const value = productToLoad
                ? productToLoad[field.id]
                : field.defaultValue;

            if (field.type === "checkbox") {
                input.checked = value === true || value === "true"; // Handle boolean or string 'true'
            } else if (field.type === "multiselect") {
                // For multiselect, set selected options based on an array
                Array.from(input.options).forEach((option) => {
                    option.selected =
                        Array.isArray(value) && value.includes(option.value);
                });
            } else if (
                field.type === "date" &&
                value === "today" &&
                !productToLoad
            ) {
                input.valueAsDate = new Date();
            } else if (value !== undefined) {
                input.value = value;
            } else {
                input.value = ""; // Clear value if no product or no default
            }
        });

        // Set the submit button text based on editing state
        submitButton.textContent = currentEditingProductName
            ? dataProductRegistryInterfaceText?.registerUpdateProduct
            : dataProductRegistryInterfaceText?.registerNewProduct;
        form.classList.remove("was-validated"); // Clear validation state on load
    }

    // Event listener for product selector change
    productSelector.addEventListener("change", (event) => {
        loadProductForEditing(event.target.value);
    });

    dprContainer.appendChild(dprTitle);
    dprContainer.appendChild(form);

    // Initial load: Populate the form with default values for a new product
    window.addEventListener("load", () => {
        loadProductForEditing("new");
    });

    return dprContainer;
}
