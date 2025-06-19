/**
 * Create a Data Product Registry Object
 *
 * @param {Object} dataProductRegistryObject - Contains the definition of the Data Product Registry Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} dataProductRegistryInterfaceText -  Contains all of the Data Product Registry relevant language interface
 * @returns a Data Product Registry Object
 */
async function addDataProductRegistryObject(dataProductRegistryObject, paneID, dataProductRegistryInterfaceText) {
    // Create the Data Product Registry Container
    let dprContainer = document.createElement("div");
    dprContainer.id = `${paneID}-obj-${dataProductRegistryObject?.id}`;

    // Retrieve the Data Product Schema
    let dataProductSchemaJSON = await getFileContent(
        window.VIYA,
        dataProductRegistryObject.dataProductSchemaURI
    );
    let dataProductSchema = await dataProductSchemaJSON.json();

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
    submitButton.textContent = dataProductRegistryInterfaceText?.registerProduct;
    form.appendChild(submitButton);

    dprContainer.appendChild(form);

    return dprContainer;
}
