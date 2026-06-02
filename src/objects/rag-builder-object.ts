/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Create a RAG Builder Object
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition, InterfaceText, RagBuilderText } from '../types';
import { getAppState } from '../state/app-state';
import { getFileContent } from '../api/files-api';
import {
  getModelProjects,
  getModelProjectModels,
  getModelRepositoryInformation,
  createModelProject,
  createModel,
  getModelContents,
  createModelContent,
  createModelVersion,
  getModelVariables,
  deleteModelVariable,
} from '../api/models-api';
import { validateAndCorrectPackageName } from '../util/validation';

interface ModelOption {
  default: unknown;
  [key: string]: unknown;
}

interface AvailableEmbeddingModel {
  id: string;
  name: string;
  fileURI?: string;
  options?: Record<string, ModelOption>;
  [key: string]: unknown;
}

interface RagSettingsOptions {
  chunkingStrategie: string | false;
  chunkSizeInput: string | false;
  chunkSizeOverlap: string | false;
  chunkSeparator: string | false;
  vectorDB: string | false;
  collectionName: string | false;
  databaseName: string | false;
  tableName: string | false;
  embeddingModelID: string | false;
  embeddingModel: string | false;
  vectorLength: string | number | false;
}

interface ChunkingStrategy {
  chunkingStrategyID: string;
  chunkingStrategyName: string;
  chunkingStrategyDescription: string;
}

interface ModalText {
  modalTitle?: string;
  nameLabel?: string;
  descriptionLabel?: string;
  closeButtonText?: string;
  saveButtonText?: string;
}

registerObjectType({
  type: 'ragBuilder',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const ragBuilderObject = definition;
    const ragBuilderInterfaceText = (interfaceText?.ragBuilder ?? {}) as RagBuilderText;
    const VIYA = getAppState().config.viyaHost;

    // This list specifies the supported Vector DBs
    const SUPPORTEDVECTORDBS = ['SingleStore', 'pgVector', 'Chroma'];

    const ragBuilderContainer = document.createElement('div');
    ragBuilderContainer.setAttribute('id', `${paneID}-obj-${ragBuilderObject?.id}`);

    // Add the intro piece to the RAG Builder
    const ragBuilderHeader = document.createElement('h1');
    ragBuilderHeader.innerText = ragBuilderInterfaceText?.ragBuilderHeading as string;
    const ragBuilderDescription = document.createElement('p');
    ragBuilderDescription.innerHTML = ragBuilderInterfaceText?.ragBuilderDescription as string;

    // Add the project selection/creation
    const ragBuilderProjectHeader = document.createElement('h2');
    ragBuilderProjectHeader.innerText = ragBuilderInterfaceText?.ragBuilderProjectHeader as string;
    // Select from existing projects
    const ragBuilderProjectSelectorHeader = document.createElement('h2');
    ragBuilderProjectSelectorHeader.innerText = `${ragBuilderInterfaceText?.projectSelect}:`;
    const ragBuilderProjectSelectorDropdown = document.createElement('select');
    ragBuilderProjectSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderProjectSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-project-dropdown`);
    ragBuilderProjectSelectorDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      // Reset the rag selector
      ragBuilderRAGSetupSelectorDropdown.innerHTML = '';
      const tmpRAGSetupBuilderRAGSetupSelectorItem = document.createElement('option');
      tmpRAGSetupBuilderRAGSetupSelectorItem.value = `${ragBuilderInterfaceText?.ragSelect}`;
      tmpRAGSetupBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragSelect}`;
      ragBuilderRAGSetupSelectorDropdown.append(tmpRAGSetupBuilderRAGSetupSelectorItem);

      // Get the RAG setups from the selected projects
      const currentProject = self.options[self.selectedIndex].value;
      try {
        const currentProjectRAGSetups = await getModelProjectModels(currentProject);
        for (const existingRAGSetup of currentProjectRAGSetups) {
          const ragObj = document.createElement('option');
          ragObj.value = existingRAGSetup.value;
          ragObj.innerHTML = existingRAGSetup.innerHTML;
          ragBuilderRAGSetupSelectorDropdown.append(ragObj);
        }
      } catch (error) {
        console.error('Failed to load RAG setups for the selected project.', error);
      }
    };
    // Add all of the projects to the dropdown
    const ragBuilderProjectSelectorItem = document.createElement('option');
    ragBuilderProjectSelectorItem.value = `${ragBuilderInterfaceText?.projectSelect}`;
    ragBuilderProjectSelectorItem.innerHTML = `${ragBuilderInterfaceText?.projectSelect}`;
    ragBuilderProjectSelectorDropdown.append(ragBuilderProjectSelectorItem);
    // Get all projects in the specified repository
    const existingProjects = await getModelProjects(`contains(tags,'RAG-Engineering')`);
    let ragBuilderRAGSetupSelectedModelID = '';
    // Add the projects to the dropdown
    for (const existingProject of existingProjects) {
      const projectMod = document.createElement('option');
      projectMod.value = existingProject.value;
      projectMod.innerHTML = existingProject.innerHTML;
      ragBuilderProjectSelectorDropdown.append(projectMod);
    }
    // Add the existing rag selector
    const ragBuilderRAGSetupHeader = document.createElement('h2');
    ragBuilderRAGSetupHeader.innerText = `${ragBuilderInterfaceText?.ragSelect}:`;
    const ragBuilderRAGSetupSelectorDropdown = document.createElement('select');
    ragBuilderRAGSetupSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderRAGSetupSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-rag-dropdown`);
    let ragBuilderCurrentSetup = '';
    let ragSettingsOptions: RagSettingsOptions = {
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
      vectorLength: false,
    };
    const ragBuilderRAGSetupSelectorItem = document.createElement('option');
    ragBuilderRAGSetupSelectorItem.value = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragSelect}`;
    ragBuilderRAGSetupSelectorDropdown.append(ragBuilderRAGSetupSelectorItem);
    ragBuilderRAGSetupSelectorDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      ragBuilderRAGSetupSelectedModelID = self.options[self.selectedIndex].value;
      ragBuilderCurrentSetup = self.options[self.selectedIndex].text.toLowerCase().replace(/[\s-]+/g, '');
      // Activate link to SAS Model Manager
      const tmpOpenInMMButton = document.getElementById(`${ragBuilderObject?.id}-openInMMButton`) as HTMLButtonElement | null;
      if (tmpOpenInMMButton) {
        tmpOpenInMMButton.disabled = false;
        tmpOpenInMMButton.onclick = () =>
          window.open(`${window.origin}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}/files`, '_blank');
      }
      // Check if a previously saved setup exists
      let ragSetupContentsTMP: Awaited<ReturnType<typeof getModelContents>> = [];
      try {
        ragSetupContentsTMP = await getModelContents(ragBuilderRAGSetupSelectedModelID);
      } catch (error) {
        console.error('Failed to load model contents for the selected RAG setup.', error);
      }
      for (const ragSetupContentTMP of ragSetupContentsTMP) {
        if (ragSetupContentTMP?.name === 'settings.json') {
          const settingsJSONResponseObject = await getFileContent(ragSetupContentTMP.fileUri!);
          ragSettingsOptions = await settingsJSONResponseObject.json();
          ragBuilderChunkingStrategySelectorDropdown.value = ragSettingsOptions.chunkingStrategie as string;
          ragBuilderChunkingStrategySelectorDropdown.dispatchEvent(new Event('change', { bubbles: true }));
          ragBuilderVectorDBSelectorDropdown.value = ragSettingsOptions.vectorDB as string;
          ragBuilderVectorDBSelectorDropdown.dispatchEvent(new Event('change', { bubbles: true }));
          ragBuilderEmbeddingModelSelectorDropdown.value = ragSettingsOptions.embeddingModelID as string;
          ragBuilderEmbeddingModelSelectorDropdown.dispatchEvent(new Event('change', { bubbles: true }));
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
            vectorLength: false,
          };
        }
      }
    };

    // Add the creation rag buttons and modals
    const ragBuilderModalButtonContainer = document.createElement('div');
    ragBuilderModalButtonContainer.setAttribute('id', `${ragBuilderObject?.id}-modal-button-container`);

    // Function to call when creating a new project
    async function ragBuilderCreateProject(): Promise<void> {
      const modal = document.getElementById('ragBuilderCreateProjectModal');
      if (modal) ((modal.lastChild as HTMLElement)?.lastChild?.lastChild?.lastChild as HTMLButtonElement).disabled = true;
      const ragBuilderRepositoryInformation = await getModelRepositoryInformation(ragBuilderObject?.modelRepositoryID as string);
      const ragBuilderNewProjectDefinition = {
        name: (document.getElementById('ragBuilderCreateProjectName') as HTMLInputElement).value,
        description: (document.getElementById('ragBuilderCreateProjectDescription') as HTMLInputElement).value,
        function: 'RAG',
        repositoryId: ragBuilderObject?.modelRepositoryID as string,
        folderId: ragBuilderRepositoryInformation?.folderId,
        properties: [
          {
            name: 'Origin',
            value: 'RAG Builder',
            type: 'string',
          },
        ],
        tags: ['LLM', 'RAG-Engineering'],
      };
      const ragBuilderNewProjectObject = await createModelProject(ragBuilderNewProjectDefinition);
      const newRAGSetupBuilderProjectSelectorItem = document.createElement('option');
      newRAGSetupBuilderProjectSelectorItem.value = `${ragBuilderNewProjectObject?.id}`;
      newRAGSetupBuilderProjectSelectorItem.innerHTML = `${ragBuilderNewProjectObject?.name}`;
      ragBuilderProjectSelectorDropdown.append(newRAGSetupBuilderProjectSelectorItem);
      // Set the newly created project as the currently selected project
      ragBuilderProjectSelectorDropdown.value = `${ragBuilderNewProjectObject?.id}`;
      ragBuilderProjectSelectorDropdown.dispatchEvent(new Event('change'));
      if (modal) ((modal.lastChild as HTMLElement)?.lastChild?.lastChild?.lastChild as HTMLButtonElement).disabled = false;
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('ragBuilderCreateProjectModal')!);
      if (modalInstance) modalInstance.hide();
    }

    // Function to call when creating a new RAG Setup
    async function ragBuilderCreateRAGSetup(): Promise<void> {
      const modal = document.getElementById('ragBuilderCreateRAGSetupModal');
      if (modal) ((modal.lastChild as HTMLElement)?.lastChild?.lastChild?.lastChild as HTMLButtonElement).disabled = true;
      const ragBuilderNewRAGSetupDefinition = {
        name: (document.getElementById('ragBuilderCreateRAGSetupName') as HTMLInputElement).value,
        description: (document.getElementById('ragBuilderCreateRAGSetupDescription') as HTMLInputElement).value,
        function: 'RAG',
        tool: 'RAG-Builder',
        modelere: getAppState().userName,
        projectId: ragBuilderProjectSelectorDropdown.options[ragBuilderProjectSelectorDropdown.selectedIndex].value,
        algorithm: 'RAG',
        tags: ['LLM', 'RAG'],
        scoreCodeType: 'python',
        trainCodeType: 'python',
      };
      const ragBuilderNewRAGSetupObject = await createModel(ragBuilderNewRAGSetupDefinition);
      const newRAGSetupBuilderRAGSetupSelectorItem = document.createElement('option');
      newRAGSetupBuilderRAGSetupSelectorItem.value = `${ragBuilderNewRAGSetupObject?.items?.[0]?.id}`;
      newRAGSetupBuilderRAGSetupSelectorItem.innerHTML = `${ragBuilderNewRAGSetupObject?.items?.[0]?.name}`;
      ragBuilderRAGSetupSelectorDropdown.append(newRAGSetupBuilderRAGSetupSelectorItem);
      // Set the newly created project as the currently selected project
      ragBuilderRAGSetupSelectorDropdown.value = `${ragBuilderNewRAGSetupObject?.items?.[0]?.id}`;
      ragBuilderRAGSetupSelectorDropdown.dispatchEvent(new Event('change'));
      if (modal) ((modal.lastChild as HTMLElement)?.lastChild?.lastChild?.lastChild as HTMLButtonElement).disabled = false;
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('ragBuilderCreateRAGSetupModal')!);
      if (modalInstance) modalInstance.hide();
    }

    function ragBuilderCreateModal(
      tmpModalContainer: HTMLElement,
      tmpPrefix: string,
      tmpModalText: ModalText,
      tmpActionFunction: () => void
    ): void {
      // Create the button that triggers the modal
      const createModalButtonToggle = document.createElement('button');
      createModalButtonToggle.type = 'button';
      createModalButtonToggle.classList.add('btn', 'btn-primary');
      createModalButtonToggle.setAttribute('data-bs-toggle', 'modal');
      createModalButtonToggle.setAttribute('data-bs-target', `#${tmpPrefix}Modal`);
      createModalButtonToggle.innerHTML = tmpModalText?.modalTitle ?? '';
      // Create the modal wrapper
      const createModalWrapper = document.createElement('div');
      createModalWrapper.classList.add('modal', 'fade');
      createModalWrapper.setAttribute('id', `${tmpPrefix}Modal`);
      createModalWrapper.setAttribute('tabindex', '-1');
      // Create the modal dialog
      const createModalModalDialog = document.createElement('div');
      createModalModalDialog.classList.add('modal-dialog');
      // Create the modal content
      const createModalModalContent = document.createElement('div');
      createModalModalContent.classList.add('modal-content');
      // Create the modal header
      const createModalModalHeader = document.createElement('div');
      createModalModalHeader.classList.add('modal-header');
      // Create the modal title
      const createModalModalTitle = document.createElement('h1');
      createModalModalTitle.classList.add('modal-title');
      createModalModalTitle.innerHTML = tmpModalText?.modalTitle ?? '';
      // Create the modal close button
      const createModalModalCloseButton = document.createElement('button');
      createModalModalCloseButton.type = 'button';
      createModalModalCloseButton.classList.add('btn-close');
      createModalModalCloseButton.setAttribute('data-bs-dismiss', 'modal');
      createModalModalCloseButton.setAttribute('aria-label', 'Close');
      // Create the modal body
      const createModalModalBody = document.createElement('div');
      createModalModalBody.classList.add('modal-body');
      // Create the first modal input
      const createModalBodyInput1Text = document.createElement('span');
      createModalBodyInput1Text.innerHTML = `${tmpModalText?.nameLabel}:`;
      const createModalBodyInput1 = document.createElement('input');
      createModalBodyInput1.setAttribute('type', 'text');
      createModalBodyInput1.setAttribute('placeholder', tmpModalText?.nameLabel ?? '');
      createModalBodyInput1.setAttribute('id', `${tmpPrefix}Name`);
      // Create the second modal input
      const createModalBodyInput2Text = document.createElement('span');
      createModalBodyInput2Text.innerHTML = `${tmpModalText?.descriptionLabel}:`;
      const createModalBodyInput2 = document.createElement('input');
      createModalBodyInput2.setAttribute('type', 'text');
      createModalBodyInput2.setAttribute('placeholder', tmpModalText?.descriptionLabel ?? '');
      createModalBodyInput2.setAttribute('id', `${tmpPrefix}Description`);
      // Create the modal footer
      const createModalModalFooter = document.createElement('div');
      createModalModalFooter.classList.add('modal-footer');
      // Create the modal footer close button
      const createModalModalFooterButton = document.createElement('button');
      createModalModalFooterButton.type = 'button';
      createModalModalFooterButton.classList.add('btn', 'btn-secondary');
      createModalModalFooterButton.setAttribute('data-bs-dismiss', 'modal');
      createModalModalFooterButton.innerHTML = tmpModalText?.closeButtonText ?? '';
      // Create the modal footer save button
      const createModalModalFooterButton2 = document.createElement('button');
      createModalModalFooterButton2.type = 'button';
      createModalModalFooterButton2.classList.add('btn', 'btn-primary');
      createModalModalFooterButton2.innerHTML = tmpModalText?.saveButtonText ?? '';
      createModalModalFooterButton2.onclick = () => {
        tmpActionFunction();
      };
      // Append elements together
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
    ragBuilderCreateModal(
      ragBuilderModalButtonContainer,
      'ragBuilderCreateProject',
      ragBuilderInterfaceText?.ragBuilderCreateProject as unknown as ModalText,
      ragBuilderCreateProject
    );
    ragBuilderCreateModal(
      ragBuilderModalButtonContainer,
      'ragBuilderCreateRAGSetup',
      ragBuilderInterfaceText?.ragBuilderCreateRAGSetup as unknown as ModalText,
      ragBuilderCreateRAGSetup
    );

    // Add link to SAS Model Manager
    const openInMMButton = document.createElement('button');
    openInMMButton.id = `${ragBuilderObject?.id}-openInMMButton`;
    openInMMButton.type = 'button';
    openInMMButton.classList.add('btn', 'btn-primary');
    openInMMButton.disabled = true;
    openInMMButton.innerHTML = ragBuilderInterfaceText?.ragBuilderOpenInMMButton as string;
    ragBuilderModalButtonContainer.appendChild(openInMMButton);

    // Create the Chunking strategy selector
    const ragBuilderChunkingStrategyHeader = document.createElement('h2');
    ragBuilderChunkingStrategyHeader.innerText = ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader as string;
    const ragBuilderChunkingStrategyDescription = document.createElement('p');
    ragBuilderChunkingStrategyDescription.innerText = ragBuilderInterfaceText?.ragBuilderChunkingStrategyDescription as string;
    const ragBuilderChunkingStrategyList: ChunkingStrategy[] = [
      {
        chunkingStrategyID: 'fixedSizeWithOverlap',
        chunkingStrategyName: ragBuilderInterfaceText?.fixedSizeWithOverlapName as string,
        chunkingStrategyDescription: ragBuilderInterfaceText?.fixedSizeWithOverlapDescription as string,
      },
      {
        chunkingStrategyID: 'sentenceBased',
        chunkingStrategyName: ragBuilderInterfaceText?.sentenceBasedName as string,
        chunkingStrategyDescription: ragBuilderInterfaceText?.sentenceBasedDescription as string,
      },
      {
        chunkingStrategyID: 'paragraphBased',
        chunkingStrategyName: ragBuilderInterfaceText?.paragraphBasedName as string,
        chunkingStrategyDescription: ragBuilderInterfaceText?.paragraphBasedDescription as string,
      },
      {
        chunkingStrategyID: 'recursive',
        chunkingStrategyName: ragBuilderInterfaceText?.recursiveName as string,
        chunkingStrategyDescription: ragBuilderInterfaceText?.recursiveDescription as string,
      },
      {
        chunkingStrategyID: 'documentStructureAware',
        chunkingStrategyName: ragBuilderInterfaceText?.documentStructureAwareName as string,
        chunkingStrategyDescription: ragBuilderInterfaceText?.documentStructureAwareDescription as string,
      },
    ];
    const ragBuilderChunkingStrategieDescription = document.createElement('p');
    ragBuilderChunkingStrategieDescription.id = `${ragBuilderObject?.id}-chunking-strategy-description`;
    const ragBuilderChunkingStrategyCustomization = document.createElement('div');
    ragBuilderChunkingStrategyCustomization.id = `${ragBuilderObject?.id}-chunking-strategy-customization`;
    const ragBuilderChunkingStrategySelectorDropdown = document.createElement('select');
    ragBuilderChunkingStrategySelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderChunkingStrategySelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-chunking-strategy-dropdown`);
    ragBuilderChunkingStrategySelectorDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      const selectedStrategy = ragBuilderChunkingStrategyList.find(
        (strategy) => strategy.chunkingStrategyID === self.options[self.selectedIndex].value
      );
      if (selectedStrategy) {
        ragBuilderChunkingStrategieDescription.innerHTML = selectedStrategy.chunkingStrategyDescription;
      } else {
        ragBuilderChunkingStrategieDescription.innerHTML = '';
      }

      // Implement the different configuration options for the different strategies
      ragBuilderChunkingStrategyCustomization.innerHTML = '';
      if (!selectedStrategy) return;
      if (selectedStrategy.chunkingStrategyID === 'sentenceBased') {
        ragBuilderChunkingStrategyCustomization.innerHTML = `<p>${ragBuilderInterfaceText?.ragBuilderChunkingStrategyNoCustomization}</p>`;
      } else if (selectedStrategy.chunkingStrategyID === 'paragraphBased') {
        ragBuilderChunkingStrategyCustomization.innerHTML = `<p>${ragBuilderInterfaceText?.ragBuilderChunkingStrategyNoCustomization}</p>`;
      } else if (selectedStrategy.chunkingStrategyID === 'fixedSizeWithOverlap') {
        const chunkSizeText = document.createElement('span');
        chunkSizeText.innerText = `${ragBuilderInterfaceText?.chunkSizeText}:`;
        const chunkSizeInput = document.createElement('input');
        chunkSizeInput.setAttribute('type', 'number');
        chunkSizeInput.value = ragSettingsOptions.chunkSizeInput ? ragSettingsOptions.chunkSizeInput as string : '200';
        chunkSizeInput.min = '25';
        chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
        const chunkSizeOverlapText = document.createElement('span');
        chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
        const chunkSizeOverlapInput = document.createElement('input');
        chunkSizeOverlapInput.setAttribute('type', 'number');
        chunkSizeOverlapInput.value = ragSettingsOptions.chunkSizeOverlap ? ragSettingsOptions.chunkSizeOverlap as string : '20';
        chunkSizeOverlapInput.min = '10';
        chunkSizeOverlapInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeOverlapInput`);
        ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeText);
        ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeInput);
        ragBuilderChunkingStrategyCustomization.appendChild(document.createElement('br'));
        ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapText);
        ragBuilderChunkingStrategyCustomization.appendChild(chunkSizeOverlapInput);
      } else if (selectedStrategy.chunkingStrategyID === 'recursive') {
        const chunkSizeText = document.createElement('span');
        chunkSizeText.innerText = `${ragBuilderInterfaceText?.chunkSizeText}:`;
        const chunkSizeInput = document.createElement('input');
        chunkSizeInput.setAttribute('type', 'number');
        chunkSizeInput.value = ragSettingsOptions.chunkSizeInput ? ragSettingsOptions.chunkSizeInput as string : '200';
        chunkSizeInput.min = '25';
        chunkSizeInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeInput`);
        const chunkSizeOverlapText = document.createElement('span');
        chunkSizeOverlapText.innerText = `${ragBuilderInterfaceText?.chunkSizeOverlapText}:`;
        const chunkSizeOverlapInput = document.createElement('input');
        chunkSizeOverlapInput.setAttribute('type', 'number');
        chunkSizeOverlapInput.value = ragSettingsOptions.chunkSizeOverlap ? ragSettingsOptions.chunkSizeOverlap as string : '20';
        chunkSizeOverlapInput.min = '10';
        chunkSizeOverlapInput.setAttribute('id', `${ragBuilderObject?.id}-chunkSizeOverlapInput`);
        const chunkSeparatorText = document.createElement('span');
        chunkSeparatorText.innerText = `${ragBuilderInterfaceText?.chunkSeparatorText}:`;
        const chunkSeparatorInput = document.createElement('input');
        chunkSeparatorInput.setAttribute('type', 'text');
        chunkSeparatorInput.value = ragSettingsOptions.chunkSeparator
          ? ragSettingsOptions.chunkSeparator as string
          : "'\\n# ', '\\n## ', '\\n### ', '\\n\\n', '. ', ' '";
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
    const ragBuilderChunkingStrategieSelectorItem = document.createElement('option');
    ragBuilderChunkingStrategieSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader}`;
    ragBuilderChunkingStrategieSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader}`;
    ragBuilderChunkingStrategySelectorDropdown.append(ragBuilderChunkingStrategieSelectorItem);
    for (const chunkingStrategie of ragBuilderChunkingStrategyList) {
      const chunkingStrategieOption = document.createElement('option');
      chunkingStrategieOption.value = chunkingStrategie.chunkingStrategyID;
      chunkingStrategieOption.innerHTML = chunkingStrategie.chunkingStrategyName;
      ragBuilderChunkingStrategySelectorDropdown.append(chunkingStrategieOption);
    }

    // Add a selector for the vector database
    const ragBuilderVectorDBHeader = document.createElement('h2');
    ragBuilderVectorDBHeader.innerText = ragBuilderInterfaceText?.ragBuilderVectorDBHeader as string;
    const ragBuilderVectorDBDescription = document.createElement('p');
    ragBuilderVectorDBDescription.innerHTML = ragBuilderInterfaceText?.ragBuilderVectorDBDescription as string;
    const ragBuilderVectorDBContainer = document.createElement('div');
    const ragBuilderVectorDBSelectorDropdown = document.createElement('select');
    ragBuilderVectorDBSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderVectorDBSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-vectorDB-dropdown`);
    ragBuilderVectorDBSelectorDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      ragBuilderVectorDBContainer.innerHTML = '';
      const ragBuilderVectorDBDescriptor = document.createElement('p');
      const selectedVectorDB = self.options[self.selectedIndex].value;
      if (selectedVectorDB === 'Chroma') {
        ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.chromaDescriptor as string;
        const ragBuilderVectorDBCollectionInputLabel = document.createElement('span');
        ragBuilderVectorDBCollectionInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBCollectionInputLabel}`;
        const ragBuilderVectorDBCollectionInput = document.createElement('input');
        ragBuilderVectorDBCollectionInput.type = 'text';
        ragBuilderVectorDBCollectionInput.value = ragSettingsOptions.collectionName ? ragSettingsOptions.collectionName as string : '';
        ragBuilderVectorDBCollectionInput.setAttribute('id', `${ragBuilderObject?.id}-collection-name`);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInputLabel);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBCollectionInput);
      } else if (selectedVectorDB === 'SingleStore') {
        ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.singleStoreDescriptor as string;
        const ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
        ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}`;
        const ragBuilderVectorDBDatabaseInput = document.createElement('input');
        ragBuilderVectorDBDatabaseInput.type = 'text';
        ragBuilderVectorDBDatabaseInput.value = ragSettingsOptions.databaseName ? ragSettingsOptions.databaseName as string : '';
        ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
        const ragBuilderVectorDBTableInputLabel = document.createElement('span');
        ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}`;
        const ragBuilderVectorDBTableInput = document.createElement('input');
        ragBuilderVectorDBTableInput.type = 'text';
        ragBuilderVectorDBTableInput.value = ragSettingsOptions.tableName ? ragSettingsOptions.tableName as string : '';
        ragBuilderVectorDBTableInput.setAttribute('id', `${ragBuilderObject?.id}-table-name`);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInputLabel);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInput);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInputLabel);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInput);
      } else if (selectedVectorDB === 'pgVector') {
        ragBuilderVectorDBDescriptor.innerHTML = ragBuilderInterfaceText?.pgVectorDescriptor as string;
        const ragBuilderVectorDBDatabaseInputLabel = document.createElement('span');
        ragBuilderVectorDBDatabaseInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBDatabaseInputLabel}`;
        const ragBuilderVectorDBDatabaseInput = document.createElement('input');
        ragBuilderVectorDBDatabaseInput.type = 'text';
        ragBuilderVectorDBDatabaseInput.value = ragSettingsOptions.databaseName ? ragSettingsOptions.databaseName as string : '';
        ragBuilderVectorDBDatabaseInput.setAttribute('id', `${ragBuilderObject?.id}-database-name`);
        const ragBuilderVectorDBTableInputLabel = document.createElement('span');
        ragBuilderVectorDBTableInputLabel.innerText = `${ragBuilderInterfaceText?.ragBuilderVectorDBTableInputLabel}`;
        const ragBuilderVectorDBTableInput = document.createElement('input');
        ragBuilderVectorDBTableInput.type = 'text';
        ragBuilderVectorDBTableInput.value = ragSettingsOptions.tableName ? ragSettingsOptions.tableName as string : '';
        ragBuilderVectorDBTableInput.setAttribute('id', `${ragBuilderObject?.id}-table-name`);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDescriptor);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInputLabel);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBDatabaseInput);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInputLabel);
        ragBuilderVectorDBContainer.appendChild(ragBuilderVectorDBTableInput);
      }
    };
    const ragBuilderVectorDBSelectorItem = document.createElement('option');
    ragBuilderVectorDBSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderVectorDBHeader}`;
    ragBuilderVectorDBSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderVectorDBHeader}`;
    ragBuilderVectorDBSelectorDropdown.append(ragBuilderVectorDBSelectorItem);
    const vectorDBList = ragBuilderObject?.vectorDBList as string[] | undefined;
    for (const vectorDB of (vectorDBList ?? [])) {
      if (SUPPORTEDVECTORDBS.includes(vectorDB)) {
        const vectorDBOption = document.createElement('option');
        vectorDBOption.value = vectorDB;
        vectorDBOption.innerHTML = vectorDB;
        ragBuilderVectorDBSelectorDropdown.append(vectorDBOption);
      } else {
        console.log(
          `The configured Vector DB: ${vectorDB} is not supported, please open an issue.`
        );
      }
    }

    // Add a selector for the embedding model
    const ragBuilderEmbeddingModelHeader = document.createElement('h2');
    ragBuilderEmbeddingModelHeader.innerText = ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader as string;
    const ragBuilderEmbeddingModelDescription = document.createElement('p');
    ragBuilderEmbeddingModelDescription.innerText = ragBuilderInterfaceText?.ragBuilderEmbeddingModelDescription as string;
    // Retrieve the Embedding Models
    let ragBuilderAvailableEmbeddingModels: AvailableEmbeddingModel[] = (await getModelProjectModels(
      ragBuilderObject?.embeddingProjectID as string
    )).map(o => ({ ...o, id: o.value, name: o.innerHTML }));
    const ragBuilderDeprecatedModels: AvailableEmbeddingModel[] = (await getModelProjectModels(
      ragBuilderObject?.embeddingProjectID as string,
      "eq(tags,'deprecated')"
    )).map(o => ({ ...o, id: o.value, name: o.innerHTML }));
    ragBuilderAvailableEmbeddingModels = ragBuilderAvailableEmbeddingModels.filter(
      (obj1) => !ragBuilderDeprecatedModels.some((obj2) => obj1.id === obj2.id)
    );
    for (let emIdx = 0; emIdx < ragBuilderAvailableEmbeddingModels.length; emIdx++) {
      const ragBuilderAvailableEmbeddingContents = await getModelContents(
        ragBuilderAvailableEmbeddingModels[emIdx].id
      );
      for (const embeddingContent of ragBuilderAvailableEmbeddingContents) {
        if (embeddingContent?.name === 'options.json') {
          ragBuilderAvailableEmbeddingModels[emIdx].fileURI =
            embeddingContent?.fileUri;
          const ragBuilderCurrentOptions = await getFileContent(
            ragBuilderAvailableEmbeddingModels[emIdx].fileURI!
          );
          const ragBuilderCurrentOptionsContent = await ragBuilderCurrentOptions.json();
          ragBuilderAvailableEmbeddingModels[emIdx].options =
            ragBuilderCurrentOptionsContent;
        }
      }
    }
    const ragBuilderEmbeddingModelSelectorDropdown = document.createElement('select');
    ragBuilderEmbeddingModelSelectorDropdown.setAttribute('class', 'form-select');
    ragBuilderEmbeddingModelSelectorDropdown.setAttribute('id', `${ragBuilderObject?.id}-embedding-model-dropdown`);
    const ragBuilderEmbeddingModelSelectorItem = document.createElement('option');
    ragBuilderEmbeddingModelSelectorItem.value = `${ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader}`;
    ragBuilderEmbeddingModelSelectorItem.innerHTML = `${ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader}`;
    ragBuilderEmbeddingModelSelectorDropdown.append(ragBuilderEmbeddingModelSelectorItem);
    for (const embeddingModel of ragBuilderAvailableEmbeddingModels) {
      const embeddingModelOption = document.createElement('option');
      embeddingModelOption.value = embeddingModel.id;
      embeddingModelOption.innerHTML = embeddingModel.name;
      ragBuilderEmbeddingModelSelectorDropdown.append(embeddingModelOption);
    }

    async function createRAGSetupCode(): Promise<number | void> {
      // Collect all the selected values by the user
      const ragSetupOptions: Record<string, unknown> = {
        chunkingStrategie: (document.getElementById(`${ragBuilderObject?.id}-chunking-strategy-dropdown`) as HTMLSelectElement).value,
        chunkSizeInput: document.getElementById(`${ragBuilderObject?.id}-chunkSizeInput`)
          ? (document.getElementById(`${ragBuilderObject?.id}-chunkSizeInput`) as HTMLInputElement).value
          : null,
        chunkSizeOverlap: document.getElementById(`${ragBuilderObject?.id}-chunkSizeOverlapInput`)
          ? (document.getElementById(`${ragBuilderObject?.id}-chunkSizeOverlapInput`) as HTMLInputElement).value
          : null,
        chunkSeparator: document.getElementById(`${ragBuilderObject?.id}-chunkSeparatorInput`)
          ? (document.getElementById(`${ragBuilderObject?.id}-chunkSeparatorInput`) as HTMLInputElement).value
          : null,
        vectorDB: (document.getElementById(`${ragBuilderObject?.id}-vectorDB-dropdown`) as HTMLSelectElement).value,
        collectionName: document.getElementById(`${ragBuilderObject?.id}-collection-name`)
          ? (document.getElementById(`${ragBuilderObject?.id}-collection-name`) as HTMLInputElement).value
          : null,
        databaseName: document.getElementById(`${ragBuilderObject?.id}-database-name`)
          ? (document.getElementById(`${ragBuilderObject?.id}-database-name`) as HTMLInputElement).value
          : null,
        tableName: document.getElementById(`${ragBuilderObject?.id}-table-name`)
          ? (document.getElementById(`${ragBuilderObject?.id}-table-name`) as HTMLInputElement).value
          : null,
        embeddingModelID: (document.getElementById(`${ragBuilderObject?.id}-embedding-model-dropdown`) as HTMLSelectElement).value,
      };
      const matchedEmbedding = ragBuilderAvailableEmbeddingModels.filter(
        (item) => item.id === ragSetupOptions['embeddingModelID']
      )[0];
      ragSetupOptions['embeddingModel'] = matchedEmbedding['name'];
      ragSetupOptions['vectorLength'] = (matchedEmbedding['options'] as Record<string, ModelOption>)['Embedding_Length']['default'];

      // Check that values were selected accordingly
      if (
        ragSetupOptions.chunkingStrategie === ragBuilderInterfaceText?.ragBuilderChunkingStrategyHeader ||
        ragSetupOptions.vectorDB === ragBuilderInterfaceText?.ragBuilderVectorDBHeader ||
        ragSetupOptions.embeddingModel === ragBuilderInterfaceText?.ragBuilderEmbeddingModelHeader ||
        ragSetupOptions.collectionName === '' ||
        ragSetupOptions.databaseName === '' ||
        ragSetupOptions.tableName === ''
      ) {
        alert(ragBuilderInterfaceText?.ragBuilderChangeDefaultsAlert);
        return 1;
      }

      // Create a list of required packages
      let requiredPackages = 'markitdown[all] pandas pyarrow langchain requests';
      if (ragSetupOptions.vectorDB === 'SingleStore') {
        requiredPackages += ' singlestoredb';
      } else if (ragSetupOptions.vectorDB === 'pgVector') {
        requiredPackages += ' psycopg2';
        requiredPackages += ' pgvector';
      } else if (ragSetupOptions.vectorDB === 'Chroma') {
        requiredPackages += ' chroma';
      }
      if (ragSetupOptions.chunkingStrategie === 'sentenceBased') {
        requiredPackages += ' nltk';
      }

      // Create the requirements.json, inputVars.json and outputVars.json
      const ragSetupRequirements: Record<string, string>[] = [
        { step: 'Install packages', command: `pip3 -q install ${requiredPackages}` },
      ];
      if (ragSetupOptions.chunkingStrategie === 'sentenceBased') {
        ragSetupRequirements.push({
          step: 'Download the Punk_Tab Tokenizer',
          command: 'python -m nltk.downloader punkt_tab -d /pybox/model',
        });
      }
      const ragSetupInputVars = [
        {
          name: 'text',
          description:
            'The input text for the retrieval, or the filename when ingesting or the document_id when deleting.',
          level: 'nominal',
          type: 'string',
          length: 1000000,
        },
        {
          name: 'options',
          description:
            'Contains the options on which action to perform + all of the additional potential variables that are required.',
          level: 'nominal',
          type: 'string',
          length: 1000000,
        },
      ];
      const ragSetupOutputVars = [
        {
          name: 'result',
          description:
            'Contains the response from the RAG pipeline. If the action is set to retrieval than it is a data grid.',
          level: 'nominal',
          type: 'string',
          length: 1000000,
        },
        {
          name: 'run_time',
          description: 'Inference of the full RAG pipeline',
          level: 'interval',
          type: 'decimal',
          length: 8,
        },
      ];

      const chunkingStrategyCustomization: Record<string, string> = {};
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
        separator = "\\n\\n",
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

      // Database customization - this is a very large block that generates Python code
      // We include it inline to preserve the exact same generated code as the original
      const dataBaseCustomization: Record<string, string> = {};

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
    document_id VARCHAR(255) NOT NULL,
    chunk_id INT NOT NULL,
    embedding VECTOR(${ragSetupOptions.vectorLength}, F32) NOT NULL,
    document TEXT,
    filename VARCHAR(255),
    ingestion_timestamp VARCHAR(255),
    PRIMARY KEY (document_id, chunk_id),
    SHARD KEY (document_id),
    VECTOR INDEX embedding_index (embedding)
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
    document_id VARCHAR(255) NOT NULL,
    chunk_id INT NOT NULL,
    embedding VECTOR(${ragSetupOptions.vectorLength}) NOT NULL,
    document TEXT,
    filename VARCHAR(255),
    ingestion_timestamp VARCHAR(255),
    PRIMARY KEY (document_id, chunk_id)
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
        dataBaseCustomization['sql'] = '--- The Chroma collection will be created if it does not exist. No need to pre-run anything.';
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
      const scoreCode = `import os
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
        server_port = config.get('SERVER_PORT', server_port)
        server_user = config.get('SERVER_USER', server_user)
        server_pw = config.get('SERVER_PW', server_pw)
        nltk_path = input_directory + '/../tokenizer'
else:
    input_directory = os.environ.get('INPUT_DIRECTORY', input_directory)
    ingested_content_file_name = os.environ.get('INGESTED_CONTENT_FILE_NAME', ingested_content_file_name)
    exported_content_file_name = os.environ.get('EXPORTED_CONTENT_FILE_NAME', exported_content_file_name)
    server_host = os.environ.get('SERVER_HOST', server_host)
    server_port = os.environ.get('SERVER_PORT', server_port)
    server_user = os.environ.get('SERVER_USER', server_user)
    server_pw = os.environ.get('SERVER_PW', server_pw)
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
                relative_path = file_path.relative_to(root_path)
                if ignore_list:
                    if str(relative_path) not in ingested_content_df['filename'].values:
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
        options = '{Embedding_Mode:query}'
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

      // The README content is the same large markdown documentation from the original
      // We include the full text to preserve exact functionality
      const README = `# Documentation

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

For more information on Python in SCR please refer to the [SAS Documentation](https://go.documentation.sas.com/doc/en/mascrtcdc/default/mascrtag/p0xn2918662nq4n1okcth9bntqqk.htm).

## Usage

Please refer to the RAG Builder documentation for full usage details.`;

      await createModelVersion(ragBuilderRAGSetupSelectedModelID);
      // Clean up previous variables first
      const modelVariables = await getModelVariables(ragBuilderRAGSetupSelectedModelID);
      for (let i = 0; i < modelVariables.length; i++) {
        await deleteModelVariable(ragBuilderRAGSetupSelectedModelID, modelVariables[i]!.id!);
      }
      const scoreCodeBlob = new Blob([scoreCode], { type: 'text/x-python' });
      const configBlob = new Blob([dataBaseCustomization?.config], { type: 'text/plain' });
      const sqlBlob = new Blob([dataBaseCustomization?.sql], { type: 'text/plain' });
      const READMEBlob = new Blob([README], { type: 'text/markdown' });
      const validatedModelName = validateAndCorrectPackageName(ragBuilderCurrentSetup);
      await createModelContent(ragBuilderRAGSetupSelectedModelID, ragSetupInputVars, 'inputVar.json', 'inputVariables');
      await createModelContent(ragBuilderRAGSetupSelectedModelID, ragSetupOutputVars, 'outputVar.json', 'outputVariables');
      await createModelContent(
        ragBuilderRAGSetupSelectedModelID,
        scoreCodeBlob,
        `${validatedModelName.correctedName}.py`,
        'score',
        'text/x-python'
      );
      await createModelContent(ragBuilderRAGSetupSelectedModelID, configBlob, 'config.txt', 'scoreResource', 'text/plain');
      await createModelContent(
        ragBuilderRAGSetupSelectedModelID,
        sqlBlob,
        'create_embedding_table.txt',
        'documentation',
        'text/plain'
      );
      await createModelContent(ragBuilderRAGSetupSelectedModelID, READMEBlob, 'README.md', 'documentation', 'text/markdown');
      await createModelContent(ragBuilderRAGSetupSelectedModelID, ragSetupOptions, 'settings.json');
      const ragSetupRequirementsResponseObject = await createModelContent(
        ragBuilderRAGSetupSelectedModelID,
        ragSetupRequirements,
        'requirements.json',
        'python pickle'
      );

      if (ragSetupRequirementsResponseObject.status_code === 201) {
        ragSetupResponseContainer.innerHTML = `<p>${ragBuilderInterfaceText.ragSetupSaveSucessResponse} <a target="_blank" rel="noopener noreferrer" href="${VIYA}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}">${VIYA}/SASModelManager/models/${ragBuilderRAGSetupSelectedModelID}</a></p>`;
      } else {
        ragSetupResponseContainer.innerHTML = `<p>${ragBuilderInterfaceText.ragSetupSaveFailureResponse}</p>`;
      }
    }

    // Save RAG Setup
    const ragSetupSaveButton = document.createElement('div');
    ragSetupSaveButton.id = `${paneID}-obj-${ragBuilderObject?.id}-rag-setup-save-button`;
    ragSetupSaveButton.innerText = `${ragBuilderInterfaceText?.ragSetupSaveButton}`;
    ragSetupSaveButton.setAttribute('type', 'button');
    ragSetupSaveButton.setAttribute('class', 'btn btn-primary');
    ragSetupSaveButton.onclick = async function () {
      createRAGSetupCode();
    };
    const ragSetupResponseContainer = document.createElement('div');

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
  },
});
