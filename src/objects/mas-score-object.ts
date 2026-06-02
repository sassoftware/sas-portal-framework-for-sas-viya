/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition, InterfaceText } from '../types';
import {
  getAllMasModules,
  getMASModuleInformation,
  getMASModuleCode,
  getMASModuleInputs,
  scoreMASModule,
  deleteMASModule,
} from '../api/mas-api';
import { createAccordionItem, addAccordionBody } from '../ui/accordion';
import { addRowToTable } from '../ui/table';

registerObjectType({
  type: 'masScore',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const masInterfaceText = (interfaceText?.masScore ?? {}) as Record<string, string>;
    const objId = definition?.id;

    // Create MAS Score Container
    const masContainer = document.createElement('div');
    masContainer.setAttribute('id', `${paneID}-obj-${objId}`);
    masContainer.setAttribute('class', 'row row-col-2 gy-3');

    // Create Right Side Column
    const masRightSide = document.createElement('div');
    masRightSide.setAttribute('class', 'col-8 p-3');
    masRightSide.style.border = '0.2em solid lightgray';

    const masAccordion = document.createElement('div');
    masAccordion.setAttribute('class', 'accordion accordion-flush');
    masAccordion.setAttribute('id', `${objId}-accordion`);

    createAccordionItem(masAccordion, `${objId}-accordion`, 'moduleInfo', masInterfaceText);
    createAccordionItem(masAccordion, `${objId}-accordion`, 'moduleCode', masInterfaceText);
    createAccordionItem(masAccordion, `${objId}-accordion`, 'stepInputs', masInterfaceText);
    createAccordionItem(masAccordion, `${objId}-accordion`, 'stepOutputs', masInterfaceText);
    masRightSide.appendChild(masAccordion);

    // Create Left Side Column
    const masLeftSide = document.createElement('div');
    masLeftSide.setAttribute('class', 'col-4 p-3');
    masLeftSide.style.border = '0.2em solid lightgray';

    // Module Selector
    const moduleHeading = document.createElement('p');
    moduleHeading.setAttribute('class', 'fs-3');
    moduleHeading.innerText = `${masInterfaceText?.moduleSelect}:`;

    const moduleDropdown = document.createElement('select');
    moduleDropdown.setAttribute('class', 'form-select');
    moduleDropdown.setAttribute('id', `${objId}-module-dropdown`);
    moduleDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      const currentModule = self.options[self.selectedIndex]!.value;
      const masInfo = await getMASModuleInformation(currentModule);

      // Reset step dropdown
      const stepDropdown = document.getElementById(`${objId}-step-dropdown`) as HTMLSelectElement | null;
      if (stepDropdown) {
        stepDropdown.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = masInterfaceText?.stepSelect ?? '';
        defaultOpt.innerHTML = masInterfaceText?.stepSelect ?? '';
        stepDropdown.append(defaultOpt);

        if (masInfo?.stepIds) {
          for (const stepId of masInfo.stepIds) {
            const opt = document.createElement('option');
            opt.value = `${currentModule}/steps/${stepId}`;
            opt.innerHTML = stepId;
            stepDropdown.append(opt);
            if (['execute', 'score'].includes(stepId)) {
              stepDropdown.value = `${currentModule}/steps/${stepId}`;
              stepDropdown.dispatchEvent(new Event('change'));
            }
          }
        }
      }

      // Build info table
      const infoObj = masInfo as unknown as Record<string, unknown>;
      delete infoObj.links;
      delete infoObj.properties;
      delete infoObj.stepIds;
      delete infoObj.warnings;

      const infoContent = Object.entries(infoObj).map(([key, value]) => [
        key,
        String(value),
      ]);

      addAccordionBody(
        `${objId}-accordion`, 'moduleInfo', 'table',
        {
          headers: [masInterfaceText?.moduleInfoAttribute ?? '', masInterfaceText?.moduleInfoValue ?? ''],
          content: infoContent,
        },
        masInterfaceText?.moduleDownloadButton
      );

      // Get module code
      const moduleCode = await getMASModuleCode(currentModule);
      addAccordionBody(
        `${objId}-accordion`, 'moduleCode', 'code', moduleCode,
        masInterfaceText?.moduleDownloadButton,
        masInterfaceText?.moduleCodeClipboard
      );
    };

    // Populate module dropdown
    const modules = await getAllMasModules(masInterfaceText?.moduleSelect ?? '');
    for (const mod of modules) {
      const opt = document.createElement('option');
      opt.value = mod.value;
      opt.innerHTML = mod.innerHTML;
      moduleDropdown.append(opt);
    }

    // Step Selector
    const moduleStepHeading = document.createElement('p');
    moduleStepHeading.setAttribute('class', 'fs-3');
    moduleStepHeading.innerText = `${masInterfaceText?.stepSelect}:`;

    const moduleStepDropdown = document.createElement('select');
    moduleStepDropdown.setAttribute('class', 'form-select');
    moduleStepDropdown.setAttribute('id', `${objId}-step-dropdown`);
    moduleStepDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      const currentStep = self.options[self.selectedIndex]!.value;
      const masInputs = await getMASModuleInputs(currentStep);

      addAccordionBody(`${objId}-accordion`, 'stepInputs', 'input', (masInputs as unknown as Record<string, unknown>)?.inputs);

      const outputs = ((masInputs as unknown as Record<string, unknown>)?.outputs as Array<{ name: string }>) ?? [];
      const outputHeaders = outputs.map((o) => o.name);
      addAccordionBody(
        `${objId}-accordion`, 'stepOutputs', 'table',
        { headers: outputHeaders, content: [] },
        masInterfaceText?.moduleDownloadButton
      );
    };

    const defaultStepOpt = document.createElement('option');
    defaultStepOpt.value = masInterfaceText?.stepSelect ?? '';
    defaultStepOpt.innerHTML = masInterfaceText?.stepSelect ?? '';
    moduleStepDropdown.append(defaultStepOpt);

    // Refresh Button
    const refreshButton = document.createElement('button');
    refreshButton.setAttribute('id', `${objId}-accordion-refreshDelete-button`);
    refreshButton.setAttribute('type', 'button');
    refreshButton.setAttribute('class', 'btn btn-primary');
    refreshButton.innerText = masInterfaceText?.moduleRefresh ?? 'Refresh';
    refreshButton.onclick = async () => {
      const dd = document.getElementById(`${objId}-module-dropdown`);
      const sd = document.getElementById(`${objId}-step-dropdown`);
      if (dd) dd.innerHTML = '';
      const refreshedModules = await getAllMasModules(masInterfaceText?.moduleSelect ?? '');
      for (const mod of refreshedModules) {
        const opt = document.createElement('option');
        opt.value = mod.value;
        opt.innerHTML = mod.innerHTML;
        dd?.append(opt);
      }
      if (sd) {
        sd.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = masInterfaceText?.stepSelect ?? '';
        opt.innerHTML = masInterfaceText?.stepSelect ?? '';
        sd.append(opt);
      }
      masAccordion.innerHTML = '';
      createAccordionItem(masAccordion, `${objId}-accordion`, 'moduleInfo', masInterfaceText);
      createAccordionItem(masAccordion, `${objId}-accordion`, 'moduleCode', masInterfaceText);
      createAccordionItem(masAccordion, `${objId}-accordion`, 'stepInputs', masInterfaceText);
      createAccordionItem(masAccordion, `${objId}-accordion`, 'stepOutputs', masInterfaceText);
    };

    // Delete Button
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.setAttribute('id', `${objId}-accordion-stepDelete-button`);
    deleteButton.setAttribute('class', 'btn btn-primary');
    deleteButton.innerText = masInterfaceText?.moduleDelete ?? 'Delete';
    deleteButton.onclick = async () => {
      const dd = document.getElementById(`${objId}-module-dropdown`) as HTMLSelectElement | null;
      if (!dd) return;
      const currentModuleValue = dd.options[dd.selectedIndex]!.value;
      const status = await deleteMASModule(currentModuleValue);
      if (status === 204) {
        window.alert(masInterfaceText?.successfullModuleDeletion);
        document.getElementById(`${objId}-accordion-refreshDelete-button`)?.click();
      } else {
        window.alert(masInterfaceText?.failedModuleDeletion);
      }
    };

    // Score Button
    const scoreButton = document.createElement('button');
    scoreButton.setAttribute('type', 'button');
    scoreButton.setAttribute('id', `${objId}-accordion-stepInputs-button`);
    scoreButton.setAttribute('class', 'btn btn-primary');
    scoreButton.innerText = masInterfaceText?.moduleScore ?? 'Score';
    scoreButton.onclick = async () => {
      const submitForm = document.getElementById(`${objId}-accordion-stepInputs-content`);
      if (!submitForm) return;
      const inputs = Array.from(submitForm.querySelectorAll('input')).map((x) => ({
        name: x.id,
        value: isNaN(parseFloat(x.value)) ? x.value : parseFloat(x.value),
      }));

      const stepDD = document.getElementById(`${objId}-step-dropdown`) as HTMLSelectElement | null;
      if (!stepDD) return;
      const currentStepValue = stepDD.options[stepDD.selectedIndex]!.value;
      const result = await scoreMASModule(currentStepValue, inputs);

      if (result?.outputs) {
        const row = result.outputs.map((o) => String((o as { value: unknown }).value));
        const tableBody = document.getElementById(`${objId}-accordion-stepOutputs-tableBody`);
        if (tableBody) addRowToTable(tableBody, [row]);
      }
    };

    // CSV upload for random scoring
    const importHeader = document.createElement('p');
    importHeader.setAttribute('class', 'fs-5');
    importHeader.innerText = `${masInterfaceText?.scoreImportHeader ?? 'Import CSV'}:`;

    let randomData: string[][] = [];
    const importInput = document.createElement('input');
    importInput.setAttribute('class', 'form-control');
    importInput.setAttribute('type', 'file');
    importInput.setAttribute('accept', '.csv');
    importInput.onchange = function () {
      const self = this as unknown as HTMLInputElement;
      if (!self.files?.[0]) return;
      const reader = new FileReader();
      reader.readAsBinaryString(self.files[0]);
      reader.onloadend = () => {
        randomData = [];
        randomData.push((reader.result as string).split('\n'));
      };
    };

    const randomScoreButton = document.createElement('button');
    randomScoreButton.setAttribute('type', 'button');
    randomScoreButton.setAttribute('class', 'btn btn-primary');
    randomScoreButton.innerText = masInterfaceText?.scoreRandom ?? 'Score Random';
    randomScoreButton.onclick = async () => {
      if (!randomData[0]) return;
      const randomRow = randomData[0][Math.floor(Math.random() * randomData[0].length)]!.split(',');
      const submitForm = document.getElementById(`${objId}-accordion-stepInputs-content`);
      if (!submitForm) return;
      const values = Array.from(submitForm.querySelectorAll('input')).map((x, i) => ({
        name: x.id,
        value: isNaN(parseFloat(randomRow[i] ?? '')) ? (randomRow[i] ?? '') : parseFloat(randomRow[i]!),
      }));

      const stepDD = document.getElementById(`${objId}-step-dropdown`) as HTMLSelectElement | null;
      if (!stepDD) return;
      const currentStepValue = stepDD.options[stepDD.selectedIndex]!.value;
      const result = await scoreMASModule(currentStepValue, values);

      if (result?.outputs) {
        const row = result.outputs.map((o) => String((o as { value: unknown }).value));
        const tableBody = document.getElementById(`${objId}-accordion-stepOutputs-tableBody`);
        if (tableBody) addRowToTable(tableBody, [row]);
      }
    };

    // Assemble left side
    masLeftSide.appendChild(moduleHeading);
    masLeftSide.appendChild(moduleDropdown);
    masLeftSide.appendChild(moduleStepHeading);
    masLeftSide.appendChild(moduleStepDropdown);
    masLeftSide.appendChild(document.createElement('br'));
    masLeftSide.appendChild(refreshButton);
    masLeftSide.appendChild(deleteButton);
    masLeftSide.appendChild(scoreButton);
    masLeftSide.appendChild(document.createElement('br'));
    masLeftSide.appendChild(importHeader);
    masLeftSide.appendChild(importInput);
    masLeftSide.appendChild(document.createElement('br'));
    masLeftSide.appendChild(randomScoreButton);

    masContainer.appendChild(masLeftSide);
    masContainer.appendChild(masRightSide);

    return masContainer;
  },
});
