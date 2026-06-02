/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Create a Data Product Registry Object
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition, InterfaceText, DataProductRegistryText } from '../types';
import { getFileContent } from '../api/files-api';
import { getFolderContent } from '../api/folders-api';
import { createFile, updateFileContent, copyFile } from '../api/files-api';
import { createFolder } from '../api/folders-api';
import { copyReport } from '../api/reports-api';

interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

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
  validation?: FieldValidation;
  options?: FieldOption[];
}

registerObjectType({
  type: 'dataProductRegistry',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const dataProductRegistryObject = definition;
    const dataProductRegistryInterfaceText = (interfaceText?.dataProductRegistry ?? {}) as DataProductRegistryText;

    // Create the data product list
    let dataProducts: Record<string, unknown>[];
    // Create the Data Product Registry Container
    const dprContainer = document.createElement('div');
    dprContainer.id = `${paneID}-obj-${dataProductRegistryObject?.id}`;

    // Create a heading for the editing
    const dprTitle = document.createElement('h2');

    // Variable to hold the name of the product currently being edited
    let currentEditingProductName: string | null = null;

    // Retrieve the Data Product Schema
    const dataProductSchemaJSON = await getFileContent(
      dataProductRegistryObject.dataProductSchemaURI as string
    );
    const dataProductSchema: SchemaField[] = await dataProductSchemaJSON.json();

    // Retrieve the existing Data Products
    const existingDataProducts = await getFolderContent(
      `${dataProductRegistryObject?.dataProductFolderURI}`,
      '?filter=eq(name,"data-products.json")'
    );
    // Check if there is already a file in place
    let dateProductFileURI: string;
    if (existingDataProducts && existingDataProducts.length > 0) {
      const existingDataProductsResponse = await getFileContent(
        existingDataProducts[0]!.uri
      );
      dataProducts = await existingDataProductsResponse.json();
      dateProductFileURI = existingDataProducts[0]!.uri;
    } else {
      dataProducts = [];
      const jsonstringContentObject = JSON.stringify(dataProducts);
      const blobContentObject = new Blob([jsonstringContentObject], {
        type: 'text/json',
      });
      // Create the new File
      const createdDataProductsFileResp = await createFile(
        dataProductRegistryObject?.dataProductFolderURI as string,
        blobContentObject,
        'data-products.json'
      );
      const createdDataProductstFile = await createdDataProductsFileResp.json();
      dateProductFileURI = `/files/files/${createdDataProductstFile.id}`;
    }

    // Create the form element
    const form = document.createElement('form');
    form.id = `${paneID}-obj-${dataProductRegistryObject?.id}-dataProductForm`;
    form.noValidate = true;

    /**
     * Generates an input element based on the field configuration.
     */
    function createInputElement(field: SchemaField): HTMLElement | null {
      let inputElement: HTMLElement;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
        case 'number':
        case 'password': {
          const inp = document.createElement('input');
          inp.type = field.type;
          inp.className = 'form-control rounded-md';
          // Apply validation attributes
          if (field.validation) {
            if (field.validation.minLength)
              inp.minLength = field.validation.minLength;
            if (field.validation.maxLength)
              inp.maxLength = field.validation.maxLength;
            if (field.validation.pattern)
              inp.pattern = field.validation.pattern;
            if (field.validation.min !== undefined)
              inp.min = String(field.validation.min);
            if (field.validation.max !== undefined)
              inp.max = String(field.validation.max);
          }
          if (field.defaultValue !== undefined)
            inp.value = String(field.defaultValue);
          inputElement = inp;
          break;
        }
        case 'textarea': {
          const ta = document.createElement('textarea');
          ta.className = 'form-control rounded-md';
          ta.rows = 3;
          if (field.validation && field.validation.maxLength)
            ta.maxLength = field.validation.maxLength;
          if (field.defaultValue !== undefined)
            ta.value = String(field.defaultValue);
          inputElement = ta;
          break;
        }
        case 'dropdown':
        case 'multiselect': {
          const sel = document.createElement('select');
          sel.className = 'form-select rounded-md';
          if (field.type === 'multiselect') {
            sel.multiple = true;
          }
          // Add a default "Choose..." option for single select dropdowns
          if (field.type === 'dropdown' && !field.required) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Choose...';
            sel.appendChild(defaultOption);
          }
          (field.options ?? []).forEach((option) => {
            const optionElement = document.createElement('option');
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
              field.type === 'multiselect' &&
              Array.isArray(field.defaultValue) &&
              (field.defaultValue as string[]).includes(option.value)
            ) {
              optionElement.selected = true;
            }
            sel.appendChild(optionElement);
          });
          inputElement = sel;
          break;
        }
        case 'radio': {
          // Radio buttons are handled slightly differently as they need a container div for each option
          const radioGroup = document.createElement('div');
          (field.options ?? []).forEach((option) => {
            const formCheck = document.createElement('div');
            formCheck.className = 'form-check';

            const radioInput = document.createElement('input');
            radioInput.className = 'form-check-input';
            radioInput.type = 'radio';
            radioInput.name = field.id;
            radioInput.id = `${field.id}-${option.value}`;
            radioInput.value = option.value;
            if (field.required) radioInput.required = true;
            if (
              field.defaultValue !== undefined &&
              field.defaultValue === option.value
            ) {
              radioInput.checked = true;
            }

            const radioLabel = document.createElement('label');
            radioLabel.className = 'form-check-label';
            radioLabel.htmlFor = `${field.id}-${option.value}`;
            radioLabel.textContent = option.label;

            formCheck.appendChild(radioInput);
            formCheck.appendChild(radioLabel);
            radioGroup.appendChild(formCheck);
          });
          inputElement = radioGroup;
          break;
        }
        case 'checkbox': {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'form-check-input';
          if (field.defaultValue !== undefined)
            cb.checked = field.defaultValue as boolean;
          inputElement = cb;
          break;
        }
        case 'date': {
          const dateInp = document.createElement('input');
          dateInp.type = 'date';
          dateInp.className = 'form-control rounded-md';
          if (field.defaultValue === 'today') {
            dateInp.valueAsDate = new Date();
          } else if (field.defaultValue) {
            dateInp.value = String(field.defaultValue);
          }
          inputElement = dateInp;
          break;
        }
        default:
          console.warn(
            `Unknown field type: ${field.type}. Skipping field with id: ${field.id}`
          );
          return null;
      }

      inputElement.id = field.id;
      (inputElement as HTMLInputElement).name = field.id;
      if (field.required && field.type !== 'radio')
        (inputElement as HTMLInputElement).required = true;
      if (field.placeholder)
        (inputElement as HTMLInputElement).placeholder = field.placeholder;

      return inputElement;
    }

    // --- Product Selector Dropdown ---
    const productSelectorGroup = document.createElement('div');
    productSelectorGroup.className = 'mb-4';

    const productSelectorLabel = document.createElement('label');
    productSelectorLabel.htmlFor = 'productSelector';
    productSelectorLabel.className = 'form-label';
    productSelectorLabel.textContent =
      dataProductRegistryInterfaceText?.productSelector;
    productSelectorGroup.appendChild(productSelectorLabel);

    const productSelector = document.createElement('select');
    productSelector.id = 'productSelector';
    productSelector.className = 'form-select rounded-md';
    productSelectorGroup.appendChild(productSelector);

    // Add "New Product" option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent =
      dataProductRegistryInterfaceText?.productSelectorNew;
    productSelector.appendChild(newOption);

    // Populate existing products
    if (dataProducts && dataProducts.length > 0) {
      dataProducts.forEach((product) => {
        const option = document.createElement('option');
        option.value = product.productName as string;
        option.textContent = product.productName as string;
        productSelector.appendChild(option);
      });
    }

    form.appendChild(productSelectorGroup);

    // Iterate through the schema and build the form
    dataProductSchema.forEach((field) => {
      const formGroup = document.createElement('div');
      formGroup.className = 'mb-3';

      // Create label (unless it's a standalone checkbox)
      if (!(field.type === 'checkbox')) {
        const labelElement = document.createElement('label');
        labelElement.htmlFor = field.id;
        labelElement.className = 'form-label';
        labelElement.textContent = field.label;
        if (field.required) {
          labelElement.innerHTML += ' <span class="text-danger">*</span>';
        }
        formGroup.appendChild(labelElement);
      }

      const inputElement = createInputElement(field);

      if (inputElement) {
        if (field.type === 'radio') {
          formGroup.appendChild(inputElement);
        } else if (field.type === 'checkbox') {
          const formCheck = document.createElement('div');
          formCheck.className = 'form-check';

          const labelElement = document.createElement('label');
          labelElement.htmlFor = field.id;
          labelElement.className = 'form-check-label';
          labelElement.textContent = field.label;

          formCheck.appendChild(inputElement);
          formCheck.appendChild(labelElement);
          formGroup.appendChild(formCheck);
        } else {
          formGroup.appendChild(inputElement);
        }

        // Add description text
        if (field.description) {
          const descriptionText = document.createElement('div');
          descriptionText.className = 'form-text';
          descriptionText.textContent = field.description;
          formGroup.appendChild(descriptionText);
        }

        form.appendChild(formGroup);
      }
    });

    // Add a submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent =
      dataProductRegistryInterfaceText?.registerProduct;
    form.appendChild(submitButton);

    // Add event listeners for input changes to provide immediate feedback
    form.addEventListener('input', function (event: Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (target.matches('.form-control, .form-select')) {
        if (target.required && !target.value) {
          target.setCustomValidity(
            dataProductRegistryInterfaceText?.validationRequired
          );
        } else if (
          (target as HTMLInputElement).pattern &&
          !new RegExp((target as HTMLInputElement).pattern).test(target.value)
        ) {
          target.setCustomValidity(
            dataProductRegistryInterfaceText?.validationPattern
          );
        } else {
          target.setCustomValidity('');
        }
      }
    });

    // Form Submission Handling
    form.addEventListener('submit', async function (event: Event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      const formData: Record<string, unknown> = {};
      dataProductSchema.forEach((field) => {
        const input = (form.elements as HTMLFormControlsCollection).namedItem(field.id) as HTMLInputElement | HTMLSelectElement | null;

        if (!input) {
          if (field.type === 'radio') {
            const checkedRadio = document.querySelector(
              `input[name="${field.id}"]:checked`
            ) as HTMLInputElement | null;
            if (checkedRadio) {
              formData[field.id] = checkedRadio.value;
            }
          }
          return;
        }

        if (field.type === 'checkbox') {
          formData[field.id] = (input as HTMLInputElement).checked;
        } else if (field.type === 'multiselect') {
          const selectedOptions = Array.from((input as HTMLSelectElement).options)
            .filter((option) => option.selected)
            .map((option) => option.value);
          formData[field.id] = selectedOptions;
        } else {
          formData[field.id] = input.value;
        }
      });

      if (currentEditingProductName) {
        formData.productName = currentEditingProductName;
        const productIndex = dataProducts.findIndex(
          (p) => p.productName === currentEditingProductName
        );
        if (productIndex !== -1) {
          dataProducts[productIndex] = { ...dataProducts[productIndex], ...formData };
        } else {
          // The edited product is no longer in the list; add it instead of
          // writing to index -1.
          dataProducts.push(formData);
        }
      } else {
        // Check if the user wants to create a new folder
        if (dataProductRegistryObject?.dataProductNewFolderParentURI) {
          const newDataProductFolder = await createFolder(
            formData.productName as string,
            dataProductRegistryObject?.dataProductNewFolderParentURI as string
          );
          // Check if the user wants to copy template content to the folder
          const copyContentList = dataProductRegistryObject?.dataProductCopyContent as string[] | undefined;
          if (copyContentList && copyContentList.length > 0) {
            for (let i = 0; i < copyContentList.length; i++) {
              if (copyContentList[i].startsWith('/reports/reports/')) {
                await copyReport(
                  copyContentList[i].replace('/reports/reports/', ''),
                  `/folders/folders/${newDataProductFolder.id}`
                );
              } else if (copyContentList[i].startsWith('/files/files/')) {
                await copyFile(
                  copyContentList[i],
                  `/folders/folders/${newDataProductFolder.id}`
                );
              } else {
                console.log(
                  `The content object ${copyContentList[i]} could not be copied as it is not supported. Only reports and files are supported`
                );
              }
            }
          }
        }
        // Add the data product to the list of data products
        dataProducts.push(formData);
      }

      const jsonstringContentObject = JSON.stringify(dataProducts);
      const blobContentObject = new Blob([jsonstringContentObject], {
        type: 'text/json',
      });
      await updateFileContent(dateProductFileURI, blobContentObject);

      // Reset form validation state after successful submission
      form.classList.remove('was-validated');
      productSelector.value = 'new';
      loadProductForEditing('new');
    });

    // Add a delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-primary';
    deleteButton.textContent =
      dataProductRegistryInterfaceText?.deleteProduct;
    deleteButton.onclick = async function () {
      if (currentEditingProductName) {
        const productIndex = dataProducts.findIndex(
          (p) => p.productName === currentEditingProductName
        );
        // Guard against -1, which would splice off the last element.
        if (productIndex === -1) return;
        dataProducts.splice(productIndex, 1);

        const jsonstringContentObject = JSON.stringify(dataProducts);
        const blobContentObject = new Blob([jsonstringContentObject], {
          type: 'text/json',
        });
        await updateFileContent(dateProductFileURI, blobContentObject);
        // Remove the element from the form
        for (let i = 0; i < productSelector.options.length; i++) {
          if (productSelector.options[i]!.value === currentEditingProductName) {
            productSelector.remove(i);
            break;
          }
        }
        // Reset form validation state after successful submission
        form.classList.remove('was-validated');
        productSelector.value = 'new';
        loadProductForEditing('new');
      }
    };

    /**
     * Loads product data into the form for editing, or clears the form for a new entry.
     */
    function loadProductForEditing(productName: string): void {
      currentEditingProductName = productName === 'new' ? null : productName;
      const productToLoad = dataProducts.find(
        (p) => p.productName === productName
      );

      // Update the H2 title based on selection
      if (productToLoad) {
        dprTitle.textContent = `${dataProductRegistryInterfaceText?.editProduct}: ${productToLoad.productName}`;
      } else {
        dprTitle.textContent =
          dataProductRegistryInterfaceText?.registerProduct;
      }

      dataProductSchema.forEach((field) => {
        const input = (form.elements as HTMLFormControlsCollection).namedItem(field.id) as HTMLInputElement | HTMLSelectElement | null;

        if (!input) {
          // Special handling for radio buttons
          if (field.type === 'radio') {
            const radioInputs = document.querySelectorAll(
              `input[name="${field.id}"]`
            ) as NodeListOf<HTMLInputElement>;
            radioInputs.forEach((radio) => {
              radio.checked = false;
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
                radio.checked = true;
              }
            });
          }
          return;
        }

        const value = productToLoad
          ? productToLoad[field.id]
          : field.defaultValue;

        if (field.type === 'checkbox') {
          (input as HTMLInputElement).checked =
            value === true || value === 'true';
        } else if (field.type === 'multiselect') {
          Array.from((input as HTMLSelectElement).options).forEach((option) => {
            option.selected =
              Array.isArray(value) && (value as string[]).includes(option.value);
          });
        } else if (
          field.type === 'date' &&
          value === 'today' &&
          !productToLoad
        ) {
          (input as HTMLInputElement).valueAsDate = new Date();
        } else if (value !== undefined) {
          (input as HTMLInputElement).value = String(value);
        } else {
          (input as HTMLInputElement).value = '';
        }
      });

      // Set the submit button text based on editing state
      submitButton.textContent = currentEditingProductName
        ? dataProductRegistryInterfaceText?.registerUpdateProduct
        : dataProductRegistryInterfaceText?.registerNewProduct;
      form.classList.remove('was-validated');
    }

    // Event listener for product selector change
    productSelector.addEventListener('change', (event: Event) => {
      loadProductForEditing((event.target as HTMLSelectElement).value);
    });

    dprContainer.appendChild(dprTitle);
    dprContainer.appendChild(form);
    dprContainer.appendChild(document.createElement('br'));
    dprContainer.appendChild(document.createElement('br'));
    dprContainer.appendChild(deleteButton);

    // Initial load: Populate the form with default values for a new product.
    // Objects are built after the page 'load' event has already fired, so a
    // 'load' listener would never run — call directly instead.
    loadProductForEditing('new');

    return dprContainer;
  },
});
