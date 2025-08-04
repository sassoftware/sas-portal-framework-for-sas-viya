/**
 * Create a Prompt Builder Object
 *
 * @param {Object} promptBuilderObject - Contains the definition of the Prompt Builder Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} promptBuilderInterfaceText - Contains all of the Prompt Builder relevant language interface
 * @returns a prompt builder object
 */
async function addPromptBuilderObject(promptBuilderObject, paneID, promptBuilderInterfaceText) {
    let promptBuilderContainer = document.createElement('div');
    promptBuilderContainer.setAttribute('id', `${paneID}-obj-${promptBuilderObject?.id}`);
    
    // Add the intro piece to the Prompt Builder
    let promptBuilderHeader = document.createElement('h1');
    promptBuilderHeader.innerText = promptBuilderInterfaceText?.promptBuilderHeading;
    let promptBuilderDescription = document.createElement('p');
    promptBuilderDescription.innerText = promptBuilderInterfaceText?.promptBuilderDescription;
    
    // Add the project selection/creation
    let promptBuilderProjectHeader = document.createElement('h2');
    promptBuilderProjectHeader.innerText = promptBuilderInterfaceText?.promptBuilderProjectHeader
    // Select from existing projects
    let promptBuilderProjectSelectorHeader = document.createElement('h2');
    promptBuilderProjectSelectorHeader.innerText = `${promptBuilderInterfaceText?.projectSelect}:`
    let promptBuilderProjectSelectorDropdown = document.createElement('select');
    promptBuilderProjectSelectorDropdown.setAttribute('class', 'form-select');
    promptBuilderProjectSelectorDropdown.setAttribute('id', `${promptBuilderObject?.id}-project-dropdown`);
    promptBuilderProjectSelectorDropdown.onchange = async function () {
        // Reset the prompt experiment tracker
        let prommpExperimentTargetContainer = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet`);
        prommpExperimentTargetContainer.innerHTML = '';
        // Reset the prompt selector
        promptBuilderPromptSelectorDropdown.innerHTML = '';
        let tmpPromptBuilderPromptSelectorItem = document.createElement('option');
        tmpPromptBuilderPromptSelectorItem.value = `${promptBuilderInterfaceText?.promptSelect}`;
        tmpPromptBuilderPromptSelectorItem.innerHTML = `${promptBuilderInterfaceText?.promptSelect}`;
        promptBuilderPromptSelectorDropdown.append(tmpPromptBuilderPromptSelectorItem);

        // Get the prompts from the selected projects
        let currentProject = this.options[this.selectedIndex].value;
        let currentProjectPrompts = await getModelProjectModels(VIYA, currentProject);
        
        for(const existingPrompt in currentProjectPrompts) {
            let promptObj = document.createElement('option');
            promptObj.value = currentProjectPrompts[existingPrompt]?.id;
            promptObj.innerHTML = currentProjectPrompts[existingPrompt]?.name;
            promptBuilderPromptSelectorDropdown.append(promptObj);
        }
    }
    // Add all of the projects to the dropdown
    let promptBuilderProjectSelectorItem = document.createElement('option');
    promptBuilderProjectSelectorItem.value = `${promptBuilderInterfaceText?.projectSelect}`;
    promptBuilderProjectSelectorItem.innerHTML = `${promptBuilderInterfaceText?.projectSelect}`;
    promptBuilderProjectSelectorDropdown.append(promptBuilderProjectSelectorItem);
    // Get all projects in the specified repostiory
    let existingProjects = await getModelProjects(VIYA, `contains(tags,'Prompt-Engineering')`);
    // Add the projects to the dropdown
    for (const existingProject in existingProjects) {
        let projectMod = document.createElement('option');
        projectMod.value = existingProjects[existingProject]?.value;
        projectMod.innerHTML = existingProjects[existingProject]?.innerHTML;
        promptBuilderProjectSelectorDropdown.append(projectMod);
    }
    // Add the existing prompt selector
    let promptBuilderPromptHeader = document.createElement('h2');
    promptBuilderPromptHeader.innerText = `${promptBuilderInterfaceText?.promptSelect}:`;
    let promptBuilderPromptSelectorDropdown = document.createElement('select');
    promptBuilderPromptSelectorDropdown.setAttribute('class', 'form-select');
    promptBuilderPromptSelectorDropdown.setAttribute('id', `${promptBuilderObject?.id}-prompt-dropdown`);
    let promptBuilderPromptSelectorItem = document.createElement('option');
    promptBuilderPromptSelectorItem.value = `${promptBuilderInterfaceText?.promptSelect}`;
    promptBuilderPromptSelectorItem.innerHTML = `${promptBuilderInterfaceText?.promptSelect}`;
    promptBuilderPromptSelectorDropdown.append(promptBuilderPromptSelectorItem);
    promptBuilderPromptSelectorDropdown.onchange = async function () {
        // Reset the prompt experiment tracker
        let prommpExperimentTargetContainer = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet`);
        prommpExperimentTargetContainer.innerHTML = '';
        let promptBuilderPromptSelectedModelID = this.options[this.selectedIndex].value
        // Get the ID of a previously created Prompt Experiment Tracker and delete it
        let promptBuilderAvailablePTE = await getModelContents(VIYA, promptBuilderPromptSelectedModelID);
        for(const promptBuilderAvailablepte in promptBuilderAvailablePTE) {
            if(promptBuilderAvailablePTE[promptBuilderAvailablepte]?.name == 'Prompt-Experiment-Tracker.json') {
                // Reset the prompt tracker to nothing
                promptExperimentTrackerRunID = 0;
                let promptBuilderCurrentPTE = await getFileContent(VIYA, promptBuilderAvailablePTE[promptBuilderAvailablepte].fileURI);
                let promptBuilderCurrentPTEContent = await promptBuilderCurrentPTE.json();
                let promptBuilderPreviousExperiment = [];
                let promptBuilderPreviousRunID = 0;
                promptBuilderCurrentPTEContent.forEach((value) => {
                    if(value.runId !== promptBuilderPreviousRunID) {
                        promptBuilderPreviousExperiment.push({systemPrompt: value.systemPrompt, userPrompt: value.userPrompt});
                        promptBuilderPreviousRunID = value.runId;
                    } else {
                        promptBuilderPreviousExperiment[promptBuilderPreviousRunID - 1][value?.model] = {
                            best_prompt: value?.best_prompt,
                            fastest_prompt: value?.fastest_prompt ?? false,
                            fewest_tokens_prompt: value?.fewest_tokens_prompt ?? false,
                            output_length: value?.output_length,
                            prompt_length: value?.prompt_length,
                            run_time: value?.run_time,
                            options: JSON.parse(value?.options.replace(/(\w+):/g, '"$1":').replace(/"API_KEY":"?([^",}]+)"?/g, function(match, p1) {
                                return `"API_KEY":"${p1}"`;
                            })),
                            response: value?.response
                        };
                    }
                })
                createPromptExperimentTracker(promptBuilderPreviousExperiment);
                promptExperimentTracker = [...promptBuilderPreviousExperiment];
            }
        }
        // Activate link to SAS Model Manager
        let tmpOpenInMMButton = document.getElementById(`${promptBuilderObject?.id}-openInMMButton`);
        tmpOpenInMMButton.disabled = false;
        tmpOpenInMMButton.onclick = () => window.open(`${window.origin}/SASModelManager/models/${promptBuilderPromptSelectedModelID}/files`,'_blank');
    }

    // Add the creation prompt buttons and modals
    let promptBuilderModalButtonContainer = document.createElement('div');
    promptBuilderModalButtonContainer.setAttribute('id', `${promptBuilderObject?.id}-modal-button-container`);

    // Function to call when creating a new project
    async function promptBuilderCreateProject() {
        document.getElementById('promptBuilderCreateProjectModal').lastChild.lastChild.lastChild.lastChild.disabled = true;
        let promptBuilderRepositoryInformation = await getModelRepositoryInformation(VIYA, promptBuilderObject?.modelRepositoryID);
        let promptBuilderNewProjectDefinition = {
            name: document.getElementById('promptBuilderCreateProjectName').value,
            description: document.getElementById('promptBuilderCreateProjectDescription').value,
            function: 'Prompt',
            repositoryId: promptBuilderObject?.modelRepositoryID,
            folderId: promptBuilderRepositoryInformation?.folderId,
            properties: [
                {
                    name: 'Origin',
                    value: 'Prompt Builder',
                    type: 'string'
                }
            ],
            tags: ['LLM', 'Prompt-Engineering']
        }
        let promptBuilderNewProjectObject = await createModelProject(VIYA, promptBuilderNewProjectDefinition);
        let newPromptBuilderProjectSelectorItem = document.createElement('option');
        newPromptBuilderProjectSelectorItem.value = `${promptBuilderNewProjectObject?.id}`;
        newPromptBuilderProjectSelectorItem.innerHTML = `${promptBuilderNewProjectObject?.name}`;
        promptBuilderProjectSelectorDropdown.append(newPromptBuilderProjectSelectorItem);
        // Set the newly created project as the currently selected proejct
        promptBuilderProjectSelectorDropdown.value = `${promptBuilderNewProjectObject?.id}`;
        promptBuilderProjectSelectorDropdown.dispatchEvent(new Event('change'));
        document.getElementById('promptBuilderCreateProjectModal').lastChild.lastChild.lastChild.lastChild.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('promptBuilderCreateProjectModal')).hide();
    }

    // Function to call call when creating a new prompt
    async function promptBuilderCreatePrompt() {
        document.getElementById('promptBuilderCreatePromptModal').lastChild.lastChild.lastChild.lastChild.disabled = true;
        let promptBuilderNewPromptDefinition = {
            name: document.getElementById('promptBuilderCreatePromptName').value,
            description: document.getElementById('promptBuilderCreatePromptDescription').value,
            function: 'Prompting',
            tool: 'Prompt-Builder',
            modelere: window.userName,
            projectId: promptBuilderProjectSelectorDropdown[promptBuilderProjectSelectorDropdown.selectedIndex].value,
            algorithm: 'Prompt-Template',
            tags: ['LLM', 'Prompt-Template'],
            scoreCodeType: 'python'
        }
        let promptBuilderNewPromptObject = await createModel(VIYA, promptBuilderNewPromptDefinition);
        let newPromptBuilderPromptSelectorItem = document.createElement('option');
        newPromptBuilderPromptSelectorItem.value = `${promptBuilderNewPromptObject?.items[0]?.id}`;
        newPromptBuilderPromptSelectorItem.innerHTML = `${promptBuilderNewPromptObject?.items[0]?.name}`;
        promptBuilderPromptSelectorDropdown.append(newPromptBuilderPromptSelectorItem);
        // Set the newly created project as the currently selected proejct
        promptBuilderPromptSelectorDropdown.value = `${promptBuilderNewPromptObject?.items[0]?.id}`;
        promptBuilderPromptSelectorDropdown.dispatchEvent(new Event('change'));
        document.getElementById('promptBuilderCreatePromptModal').lastChild.lastChild.lastChild.lastChild.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('promptBuilderCreatePromptModal')).hide();
    }

    function promptBuilderCreateModal(tmpModalContainer, tmpPrefix, tmpModalText, tmpActionFunction) {
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

    // Create the modals for project/prompt creation
    promptBuilderCreateModal(promptBuilderModalButtonContainer, 'promptBuilderCreateProject', promptBuilderInterfaceText?.promptBuilderCreateProject, promptBuilderCreateProject);
    promptBuilderCreateModal(promptBuilderModalButtonContainer, 'promptBuilderCreatePrompt', promptBuilderInterfaceText?.promptBuilderCreatePrompt, promptBuilderCreatePrompt);

    // Add link to SAS Model Manager
    let openInMMButton = document.createElement('button');
    openInMMButton.id = `${promptBuilderObject?.id}-openInMMButton`;
    openInMMButton.type = 'button';
    openInMMButton.classList.add(...['btn', 'btn-primary']);
    openInMMButton.disabled = true;
    openInMMButton.innerHTML = promptBuilderInterfaceText?.promptBuilderOpenInMMButton;
    promptBuilderModalButtonContainer.appendChild(openInMMButton);

    function generateModelSelection(availableModels) {
        availableModels.forEach((model, index) => {
            const modelDiv = document.createElement('div');
            modelDiv.classList = ['form-check']
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `model${index}`;
            checkbox.classList = ['form-check-input']
            checkbox.value = model?.name;
            checkbox.addEventListener('change', () => {
                const optionsDiv = document.getElementById(`options${index}`);
                optionsDiv.style.display = checkbox.checked ? 'flex' : 'none';
            });

            const label = document.createElement('label');
            label.classList = ['form-check-label']
            label.htmlFor = `model${index}`;
            label.innerText = model?.name;

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('model-options');
            optionsDiv.id = `options${index}`;

            if(model?.options?.temperature) {
                const temperatureInput = document.createElement('input');
                temperatureInput.type = 'number';
                temperatureInput.id = `temperature${index}`;
                temperatureInput.value = model.options.temperature.default;
                temperatureInput.step = 0.1;
                temperatureInput.min = 0;
                temperatureInput.max = 1;
                let temperatureInformationContainer = document.createElement('div');
                temperatureInformationContainer.classList = ['info-container'];
                temperatureInformationContainer.innerHTML = `Temperature: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderTemperatureInfo}</span>`
                optionsDiv.appendChild(temperatureInformationContainer);
                optionsDiv.appendChild(temperatureInput);
            }
            
            if(model?.options?.top_p) {
                const topPInput = document.createElement('input');
                topPInput.type = 'number';
                topPInput.id = `top_p${index}`;
                topPInput.value = model.options.top_p.default;
                topPInput.step = 0.1;
                topPInput.min = 0;
                topPInput.max = 1;
                let topPInformationContainer = document.createElement('div');
                topPInformationContainer.classList = ['info-container'];
                topPInformationContainer.innerHTML = `Top P: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderTop_PInfo}</span>`
                optionsDiv.appendChild(topPInformationContainer);
                optionsDiv.appendChild(topPInput);
            }

            if(model?.options?.top_k) {
                const topKInput = document.createElement('input');
                topKInput.type = 'number';
                topKInput.id = `top_k${index}`;
                topKInput.value = model.options.top_k.default;
                topKInput.step = 1;
                topKInput.min = 1;
                topKInput.max = 100;
                let topKInformationContainer = document.createElement('div');
                topKInformationContainer.classList = ['info-container'];
                topKInformationContainer.innerHTML = `Top K: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderTop_KInfo}</span>`
                optionsDiv.appendChild(topKInformationContainer);
                optionsDiv.appendChild(topKInput);
            }

            if(model?.options?.max_length) {
                const maxLengthInput = document.createElement('input');
                maxLengthInput.type = 'number';
                maxLengthInput.id = `max_length${index}`;
                maxLengthInput.value = model.options.max_length.default;
                maxLengthInput.step = 1;
                maxLengthInput.min = 0;
                maxLengthInput.max = 1000000;
                let maxLengthInformationContainer = document.createElement('div');
                maxLengthInformationContainer.classList = ['info-container'];
                maxLengthInformationContainer.innerHTML = `Max Length: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderMax_LengthInfo}</span>`
                optionsDiv.appendChild(maxLengthInformationContainer);
                optionsDiv.appendChild(maxLengthInput);
            }

            if(model?.options?.max_tokens) {
                const maxTokensInput = document.createElement('input');
                maxTokensInput.type = 'number';
                maxTokensInput.id = `max_tokens${index}`;
                maxTokensInput.value = model.options.max_tokens.default;
                maxTokensInput.step = 1;
                maxTokensInput.min = 0;
                maxTokensInput.max = 1000000;
                let maxTokensInformationContainer = document.createElement('div');
                maxTokensInformationContainer.classList = ['info-container'];
                maxTokensInformationContainer.innerHTML = `Max Tokens: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderMax_LengthInfo}</span>`
                optionsDiv.appendChild(maxTokensInformationContainer);
                optionsDiv.appendChild(maxTokensInput);
            }

            if(model?.options?.max_new_tokens) {
                const maxTokensInput = document.createElement('input');
                maxTokensInput.type = 'number';
                maxTokensInput.id = `max_new_tokens${index}`;
                maxTokensInput.value = model.options.max_new_tokens.default;
                maxTokensInput.step = 1;
                maxTokensInput.min = 0;
                maxTokensInput.max = 1000000;
                let maxTokensInformationContainer = document.createElement('div');
                maxTokensInformationContainer.classList = ['info-container'];
                maxTokensInformationContainer.innerHTML = `Max New Tokens: <span class="info-icon">ℹ️</span><span class="info-content">${promptBuilderInterfaceText?.promptBuilderMax_LengthInfo}</span>`
                optionsDiv.appendChild(maxTokensInformationContainer);
                optionsDiv.appendChild(maxTokensInput);
            }

            modelDiv.appendChild(checkbox);
            modelDiv.appendChild(label);
            modelDiv.appendChild(optionsDiv);
            promptBuilderModelSelectorContainer.appendChild(modelDiv);
        });
    }

    // Model Selector
    let promptBuilderModelSelectorHeader = document.createElement('h1');
    promptBuilderModelSelectorHeader.innerText = promptBuilderInterfaceText?.promptBuilderModelSelectorHeading;
    let promptBuilderModelSelectorContainer = document.createElement('div');
    promptBuilderModelSelectorContainer.setAttribute('id', `${promptBuilderObject?.id}-model-selector-container`);
    let promptBuilderAvailableLLMs = await getModelProjectModels(VIYA, promptBuilderObject?.llmProjectID);
    for(const promptBuilderAvailableLLM in promptBuilderAvailableLLMs) {
        let promptBuilderAvailableLLMContents = await getModelContents(VIYA, promptBuilderAvailableLLMs[promptBuilderAvailableLLM]?.id);
        for(const promptBuilderAvailableLLMContent in promptBuilderAvailableLLMContents) {
            if(promptBuilderAvailableLLMContents[promptBuilderAvailableLLMContent]?.name == 'options.json') {
                promptBuilderAvailableLLMs[promptBuilderAvailableLLM].fileURI = promptBuilderAvailableLLMContents[promptBuilderAvailableLLMContent]?.fileURI
                let promptBuilderCurrentOptions = await getFileContent(VIYA, promptBuilderAvailableLLMs[promptBuilderAvailableLLM].fileURI);
                let promptBuilderCurrentOptionsContent = await promptBuilderCurrentOptions.json();
                promptBuilderAvailableLLMs[promptBuilderAvailableLLM].options = promptBuilderCurrentOptionsContent;
            }
        }
    }
    generateModelSelection(promptBuilderAvailableLLMs);
    
    // Add the prompting inputs
    let promptBuilderPromptingHeader = document.createElement('h1');
    promptBuilderPromptingHeader.innerText = promptBuilderInterfaceText?.promptBuilderPromptingHeader;
    let promptBulderPromptingExplainer = document.createElement('p');
    promptBulderPromptingExplainer.innerHTML = promptBuilderInterfaceText?.promptBulderPromptingExplainer;
    let promptBuilderPromptingContainer = document.createElement('div');
    promptBuilderPromptingContainer.style.gap = '20px';
    promptBuilderPromptingContainer.style.display = 'flex';
    let promptBuilderSystemPrompt = document.createElement('textarea');
    promptBuilderSystemPrompt.id = `${paneID}-obj-${promptBuilderObject?.id}-system-prompt`;
    promptBuilderSystemPrompt.placeholder = promptBuilderInterfaceText?.promptBuilderSystemPromptPlaceholder;
    promptBuilderSystemPrompt.style.width = '100%';
    promptBuilderSystemPrompt.style.height = '200px';
    let promptBuilderUserPrompt = document.createElement('textarea');
    promptBuilderUserPrompt.id = `${paneID}-obj-${promptBuilderObject?.id}-user-prompt`;
    promptBuilderUserPrompt.placeholder = promptBuilderInterfaceText?.promptBuilderUserPromptPlaceholder;
    promptBuilderUserPrompt.style.width = '100%';
    promptBuilderUserPrompt.style.height = '200px';
    promptBuilderPromptingContainer.appendChild(promptBuilderSystemPrompt);
    promptBuilderPromptingContainer.appendChild(promptBuilderUserPrompt);

    // Start running experiments
    let promptBuilderRunExperimentsButton = document.createElement('button');
    promptBuilderRunExperimentsButton.setAttribute('type', 'button');
    promptBuilderRunExperimentsButton.setAttribute('class', 'btn btn-primary');
    promptBuilderRunExperimentsButton.id = `${paneID}-obj-${promptBuilderObject?.id}-run-experiment`
    promptBuilderRunExperimentsButton.innerText = `${promptBuilderInterfaceText?.promptBuilderRunExperimentsButton}`;
    promptBuilderRunExperimentsButton.onclick = async function () {
        promptBuilderRunExperiment();
    }

    let promptBuilderRunExperimentError = document.createElement('p');
    promptBuilderRunExperimentError.style.color = 'red';
    promptBuilderRunExperimentError.id = `${paneID}-obj-${promptBuilderObject?.id}-run-error`
    let promptExperimentTrackerRunID = 0;
    let promptExperimentTracker = [];

    // Add prompt evaluations here
    function annotatePrompts(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return;

        // Initialize indices and minima using the first element
        let fastestIndex = 0;
        let fewestTokensIndex = 0;
        let minRunTime = arr[0]?.data?.run_time;
        let minOutputLength = arr[0]?.data?.output_length;

        // Find the index of the object with the minimum run_time and minimum output_length
        for (let i = 1; i < arr.length; i++) {
            const { run_time, output_length } = arr[i]?.data;

            if (run_time < minRunTime) {
                minRunTime = run_time;
                fastestIndex = i;
            }
            if (output_length < minOutputLength) {
                minOutputLength = output_length;
                fewestTokensIndex = i;
            }
        }

        // Annotate each object with fastest_prompt / fewest_tokens_prompt
        for (let i = 0; i < arr.length; i++) {
            arr[i].data.fastest_prompt = (i === fastestIndex);
            arr[i].data.fewest_tokens_prompt = (i === fewestTokensIndex);
        }
    }

    async function promptBuilderRunExperiment() {
        // Add a spinner to the button
        let promptBuilderRunExperimentTargetButton = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-run-experiment`);
        promptBuilderRunExperimentTargetButton.disabled = true;
        promptBuilderRunExperimentTargetButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${promptBuilderInterfaceText.promptBuilderRunExperimentsButtonRunStatus}`;
        // Reset error message
        let promptBuilderRunExperimentErrorText = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-run-error`);
        promptBuilderRunExperimentErrorText.innerText = '';
        const promptBuilderSelectedModels = [];
        promptBuilderAvailableLLMs.forEach((promptBuilderCurrentLLM, index) => {
            const promptBuilderCheckbox = document.getElementById(`model${index}`);
            if (promptBuilderCheckbox.checked) {
                let currentlySelectedModel = {name: promptBuilderCurrentLLM.name, options: {}};
                Object.keys(promptBuilderCurrentLLM.options).forEach(key => {
                    if(key !== 'API_KEY') {
                        try{
                            currentlySelectedModel.options[`${key}`] = parseFloat(document.getElementById(`${key}${index}`).value)
                        } catch {
                            promptBuilderRunExperimentTargetButton.disabled = false;
                            console.log(`The Error was caused by the ${currentlySelectedModel} and the following option which couldn't be resolved ${currentlySelectedModel.options[`${key}`]}`)
                            promptBuilderRunExperimentTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderModelCallFailed}`;
                        }
                    } else if (key == 'API_KEY') {
                        currentlySelectedModel.options[`${key}`] = promptBuilderObject?.API_KEYS[promptBuilderCurrentLLM.options[key]?.default];
                    }
                })
                promptBuilderSelectedModels.push({currentlySelectedModel});
            }
        })

        // Catch if the user hasn't selected any LLM
        if (promptBuilderSelectedModels.length === 0){
            alert(promptBuilderInterfaceText.promptExperimentSelectModelsAlert);
            promptBuilderRunExperimentTargetButton.disabled = false;
            promptBuilderRunExperimentTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderRunExperimentsButton}`;
            return;
        }

        const systemPrompt = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-system-prompt`).value;
        const userPrompt = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-user-prompt`).value;
        promptExperimentTracker.push({'systemPrompt': systemPrompt, 'userPrompt': userPrompt});

        const allPromises = [];
        for (const modelObj of promptBuilderSelectedModels) {
            const modelName = modelObj.currentlySelectedModel.name;
            const options = modelObj.currentlySelectedModel.options ?? {};

            // Push the un‐awaited promise into the array
            allPromises.push(
                callSCRLLM(
                    promptBuilderObject.SCREndpoint,
                    modelName,
                    systemPrompt,
                    userPrompt,
                    options
                ).then((data) => ({ modelName, data, options }))
            );
        }

        const results = await Promise.all(allPromises);
        // Identify fastest prompt and fewest tokens used prompt
        annotatePrompts(results);
        for (const {modelName, data, options} of results) {
            if (data?.error) {
                promptBuilderRunExperimentErrorText.innerText = data.error;
                promptBuilderRunExperimentTargetButton.disabled = false;
                promptBuilderRunExperimentTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderRunExperimentsButton}`;
                break;
            } else {
                try {
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`] = {};
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['best_prompt'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['fastest_prompt'] = data?.fastest_prompt;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['fewest_tokens_prompt'] = data?.fewest_tokens_prompt;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['output_length'] = data?.output_length;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['prompt_length'] = data?.prompt_length;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['run_time'] = data?.run_time;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['options'] = options;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['response'] = data?.response;
                } catch {
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`] = {};
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['best_prompt'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['fastest_prompt'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['fewest_tokens_prompt'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['output_length'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['prompt_length'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['run_time'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['options'] = null;
                    promptExperimentTracker[promptExperimentTrackerRunID][`${modelName}`]['response'] = promptBuilderInterfaceText?.promptBuilderModelInferenceFailed;
                }
            }
        }

        createPromptExperimentTracker(promptExperimentTracker, systemPrompt, userPrompt);

        promptBuilderRunExperimentTargetButton.disabled = false;
        promptBuilderRunExperimentTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderRunExperimentsButton}`;
    }
    
    let promptExperimentContainer = document.createElement('div');
    promptExperimentContainer.id = `${paneID}-obj-${promptBuilderObject?.id}-pet`;

    // Add a prompt experiment tracker to the UI
    function createPromptExperimentTracker(promptExperimentTracker, systemPrompt='', userPrompt='') {
        promptExperimentTracker.forEach((promptExperimentTrackerRunResult, index) => {
            if(index === promptExperimentTrackerRunID) {
                if(systemPrompt === '') {
                    systemPrompt = promptExperimentTrackerRunResult.systemPrompt;
                }
                if (userPrompt === '') {
                    userPrompt = promptExperimentTrackerRunResult.userPrompt;
                }
                // Add Run Container
                let promptExperimentRunContainer = document.createElement('div');
                promptExperimentRunContainer.classList = ['accordion'];
                promptExperimentRunContainer.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}`;
                // Add the accordion main item
                createAccordionItem(promptExperimentRunContainer, `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}`, 'run', `${promptBuilderInterfaceText.promptExperimentTrackerRunHeader}${index + 1}`);
                let promptExperimentRunContainerItemBody = document.createElement('div');
                promptExperimentRunContainerItemBody.classList = ['accordion-body'];
                // Add the System Prompt to the main run body
                let promptExperimentRunContainerItemBodySystemPrompt = document.createElement('p');
                promptExperimentRunContainerItemBodySystemPrompt.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-systenPrompt`;
                promptExperimentRunContainerItemBodySystemPrompt.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentTrackerSystemPrompt}</b> ${systemPrompt}`;
                // Add the User Prompt to the main run body
                let promptExperimentRunContainerItemBodyUserPrompt = document.createElement('p');
                promptExperimentRunContainerItemBodyUserPrompt.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-userPrompt`;
                promptExperimentRunContainerItemBodyUserPrompt.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentTrackerUserPrompt}</b> ${userPrompt}`;
                // Append to the container
                promptExperimentRunContainerItemBody.appendChild(promptExperimentRunContainerItemBodySystemPrompt);
                promptExperimentRunContainerItemBody.appendChild(promptExperimentRunContainerItemBodyUserPrompt);
                promptExperimentRunContainer.lastChild.lastChild.appendChild(promptExperimentRunContainerItemBody);
                // Iterate over the models used in the run
                let promptExperimentContainerModelContainer = document.createElement('div');
                promptExperimentContainerModelContainer.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested`;
                for(const promptExperimentRunModelKey in promptExperimentTrackerRunResult) {
                    if (promptExperimentRunModelKey !== "systemPrompt" && promptExperimentRunModelKey !== "userPrompt" && promptExperimentRunModelKey !== "author") {
                        // Create the accordion
                        let promptExperimentContainerModelContainerAccordion = document.createElement('div');
                        promptExperimentContainerModelContainerAccordion.classList = ['accordion nested-accordion mt-3'];
                        promptExperimentContainerModelContainerAccordion.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}`;
                        // Create the accordion item
                        let promptExperimentContainerModelContainerAccordionItem = document.createElement('div');
                        promptExperimentContainerModelContainerAccordionItem.classList = ['accordion-item'];
                        // Create the accordion item header
                        let promptExperimentContainerModelContainerAccordionItemHeader = document.createElement('h2');
                        promptExperimentContainerModelContainerAccordionItemHeader.classList = ['accordion-header'];
                        // Create the accordion button
                        let promptExperimentContainerModelContainerAccordionItemButton = document.createElement('button');
                        promptExperimentContainerModelContainerAccordionItemButton.classList = ['accordion-button collapsed'];
                        promptExperimentContainerModelContainerAccordionItemButton.type = 'button';
                        promptExperimentContainerModelContainerAccordionItemButton.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}-header`;
                        promptExperimentContainerModelContainerAccordionItemButton.setAttribute('data-bs-toggle', 'collapse');
                        promptExperimentContainerModelContainerAccordionItemButton.setAttribute(
                            'data-bs-target',
                            `#${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}-body`
                        );
                        // Add fastest and fewest token prompt icons if applicable
                        if(promptExperimentTrackerRunResult[promptExperimentRunModelKey]?.best_prompt) {
                            promptExperimentContainerModelContainerAccordionItemButton.innerHTML = `<svg class="bestPrompt" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><title>${promptBuilderInterfaceText.promptBuilderBestPrompt}</title><path d="M200-160v-80h560v80H200Zm0-140-51-321q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-51 321H200Zm68-80h424l26-167-105 46-133-183-133 183-105-46 26 167Zm212 0Z"/></svg> `;
                        }
                        if(promptExperimentTrackerRunResult[promptExperimentRunModelKey]?.fastest_prompt) {
                            promptExperimentContainerModelContainerAccordionItemButton.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><title>${promptBuilderInterfaceText.promptBuilderFastestPrompt}</title><path d="m422-232 207-248H469l29-227-185 267h139l-30 208ZM320-80l40-280H160l360-520h80l-40 320h240L400-80h-80Zm151-390Z"/></svg> `;
                        }
                        if (promptExperimentTrackerRunResult[promptExperimentRunModelKey]?.fewest_tokens_prompt) {
                            promptExperimentContainerModelContainerAccordionItemButton.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><title>${promptBuilderInterfaceText.promptBuilderFewestTokensPrompt}</title><path d="M480-83 240-323l56-56 184 183 184-183 56 56L480-83Zm0-238L240-561l56-56 184 183 184-183 56 56-240 240Zm0-238L240-799l56-56 184 183 184-183 56 56-240 240Z"/></svg> `;
                        }
                        promptExperimentContainerModelContainerAccordionItemButton.innerHTML += `${promptBuilderInterfaceText.promptExperimentModel} ${promptExperimentRunModelKey}`;
                        // Create the accordion body container
                        let promptExperimentContainerModelContainerAccordionItemBodyContainer = document.createElement('div');
                        promptExperimentContainerModelContainerAccordionItemBodyContainer.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}-body`;
                        promptExperimentContainerModelContainerAccordionItemBodyContainer.classList = ['accordion-collapse collapse'];
                        promptExperimentContainerModelContainerAccordionItemBodyContainer.setAttribute('data-bs-parent', `#${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}`);
                        // Create the accordion body
                        let promptExperimentContainerModelContainerAccordionItemBodyContainerBody = document.createElement('div');
                        promptExperimentContainerModelContainerAccordionItemBodyContainerBody.classList = ['accordion-body'];
                        // Iterate over the model contents
                        for (const promptExperimentRunModelKeyAttribute in promptExperimentTrackerRunResult[promptExperimentRunModelKey]) {
                            let promptExperimentRunModelKeyValue = promptExperimentTrackerRunResult[promptExperimentRunModelKey][promptExperimentRunModelKeyAttribute];
                            let promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine = document.createElement('p');
                            if(promptExperimentRunModelKeyAttribute === "best_prompt") {
                                const bestPromptDiv = document.createElement('div');
                                bestPromptDiv.classList = ['form-check'];
                                const bestPromptCheckbox = document.createElement('input');
                                if(promptExperimentRunModelKeyValue) {
                                    bestPromptCheckbox.checked = true;
                                }
                                bestPromptCheckbox.type = 'checkbox';
                                bestPromptCheckbox.id = `best-prompt-${index}-${promptExperimentRunModelKey}`;
                                bestPromptCheckbox.classList = ['form-check-input'];
                                bestPromptCheckbox.addEventListener('change', () => {
                                    let currentHeader = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet-${index}-run-nested-${promptExperimentRunModelKey}-header`);
                                    let hasBestPrompt = currentHeader.querySelector('.bestPrompt');
                                    if(bestPromptCheckbox.checked && !hasBestPrompt) {
                                        currentHeader.insertAdjacentHTML('afterbegin', `<svg class="bestPrompt" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><title>${promptBuilderInterfaceText.promptBuilderBestPrompt}</title><path d="M200-160v-80h560v80H200Zm0-140-51-321q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-51 321H200Zm68-80h424l26-167-105 46-133-183-133 183-105-46 26 167Zm212 0Z"/></svg> `);
                                    } else if (!bestPromptCheckbox.checked && hasBestPrompt) {
                                        hasBestPrompt.remove();
                                    }
                                    window.pet.forEach(obj => {
                                        if(obj.runId === (index + 1) && obj.model === promptExperimentRunModelKey) {
                                            obj.best_prompt = bestPromptCheckbox.checked ? 1 : 0;
                                        }
                                    })
                                });

                                const bestPromptLabel = document.createElement('label');
                                bestPromptLabel.classList = ['form-check-label'];
                                bestPromptLabel.htmlFor = `best-prompt-${index}-${promptExperimentRunModelKey}`;
                                bestPromptLabel.innerText = promptBuilderInterfaceText.promptExperimentModelPromptBest;
                                bestPromptDiv.appendChild(bestPromptCheckbox);
                                bestPromptDiv.appendChild(bestPromptLabel);
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.appendChild(bestPromptDiv);
                            }
                            else if(promptExperimentRunModelKeyAttribute === "prompt_length") {
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentModelPromptLength}</b> ${promptExperimentRunModelKeyValue}`;
                            } else if (promptExperimentRunModelKeyAttribute === "output_length") {
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentModelOutputLength}</b> ${promptExperimentRunModelKeyValue}`;
                            } else if (promptExperimentRunModelKeyAttribute === "run_time") {
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentModelRunTime}</b> ${promptExperimentRunModelKeyValue}`;
                            } else if (promptExperimentRunModelKeyAttribute === "options") {
                                if(promptExperimentRunModelKeyValue?.API_KEY !== undefined) {
                                    let promptExperimentContainerModelContainerAccordionItemBodyContainerBodyAPIKEYDefault = promptBuilderAvailableLLMs.find(obj => obj['name'] === promptExperimentRunModelKey).options.API_KEY.default;
                                    promptExperimentTrackerRunResult[promptExperimentRunModelKey][promptExperimentRunModelKeyAttribute]['API_KEY'] = promptExperimentContainerModelContainerAccordionItemBodyContainerBodyAPIKEYDefault;
                                    promptExperimentRunModelKeyValue['API_KEY'] = promptExperimentContainerModelContainerAccordionItemBodyContainerBodyAPIKEYDefault;
                                }
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentModelOptions}</b> ${JSON.stringify(promptExperimentRunModelKeyValue)}`;
                            } else if (promptExperimentRunModelKeyAttribute === "response") {
                                promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine.innerHTML = `<b>${promptBuilderInterfaceText.promptExperimentModelResponse}</b> <zero-md><script type="text/markdown">${promptExperimentRunModelKeyValue}</script></zero-markdown>`;
                            }
                            promptExperimentContainerModelContainerAccordionItemBodyContainerBody.appendChild(promptExperimentContainerModelContainerAccordionItemBodyContainerBodyLine);
                        }

                        promptExperimentContainerModelContainerAccordionItemHeader.appendChild(promptExperimentContainerModelContainerAccordionItemButton);
                        promptExperimentContainerModelContainerAccordionItem.appendChild(promptExperimentContainerModelContainerAccordionItemHeader);
                        promptExperimentContainerModelContainerAccordionItemBodyContainer.appendChild(promptExperimentContainerModelContainerAccordionItemBodyContainerBody);
                        promptExperimentContainerModelContainerAccordionItem.appendChild(promptExperimentContainerModelContainerAccordionItemBodyContainer);
                        promptExperimentContainerModelContainerAccordion.appendChild(promptExperimentContainerModelContainerAccordionItem);
                        promptExperimentContainerModelContainer.appendChild(promptExperimentContainerModelContainerAccordion);
                    }
                }
                // Add the model tracker
                promptExperimentRunContainer.lastChild.lastChild.lastChild.appendChild(promptExperimentContainerModelContainer);
                // Add the finished run tracker
                let prommpExperimentTargetContainer = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet`);
                prommpExperimentTargetContainer.prepend(promptExperimentRunContainer);
                // Reset the prompts for the next loop
                systemPrompt = '';
                userPrompt = '';
                // Increment the run tracker
                promptExperimentTrackerRunID++;
            }
        })
        window.pet = promptExperimentTransformData(promptExperimentTracker);
    }

    // Transform the data structure to be saved in SAS Model Manager
    function promptExperimentTransformData(inputArray) {
        return inputArray.map((entry, index) => {
          const MODELKEYS = Object.keys(entry).filter(key => key !== "systemPrompt" && key !== "userPrompt");
          let responseForModel = [];
          MODELKEYS.forEach((MODELKEY, MODELINDEX) => {
            if(MODELINDEX === 0) {
                responseForModel.push({
                    runId: index + 1,
                    systemPrompt: entry.systemPrompt,
                    userPrompt: entry.userPrompt,
                    model: "",
                    options: "",
                    response: "",
                    run_time: null,
                    prompt_length: null,
                    output_length: null,
                    best_prompt: null,
                    fastest_prompt: null,
                    fewest_tokens_prompt: null
                  });
            }

            responseForModel.push({
                runId: index + 1,
                systemPrompt: "",
                userPrompt: "",
                model: MODELKEY,
                options: JSON.stringify(entry[MODELKEY].options).replace(/"/g, ''),
                response: entry[MODELKEY].response,
                run_time: entry[MODELKEY].run_time,
                prompt_length: entry[MODELKEY].prompt_length,
                output_length: entry[MODELKEY].output_length,
                best_prompt: entry[MODELKEY].best_prompt,
                fastest_prompt: entry[MODELKEY]?.fastest_prompt,
                fewest_tokens_prompt: entry[MODELKEY]?.fewest_tokens_prompt
              })
          })
      
          return responseForModel;
        }).flat();
    }

    // Save the prompt run to the prompt
    let promptExperimentSaveButton = document.createElement('div');
    promptExperimentSaveButton.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-save-button`;
    promptExperimentSaveButton.innerText = `${promptBuilderInterfaceText?.promptBuilderSaveExperimentsButton}`;
    promptExperimentSaveButton.setAttribute('type', 'button');
    promptExperimentSaveButton.setAttribute('class', 'btn btn-primary');
    promptExperimentSaveButton.onclick = async function () {
        promptBuilderSaveExperiments();
    }

    // Save the prompt run and turn the best prompt into a model
    let promptExperimentCreateModelButton = document.createElement('div');
    promptExperimentCreateModelButton.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-create-model-button`;
    promptExperimentCreateModelButton.innerText = `${promptBuilderInterfaceText?.promptBuilderCreateModelButton}`;
    promptExperimentCreateModelButton.setAttribute('type', 'button');
    promptExperimentCreateModelButton.setAttribute('class', 'btn btn-primary');
    promptExperimentCreateModelButton.style.marginLeft = '4px';
    promptExperimentCreateModelButton.onclick = async function () {
        await promptBuilderSaveExperiments();
        await promptBulderCreateBestPromptModel();
    }
    // Response for the user about saving
    let promptExperimentResultContainer = document.createElement('div');
    promptExperimentResultContainer.id = `${paneID}-obj-${promptBuilderObject?.id}-pet-save-result`;

    // Save the experiments to the SAS Model Manager
    async function promptBuilderSaveExperiments() {
        // Add spinner to save button
        let promptExperimentSaveTargetButton = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet-save-button`);
        promptExperimentSaveTargetButton.disabled = true;
        promptExperimentSaveTargetButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${promptBuilderInterfaceText.promptBuilderSaveExperimentsButtonStatus}`;
        let promptExperimentRunModel = document.getElementById(`${promptBuilderObject?.id}-prompt-dropdown`).value
        // Check if an experiment was run
        if(typeof window.pet === 'undefined') {
            promptExperimentSaveTargetButton.disabled = false;
            promptExperimentSaveTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderSaveExperimentsButton}`;
            alert(promptBuilderInterfaceText.promptExperimentSaveModelsExperimentAlert);
            return;
        }
        // Check if a prompt test was selected
        if (promptExperimentRunModel === promptBuilderInterfaceText.promptSelect) {
            promptExperimentSaveTargetButton.disabled = false;
            promptExperimentSaveTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderSaveExperimentsButton}`;
            alert(promptBuilderInterfaceText.promptExperimentSaveModelsPromptAlert);
            return;
        } else {
            // Get the ID of a previously created Prompt Experiment Tracker and delete it
            let promptBuilderAvailablePTE = await getModelContents(VIYA, promptExperimentRunModel);
            for(const promptBuilderAvailablepte in promptBuilderAvailablePTE) {
                if(promptBuilderAvailablePTE[promptBuilderAvailablepte]?.name == 'Prompt-Experiment-Tracker.json') {
                    createModelVersion(VIYA, promptExperimentRunModel);
                    deleteModelContet(VIYA, promptExperimentRunModel, promptBuilderAvailablePTE[promptBuilderAvailablepte]?.id);
                }
            }
        }
        // Create the new Prompt Experiment Tracker
        let promptExperimentPromptResponseObject = await createModelContent(VIYA, promptExperimentRunModel, window.pet, 'Prompt-Experiment-Tracker.json');
        if(promptExperimentPromptResponseObject.status_code === 201) {
            promptExperimentResultContainer.innerHTML = `<p>${promptBuilderInterfaceText.promptExperimentSaveSucessResponse} <a target="_blank" rel="noopener noreferrer" href="${VIYA}/SASModelManager/models/${promptExperimentRunModel}">${VIYA}/SASModelManager/models/${promptExperimentRunModel}</a></p>`
        } else {
            promptExperimentResultContainer.innerHTML = `<p>${promptBuilderInterfaceText.promptExperimentSaveFailureResponse}</p>`
        }

        // Re-enable the save button
        promptExperimentSaveTargetButton.disabled = false;
        promptExperimentSaveTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderSaveExperimentsButton}`;
    }

    // Turn the best prompt into a model
    async function promptBulderCreateBestPromptModel() {
        // Disable the create model button
        let promptExperimentCreateModelTargetButton = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet-create-model-button`);
        promptExperimentCreateModelTargetButton.disabled = true;
        promptExperimentCreateModelTargetButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${promptBuilderInterfaceText.promptBuilderSaveExperimentsButtonStatus}`;
        // Get target container to display a message to the user
        let promptExperimentResultTargetContainer = document.getElementById(`${paneID}-obj-${promptBuilderObject?.id}-pet-save-result`);
        // Get the selected model ID & model name
        let promptExperimentRunModel = document.getElementById(`${promptBuilderObject?.id}-prompt-dropdown`).value;
        let promptExperimentRunModelName = document.getElementById(`${promptBuilderObject?.id}-prompt-dropdown`).options[document.getElementById(`${promptBuilderObject?.id}-prompt-dropdown`).selectedIndex].text.toLowerCase().replace(/[\s-]+/g, '_');
        // Get the latest Prompt with a Best Prompt selected
        let bestPromptItem = null;
        window.pet.forEach(item => {
            if(item.best_prompt) {
                if (bestPromptItem === null || item.runId > bestPromptItem.runId) {
                    bestPromptItem = item;
                }
            }
        })
        // Get the system & user Prompt for the Best Prompt
        let basePrompt = null;
        if (bestPromptItem !== null) {
            basePrompt = window.pet.find(item => item.runId === bestPromptItem.runId && item.systemPrompt.trim().length > 0);
            let parsedUserPrompt = basePrompt.userPrompt.trim().split(';');
            // Remove empty items, if the user closed with a semi-colon
            parsedUserPrompt = parsedUserPrompt.filter(Boolean)
            let promptInputs = [];
            // Parse the input and create the input signature
            if (parsedUserPrompt.length >= 1) {
                parsedUserPrompt.forEach(item => {
                    // Check that the variable name doesn't contain blanks
                    let tempInputVar = item.split(':');
                    if(tempInputVar.length > 1 && isValidDS2VariableName(tempInputVar[0])) {
                        let varType = String(tempInputVar[1]).trim() === "" || isNaN(Number(tempInputVar[1])) ? "string" : "decimal";
                        let varLevel = varType === "string" ? "nominal" : "interval";
                        promptInputs.push({
                            name: tempInputVar[0],
                            description: "",
                            level: varLevel,
                            type: varType,
                            length: varType === "string" ? 128000 : 8
                        })
                    } else {
                        if(!promptInputs.includes('userPrompt')) {
                            promptInputs.push({
                                name: "userPrompt",
                                description: "Captures any non-structured inputs for the prompt template",
                                level: "nominal",
                                type: "string",
                                length: 128000
                            })
                        }
                    }
                })
            } else {
                promptInputs.push({
                    name: "userPrompt",
                    description: "Captures any non-structured inputs for the prompt template",
                    level: "nominal",
                    type: "string",
                    length: 128000
                })
            }
            // Check if the options contains an API-Key
            let requiresAPIKey = false;
            let bestPromptOptionsList = bestPromptItem.options.replace(/[{}]/g, '').split(',').map(str => {
                const index = str.indexOf("API_KEY");
                if (index !== -1) {
                    requiresAPIKey = true;
                    promptInputs.push({
                        name: "API_KEY",
                        description: "This LLM call requires you to input an API-Key",
                        level: "nominal",
                        type: "string",
                        length: 256
                    })
                }
                return index !== -1 ? str.substring(0, index) : str;
                }).filter(str => str.trim() !== "");
            
            // Create the input and user input strings for the score code
            let scoreCodeInput = '';
            let scoreCodeUserPrompt = '';
            for (let i = 0; i < promptInputs.length; i++) {
                if (i !== 0) {
                    scoreCodeInput += ', ';
                    scoreCodeUserPrompt += '; ';
                }
                scoreCodeInput += promptInputs[i].name;
                if (promptInputs[i].name !== 'API_KEY') {
                    scoreCodeUserPrompt += `${promptInputs[i].name}: {str(${promptInputs[i].name}).strip()}`
                }
            }
            // Create the options string for the score code
            let scoreCodeOptions = ''
            for (let i = 0; i < bestPromptOptionsList.length; i++) {
                if (i !== 0) {
                    scoreCodeOptions += ',';
                }
                scoreCodeOptions += bestPromptOptionsList[i];
            }
            if (requiresAPIKey) {
                scoreCodeOptions += scoreCodeOptions.length > 0 ? ',API_KEY:{API_KEY}' : 'API_KEY:{API_KEY}';
            }
            // Create the output variables definition
            let outputVars = [
                {
                  "name": "llmBody",
                  "description": "Contains the structered input for the Call LLM node in SAS Intelligent Decisioning",
                  "level": "nominal",
                  "type": "string",
                  "length": 1000000
                },
                {
                  "name": "llmURL",
                  "description": "The URL of the LLM container that will be called",
                  "level": "nominal",
                  "type": "string",
                  "length": 256
                }
            ];
            let scoreCode = `def scoreModel(${scoreCodeInput}):
    "Output: llmBody, llmURL"
    # The llm and the target endpoint
    llm = "${bestPromptItem.model}"
    endpoint = "${promptBuilderObject?.SCREndpoint}"
    llmURL = f"{endpoint}/{llm}/{llm}"
    # These are the options that were set for the best prompt
    options = f"{{${scoreCodeOptions}}}"
    # This is the system prompt that was selected as the best one by the prompt engineer
    systemPrompt = """${basePrompt.systemPrompt}""".replace('\\n', "\\\\n").replace("'", '"').replace('"', '\\\\"')
    # Here the user prompt will be created from the inputs of the call
    userPrompt = f"${scoreCodeUserPrompt}".replace('\\n', "\\\\n").replace("'", '"').replace('"', '\\\\"')
    llmBody = '{"inputs":[{"name":"systemPrompt","value":"' + systemPrompt + '"},{"name":"userPrompt","value":"' + userPrompt + '"},{"name":"options","value":"' + options + '"}]}'
    return llmBody, llmURL`;
            const mainfestPromptScoreCodeBlob = new Blob([scoreCode], {type: 'text/x-python'});
            // Clean up previous variables first
            let modelVariables = await getModelVariables(window.VIYA, promptExperimentRunModel);
            for(let i = 0; i < modelVariables.length; i++) {
                deleteModelVariable(window.VIYA, promptExperimentRunModel, modelVariables[i].id);
            }
            let validatedModelName = validateAndCorrectPackageName(promptExperimentRunModelName);
            let manifestPromptInputResponseObject = await createModelContent(VIYA, promptExperimentRunModel, promptInputs, 'inputVar.json', 'inputVariables');
            let manifestPromptOutputResponseObject = await createModelContent(VIYA, promptExperimentRunModel, outputVars, 'outputVar.json', 'outputVariables');
            let manifestPromptScoreCodeResponseObject = await createModelContent(VIYA, promptExperimentRunModel, mainfestPromptScoreCodeBlob, `${validatedModelName.correctedName}.py`, 'score', 'text/x-python');
        } else {
            promptExperimentResultTargetContainer.innerText = `${promptBuilderInterfaceText?.promptBuilderCreateModelNoBestPrompt}`
        }

        // Re-enable the create model button
        promptExperimentCreateModelTargetButton.disabled = false;
        promptExperimentCreateModelTargetButton.innerText = `${promptBuilderInterfaceText?.promptBuilderCreateModelButton}`;
    }

    promptBuilderContainer.appendChild(promptBuilderHeader);
    promptBuilderContainer.appendChild(promptBuilderDescription);
    promptBuilderContainer.appendChild(promptBuilderProjectHeader);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderProjectSelectorHeader);
    promptBuilderContainer.appendChild(promptBuilderProjectSelectorDropdown);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderPromptHeader);
    promptBuilderContainer.appendChild(promptBuilderPromptSelectorDropdown);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderModalButtonContainer);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderModelSelectorHeader);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderModelSelectorContainer);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderPromptingHeader);
    promptBuilderContainer.appendChild(promptBulderPromptingExplainer);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderPromptingContainer);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptBuilderRunExperimentsButton);
    promptBuilderContainer.appendChild(promptBuilderRunExperimentError);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptExperimentContainer);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptExperimentSaveButton);
    promptBuilderContainer.appendChild(promptExperimentCreateModelButton);
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(document.createElement('br'));
    promptBuilderContainer.appendChild(promptExperimentResultContainer);
  
    return promptBuilderContainer;
}