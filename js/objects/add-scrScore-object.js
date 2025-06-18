/**
 * Create a SCR Scoring Object
 *
 * @param {Object} scrObject - Contains the definition of the SCR Score Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} scrInterfaceText - Contains all of the SCR relevant language interface
 * @returns a SCR Score object
 */
async function addSCRScoreObject(scrObject, paneID, scrInterfaceText) {
    // Create SCR Score Container
    let scrContainer = document.createElement('div');
    scrContainer.setAttribute('id', `${paneID}-obj-${scrObject?.id}`);

    // Create the Input Heading
    let inputHeader = document.createElement('h3');
    inputHeader.innerText = scrInterfaceText?.inputHeader;

    // Create the Input Container
    let scrInputContainer = document.createElement('div');
    scrInputContainer.id = `${paneID}-obj-${scrObject?.id}-inputs`;

    // Create the Output Heading
    let outputHeader = document.createElement('h3');
    outputHeader.innerText = scrInterfaceText?.outputHeader;

    // Create the Output Container
    let scrOutputContainer = document.createElement('div');
    scrOutputContainer.id = `${paneID}-obj-${scrObject?.id}-outputs`;

    // Create the Score Button
    let scrScoreButton = document.createElement('button');
    scrScoreButton.type = 'button';
    scrScoreButton.id = `${paneID}-obj-${scrObject?.id}-score`;
    scrScoreButton.setAttribute('class', 'btn btn-primary');
    scrScoreButton.innerText = scrInterfaceText?.scoreButton;
    scrScoreButton.onclick = async function () {
        this.disabled = true;
        this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${scrInterfaceText?.runStatus}`;
        let submitForm = document.getElementById(
            `${paneID}-obj-${scrObject?.id}-inputs-form`
        );
        const values = Array.from(submitForm.elements).map((x) => {
            return {
                name: x.id,
                value: isNaN(parseFloat(x.value))
                    ? x.value
                    : parseFloat(x.value),
            };
        });

        let currentSCR = document.getElementById(`${paneID}-obj-${scrObject?.id}-endpoint`).value;
        let scrResponse = await scoreSCR(currentSCR, values);
        let scrResultTable = document.getElementById(`${paneID}-obj-${scrObject?.id}-outputs-table-table-root`);
        addRowToTable(scrResultTable, [Object.values(scrResponse?.data)]);
        this.disabled = false;
        this.innerText = scrInterfaceText?.scoreButton;
    }

    // Add the SCR Module Input Selector 
    let scrEndpointInput = document.createElement('input');
    scrEndpointInput.type = 'text';
    scrEndpointInput.className = 'form-control';
    scrEndpointInput.placeholder = 'https://example.com/SCR';
    scrEndpointInput.id = `${paneID}-obj-${scrObject?.id}-endpoint`;
    scrEndpointInput.onblur = async function () {
        let scrDefinition = await getSCRMetadata(this.value);
        // Reset containers
        let scrInContainer = document.getElementById(`${paneID}-obj-${scrObject?.id}-inputs`);
        scrInContainer.innerHTML = '';
        let scrOutContainer = document.getElementById(`${paneID}-obj-${scrObject?.id}-outputs`)
        scrOutContainer.innerHTML = '';
        if(scrDefinition.length === 1) {
            let scrError = document.createElement('p');
            scrError.style.color = 'red';
            scrError.innerText = scrDefinition[0];
            scrInContainer.appendChild(scrError);
        } else {
            // Create the inputs
            addAccordionBody(`${paneID}-obj-${scrObject?.id}`, 'inputs', 'input', scrDefinition[0]);
            // Create the outputs
            createTable(scrOutContainer, `${paneID}-obj-${scrObject?.id}-outputs-table`, Object.values(scrDefinition[1]).map(field => field.name), []);
        }
    }

    // Add Label for input
    let scrEndpointInputLabel = document.createElement('label');
    scrEndpointInputLabel.for = `${paneID}-obj-${scrObject?.id}-endpoint`;
    scrEndpointInputLabel.innerText = `${scrInterfaceText?.endpoint}:`;
    scrEndpointInputLabel.style.textTransform = 'capitalize';

    // Create result
    scrContainer.appendChild(scrEndpointInputLabel);
    scrContainer.appendChild(scrEndpointInput);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(inputHeader);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrInputContainer);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrScoreButton);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(outputHeader);
    scrContainer.appendChild(document.createElement('br'));
    scrContainer.appendChild(scrOutputContainer);

    return scrContainer;
}
