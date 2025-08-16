/**
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
    let ragBuilderRAGSetupSelectorItem = document.createElement('option');
    ragBuilderRAGSetupSelectorItem.value = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorDropdown.append(ragBuilderRAGSetupSelectorItem);
    ragBuilderRAGSetupSelectorDropdown.onchange = async function () {
        let ragBuilderRAGSetupSelectedModelID = this.options[this.selectedIndex].value
        // Activate link to SAS Model Manager
        let tmpOpenInMMButton = document.getElementById(`${ragBuilderObject?.id}-openInMMButton`);
        tmpOpenInMMButton.disabled = false;
        tmpOpenInMMButton.onclick = () => window.open(`${window.origin}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}/files`,'_blank');
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
            scoreCodeType: 'python'
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
            chunkSizeInput.value = 200;
            chunkSizeInput.min = 25;
            chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
            let chunkSizeOverlapText = document.createElement('span');
            chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
            let chunkSizeOverlapInput = document.createElement('input');
            chunkSizeOverlapInput.setAttribute('type', 'number');
            chunkSizeOverlapInput.value = 20;
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
            chunkSizeInput.value = 200;
            chunkSizeInput.min = 25;
            chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
            let chunkSizeOverlapText = document.createElement('span');
            chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
            let chunkSizeOverlapInput = document.createElement('input');
            chunkSizeOverlapInput.setAttribute('type', 'number');
            chunkSizeOverlapInput.value = 20;
            chunkSizeOverlapInput.min = 10;
            chunkSizeOverlapInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeOverlapInput`);
            let chunkSeparatorText = document.createElement('span');
            chunkSeparatorText.innerText = `${ragBuilderInterfaceText?.chunkSeparatorText}:`;
            let chunkSeparatorInput = document.createElement('input');
            chunkSeparatorInput.setAttribute('type', 'text');
            chunkSeparatorInput.value = "'\n# ', '\n## ', '\n### ', '\n\n', '. ', ' '";
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
            ragBuilderVectorDBCollectionInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBCollectionInputLabel}:`;
            let ragBuilderVectorDBCollectionInput = document.createElement('input');
            ragBuilderVectorDBCollectionInput.type = 'text';
            ragBuilderVectorDBCollectionInput.placholder = "my_collection";
            ragBuilderVectorDBCollectionInput.setAttribute('id', `${ragBuilderObject?.id}-collection-name`);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInput);
        } else if (selectedVectorDB === 'SingleStore') {
            ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.singleStoreDescriptor;
            let ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
            ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}:`;
            let ragBuilderVectorDBDatabaseInput = document.createElement('input');
            ragBuilderVectorDBDatabaseInput.type = 'text';
            ragBuilderVectorDBDatabaseInput.placholder = "database_name";
            ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
            let ragBuilderVectorDBTableInputLabel = document.createElement('span');
            ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}:`;
            let ragBuilderVectorDBTableInput = document.createElement('input');
            ragBuilderVectorDBTableInput.type = 'text';
            ragBuilderVectorDBTableInput.placholder = "table_name";
            ragBuilderVectorDBTableInput.setAttribute('id', `${ragBuilderObject?.id}-table-name`);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInput);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInputLabel);
            ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInput);
        } else if (selectedVectorDB === 'pgVector') {
            ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.pgVectorDescriptor;
            let ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
            ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}:`;
            let ragBuilderVectorDBDatabaseInput = document.createElement('input');
            ragBuilderVectorDBDatabaseInput.type = 'text';
            ragBuilderVectorDBDatabaseInput.placholder = "database_name";
            ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
            let ragBuilderVectorDBTableInputLabel = document.createElement('span');
            ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}:`;
            let ragBuilderVectorDBTableInput = document.createElement('input');
            ragBuilderVectorDBTableInput.type = 'text';
            ragBuilderVectorDBTableInput.placholder = "table_name";
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
    let promptBuilderDeprecatedLLMs = await getModelProjectModels(VIYA, ragBuilderObject?.embeddingProjectID, "eq(tags,'deprecated')");
    ragBuilderAvailableEmbeddingModels = ragBuilderAvailableEmbeddingModels.filter(obj1 => !promptBuilderDeprecatedLLMs.some(obj2 => obj1.id === obj2.id))
    for(const ragBuilderAvailableEmbeddingModel in ragBuilderAvailableEmbeddingModels) {
        let ragBuilderAvailableEmbeddingContents = await getModelContents(VIYA, ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel]?.id);
        for(const ragBuilderAvailableEmbeddingContent in ragBuilderAvailableEmbeddingContents) {
            if(ragBuilderAvailableEmbeddingContents[ragBuilderAvailableEmbeddingContent]?.name == 'options.json') {
                ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel].fileURI = ragBuilderAvailableEmbeddingContents[ragBuilderAvailableEmbeddingContent]?.fileURI
                let promptBuilderCurrentOptions = await getFileContent(VIYA, ragBuilderAvailableEmbeddingModels[ragBuilderAvailableEmbeddingModel].fileURI);
                let ragBuilderCurrentOptionsContent = await promptBuilderCurrentOptions.json();
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

    // Save RAG Setup
    let ragSetupSaveButton = document.createElement('div');
    ragSetupSaveButton.id = `${paneID}-obj-${ragBuilderObject?.id}-rag-setup-save-button`;
    ragSetupSaveButton.innerText = `${ragBuilderInterfaceText?.ragSetupSaveButton}`;
    ragSetupSaveButton.setAttribute('type', 'button');
    ragSetupSaveButton.setAttribute('class', 'btn btn-primary');
    ragSetupSaveButton.onclick = async function () {
        console.log('SAVED');
    }

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
  
    return ragBuilderContainer;
}