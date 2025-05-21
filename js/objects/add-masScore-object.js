/**
 * Create a MAS Scoring Object
 *
 * @param {Object} masObject - Contains the definition of the MAS Score Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} masInterfaceText - Contains all of the MAS relevant language interface
 * @returns a MAS Score object
 */
async function addMASScoreObject(masObject, paneID, masInterfaceText) {
    // Create MAS Score Container
    let masContainer = document.createElement('div');
    masContainer.setAttribute('id', `${paneID}-obj-${masObject?.id}`);
    masContainer.setAttribute('class', 'row row-col-2 gy-3');

    // Create Right Side Column
    let masRightSide = document.createElement('div');
    masRightSide.setAttribute('class', 'col-8 p-3');
    masRightSide.style.border = '0.2em solid lightgray';

    // Create Baseline Right Side Column
    let masAccordion = document.createElement('div');
    masAccordion.setAttribute('class', 'accordion accordion-flush');
    masAccordion.setAttribute('id', `${masObject?.id}-accordion`);

    createAccordionItem(
        masAccordion,
        `${masObject?.id}-accordion`,
        'moduleInfo',
        masInterfaceText
    );
    createAccordionItem(
        masAccordion,
        `${masObject?.id}-accordion`,
        'moduleCode',
        masInterfaceText
    );
    createAccordionItem(
        masAccordion,
        `${masObject?.id}-accordion`,
        'stepInputs',
        masInterfaceText
    );
    createAccordionItem(
        masAccordion,
        `${masObject?.id}-accordion`,
        'stepOutputs',
        masInterfaceText
    );
    masRightSide.appendChild(masAccordion);

    // Create Left Side Column
    let masLeftSide = document.createElement('div');
    masLeftSide.setAttribute('class', 'col-4 p-3');
    masLeftSide.style.border = '0.2em solid lightgray';

    // Add the MAS Module Selector
    let moduleHeading = document.createElement('p');
    moduleHeading.setAttribute('class', 'fs-3');
    moduleHeading.innerText = `${masInterfaceText?.moduleSelect}:`;

    let moduleDropdown = document.createElement('select');
    moduleDropdown.setAttribute('class', 'form-select');
    moduleDropdown.setAttribute('id', `${masObject?.id}-module-dropdown`);
    moduleDropdown.onchange = async function () {
        let currentModule = this.options[this.selectedIndex].value;
        let MASINFO = await getMASModuleInformation(VIYA, currentModule);

        // Set the Options for the Step Dropdown
        let tmpModuleStepDropdown = document.getElementById(
            `${masObject?.id}-step-dropdown`
        );
        tmpModuleStepDropdown.innerHTML = '';
        let tmpModuleStepDropdownItem = document.createElement('option');
        tmpModuleStepDropdownItem.value = `${masInterfaceText?.stepSelect}`;
        tmpModuleStepDropdownItem.innerHTML = `${masInterfaceText?.stepSelect}`;
        tmpModuleStepDropdown.append(tmpModuleStepDropdownItem);

        // Add all Steps to the Interface
        for (const step in MASINFO?.stepIds) {
            let tmpModuleStepItem = document.createElement('option');
            tmpModuleStepItem.value = `${currentModule}/steps/${MASINFO?.stepIds[step]}`;
            tmpModuleStepItem.innerHTML = MASINFO?.stepIds[step];
            tmpModuleStepDropdown.append(tmpModuleStepItem);
            // Auto set the step to score (Model) or execute (Decision) if they are available
            if (['execute', 'score'].includes(MASINFO?.stepIds[step])) {
                tmpModuleStepDropdown.value = `${currentModule}/steps/${MASINFO?.stepIds[step]}`;
                tmpModuleStepDropdown.dispatchEvent(new Event('change'));
            }
        }

        // Remove Elements not Wanted in the Table
        delete MASINFO.links;
        delete MASINFO.properties;
        delete MASINFO.stepIds;
        delete MASINFO.warnings;

        // Deconstruct all information into an array
        let MASINFOCONTENT = [];
        for (let [key, value] of Object.entries(MASINFO)) {
            MASINFOCONTENT.push([key, value]);
        }

        // Full table definition for the MAS Module Information Table
        let MASINFORESULT = {
            headers: [
                masInterfaceText?.moduleInfoAttribute,
                masInterfaceText?.moduleInfoValue,
            ],
            content: MASINFOCONTENT,
        };

        // Add the MAS Module Information Table
        addAccordionBody(
            `${masObject?.id}-accordion`,
            'moduleInfo',
            'table',
            MASINFORESULT,
            masInterfaceText?.moduleDownloadButton
        );

        // Get the MAS Module Code
        let moduleCode = await getMASModuleCode(VIYA, currentModule);
        // Add the MAS Module Code
        addAccordionBody(
            `${masObject?.id}-accordion`,
            'moduleCode',
            'code',
            moduleCode,
            masInterfaceText?.moduleDownloadButton,
            masInterfaceText?.moduleCodeClipboard
        );
    };

    // Get all MAS Module
    let modules = await getAllMasModules(VIYA, masInterfaceText);

    // Add the MAS Modules to the dropdown
    for (const module in modules) {
        let masMod = document.createElement('option');
        masMod.value = modules[module]?.value;
        masMod.innerHTML = modules[module]?.innerHTML;
        moduleDropdown.append(masMod);
    }

    // Add the MAS Module Step Selector Heading
    let moduleStepHeading = document.createElement('p');
    moduleStepHeading.setAttribute('class', 'fs-3');
    moduleStepHeading.innerText = `${masInterfaceText?.stepSelect}:`;

    // Add the MAS Module Step Selector
    let moduleStepDropdown = document.createElement('select');
    moduleStepDropdown.setAttribute('class', 'form-select');
    moduleStepDropdown.setAttribute('id', `${masObject?.id}-step-dropdown`);
    moduleStepDropdown.onchange = async function () {
        let currentStep = this.options[this.selectedIndex].value;
        let MASINPUTS = await getMASModuleInputs(VIYA, currentStep);

        // Add Input Controls for Scoring
        addAccordionBody(
            `${masObject?.id}-accordion`,
            'stepInputs',
            'input',
            MASINPUTS?.inputs
        );

        let MASOUTPUTS = MASINPUTS?.outputs.map((outCol) => outCol?.name);
        let MASOUTTABLE = { headers: MASOUTPUTS, content: [] };
        // Add Output Table
        addAccordionBody(
            `${masObject?.id}-accordion`,
            'stepOutputs',
            'table',
            MASOUTTABLE,
            masInterfaceText?.moduleDownloadButton
        );
    };

    // Add the default explanation
    let moduleStepDropdownItem = document.createElement('option');
    moduleStepDropdownItem.value = `${masInterfaceText?.stepSelect}`;
    moduleStepDropdownItem.innerHTML = `${masInterfaceText?.stepSelect}`;
    moduleStepDropdown.append(moduleStepDropdownItem);

    // Add the Refresh Button
    let moduleRefreshButton = document.createElement('button');
    moduleRefreshButton.setAttribute('id', `${masObject?.id}-accordion-refreshDelete-button`);
    moduleRefreshButton.setAttribute('type', 'button');
    moduleRefreshButton.setAttribute('class', 'btn btn-primary');
    moduleRefreshButton.innerText = `${masInterfaceText?.moduleRefresh}`;
    moduleRefreshButton.onclick = async function () {
        let tmpModuleDropdown = document.getElementById(
            `${masObject?.id}-module-dropdown`
        );
        let tmpModuleStepDropdown = document.getElementById(
            `${masObject?.id}-step-dropdown`
        );

        // Reset and Repopulate the Module Dropdown
        tmpModuleDropdown.innerHTML = '';
        let tmpModules = await getAllMasModules(VIYA, masInterfaceText);
        // Add the MAS Modules to the dropdown
        for (const tmpModule in tmpModules) {
            let masMod = document.createElement('option');
            masMod.value = tmpModules[tmpModule]?.value;
            masMod.innerHTML = tmpModules[tmpModule]?.innerHTML;
            moduleDropdown.append(masMod);
        }

        // Reset and Repopulate the Step Dropdown
        tmpModuleStepDropdown.innerHTML = '';
        // Add the default explanation
        let tmpModuleStepDropdownItem = document.createElement('option');
        tmpModuleStepDropdownItem.value = `${masInterfaceText?.stepSelect}`;
        tmpModuleStepDropdownItem.innerHTML = `${masInterfaceText?.stepSelect}`;
        tmpModuleStepDropdown.append(tmpModuleStepDropdownItem);

        // Reset the Right Side
        masAccordion.innerHTML = '';
        createAccordionItem(
            masAccordion,
            `${masObject?.id}-accordion`,
            'moduleInfo',
            masInterfaceText
        );
        createAccordionItem(
            masAccordion,
            `${masObject?.id}-accordion`,
            'moduleCode',
            masInterfaceText
        );
        createAccordionItem(
            masAccordion,
            `${masObject?.id}-accordion`,
            'stepInputs',
            masInterfaceText
        );
        createAccordionItem(
            masAccordion,
            `${masObject?.id}-accordion`,
            'stepOutputs',
            masInterfaceText
        );
        masRightSide.appendChild(masAccordion);
    };

    // Add the Delete Button
    let masDeleteButton = document.createElement('button');
    masDeleteButton.setAttribute('type', 'button');
    masDeleteButton.setAttribute('id', `${masObject?.id}-accordion-stepDelete-button`);
    masDeleteButton.setAttribute('class', 'btn btn-primary');
    masDeleteButton.innerText = masInterfaceText?.moduleDelete;
    masDeleteButton.onclick = async function () {
        let currentModule = document.getElementById(
            `${masObject?.id}-module-dropdown`
        );
        let currentModuleValue = currentModule.options[currentModule.selectedIndex].value;
        let masModuleDeletionResponse = await deleteMASModule(VIYA, currentModuleValue);

        if (masModuleDeletionResponse === 204) {
            window.alert(masInterfaceText?.successfullModuleDeletion)
            // Refresh the UI to remove the old content
            document.getElementById(`${masObject?.id}-accordion-refreshDelete-button`).click();
        } else {
            window.alert(masInterfaceText?.failedModuleDeletion)
        }
    }

    // Add the default Submit Button
    let masSubmitButton = document.createElement('button');
    masSubmitButton.setAttribute('type', 'button');
    masSubmitButton.setAttribute(
        'id',
        `${masObject?.id}-accordion-stepInputs-button`
    );
    masSubmitButton.setAttribute('class', 'btn btn-primary');
    masSubmitButton.innerText = masInterfaceText?.moduleScore;
    masSubmitButton.onclick = async function () {
        let submitForm = document.getElementById(
            `${masObject?.id}-accordion-stepInputs-form`
        );
        const values = Array.from(submitForm.elements).map((x) => {
            return {
                name: x.id,
                value: isNaN(parseFloat(x.value))
                    ? x.value
                    : parseFloat(x.value),
            };
        });

        let currentStep = document.getElementById(
            `${masObject?.id}-step-dropdown`
        );
        let currentStepValue =
            currentStep.options[currentStep.selectedIndex].value;
        let masScoreResponse = await scoreMASModule(
            VIYA,
            currentStepValue,
            values
        );

        let masScoreResponseRow = masScoreResponse?.outputs.map(
            (outElement) => outElement?.value
        );
        let masScoreResponseTableRow = [];
        masScoreResponseTableRow.push(masScoreResponseRow);

        let masResultsTable = document.getElementById(
            `${masObject?.id}-accordion-stepOutputs-table`
        );
        addRowToTable(masResultsTable, masScoreResponseTableRow);
    };

    // Add file upload for random score
    let importScoreTableHeader = document.createElement('p');
    importScoreTableHeader.setAttribute('class', 'fs-5');
    importScoreTableHeader.innerText = `${masInterfaceText?.scoreImportHeader}:`;

    // Add input file upload
    let randomData = [];
    let importScoreButton = document.createElement('input');
    importScoreButton.setAttribute('class', 'form-control');
    importScoreButton.setAttribute('type', 'file');
    importScoreButton.setAttribute('accept', '.csv');
    importScoreButton.onchange = async function () {
        let read = new FileReader();

        read.readAsBinaryString(this.files[0]);

        read.onloadend = function () {
            randomData = [];
            randomData.push(read.result.split('\n'));
        };
    };

    // Add Random Score Button
    let masRandomScoreButton = document.createElement('button');
    masRandomScoreButton.setAttribute('type', 'button');
    masRandomScoreButton.setAttribute('class', 'btn btn-primary');
    masRandomScoreButton.innerText = `${masInterfaceText?.scoreRandom}`;
    masRandomScoreButton.onclick = async function () {
        let randomRow =
            randomData[0][
                Math.floor(Math.random() * randomData[0].length)
            ].split(',');
        let submitForm = document.getElementById(
            `${masObject?.id}-accordion-stepInputs-form`
        );
        let values = Array.from(submitForm.elements).map((x) => {
            return {
                name: x.id,
                value: isNaN(parseFloat(x.value))
                    ? x.value
                    : parseFloat(x.value),
            };
        });

        for (
            let valueArrayElement = 0;
            valueArrayElement < values.length;
            valueArrayElement++
        ) {
            values[valueArrayElement].value = isNaN(
                parseFloat(randomRow[valueArrayElement])
            )
                ? randomRow[valueArrayElement]
                : parseFloat(randomRow[valueArrayElement]);
        }

        let currentStep = document.getElementById(
            `${masObject?.id}-step-dropdown`
        );
        let currentStepValue =
            currentStep.options[currentStep.selectedIndex].value;
        let masScoreResponse = await scoreMASModule(
            VIYA,
            currentStepValue,
            values
        );

        let masScoreResponseRow = masScoreResponse?.outputs.map(
            (outElement) => outElement?.value
        );
        let masScoreResponseTableRow = [];
        masScoreResponseTableRow.push(masScoreResponseRow);

        let masResultsTable = document.getElementById(
            `${masObject?.id}-accordion-stepOutputs-table`
        );
        addRowToTable(masResultsTable, masScoreResponseTableRow);
    };

    let masNewLine1 = document.createElement('br');
    let masNewLine2 = document.createElement('br');
    let masNewLine3 = document.createElement('br');

    // Add to the Left Side Column
    masLeftSide.appendChild(moduleHeading);
    masLeftSide.appendChild(moduleDropdown);
    masLeftSide.appendChild(moduleStepHeading);
    masLeftSide.appendChild(moduleStepDropdown);
    masLeftSide.appendChild(masNewLine1);
    masLeftSide.appendChild(moduleRefreshButton);
    masLeftSide.appendChild(masDeleteButton);
    masLeftSide.appendChild(masSubmitButton);
    masLeftSide.appendChild(masNewLine2);
    masLeftSide.appendChild(importScoreTableHeader);
    masLeftSide.appendChild(importScoreButton);
    masLeftSide.appendChild(masNewLine3);
    masLeftSide.appendChild(masRandomScoreButton);

    masContainer.appendChild(masLeftSide);
    masContainer.appendChild(masRightSide);

    return masContainer;
}
