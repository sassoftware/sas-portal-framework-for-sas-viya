/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a RAG Builder Object
 *
 * @param {Object} ragBuilderObject - Contains the definition of the RAG Builder Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} ragBuilderInterfaceText - Contains all of the RAG Builder relevant language interface
 * @returns a rag builder object
 */
async function addRAGBuilderObject(ragBuilderObject, paneID, ragBuilderInterfaceText) {
    // This list specifies the supported Vector DBs
    const SUPPORTEDVECTORDBS = ["SingleStore", "pgVector", "Chroma"];

    let ragBuilderContainer = document.createElement('div');
    ragBuilderContainer.setAttribute('id', `${paneID}-obj-${ragBuilderObject?.id}`);
    
    // Add the intro piece to the RAG Builder
    let ragBuilderHeader = document.createElement('h1');
    ragBuilderHeader.innerText = ragBuilderInterfaceText?.ragBuilderHeading;
    let ragBuilderDescription = document.createElement('p');
    ragBuilderDescription.innerHTML = ragBuilderInterfaceText?.ragBuilderDescription;
    
    // Add the project selection/creation
    let ragBuilderProjectHeader = document.createElement('h2');
    ragBuilderProjectHeader.innerText = ragBuilderInterfaceText?.ragBuilderProjectHeader
    // Select from existing projects
    let ragBuilderProjectSelectorHeader = document.createElement('h2');
    ragBuilderProjectSelectorHeader.innerText = `${ragBuilderInterfaceText?.projectSelect}:`
    let ragBuilderProjectSelectorDropdown = document.createElement('select');
    ragBuilderProjectSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderProjectSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-project-dropdown`);
    ragBuilderProjectSelectorDropdown.onchange = async function () {
        // Reset the rag selector
        ragBuilderRAGSetupSelectorDropdown.innerHTML = '';
        let tmpRAGSetupBuilderRAGSetupSelectorItem = document.createElement('option');
        tmpRAGSetupBuilderRAGSetupSelectorItem.value = `${ragBuilderInterfaceText?.ragSelect}`;
        tmpRAGSetupBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragSelect}`;
        ragBuilderRAGSetupSelectorDropdown.append(tmpRAGSetupBuilderRAGSetupSelectorItem);

        // Get the RAG setups from the selected projects
        let currentProject = this.options[this.selectedIndex].value;
        let currentProjectRAGSetups = await getModelProjectModels(VIYA, currentProject);
        
        for(const existingRAGSetup in currentProjectRAGSetups) {
            let ragObj = document.createElement('option');
            ragObj.value = currentProjectRAGSetups[existingRAGSetup]?.id;
            ragObj.innerHTML = currentProjectRAGSetups[existingRAGSetup]?.name;
            ragBuilderRAGSetupSelectorDropdown.append(ragObj);
        }
    }
    // Add all of the projects to the dropdown
    let ragBuilderProjectSelectorItem = document.createElement('option');
    ragBuilderProjectSelectorItem.value = `${ragBuilderInterfaceText?.projectSelect}`;
    ragBuilderProjectSelectorItem.innerHTML = `${ragBuilderInterfaceText?.projectSelect}`;
    ragBuilderProjectSelectorDropdown.append(ragBuilderProjectSelectorItem);
    // Get all projects in the specified repostiory
    let existingProjects = await getModelProjects(VIYA, `contains(tags,'RAG-Engineering')`);
    let ragBuilderRAGSetupSelectedModelID = ''
    // Add the projects to the dropdown
    for (const existingProject in existingProjects) {
        let projectMod = document.createElement('option');
        projectMod.value = existingProjects[existingProject]?.value;
        projectMod.innerHTML = existingProjects[existingProject]?.innerHTML;
        ragBuilderProjectSelectorDropdown.append(projectMod);
    }
    // Add the existing rag selector
    let ragBuilderRAGSetupHeader = document.createElement('h2');
    ragBuilderRAGSetupHeader.innerText = `${ragBuilderInterfaceText?.ragSelect}:`;
    let ragBuilderRAGSetupSelectorDropdown = document.createElement('select');
    ragBuilderRAGSetupSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderRAGSetupSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-rag-dropdown`);
    let ragBuilderCurrentSetup = '';
    let ragSettingsOptions = '';
    let ragBuilderRAGSetupSelectorItem = document.createElement('option');
    ragBuilderRAGSetupSelectorItem.value = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorDropdown.append(ragBuilderRAGSetupSelectorItem);
    ragBuilderRAGSetupSelectorDropdown.onchange = async function () {
        ragBuilderRAGSetupSelectedModelID = this.options[this.selectedIndex].value;
        ragBuilderCurrentSetup = this.options[this.selectedIndex].text.toLowerCase().replace(/[\s-]+/g, '');
        // Activate link to SAS Model Manager
        let tmpOpenInMMButton = document.getElementById(`${ragBuilderObject?.id}-openInMMButton`);
        tmpOpenInMMButton.disabled = false;
        tmpOpenInMMButton.onclick = () => window.open(`${window.origin}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}/files`,'_blank');
        // Check if a previously saved setup exists
        let ragSetupContentsTMP = await getModelContents(window.VIYA, ragBuilderRAGSetupSelectedModelID);
        for (const ragSetupContentTMP in ragSetupContentsTMP) {
            if (ragSetupContentsTMP[ragSetupContentTMP]?.name === 'settings.json') {
                let settingsJSONResponseObject = await getFileContent(window.VIYA, ragSetupContentsTMP[ragSetupContentTMP].fileURI);
                ragSettingsOptions = await settingsJSONResponseObject.json();
                ragBuilderChunkingStrategySelectorDropdown.value = ragSettingsOptions.chunkingStrategie;
                ragBuilderChunkingStrategySelectorDropdown.dispatchEvent(new Event('change', {bubbles: true}));
                ragBuilderVectorDBSelectorDropdown.value = ragSettingsOptions.vectorDB;
                ragBuilderVectorDBSelectorDropdown.dispatchEvent(new Event('change', {bubbles: true}));
                ragBuilderEmbeddingModelSelectorDropdown.value = ragSettingsOptions.embeddingModelID;
                ragBuilderEmbeddingModelSelectorDropdown.dispatchEvent(new Event('change', {bubbles: true}));
            } else {
                ragSettingsOptions = {
                    chunkingStrategie: false,
                    chunkSizeInput: false,
                    chunkSizeOverlap: false,
                    chunkSeparator: false,
                    vectorDB: false,
                    collectionName: false,
                    databaseName: false,
                    tableName: false,
                    embeddingModelID: false,
                    embeddingModel: false,
                    vectorLength: false
                };
            }

        }
    }

    // Add the creation rag buttons and modals
    let ragBuilderModalButtonContainer = document.createElement('div');
    ragBuilderModalButtonContainer.setAttribute('id', `${ragBuilderObject?.id}-modal-button-container`);

    // Function to call when creating a new project
    async function ragBuilderCreateProject() {
        document.getElementById('ragBuilderCreateProjectModal').lastChild.lastChild.lastChild.lastChild.disabled = true;
        let ragBuilderRepositoryInformation = await getModelRepositoryInformation(VIYA, ragBuilderObject?.modelRepositoryID);
        let ragBuilderNewProjectDefinition = {
            name: document.getElementById('ragBuilderCreateProjectName').value,
            description: document.getElementById('ragBuilderCreateProjectDescription').value,
            function: 'RAG',
            repositoryId: ragBuilderObject?.modelRepositoryID,
            folderId: ragBuilderRepositoryInformation?.folderId,
            properties: [
                {
                    name: 'Origin',
                    value: 'RAG Builder',
                    type: 'string'
                }
            ],
            tags: ['LLM', 'RAG-Engineering']
        }
        let ragBuilderNewProjectObject = await createModelProject(VIYA, ragBuilderNewProjectDefinition);
        let newRAGSetupBuilderProjectSelectorItem = document.createElement('option');
        newRAGSetupBuilderProjectSelectorItem.value = `${ragBuilderNewProjectObject?.id}`;
        newRAGSetupBuilderProjectSelectorItem.innerHTML = `${ragBuilderNewProjectObject?.name}`;
        ragBuilderProjectSelectorDropdown.append(newRAGSetupBuilderProjectSelectorItem);
        // Set the newly created project as the currently selected proejct
        ragBuilderProjectSelectorDropdown.value = `${ragBuilderNewProjectObject?.id}`;
        ragBuilderProjectSelectorDropdown.dispatchEvent(new Event('change'));
        document.getElementById('ragBuilderCreateProjectModal').lastChild.lastChild.lastChild.lastChild.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('ragBuilderCreateProjectModal')).hide();
    }

    // Function to call call when creating a new RAG Setup
    async function ragBuilderCreateRAGSetup() {
        document.getElementById('ragBuilderCreateRAGSetupModal').lastChild.lastChild.lastChild.lastChild.disabled = true;
        let ragBuilderNewRAGSetupDefinition = {
            name: document.getElementById('ragBuilderCreateRAGSetupName').value,
            description: document.getElementById('ragBuilderCreateRAGSetupDescription').value,
            function: 'RAG',
            tool: 'RAG-Builder',
            modelere: window.userName,
            projectId: ragBuilderProjectSelectorDropdown[ragBuilderProjectSelectorDropdown.selectedIndex].value,
            algorithm: 'RAG',
            tags: ['LLM', 'RAG'],
            scoreCodeType: 'python',
            trainCodeType: 'python'
        }
        let ragBuilderNewRAGSetupObject = await createModel(VIYA, ragBuilderNewRAGSetupDefinition);
        let newRAGSetupBuilderRAGSetupSelectorItem = document.createElement('option');
        newRAGSetupBuilderRAGSetupSelectorItem.value = `${ragBuilderNewRAGSetupObject?.items[0]?.id}`;
        newRAGSetupBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderNewRAGSetupObject?.items[0]?.name}`;
        ragBuilderRAGSetupSelectorDropdown.append(newRAGSetupBuilderRAGSetupSelectorItem);
        // Set the newly created project as the currently selected proejct
        ragBuilderRAGSetupSelectorDropdown.value = `${ragBuilderNewRAGSetupObject?.items[0]?.id}`;
        ragBuilderRAGSetupSelectorDropdown.dispatchEvent(new Event('change'));
        document.getElementById('ragBuilderCreateRAGSetupModal').lastChild.lastChild.lastChild.lastChild.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('ragBuilderCreateRAGSetupModal')).hide();
    }

    function ragBuilderCreateModal(tmpModalContainer, tmpPrefix, tmpModalText, tmpActionFunction) {
        // Create the button that triggers the modal
        let createModalButtonToggle = document.createElement('button');
        createModalButtonToggle.type = 'button';
        createModalButtonToggle.classList.add(...['btn', 'btn-primary'])
        createModalButtonToggle.setAttribute('data-bs-toggle','modal');
        createModalButtonToggle.setAttribute('data-bs-target', `#${tmpPrefix}Modal`);
        createModalButtonToggle.innerHTML = tmpModalText?.modalTitle;
        // Create the modal wrapper
        let createModalWrapper = document.createElement('div');
        createModalWrapper.classList.add(...['modal', 'fade']);
        createModalWrapper.setAttribute('id', `${tmpPrefix}Modal`);
        createModalWrapper.setAttribute('tabindex', '-1');
        // Create the modal dialog
        let createModalModalDialog = document.createElement('div');
        createModalModalDialog.classList.add(...['modal-dialog']);
        // Create the modal content
        let createModalModalContent = document.createElement('div');
        createModalModalContent.classList.add(...['modal-content']);
        // Create the modal header
        let createModalModalHeader = document.createElement('div');
        createModalModalHeader.classList.add(...['modal-header']);
        // Create the modal title
        let createModalModalTitle = document.createElement('h1');
        createModalModalTitle.classList.add(...['modal-title']);
        createModalModalTitle.innerHTML = tmpModalText?.modalTitle;
        // Create the modal close button
        let createModalModalCloseButton = document.createElement('button');
        createModalModalCloseButton.type = 'button';
        createModalModalCloseButton.classList.add(...['btn-close']);
        createModalModalCloseButton.setAttribute('data-bs-dismiss','modal');
        createModalModalCloseButton.setAttribute('aria-label', 'Close');
        // Create the modal body
        let createModalModalBody = document.createElement('div');
        createModalModalBody.classList.add(...['modal-body']);
        // Create the first modal input
        let createModalBodyInput1Text = document.createElement('span');
        createModalBodyInput1Text.innerHTML = `${tmpModalText?.nameLabel}:`;
        let createModalBodyInput1 = document.createElement('input');
        createModalBodyInput1.setAttribute('type', 'text');
        createModalBodyInput1.setAttribute('placeholder', tmpModalText?.nameLabel);
        createModalBodyInput1.setAttribute('id', `${tmpPrefix}Name`);
        // Create the second modal input
        let createModalBodyInput2Text = document.createElement('span');
        createModalBodyInput2Text.innerHTML = `${tmpModalText?.descriptionLabel}:`;
        let createModalBodyInput2 = document.createElement('input');
        createModalBodyInput2.setAttribute('type', 'text');
        createModalBodyInput2.setAttribute('placeholder', tmpModalText?.descriptionLabel);
        createModalBodyInput2.setAttribute('id', `${tmpPrefix}Description`);
        // Create the modal footer
        let createModalModalFooter = document.createElement('div');
        createModalModalFooter.classList.add(...['modal-footer']);
        // Create the modal footer button
        let createModalModalFooterButton = document.createElement('button');
        createModalModalFooterButton.type = 'button';
        createModalModalFooterButton.classList.add(...['btn', 'btn-secondary']);
        createModalModalFooterButton.setAttribute('data-bs-dismiss','modal');
        createModalModalFooterButton.innerHTML = tmpModalText?.closeButtonText;
        // Create the modal footer button
        let createModalModalFooterButton2 = document.createElement('button');
        createModalModalFooterButton2.type = 'button';
        createModalModalFooterButton2.classList.add(...['btn', 'btn-primary']);
        createModalModalFooterButton2.innerHTML = tmpModalText?.saveButtonText;
        createModalModalFooterButton2.onclick = () => {
            tmpActionFunction();
        };
        // Append elements togther
        createModalModalHeader.appendChild(createModalModalTitle);
        createModalModalHeader.appendChild(createModalModalCloseButton);
        createModalModalContent.appendChild(createModalModalHeader);
        createModalModalBody.appendChild(createModalBodyInput1Text);
        createModalModalBody.appendChild(createModalBodyInput1);
        createModalModalBody.appendChild(document.createElement('br'));
        createModalModalBody.appendChild(createModalBodyInput2Text);
        createModalModalBody.appendChild(createModalBodyInput2);
        createModalModalContent.appendChild(createModalModalBody);
        createModalModalFooter.appendChild(createModalModalFooterButton);
        createModalModalFooter.appendChild(createModalModalFooterButton2);
        createModalModalContent.appendChild(createModalModalFooter);
        createModalModalDialog.appendChild(createModalModalContent);
        createModalWrapper.appendChild(createModalModalDialog);

        // Add to the modal container
        tmpModalContainer.appendChild(createModalButtonToggle);
        tmpModalContainer.appendChild(createModalWrapper);
    }

    // Create the modals for project/rag creation
    ragBuilderCreateModal(ragBuilderModalButtonContainer, 'ragBuilderCreateProject', ragBuilderInterfaceText?.ragBuilderCreateProject, ragBuilderCreateProject);
    ragBuilderCreateModal(ragBuilderModalButtonContainer, 'ragBuilderCreateRAGSetup', ragBuilderInterfaceText?.ragBuilderCreateRAGSetup, ragBuilderCreateRAGSetup);

    // Add link to SAS Model Manager
    let openInMMButton = document.createElement('button');
    openInMMButton.id = `${ragBuilderObject?.id}-openInMMButton`;
    openInMMButton.type = 'button';
    openInMMButton.classList.add(...['btn', 'btn-primary']);
    openInMMButton.disabled = true;
    openInMMButton.innerHTML = ragBuilderInterfaceText?.ragBuilderOpenInMMButton;
    ragBuilderModalButtonContainer.appendChild(openInMMButton);

    // Create the Chunking strategy selector
    let ragBuilderChunkingStrategyHeader = document.createElement('h2');
    ragBuilderChunkingStrategyHeader.innerText = ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader;
    let ragBuilderChunkingStrategyDescription = document.createElement('p');
    ragBuilderChunkingStrategyDescription.innerText = ragBuilderInterfaceText?.ragBuilderChunkingStrategyDescription;
    let ragBuilderChunkingStrategyList = [
        {
            chunkingStrategyID: "fixedSizeWithOverlap",
            chunkingStrategyName: ragBuilderInterfaceText?.fixedSizeWithOverlapName,
            chunkingStrategyDescription: ragBuilderInterfaceText?.fixedSizeWithOverlapDescription,
        },
        {
            chunkingStrategyID: "sentenceBased",
            chunkingStrategyName: ragBuilderInterfaceText?.sentenceBasedName,
            chunkingStrategyDescription: ragBuilderInterfaceText?.sentenceBasedDescription,
        },
        {
            chunkingStrategyID: "paragraphBased",
            chunkingStrategyName: ragBuilderInterfaceText?.paragraphBasedName,
            chunkingStrategyDescription: ragBuilderInterfaceText?.paragraphBasedDescription,
        },
        {
            chunkingStrategyID: "recursive",
            chunkingStrategyName: ragBuilderInterfaceText?.recursiveName,
            chunkingStrategyDescription: ragBuilderInterfaceText?.recursiveDescription,
        },
        {
            chunkingStrategyID: "documentStructureAware",
            chunkingStrategyName: ragBuilderInterfaceText?.documentStructureAwareName,
            chunkingStrategyDescription: ragBuilderInterfaceText?.documentStructureAwareDescription,
        },
    ]
    let ragBuilderChunkingStrategieDescription = document.createElement('p');
    ragBuilderChunkingStrategieDescription.id = `${ragBuilderObject?.id}-chunking-strategy-description`;
    let ragBuilderChunkingStrategyCustomization = document.createElement('div');
    ragBuilderChunkingStrategyCustomization.id = `${ragBuilderObject?.id}-chunking-strategy-customization`;
    let ragBuilderChunkingStrategySelectorDropdown = document.createElement('select');
    ragBuilderChunkingStrategySelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderChunkingStrategySelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-chunking-strategy-dropdown`);
    ragBuilderChunkingStrategySelectorDropdown.onchange = async function () {
        const selectedStrategy = ragBuilderChunkingStrategyList.find(strategy => strategy.chunkingStrategyID === this.options[this.selectedIndex].value)
        if (selectedStrategy) {
            ragBuilderChunkingStrategieDescription.innerHTML = selectedStrategy.chunkingStrategyDescription;
        } else {
            ragBuilderChunkingStrategieDescription.innerHTML = '';
        }

        // Implement the different configuration options for the different strategies
        ragBuilderChunkingStrategyCustomization.innerHTML = '';
        if (selectedStrategy.chunkingStrategyID === 'sentenceBased') {
            ragBuilderChunkingStrategyCustomization.innerHTML = `<p>${ragBuilderInterfaceText?.ragBuilderChunkingStrategyNoCustomization}</p>`;
        } else if (selectedStrategy.chunkingStrategyID === 'paragraphBased') {
            ragBuilderChunkingStrategyCustomization.innerHTML = `<p>${ragBuilderInterfaceText?.ragBuilderChunkingStrategyNoCustomization}</p>`;
        } else if (selectedStrategy.chunkingStrategyID === 'fixedSizeWithOverlap') {
            // Create the Chunking Size and Overlap options
            let chunkSizeText = document.createElement('span');
            chunkSizeText.innerText = `${ragBuilderInterfaceText?.chunkSizeText}:`;
            let chunkSizeInput = document.createElement('input');
            chunkSizeInput.setAttribute('type', 'number');
            chunkSizeInput.value = ragSettingsOptions.chunkSizeInput ? ragSettingsOptions.chunkSizeInput : 200;
            chunkSizeInput.min = 25;
            chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
            let chunkSizeOverlapText = document.createElement('span');
            chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
            let chunkSizeOverlapInput = document.createElement('input');
            chunkSizeOverlapInput.setAttribute('type', 'number');
            chunkSizeOverlapInput.value = ragSettingsOptions.chunkSizeOverlap ? ragSettingsOptions.chunkSizeOverlap : 20;
            chunkSizeOverlapInput.min = 10;
            chunkSizeOverlapInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeOverlapInput`);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeText);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeInput);
            ragBuilderChunkingStrategyCustomization.appendChild(document.createElement('br'));
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapText);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapInput);
        } else if (selectedStrategy.chunkingStrategyID === 'recursive') {
            // Create the Chunking Size, Overlap and Separators options
            let chunkSizeText = document.createElement('span');
            chunkSizeText.innerText = `${ragBuilderInterfaceText?.chunkSizeText}:`;
            let chunkSizeInput = document.createElement('input');
            chunkSizeInput.setAttribute('type', 'number');
            chunkSizeInput.value = ragSettingsOptions.chunkSizeInput ? ragSettingsOptions.chunkSizeInput : 200;
            chunkSizeInput.min = 25;
            chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
            let chunkSizeOverlapText = document.createElement('span');
            chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
            let chunkSizeOverlapInput = document.createElement('input');
            chunkSizeOverlapInput.setAttribute('type', 'number');
            chunkSizeOverlapInput.value = ragSettingsOptions.chunkSizeOverlap ? ragSettingsOptions.chunkSizeOverlap : 20;
            chunkSizeOverlapInput.min = 10;
            chunkSizeOverlapInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeOverlapInput`);
            let chunkSeparatorText = document.createElement('span');
            chunkSeparatorText.innerText = `${ragBuilderInterfaceText?.chunkSeparatorText}:`;
            let chunkSeparatorInput = document.createElement('input');
            chunkSeparatorInput.setAttribute('type', 'text');
            chunkSeparatorInput.value = ragSettingsOptions.chunkSizeOverlap ? ragSettingsOptions.chunkSizeOverlap : "'\n# ', '\n## ', '\n### ', '\n\n', '. ', ' '";
            chunkSeparatorInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSeparatorInput`);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeText);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeInput);
            ragBuilderChunkingStrategyCustomization.appendChild(document.createElement('br'));
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapText);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapInput);
            ragBuilderChunkingStrategyCustomization.appendChild(document.createElement('br'));
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSeparatorText);
            ragBuilderChunkingStrategyCustomization.appendChild(chunkSeparatorInput);
        } else if (selectedStrategy.chunkingStrategyID === 'documentStructureAware') {
            ragBuilderChunkingStrategyCustomization.innerHTML = `<p>${ragBuilderInterfaceText?.ragBuilderChunkingStrategyNoCustomization}</p>`;
        }
    };
    // Add all of the chunking strategies to the dropdown
    let ragBuilderChunkingStrategieSelectorItem = document.createElement('option');
    ragBuilderChunkingStrategieSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader}`;
    ragBuilderChunkingStrategieSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader}`;
    ragBuilderChunkingStrategySelectorDropdown.append(ragBuilderChunkingStrategieSelectorItem);
    // Add the projects to the dropdown
    for (const chunkingStrategie in ragBuilderChunkingStrategyList) {
        let chunkingStrategieOption = document.createElement('option');
        chunkingStrategieOption.value = ragBuilderChunkingStrategyList[chunkingStrategie].chunkingStrategyID;
        chunkingStrategieOption.innerHTML = ragBuilderChunkingStrategyList[chunkingStrategie].chunkingStrategyName;
        ragBuilderChunkingStrategySelectorDropdown.append(chunkingStrategieOption);
    }

    // Add a selector for the vector database
    let ragBuilderVectorDBHeader = document.createElement('h2');
    ragBuilderVectorDBHeader.innerText = ragBuilderInterfaceText?.ragBuilderVectorDBHeader;
    let ragBuilderVectorDBDescription = document.createElement('p');
    ragBuilderVectorDBDescription.innerHTML = ragBuilderInterfaceText?.ragBuilderVectorDBDescription;
    let ragBuilderVectorDBContainer = document.createElement('div');
    let ragBuilderVectorDBSelectorDropdown = document.createElement('select');
    ragBuilderVectorDBSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderVectorDBSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-vectorDB-dropdown`);
    ragBuilderVectorDBSelectorDropdown.onchange = async function () {
        ragBuilderVectorDBContainer.innerHTML = '';
        let ragBuilderVectorDBDescriptor = document.createElement('p');
        const selectedVectorDB = this.options[this.selectedIndex].value;
        // Implement VectorDB specific notes
        if (selectedVectorDB === 'Chroma') {
            ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.chromaDescriptor;
            let ragBuilderVectorDBCollectionInputLabel = document.createElement('span');
            ragBuilderVectorDBCollectionInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBCollectionInputLabel}`;
            let ragBuilderVectorDBCollectionInput = document.createElement('input');
            ragBuilderVectorDBCollectionInput.type = 'text';
            ragBuilderVectorDBCollectionInput.value = ragSettingsOptions.collectionName ? ragSettingsOptions.collectionName : '';
            ragBuilderVectorDBCollectionInput.setAttribute('id', `${ragBuilderObject?.id}-collection-name`);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInput);
        } else if (selectedVectorDB === 'SingleStore') {
            ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.singleStoreDescriptor;
            let ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
            ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}`;
            let ragBuilderVectorDBDatabaseInput = document.createElement('input');
            ragBuilderVectorDBDatabaseInput.type = 'text';
            ragBuilderVectorDBDatabaseInput.value = ragSettingsOptions.databaseName ? ragSettingsOptions.databaseName : '';
            ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
            let ragBuilderVectorDBTableInputLabel = document.createElement('span');
            ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}`;
            let ragBuilderVectorDBTableInput = document.createElement('input');
            ragBuilderVectorDBTableInput.type = 'text';
            ragBuilderVectorDBTableInput.value = ragSettingsOptions.tableName ? ragSettingsOptions.tableName : '';
            ragBuilderVectorDBTableInput.setAttribute('id', `${ragBuilderObject?.id}-table-name`);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInput);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInput);
        } else if (selectedVectorDB === 'pgVector') {
            ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.pgVectorDescriptor;
            let ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
            ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}`;
            let ragBuilderVectorDBDatabaseInput = document.createElement('input');
            ragBuilderVectorDBDatabaseInput.type = 'text';
            ragBuilderVectorDBDatabaseInput.value = ragSettingsOptions.databaseName ? ragSettingsOptions.databaseName : '';
            ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
            let ragBuilderVectorDBTableInputLabel = document.createElement('span');
            ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}`;
            let ragBuilderVectorDBTableInput = document.createElement('input');
            ragBuilderVectorDBTableInput.type = 'text';
            ragBuilderVectorDBTableInput.value = ragSettingsOptions.tableName ? ragSettingsOptions.tableName : '';
            ragBuilderVectorDBTableInput.setAttribute('id', `${ragBuilderObject?.id}-table-name`);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInput);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInput);
        }
    }
    let ragBuilderVectorDBSelectorItem = document.createElement('option');
    ragBuilderVectorDBSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderVectorDBHeader}`;
    ragBuilderVectorDBSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderVectorDBHeader}`;
    ragBuilderVectorDBSelectorDropdown.append(ragBuilderVectorDBSelectorItem);
    // Add the projects to the dropdown
    for (const vectorDB in ragBuilderObject?.vectorDBList) {
        if (SUPPORTEDVECTORDBS.includes(ragBuilderObject?.vectorDBList[vectorDB])) {
            let vectorDBOption = document.createElement('option');
            vectorDBOption.value = ragBuilderObject?.vectorDBList[vectorDB];
            vectorDBOption.innerHTML = ragBuilderObject?.vectorDBList[vectorDB];
            ragBuilderVectorDBSelectorDropdown.append(vectorDBOption);
        } else {
            console.log(`The configured Vector DB: ${ragBuilderObject?.vectorDBList[vectorDB]} is not supported, please open an issue.`);
        }
    }

    // Add a selector for the embedding model
    let ragBuilderEmbeddingModelHeader = document.createElement('h2');
    ragBuilderEmbeddingModelHeader.innerText = ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader;
    let ragBuilderEmbeddingModelDescription = document.createElement('p');
    ragBuilderEmbeddingModelDescription.innerText = ragBuilderInterfaceText?.ragBuilderEmbeddingModelDescription;
    // Retrieve the Embedding Models
    let ragBuilderAvailableEmbeddingModels = await getModelProjectModels(VIYA, ragBuilderObject?.embeddingProjectID);
    let ragBuilderDeprecatedModels = await getModelProjectModels(VIYA, ragBuilderObject?.embeddingProjectID, "eq(tags,'deprecated')");
    ragBuilderAvailableEmbeddingModels = ragBuilderAvailableEmbeddingModels.filter(obj1 => !ragBuilderDeprecatedModels.some(obj2 => obj1.id === obj2.id))
    for(const ragBuilderAvailableEmbeddingModel in ragBuilderAvailableEmbeddingModels) {
        let ragBuilderAvailableEmbeddingContents = await getModelContents(VIYA, ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel]?.id);
        for(const ragBuilderAvailableEmbeddingContent in ragBuilderAvailableEmbeddingContents) {
            if(ragBuilderAvailableEmbeddingContents[ragBuilderAvailableEmbeddingContent]?.name == 'options.json') {
                ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel].fileURI = ragBuilderAvailableEmbeddingContents[ragBuilderAvailableEmbeddingContent]?.fileURI
                let ragBuilderCurrentOptions = await getFileContent(VIYA, ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel].fileURI);
                let ragBuilderCurrentOptionsContent = await ragBuilderCurrentOptions.json();
                ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel].options = ragBuilderCurrentOptionsContent;
            }
        }
    }
    let ragBuilderEmbeddingModelSelectorDropdown = document.createElement('select');
    ragBuilderEmbeddingModelSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderEmbeddingModelSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-embedding-model-dropdown`);
    let ragBuilderEmbeddingModelSelectorItem = document.createElement('option');
    ragBuilderEmbeddingModelSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader}`;
    ragBuilderEmbeddingModelSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader}`;
    ragBuilderEmbeddingModelSelectorDropdown.append(ragBuilderEmbeddingModelSelectorItem);
    // Add the Embedding Models to the dropdown
    for (const embeddingModel in ragBuilderAvailableEmbeddingModels) {
        let embeddingModelOption = document.createElement('option');
        embeddingModelOption.value = ragBuilderAvailableEmbeddingModels[embeddingModel].id;
        embeddingModelOption.innerHTML = ragBuilderAvailableEmbeddingModels[embeddingModel].name;
        ragBuilderEmbeddingModelSelectorDropdown.append(embeddingModelOption);
    }

    async function createRAGSetupCode() {
        // Collect all the selected values by the user
        let ragSetupOptions = {
            chunkingStrategie: document.getElementById(`${ragBuilderObject?.id}-chunking-strategy-dropdown`).value,
            chunkSizeInput: document.getElementById(`${ragBuilderObject?.id}-chunkSizeInput`) ? document.getElementById(`${ragBuilderObject?.id}-chunkSizeInput`).value : null,
            chunkSizeOverlap: document.getElementById(`${ragBuilderObject?.id}-chunkSizeOverlapInput`) ? document.getElementById(`${ragBuilderObject?.id}-chunkSizeOverlapInput`).value : null,
            chunkSeparator: document.getElementById(`${ragBuilderObject?.id}-chunkSeparatorInput`) ? document.getElementById(`${ragBuilderObject?.id}-chunkSeparatorInput`).value : null,
            vectorDB: document.getElementById(`${ragBuilderObject?.id}-vectorDB-dropdown`).value,
            collectionName: document.getElementById(`${ragBuilderObject?.id}-collection-name`) ? document.getElementById(`${ragBuilderObject?.id}-collection-name`).value : null,
            databaseName: document.getElementById(`${ragBuilderObject?.id}-database-name`) ? document.getElementById(`${ragBuilderObject?.id}-database-name`).value : null,
            tableName: document.getElementById(`${ragBuilderObject?.id}-table-name`) ? document.getElementById(`${ragBuilderObject?.id}-table-name`).value : null,
            embeddingModelID: document.getElementById(`${ragBuilderObject?.id}-embedding-model-dropdown`).value
        }
        ragSetupOptions['embeddingModel'] = ragBuilderAvailableEmbeddingModels.filter(item => item.id === ragSetupOptions['embeddingModelID'])[0]['name'];
        ragSetupOptions['vectorLength'] = ragBuilderAvailableEmbeddingModels.filter(item => item.id === ragSetupOptions['embeddingModelID'])[0]['options']['Embedding_Length']['default'];

        // Check that values were selected accordingly
        if (
            ragSetupOptions.chunkingStrategie === ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader ||
            ragSetupOptions.vectorDB === ragBuilderInterfaceText?.ragBuilderVectorDBHeader ||
            ragSetupOptions.embeddingModel === ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader ||
            ragSetupOptions.collectionName === "" ||
            ragSetupOptions.databaseName === "" ||
            ragSetupOptions.tableName === ""
        ) {
            alert(ragBuilderInterfaceText?.ragBuilderChangeDefaultsAlert);
            return 1;
        }

        // Create a list of required packages
        let requiredPackages = "markitdown[all] pandas pyarrow langchain requests"
        if (ragSetupOptions.vectorDB === "SingleStore" ) {
            requiredPackages += " singlestoredb";
        } else if (ragSetupOptions.vectorDB === "pgVector") {
            requiredPackages += " psycopg2";
            requiredPackages += " pgvector";
        } else if (ragSetupOptions.vectorDB === "Chroma") {
            requiredPackages += " chroma";
        }
        if (ragSetupOptions.chunkingStrategie === 'sentenceBased') {
            requiredPackages += " nltk";
        }

        // Create the requirments.json, inputVars.json and outputVars.json
        let ragSetupRequirements = [{"step": "Install packages", "command": `pip3 -q install ${requiredPackages}`}]
        if (ragSetupOptions.chunkingStrategie === 'sentenceBased') {
            ragSetupRequirements.push({"step": "Download the Punk_Tab Tokenizer", "command": "python -m nltk.downloader punkt_tab -d /pybox/model"})
        }
        let ragSetupInputVars = [
            {
                "name": "text",
                "description": "The input text for the retrieval, or the filename when ingesting or the document_id when deleting.",
                "level": "nominal",
                "type": "string",
                "length": 1000000
            },
            {
                "name": "options",
                "description": "Contains the options on which action to perform + all of the additional potential variables that are required.",
                "level": "nominal",
                "type": "string",
                "length": 1000000
            },
        ];
        let ragSetupOutputVars = [
            {
                  "name": "result",
                  "description": "Contains the response from the RAG pipeline. If the action is set to retrieval than it is a data grid.",
                  "level": "nominal",
                  "type": "string",
                  "length": 1000000
            },
            {
                "name": "run_time",
                "description": "Inference of the full RAG pipeline",
                "level": "interval",
                "type": "decimal",
                "length": 8
            }
        ];

        let chunkingStrategyCustomization = {};
        if (ragSetupOptions.chunkingStrategie === 'fixedSizeWithOverlap') {
            chunkingStrategyCustomization['importStatement'] = 'from langchain.text_splitter import CharacterTextSplitter';
            chunkingStrategyCustomization['chunkDocumentFunction'] = `def chunk_document(document):
    chunking_result = []
    splitter = CharacterTextSplitter(
        separator = " ",
        chunk_size = ${ragSetupOptions.chunkSizeInput},
        chunk_overlap = ${ragSetupOptions.chunkSizeOverlap},
        length_function = len
    )
    chunks = splitter.create_documents([document['content']])
    for i, chunk in enumerate(chunks):
        chunking_result.append({
                "document_id": document["document_id"],
                "chunk_id": i,
                "title": document["title"],
                "ingestion_timestamp": document["ingestion_timestamp"],
                "content": chunk.page_content
        })
    return chunking_result`;
        } else if (ragSetupOptions.chunkingStrategie === 'sentenceBased') {
            chunkingStrategyCustomization['importStatement'] = `os.environ["NLTK_DATA"]=nltk_path
from langchain.text_splitter import NLTKTextSplitter
import nltk
nltk.data.find('tokenizers/punkt_tab')`;
            chunkingStrategyCustomization['chunkDocumentFunction'] = `def chunk_document(document):
    chunking_result = []
    splitter = NLTKTextSplitter()
    chunks = splitter.create_documents([document['content']])
    for i, chunk in enumerate(chunks):
        chunking_result.append({
                "document_id": document["document_id"],
                "chunk_id": i,
                "title": document["title"],
                "ingestion_timestamp": document["ingestion_timestamp"],
                "content": chunk.page_content
        })
    return chunking_result`;
        } else if (ragSetupOptions.chunkingStrategie === 'paragraphBased') {
            chunkingStrategyCustomization['importStatement'] = 'from langchain.text_splitter import CharacterTextSplitter';
            chunkingStrategyCustomization['chunkDocumentFunction'] = `def chunk_document(document):
    chunking_result = []
    splitter = CharacterTextSplitter(
        separator = "\n\n",
        chunk_size = 1,
        chunk_overlap = 0,
        keep_separator = False
    )
    chunks = splitter.create_documents([document['content']])
    for i, chunk in enumerate(chunks):
        chunking_result.append({
                "document_id": document["document_id"],
                "chunk_id": i,
                "title": document["title"],
                "ingestion_timestamp": document["ingestion_timestamp"],
                "content": chunk.page_content
        })
    return chunking_result`;
        } else if (ragSetupOptions.chunkingStrategie === 'recursive') {
            chunkingStrategyCustomization['importStatement'] = 'from langchain.text_splitter import RecursiveCharacterTextSplitter';
            chunkingStrategyCustomization['chunkDocumentFunction'] = `def chunk_document(document):
    chunking_result = []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = ${ragSetupOptions.chunkSizeInput},
        chunk_overlap = ${ragSetupOptions.chunkSizeOverlap},
        separators = [${ragSetupOptions.chunkSeparator}]
    )
    chunks = splitter.create_documents([document['content']])
    for i, chunk in enumerate(chunks):
        chunking_result.append({
                "document_id": document["document_id"],
                "chunk_id": i,
                "title": document["title"],
                "ingestion_timestamp": document["ingestion_timestamp"],
                "content": chunk.page_content
        })
    return chunking_result`;
        } else if (ragSetupOptions.chunkingStrategie === 'documentStructureAware') {
            chunkingStrategyCustomization['importStatement'] = 'from langchain.text_splitter import MarkdownHeaderTextSplitter';
            chunkingStrategyCustomization['chunkDocumentFunction'] = `def chunk_document(document):
    chunking_result = []
    headers_to_split_on=[
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
        ("#####", "Header 5"),
        ("######", "Header 6"),
    ]
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    chunks = splitter.split_text(document['content'])
    for i, chunk in enumerate(chunks):
        chunking_result.append({
                "document_id": document["document_id"],
                "chunk_id": i,
                "title": document["title"],
                "ingestion_timestamp": document["ingestion_timestamp"],
                "content": chunk.page_content
        })
    return chunking_result`;
        }

        let dataBaseCustomization = {}
        if (ragSetupOptions.vectorDB === 'SingleStore') {
            dataBaseCustomization['importStatement'] = 'import singlestoredb as s2';
            dataBaseCustomization['metadataQuery'] = `query = f"WHERE {key} = '{value}'"`;
            dataBaseCustomization['config'] = `{
    "INPUT_DIRECTORY": "/inputs",
    "INGESTED_CONTENT_FILE_NAME": "_ingested_content.parquet",
    "EXPORTED_CONTENT_FILE_NAME": "_exported_content.parquet",
    "SERVER_HOST": "No default value",
    "SERVER_PORT": "No default value",
    "SERVER_USER": "No default value",
    "SERVER_PW": "No default value"
}`;
            dataBaseCustomization['sql'] = `--- Make sure that the table is in the following database: ${ragSetupOptions.databaseName}
CREATE TABLE IF NOT EXISTS ${ragSetupOptions.tableName} (
    document_id VARCHAR(255) NOT NULL, -- The document_id is unique per document
    chunk_id INT NOT NULL, -- Specifies the chunk order for the document, starts at 0
    embedding VECTOR(${ragSetupOptions.vectorLength}, F32) NOT NULL, -- The embedding vector
    document TEXT, -- The chunk text
    filename VARCHAR(255), -- The name of the file relative to the input directory
    ingestion_timestamp VARCHAR(255), -- Timestamp when the ingestion occured
    PRIMARY KEY (document_id, chunk_id), -- Composite primary key
    SHARD KEY (document_id), -- Distribution per document
    VECTOR INDEX embedding_index (embedding) -- Index creation for the embedding column for performance
);`;
            dataBaseCustomization['ingestDocumentsFunction'] = `def ingest_documents(chunks):
    with s2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        with conn.cursor() as cur:
            sql_insert = f"INSERT INTO {table_name}" + """
                (document_id, chunk_id, filename, ingestion_timestamp, document, embedding) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            rows_to_insert = []
            for chunk in chunks:
                rows_to_insert.append((chunk['document_id'], chunk['chunk_id'], chunk['filename'], chunk['ingestion_timestamp'], chunk['content'], chunk['embedding']))
            cur.executemany(sql_insert, rows_to_insert)
            conn.commit()`;
            dataBaseCustomization['retrieveDocumentsFunction'] = `def retrieve_documents(embedding, n_results, query=''):
    with s2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        with conn.cursor() as cur:
            sql_similarity_search = """
    SELECT
        document_id,
        chunk_id,
        filename,
        ingestion_timestamp,
        embedding <*> %s AS distance,
        document
    FROM
    """ + f"{table_name} {query} ORDER BY distance DESC LIMIT {int(n_results)};"
            print(sql_similarity_search)
            cur.execute(sql_similarity_search, (embedding,))
            rows = cur.fetchall()
            column_names = [desc[0] for desc in cur.description]
            data_rows = [dict(zip(column_names, row)) for row in rows]
            # Combine metadata and data into the final structure
            final_output = [
                {'metadata': [
                    {'document_id': 'string'},
                    {'chunk_id': 'string'},
                    {'filename': 'string'},
                    {'ingestion_timestamp': 'string'},
                    {'distance': 'decimal'},
                    {'document': 'string'}
                ]},
                {"data": data_rows}
            ]
            return final_output`;
            dataBaseCustomization['deleteDocumentsFunction'] = `def delete_documents(query):
    with s2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        with conn.cursor() as cur:
            sql_delete = f"DELETE FROM {table_name}" + " WHERE document_id = %s"
            cur.execute(sql_delete, query['document_id'])
            conn.commit()`;
            dataBaseCustomization['exportFunction'] = `def export_documents():
    with s2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT document_id, chunk_id, filename, ingestion_timestamp, embedding, document FROM {table_name}")
            rows = cur.fetchall()
            df = pd.DataFrame(rows, columns=['document_id', 'chunk_id', 'filename', 'ingestion_timestamp', 'embedding', 'document'])
            max_len = df['embedding'].apply(len).max()
            df_split = pd.DataFrame(df['embedding'].to_list(), columns=[f'embedding_{i+1}' for i in range(max_len)])
            df_final = pd.concat([df, df_split], axis=1).drop(columns=['embedding'])
            df_final.to_parquet(input_directory + '/' + exported_content_file_name, index=False)`;
        } else if (ragSetupOptions.vectorDB === 'pgVector') {
            dataBaseCustomization['importStatement'] = `import psycopg2
from pgvector.psycopg2 import register_vector
import psycopg2.extras`;
            dataBaseCustomization['metadataQuery'] = `query = f"WHERE {key} = '{value}'"`;
            dataBaseCustomization['config'] = `{
    "INPUT_DIRECTORY": "/inputs",
    "INGESTED_CONTENT_FILE_NAME": "_ingested_content.parquet",
    "EXPORTED_CONTENT_FILE_NAME": "_exported_content.parquet",
    "SERVER_HOST": "No default value",
    "SERVER_PORT": "No default value",
    "SERVER_USER": "No default value",
    "SERVER_PW": "No default value"
}`;
            dataBaseCustomization['sql'] = `--- Make sure that the table is in the following database: ${ragSetupOptions.databaseName}
CREATE TABLE IF NOT EXISTS ${ragSetupOptions.tableName} (
    document_id VARCHAR(255) NOT NULL, -- The document_id is unique per document
    chunk_id INT NOT NULL, -- Specifies the chunk order for the document, starts at 0
    embedding VECTOR(${ragSetupOptions.vectorLength}) NOT NULL, -- The embedding vector
    document TEXT, -- The chunk text
    filename VARCHAR(255), -- The name of the file relative to the input directory
    ingestion_timestamp VARCHAR(255), -- Timestamp when the ingestion occured
    PRIMARY KEY (document_id, chunk_id) -- Composite primary key
);`;
            dataBaseCustomization['ingestDocumentsFunction'] = `def ingest_documents(chunks):
    with psycopg2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        register_vector(conn)
        with conn.cursor() as cur:
            sql_insert = f"INSERT INTO {table_name}" +  """ (document_id, chunk_id, filename, ingestion_timestamp, document, embedding) VALUES %s;"""
            rows_to_insert = []
            for chunk in chunks:
                rows_to_insert.append((chunk['document_id'], chunk['chunk_id'], chunk['filename'], chunk['ingestion_timestamp'], chunk['content'], chunk['embedding']))
            psycopg2.extras.execute_values(cur, sql_insert, rows_to_insert, page_size=100)
            conn.commit()`;
            dataBaseCustomization['retrieveDocumentsFunction'] = `def retrieve_documents(embedding, n_results, query=''):
    with psycopg2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        register_vector(conn)
        with conn.cursor() as cur:
            sql_base = """
    SELECT
        document_id,
        chunk_id,
        filename,
        ingestion_timestamp,
        embedding <=> %s AS distance,
        document
    FROM
    """ + f"{table_name} {query} ORDER BY distance DESC"
            sql_similarity_search = sql_base + f" LIMIT {int(n_results)};"
            cur.execute(sql_similarity_search, (embedding,))
            rows = cur.fetchall()
            column_names = [desc[0] for desc in cur.description]
            data_rows = [dict(zip(column_names, row)) for row in rows]
            # Combine metadata and data into the final structure
            final_output = [
                {'metadata': [
                    {'document_id': 'string'},
                    {'chunk_id': 'string'},
                    {'filename': 'string'},
                    {'ingestion_timestamp': 'string'},
                    {'distance': 'decimal'},
                    {'document': 'string'}
                ]},
                {"data": data_rows}
            ]
            return final_output`;
            dataBaseCustomization['deleteDocumentsFunction'] = `def delete_documents(query):
   with psycopg2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        with conn.cursor() as cur:
            sql_delete = f"DELETE FROM {table_name}" + " WHERE document_id = %s"
            cur.execute(sql_delete, query['document_id'])
            conn.commit()`;
            dataBaseCustomization['exportFunction'] = `def export_documents():
    with psycopg2.connect(host=server_host, port=server_port, user=server_user, password=server_pw, database=database_name) as conn:
        register_vector(conn)
        with conn.cursor() as cur:
            cur.execute(f"SELECT document_id, chunk_id, filename, ingestion_timestamp, embedding, document FROM {table_name}")
            rows = cur.fetchall()
            df = pd.DataFrame(rows, columns=['document_id', 'chunk_id', 'filename', 'ingestion_timestamp', 'embedding', 'document'])
            max_len = df['embedding'].apply(len).max()
            df_split = pd.DataFrame(df['embedding'].to_list(), columns=[f'embedding_{i+1}' for i in range(max_len)])
            df_final = pd.concat([df, df_split], axis=1).drop(columns=['embedding'])
            df_final.to_parquet(input_directory + '/' + exported_content_file_name, index=False)`;
        } else if (ragSetupOptions.vectorDB === 'Chroma') {
            dataBaseCustomization['importStatement'] = `import chromadb
from chromadb.config import Settings`;
            dataBaseCustomization['metadataQuery'] = `query = {key: value}`;
            dataBaseCustomization['sql'] = '--- The Chroma collection will be created if it does not exist. No need to pre-run anything.'
            dataBaseCustomization['config'] = `{
    "INPUT_DIRECTORY": "/inputs",
    "INGESTED_CONTENT_FILE_NAME": "_ingested_content.parquet",
    "EXPORTED_CONTENT_FILE_NAME": "_exported_content.parquet",
    "CHROMA_NAME": "_chroma_db"
}`;
            dataBaseCustomization['ingestDocumentsFunction'] = `def ingest_documents(chunks):
    vector_store = chromadb.PersistentClient(path= input_directory + '/' + chroma_name, settings=Settings(anonymized_telemetry=False))
    collection = vector_store.get_or_create_collection(collection_name)
    batch_texts = [chunk['content'] for chunk in chunks]
    batch_embeddings = [json.loads(chunk['embedding']) for chunk in chunks]
    batch_ids = [f"{chunk['document_id']}-{chunk['chunk_id']}" for chunk in chunks]
    batch_metadatas = []
    for chunk in chunks:
        metadata = {
            "document_id": chunk['document_id'],
            "chunk_id": chunk['chunk_id'],
            "filename": chunk['filename'],
            "ingestion_timestamp": chunk['ingestion_timestamp']
        }
        batch_metadatas.append(metadata)
    if batch_texts:
        collection.add(
            documents=batch_texts,
            embeddings=batch_embeddings,
            ids=batch_ids,
            metadatas=batch_metadatas
        )`;
            dataBaseCustomization['retrieveDocumentsFunction'] = `def transform_retrieval_result(retrieval_result):
    "Transforms the retrieval result object into the desired row-based format."
    docs = retrieval_result['documents'][0]
    metas = retrieval_result['metadatas'][0]
    dists = retrieval_result['distances'][0]
    data_rows = []
    for meta, doc, dist in zip(metas, docs, dists):
        row = [meta.get('document_id'), meta.get('chunk_id'), meta.get('filename'), meta.get('ingestion_timestamp'), dist, doc]
        data_rows.append(row)
    
    result = [
        {"metadata": [{"document_id": "string"}, {"chunk_id": "decimal"}, {"filename": "string"}, {"ingestion_timestamp": "string"}, {"distance": "decimal"}, {"document": "string"}]},
        {"data": data_rows}
    ]
    return json.dumps(result)

def retrieve_documents(embedding, n_results, query=''):
    vector_store = chromadb.PersistentClient(path= input_directory + '/' + chroma_name, settings=Settings(anonymized_telemetry=False))
    collection = vector_store.get_or_create_collection(collection_name)
    if query == '':
        retrieved_documents = collection.query(query_embeddings=[json.loads(embedding)], n_results=n_results, include=['documents', 'metadatas', 'distances'])
    else:
        retrieved_documents = collection.query(query_embeddings=[json.loads(embedding)], n_results=n_results, include=['documents', 'metadatas', 'distances'], where=query)
    return transform_retrieval_result(retrieved_documents)`;
            dataBaseCustomization['deleteDocumentsFunction'] = `def delete_documents(query):
    vector_store = chromadb.PersistentClient(path= input_directory + '/' + chroma_name, settings=Settings(anonymized_telemetry=False))
    collection = vector_store.get_or_create_collection(collection_name)
    collection.delete(where=query)`;
            dataBaseCustomization['exportFunction'] = `def export_documents():
    vector_store = chromadb.PersistentClient(path= input_directory + '/' + chroma_name, settings=Settings(anonymized_telemetry=False))
    collection = vector_store.get_or_create_collection(collection_name)
    embeddings = collection.get(include=["embeddings"])["embeddings"]
    metadatas = collection.get(include=["metadatas"])["metadatas"]
    documents = collection.get(include=["documents"])["documents"]
    data = []
    for i, metadata in enumerate(metadatas):
        flattened_metadata = {
            "document_id": metadata.get('document_id', ''),
            "chunk_id": metadata.get('chunk_id', ''),
            "filename": metadata.get('filename', ''),
            "ingestion_timestamp": metadata.get('ingestion_timestamp', '')
        }
        data_row = {
            **flattened_metadata,
            "embedding": embeddings[i] if i < len(embeddings) else None,
            "document": documents[i] if i < len(documents) else None
        }
        data.append(data_row)
    df = pd.DataFrame(data)
    max_len = df['embedding'].apply(len).max()
    df_split = pd.DataFrame(df['embedding'].to_list(), columns=[f'embedding_{i+1}' for i in range(max_len)])
    df_final = pd.concat([df, df_split], axis=1).drop(columns=['embedding'])
    df_final.to_parquet(input_directory + '/' + exported_content_file_name, index=False)`;
        }

        // Create the score code
        let scoreCode = `import os
import sys
import logging
from pathlib import Path
import uuid
import datetime
import time
import json
import warnings
# Test if running MAS
running_in_mas = 0
try:
    import settings
    running_in_mas = 1
except:
    running_in_mas = 0

# Setup project variables - defaults and overwrite as appropriate
input_directory = './inputs'
ingested_content_file_name = '_ingested_content.parquet'
exported_content_file_name = '_exported_content.parquet'
chroma_name = '${ragSetupOptions?.collectionName}'
table_name = '${ragSetupOptions?.tableName}'
database_name = '${ragSetupOptions?.databaseName}'
server_host = ''
server_port = ''
server_user = ''
server_pw = ''
nltk_path = '/pybox/model'
project = '${ragBuilderCurrentSetup}'
embedding_endpoint = '${ragBuilderObject?.SCREndpoint}'
embedding_model = '${ragSetupOptions?.embeddingModel}'
if running_in_mas:
    with open(settings.pickle_path + '/config.txt') as f:
        config = json.load(f)
        input_directory = config.get('INPUT_DIRECTORY', input_directory)
        ingested_content_file_name = config.get('INGESTED_CONTENT_FILE_NAME', ingested_content_file_name)
        exported_content_file_name = config.get('EXPORTED_CONTENT_FILE_NAME', exported_content_file_name)
        server_host = config.get('SERVER_HOST', server_host)
        server_port = config.get('SERVER_HOST', server_port)
        server_user = config.get('SERVER_HOST', server_user)
        server_pw = config.get('SERVER_HOST', server_pw)
        nltk_path = input_directory + '/../tokenizer'
else:
    input_directory = os.environ.get('INPUT_DIRECTORY', input_directory)
    ingested_content_file_name = os.environ.get('INGESTED_CONTENT_FILE_NAME', ingested_content_file_name)
    exported_content_file_name = os.environ.get('EXPORTED_CONTENT_FILE_NAME', exported_content_file_name)
    server_host = os.environ.get('SERVER_HOST', server_host)
    server_port = os.environ.get('SERVER_HOST', server_port)
    server_user = os.environ.get('SERVER_HOST', server_user)
    server_pw = os.environ.get('SERVER_HOST', server_pw)
import requests
import pandas as pd
# Remmove warning from log as audio is currently not supported
warnings.filterwarnings("ignore", "Couldn't find ffmpeg or avconv")
from markitdown import MarkItDown
# Import depends on the chunking strategy
${chunkingStrategyCustomization.importStatement}
# Import depends on the database
${dataBaseCustomization.importStatement}

# Initiate the logger to write output information to the log
logging.basicConfig(
    level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stdout)],
    format='%(levelname)s - %(message)s'
)
logger = logging.getLogger("scoreModel")

# Check the that _ingested_documents.parquet file exists
ingested_content_file = Path(input_directory + '/' + ingested_content_file_name)
if not ingested_content_file.is_file():
    logger.info(f"Creating the {ingested_content_file_name}")
    pd.DataFrame(columns=['filename', 'document_id', 'ingestion_timestamp']).to_parquet(ingested_content_file, engine='pyarrow')

def check_file_extension(filename):
    "Checks that the files extension is in the supported list"
    if filename.endswith(('.md', '.pdf', '.doc', '.docx', '.csv', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.epub', '.json', '.xml', '.html', '.htm')):
        return True
    else:
        return False
    
def read_markdown(filename):
    "Converts files into markdown documents"
    md = MarkItDown()
    converted_doc = md.convert(input_directory + '/' + filename)
    result = {
        "document_id": str(uuid.uuid4()),
        "filename": filename,
        "content": converted_doc.text_content,
        "ingestion_timestamp": str(datetime.datetime.now())
    }
    return result

def check_docs(path, ignore_list, ingested_content_df):
    "Checks a specific file or all files in a directory, excluding those in a given list."
    document_content = []
    if path == '.':
        root_path = Path(input_directory)
        for file_path in root_path.rglob('*'):
            if file_path.is_file():
                # Get path relative to the root for your check
                relative_path = file_path.relative_to(root_path)
                if ignore_list:
                    # Convert Path object to string for comparison
                    if str(relative_path) not in ingested_content_df['filename'].values:
                        # Use file_path.name for extension check
                        if check_file_extension(str(relative_path)):
                            logger.info(f"Ingesting {str(relative_path)}")
                            document_content.append(read_markdown(str(relative_path)))
                else:
                    if check_file_extension(str(relative_path)):
                        logger.info(f"Ingesting {str(relative_path)}")
                        document_content.append(read_markdown(str(relative_path)))
    else:
        file_path = input_directory + '/' + path
        if not Path(file_path).is_file():
                logger.error(f"File is not a available: {file_path}")
        if ignore_list:
            if path not in ingested_content_df['filename'].values:
                if check_file_extension(path):
                    logger.info(f"Ingesting {path}")
                    document_content.append(read_markdown(path))
        else:
            if check_file_extension(path):
                logger.info(f"Ingesting {path}")
                document_content.append(read_markdown(path))
    return document_content

def embed_text(text, project, options):
    if options == '':
        options == '{Embedding_Mode:query}'
    payload = json.dumps({
        "inputs": [
            {
                "name": "document",
                "value": text
            },
            {
                "name": "options",
                "value": options
            },
            {
                "name": "project",
                "value": project
            }
        ]
    })
    response = requests.post(f"{embedding_endpoint}/{embedding_model}/{embedding_model}", headers={"Content-Type": "application/json"}, data=payload)
    return response.json()['data']['embedding']

# Implementation depends on the chunking strategy
${chunkingStrategyCustomization.chunkDocumentFunction}

# Implementation depends on the database
${dataBaseCustomization.ingestDocumentsFunction}

${dataBaseCustomization.retrieveDocumentsFunction}

${dataBaseCustomization.deleteDocumentsFunction}

${dataBaseCustomization.exportFunction}

def scoreModel(text, options):
    "Output: result, run_time"
    started_timestamp = time.time()
    optionsDefaults = {
        "action": 'retrieve',
        "ignore_list": 1,
        "n_documents": 3,
        "where": ''
    }
    optionsParsed = {}
    if len(options) > 0:
        if isinstance(options[0], str):
            try:
                optionsParsed = json.loads(options[0].replace('{', '{"').replace('}', '"}').replace(':', '":"').replace(',', '","'))
            except json.JSONDecodeError:
                optionsParsed = {}
    options = {**optionsDefaults, **optionsParsed}
    result = ''
    if options['action'] == 'retrieve':
        if (options.get('API_KEY')):
            embedding = embed_text(text[0], project, '{API_KEY:' + options['API_KEY'] + ',Embedding_Mode:query}')
        else:
            embedding = embed_text(text[0], project, '{Embedding_Mode:query}')
        if options['where'] == '':
            result = retrieve_documents(embedding, options['n_documents'])
        else:
            key, value = options['where'].split('|', 1)
            if (key in ['document_id', 'chunk_id', 'filename', 'ingestion_timestamp']):
                ${dataBaseCustomization.metadataQuery}
                result = retrieve_documents(embedding, options['n_documents'], query)
            else:
                result = 'Invalid key provided, please ensure your key is in the following list: document_id, chunk_id, filename or ingestion_timestamp'
    elif options['action'] == 'ingest':
        ingested_content_df = pd.read_parquet(ingested_content_file)
        documents = check_docs(text[0], options['ignore_list'], ingested_content_df)
        for document in documents:
            chunks = chunk_document(document)
            for i, chunk in enumerate(chunks):
                if (options.get('API_KEY')):
                    chunks[i]['embedding'] = embed_text(chunk['content'], project, '{API_KEY:' + options['API_KEY'] + ',Embedding_Mode:document}')
                else:
                    chunks[i]['embedding'] = embed_text(chunk['content'], project, '{Embedding_Mode:document}')
            ingest_documents(chunks)
            ingested_content_df = pd.concat([ingested_content_df, pd.DataFrame({
                "filename": [document['filename']],
                "document_id": [document['document_id']],
                "ingestion_timestamp": [document['ingestion_timestamp']]
            })], ignore_index = True)
            ingested_content_df.to_parquet(ingested_content_file, index = False)
        if len(documents) > 0:
            result = f"{len(documents)} documents have been ingested."
        else:
            result = f"No documents have been ingested."
    elif options['action'] == 'delete':
        ingested_content_df = pd.read_parquet(ingested_content_file)
        deleteResponse = delete_documents({"document_id": text[0]})
        if deleteResponse == None:
            result = f"No document found with the document_id: {text[0]}."
        else:
            result = f"The document with the document_id: {text[0]} was deleted."
            ingested_content_df = ingested_content_df[ingested_content_df['document_id'] != text[0]]
            ingested_content_df.to_parquet(ingested_content_file, index = False)
    elif options['action'] == 'export':
        export_documents()
        result = f"The export is available as {input_directory + '/' + exported_content_file_name}."
    run_time = time.time() - started_timestamp
    logger.info(f"run_time: {run_time}")
    return result, run_time
        `;

        let README = `# Documentation

This documentation walks you through both the functionality of this model and also what the additional requirements are for deploying it.

The document is split into two pieces with two different intended audiences:
1. **Deployment Considerations**, this is for administrators to ensure that everything can be run.
2. **Usage**, this is for the users of this RAG setup.

## Deployment Considerations

It is generally recommended to deploy these RAG Setups as *SAS Container Runtime* (SCR) containers as that enables the full flexibility. If you want to make use of the Scoring tab in SAS Intelligent Decisioning though, you will have to configure *SAS Micro Analytic Service* (MAS) for this as well.

For both of the deployment considerations you will have to get in touch with an administrator and go through this part of documentation with them.

This setup walks you through all considerations, but as your environment might not support all of the vector databases (vectorDB) that are technically available you can skip over those sections accordingly.

### MAS

This information can also be found in the main setup guide of the SAS Agentic AI Accelerator. 

Please note that MAS only provides one Python runtime that is shared across all of the modules so the changes you make here can have knock on effects. For more information about using Python in MAS please refer to the [SAS Documentation](https://go.documentation.sas.com/doc/en/mascdc/default/masag/n1fn07cwjn2w65n16njwlbpgo5fk.htm).

The following packages are always required to be installed:
- markitdown[all]
- pandas
- pyarrow
- langchain
- requests
- nltk
\`\`\`bash
pip install -q markitdown[all] pandas pyarrow langchain requests nltk
\`\`\`

Download the nltk punkt_tab tokenizer into the a folder that isn't part of the project structure. Please take a look at the recommended folder structure:
\`\`\`bash
python -m nltk.downloader punkt_tab -d .
\`\`\`

#### Specifics for Chroma

The following additional configuration is required for ChromaDB:
1. Install the package chromadb for MAS:
\`\`\`bash
pip install -q chromadb
\`\`\`
2. Mount the directory containing the vector DB - make sure that READ access is provided. Please take a look at the recommended folder structure.
3. Share the full path of the directory from inside of the *viya4-mas-python-runner* container inside of the *sas-microanalytics-score* so it can be used to update the *config.txt*.

#### Specifics for SingleStore

The following additional configuration is required for SingleStore:
1. Install the package singlestoredb:
\`\`\`bash
pip install -q singlestoredb
\`\`\`
2. Share the following three pieces of information to be added to the *config.txt*:
    - *SERVER_HOST*, this is the host URL of your SingleStore.
    - *SERVER_PORT*, this is the port number of your SingleStore.
    - *SERVER_USER*, this is the user name that is used for the connection with SingleStore.
    - *SERVER_PW*, this is the password that is used for the connection with SingleStore.
3. Create the embedding table using the *create_embedding_table.txt* that is part of the same model inside of SAS Model Manager as this README.md. This is required because SingleStore requires the length specification of the vector column to be done during creation and based on the selected embedding model this might vary, so please do not reuse and earlier SQL.

Here is the base template of what that SQL code will look like - please make sure 
\`\`\`sql
--- Make sure that the table is in the following database: <USER-SPECIFIED>
CREATE TABLE IF NOT EXISTS <USER-SPECIFIED> (
    document_id VARCHAR(255) NOT NULL, -- The document_id is unique per document
    chunk_id INT NOT NULL, -- Specifies the chunk order for the document, starts at 0
    embedding VECTOR(<EMBEDDING-MODEL-DEPENDANT>, F32) NOT NULL, -- The embedding vector
    document TEXT, -- The chunk text
    filename VARCHAR(255), -- The name of the file relative to the input directory
    ingestion_timestamp VARCHAR(255), -- Timestamp when the ingestion occured
    PRIMARY KEY (document_id, chunk_id), -- Composite primary key
    SHARD KEY (document_id), -- Distribution per document
    VECTOR INDEX embedding_index (embedding) -- Index creation for the embedding column for performance
);
\`\`\`

#### Specifics for PgVector

1. Install the packages psycopg2-binary and pgvector:
\`\`\`bash
pip install -q psycopg2-binary pgvector
\`\`\`
2. Share the following three pieces of information to be added to the *config.txt*:
    - *SERVER_HOST*, this is the host URL of your PostgreSQL.
    - *SERVER_PORT*, this is the port number of your PostgreSQL.
    - *SERVER_USER*, this is the user name that is used for the connection with PostgreSQL.
    - *SERVER_PW*, this is the password that is used for the connection with PostgreSQL.
3. Create the embedding table using the *create_embedding_table.txt* that is part of the same model inside of SAS Model Manager as this README.md. This is required because PostgreSQL + pgVector require the length specification of the vector column to be done during creation and based on the selected embedding model this might vary, so please do not reuse and earlier SQL.

Here is the base template of what that SQL code will look like - please make sure 
\`\`\`sql
--- Make sure that the table is in the following database: <USER-SPECIFIED>
CREATE TABLE IF NOT EXISTS <USER-SPECIFIED> (
    document_id VARCHAR(255) NOT NULL, -- The document_id is unique per document
    chunk_id INT NOT NULL, -- Specifies the chunk order for the document, starts at 0
    embedding VECTOR(<EMBEDDING-MODEL-DEPENDANT>) NOT NULL, -- The embedding vector
    document TEXT, -- The chunk text
    filename VARCHAR(255), -- The name of the file relative to the input directory
    ingestion_timestamp VARCHAR(255), -- Timestamp when the ingestion occured
    PRIMARY KEY (document_id, chunk_id) -- Composite primary key
);
\`\`\`

#### Update config

Please note the *config.txt* file is only required for the deployment in MAS. For the deployment in SCR it can be used for automation purposes, but for SCR it should NOT be edited inside of SAS Model Manager.

If you have setup everything than you need to edit the following file *config.txt* in the SAS Model Manager model in order to make use of all of these configurations.

The value for **INPUT_DIRECTORY** should be provided by the administrator of your environment. If you require additional customization, you can add the follwoing variables to the config as well, what you see listed below are the default values:
\`\`\`json
{
    "INPUT_DIRECTORY": "/inputs",
    "INGESTED_CONTENT_FILE_NAME": "_ingested_content.parquet",
    "EXPORTED_CONTENT_FILE_NAME": "_exported_content.parquet",
    "CHROMA_NAME": "_chroma_db",
    "SERVER_HOST": "No default value",
    "SERVER_PORT": "No default value",
    "SERVER_USER": "No default value",
    "SERVER_PW": "No default value"
}
\`\`\`

The list below highlights which variables are used for which vectorDB:
- *CHROMA_NAME*, is only used with Chroma.
- *SERVER_HOST*, is used with SingleStore and pgVector.
- *SERVER_PORT*, is used with SingleStore and pgVector.
- *SERVER_USER*, is used with SingleStore and pgVector.
- *SERVER_PW*, is used with SingleStore and pgVector.

Please note that the **INGESTED_CONTENT_FILE_NAME** and **EXPORTED_CONTENT_FILE_NAME** variables have to end in *.parquet*.

You are ready to start using this now in MAS.

#### Recommended Folder Structure
/
-- /inputs <- Mount Point of the directory inside of the container.
---- /project_a <- A folder for each RAG Setup project to separate everything from each other.
---- /tokenizer <- Folder that contains the downloaded punkt_tab tokenizer from nltk. Please note that because this tokenizer contains text it can not be stored within the project folders as it would get ingested. The name of the folder is **required** to be *tokenizer*!

### SCR

In SCR you do not have to manage the package installation as that will be taken care of for you by the generated *requirements.json* which is run during the publishing process. What you have to do is to mount the persistent volume that contains this projects files to the container - the default location within the container is */pybox/model/inputs* you can change this path by adding the environment variable **INPUT_DIRECTORY** to the containers deployment.

You will also have to provide additional environment variables during the deployment of the container depending on the on the choosen database. Below you will find an overview of everything that is available, but you can also check these via the *config.txt* file that is stored along side the model:
- *INPUT_DIRECTORY*, is optional and specifies the name of the default path to the documents, default value is "./inputs", which in the container translates to /pybox/model/input.
- *INGESTED_CONTENT_FILE_NAME*, is optional and specifies the name of the ingestion tracking file. The filename has to end in *.parquet*, default is "_ingested_content.parquet".
- *EXPORTED_CONTENT_FILE_NAME*, is optional and specifies the name of the exported database. The filename has to end in *.parquet*, default is "_exported_content.parquet".
- *CHROMA_NAME*, is optional and specifies the name of the Chroma database in the file system. The default is "_chroma_db".
- *CHROMA_NAME*, is only used with Chroma.
- *SERVER_HOST*, is used with SingleStore and pgVector.
- *SERVER_PORT*, is used with SingleStore and pgVector.
- *SERVER_USER*, is used with SingleStore and pgVector.
- *SERVER_PW*, is used with SingleStore and pgVector.

For more information on Python in SCR please refer to the [SAS Documentation](https://go.documentation.sas.com/doc/en/mascrtcdc/default/mascrtag/p0xn2918662nq4n1okcth9bntqqk.htm).

## Usage

In here you will get a description of the different features of the RAG Setup project and how to interact with it.

In broad terms there is four actions that it provides:
- *Retrieve*, is considered the default, and enables you to provide text, which gets embedded and than similar documents are retrieved.
- *Ingest*, enables you to provide a filename and ingest it into your vectorDB.
- *Delete*, enables you to delete a document by its ID from the vectorDB.
- *Export*, enables you to export the vectorDB into a parquet file.

The general call structure is always the same, but the available parameters change. Here is the baseline call:
\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": ""
        },
        {
            "name": "options",
            "value": "{}"
        }
    ]
}
\`\`\`

And of course you will always get the following output structure back, the contents of which also depend on the performed action:
\`\`\`json
{
    "response": "",
    "run_time": 1.0
}
\`\`\`

The response is always a string, in the case of retrieval it can be converted into a data grid for easy processing within SAS Intelligent Decisioning. In the case of the other operations it contains information on how the process went. The runtime is always specified in seconds and measures the full process.

### Retrieve [Default]

Retrieve enables you to to provide a text which gets embedded and than a similiarity search is performed against the connect vectorDB.

#### Inputs

Here is a definition of the arguments and their values to perform a retrieval call:
- *text*, its value needs to be a plain text input that you want to find similiar documents to.
- *options*, here the following pieces are available and their values - note that options are comma-separated:
    - *API_KEY:value*, is required if you use an embedding model that requires an API_KEY
    - *action:retrieve*, this is optional as if no action is specified retrieve will be performed.
    - *n_documents:X*, this is optional, the default being **3**, and it allows you to specify how many documents will be returned.
    - *where:column|value*, this is optional, by default no metadata based filtering is performed, enables you to provide a metadata column name and its value to subset the embedding space. See the subchapter below on what metadata is available. Note that only one filter is supported

Here is a fully qualified call - the demonstrated where condition filters the filename column only for a certain file:
\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": "Find documents close to me"
        },
        {
            "name": "options",
            "value": "{API_KEY:value,action:retrieve,n_documents:3,where:filename|example/test.txt}"
        }
    ]
}
\`\`\`

Smallest possible call:
\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": "Find documents close to me"
        },
        {
            "name": "options",
            "value": "{}"
        }
    ]
}
\`\`\`

#### Outputs

The output that is returned is for the response is a string that follows the structure of a SAS data grid. If you want to load this as a datagrid variable inside of a SAS Intelligent Decision, create a variable of the type data grid and the use the following assignment in a Rule Set: **DATAGRID_CREATE(your_data_grid, text_response)** - here is the link to the SAS Documentation about this [data grid function](https://go.documentation.sas.com/doc/en/edmcdc/default/edmdatagrids/p1b00g0lvqulmxn196x7y6q92yxb.htm).

If you want to work with the output in a Python code file than just pass it on as a string into Python and use the following code snippet to convert it into a data frame - assuming that you called the input variable text:

\`\`\`python
import json
import pandas as pd

# Load the string into a list
text = json.loads(text)

# Get the column names from the structure
column_names = [list(item.keys())[0] for item in text[0]['metadata']]

# Get the data rows
data_rows = text[1]['data']

# Create the pandas DataFrame
df = pd.DataFrame(data_rows, columns=column_names)
\`\`\`

Below is an example response that contains three rows of data - please note the string is normaly flat and has been indented here for your reading:

\`\`\`json
{
    "response": "
    [
        {'metadata': [
            {'document_id': 'string'},
            {'chunk_id': 'string'},
            {'filename': 'string'},
            {'ingestion_timestamp': 'string'},
            {'distance': 'decimal'},
            {'document': 'string'}
        ]},
        {'data': [
            ['03317bee-7880-48b2-9871-99ab15400b02', 0, 'index.html', '2025-09-01 14:02:04.316083', 0.2886979579925537, 'Hello World'],
            ['03317bee-7880-48b2-9871-99ab15400b02', 12, 'index.html', '2025-09-01 14:02:04.316083', 0.36446768045425415, 'Hello There'],
            ['689f8b2a-b23a-4010-8b3b-aeac0a053e08', 0, 'example\\\\test.txt', '2025-09-01 14:02:04.533081', 0.3780241310596466, 'Hello General']
        ]}
    ]",
    "run_time": 1.0
}
\`\`\`

#### Collected Metadata

During the ingestion the following metadata items are stored along side the document text and embeddings:
- *document_id*, this is the internal ID of the document and is used to delete a document from the vectorDB.
- *chunk_id*, this is the ID of each chunk in sequence for each document.
- *filename*, this is the name of the original file that was ingested.
- *ingestion_timestamp*, this is a date-timestamp of when the ingestion of the document occured.

These metadata items are available as part of the retrieval process for the *where* option, they get generated during ingestion, they are deleted along side the actual document itself, if a document is deleted and the export provides all of the metadata along side the text and embedding vector.

### Ingest

Ingest enables you to specify what should be ingested into the vectorDB. The following file formats are supported - currently there is no support for image ingesation within these files:
- PDF (.pdf)
- Word (.doc, docx)
- PowerPoint (.ppt, .pptx)
- Excel (.xls, xlsx, .csv)
- Text (.txt, .md, .epub)
- JSON (.json)
- XML (.xml)
- HTML (.html, .htm)

#### Inputs

Here is a definition of the arguments and their values to perform a ingestion call:
- *text*, its value can be either a filename e.g. test.pdf or example/test.pdf (if the file is located in a subfolder) or it can be **.** (period) if you want to ingest everything that is stored in the directory.
- *options*, here the following pieces are available and their values - note that options are comma-separated:
    - *API_KEY:value*, is required if you use an embedding model that requires an API_KEY
    - *action:ingest*, this is required, as if no action is specified retrieve will be performed.
    - *ignore_list:1*, this is optional, the default value is 1, which means that previously ingested documents will not be reingested. If you want to reingest things set this value to 0.

Example call for ingesting one specific file - you do not have to set ignore_list if the default is ok:

\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": "test.pdf"
        },
        {
            "name": "options",
            "value": "{API_KEY:value,action:ingest,ignore_list:1}"
        }
    ]
}
\`\`\`

Example to ingest everything, that hasn't been previously ingested:
\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": "."
        },
        {
            "name": "options",
            "value": "{API_KEY:value,action:ingest}"
        }
    ]
}
\`\`\`

#### Outputs

The output from the ingestion is rather simple it either responds with the message that *X* documents were ingested or it responds with the following error message: *No documents have been ingested.*.
\`\`\`json
{
    "response": "X documents have been ingested.",
    "run_time": 1.0
}
\`\`\`

### Delete

Delete enables you to delete a specified document from the vectorDB. Please note this only deletes the file from the vectorDB and not the physical file from the directory.

#### Inputs

Here is a definition of the arguments and their values to perform a retrieval call:
- *text*, its value needs to be a *document_id* (see the chapter on *Collected Metadata*) for more on this variable. This will delete all chunks of the document.
- *options*, here the following pieces are available and their values - note that options are comma-separated:
    - *action:delete*, this is required, as if no action is specified retrieve will be performed.

Below is a typical call:
\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": "03317bee-7880-48b2-9871-99ab15400b02"
        },
        {
            "name": "options",
            "value": "{action:delete}"
        }
    ]
}
\`\`\`

#### Outputs

The output from the deletion is rather simple it either responds with the message that *document_id* was deleted (see below) or it responds with the following error message: *No document found with the document_id: 03317bee-7880-48b2-9871-99ab15400b02.*.

\`\`\`json
{
    "response": "The document with the document_id: 03317bee-7880-48b2-9871-99ab15400b02 was deleted.",
    "run_time": 1.0
}
\`\`\`

### Export

Export enables you to get the contents of the vectorDB as a *.parquet* file for further analysis.

#### Inputs

Here is a definition of the arguments and their values to perform a retrieval call:
- *text*, its is ignored for this step and can be left empty.
- *options*, here the following pieces are available and their values - note that options are comma-separated:
    - *action:export*, this is required, as if no action is specified retrieve will be performed.

\`\`\`json
{
    "inputs": [
        {
            "name": "text",
            "value": ""
        },
        {
            "name": "options",
            "value": "{action:export}"
        }
    ]
}
\`\`\`

#### Outputs

The output from the export is rather simple it only responds with: *The export is available as path/to/exported_data.parquet.* from where you can than further process the result data.

\`\`\`json
{
    "response": "The export is available as path/to/exported_data.parquet.",
    "run_time": 1.0
}
\`\`\``
        createModelVersion(window.VIYA, ragBuilderRAGSetupSelectedModelID);
        // Clean up previous variables first
        let modelVariables = await getModelVariables(window.VIYA, ragBuilderRAGSetupSelectedModelID);
        for(let i = 0; i < modelVariables.length; i++) {
            deleteModelVariable(window.VIYA, ragBuilderRAGSetupSelectedModelID, modelVariables[i].id);
        }
        let scoreCodeBlob = new Blob([scoreCode], {type: 'text/x-python'});
        let configBlob = new Blob([dataBaseCustomization?.config], {type: 'text/plain'})
        let sqlBlob = new Blob([dataBaseCustomization?.sql], {type: 'text/plain'})
        let READMEBlob = new Blob([README], {type: 'text/mardkown'})
        let validatedModelName = validateAndCorrectPackageName(ragBuilderCurrentSetup);
        let ragSetupInputResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, ragSetupInputVars, 'inputVar.json', 'inputVariables');
        let ragSetupOutputResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, ragSetupOutputVars, 'outputVar.json', 'outputVariables');
        let ragSetupScoreCodeResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, scoreCodeBlob, `${validatedModelName.correctedName}.py`, 'score', 'text/x-python');
        let ragSetupConfigResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, configBlob, 'config.txt', 'scoreResource', 'text/plain');
        let ragSetupSQLResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, sqlBlob, 'create_embedding_table.txt', 'documentation', 'text/plain');
        let ragSetupREADMEResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, READMEBlob, 'README.md', 'documentation', 'text/markdown');
        let ragSetupSettingsResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, ragSetupOptions, 'settings.json');
        let ragSetupRequirementsResponseObject = await createModelContent(window.VIYA, ragBuilderRAGSetupSelectedModelID, ragSetupRequirements, 'requirements.json', 'python pickle');

        if(ragSetupScoreCodeResponseObject.status_code === 201) {
            ragSetupResponseContainer.innerHTML = `<p>${ragBuilderInterfaceText.ragSetupSaveSucessResponse} <a target="_blank" rel="noopener noreferrer" href="${VIYA}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}">${VIYA}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}</a></p>`
        } else {
            ragSetupResponseContainer.innerHTML = `<p>${ragBuilderInterfaceText.ragSetupSaveFailureResponse}</p>`
        }
    }

    // Save RAG Setup
    let ragSetupSaveButton = document.createElement('div');
    ragSetupSaveButton.id = `${paneID}-obj-${ragBuilderObject?.id}-rag-setup-save-button`;
    ragSetupSaveButton.innerText = `${ragBuilderInterfaceText?.ragSetupSaveButton}`;
    ragSetupSaveButton.setAttribute('type', 'button');
    ragSetupSaveButton.setAttribute('class', 'btn btn-primary');
    ragSetupSaveButton.onclick = async function () {
        createRAGSetupCode();
    }
    let ragSetupResponseContainer = document.createElement('div');

    ragBuilderContainer.appendChild(ragBuilderHeader);
    ragBuilderContainer.appendChild(ragBuilderDescription);
    ragBuilderContainer.appendChild(ragBuilderProjectHeader);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderProjectSelectorHeader);
    ragBuilderContainer.appendChild(ragBuilderProjectSelectorDropdown);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderRAGSetupHeader);
    ragBuilderContainer.appendChild(ragBuilderRAGSetupSelectorDropdown);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderModalButtonContainer);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderChunkingStrategyHeader);
    ragBuilderContainer.appendChild(ragBuilderChunkingStrategyDescription);
    ragBuilderContainer.appendChild(ragBuilderChunkingStrategySelectorDropdown);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderChunkingStrategieDescription);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderChunkingStrategyCustomization);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderVectorDBHeader);
    ragBuilderContainer.appendChild(ragBuilderVectorDBDescription);
    ragBuilderContainer.appendChild(ragBuilderVectorDBSelectorDropdown);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderVectorDBContainer);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragBuilderEmbeddingModelHeader);
    ragBuilderContainer.appendChild(ragBuilderEmbeddingModelDescription);
    ragBuilderContainer.appendChild(ragBuilderEmbeddingModelSelectorDropdown);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragSetupSaveButton);
    ragBuilderContainer.appendChild(document.createElement('br'));
    ragBuilderContainer.appendChild(ragSetupResponseContainer);
  
    return ragBuilderContainer;
}