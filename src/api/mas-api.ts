/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaGet } from './http-client';
import type {
  MasModule,
  MasModuleInformation,
  MasScoreInput,
  MasScoreResult,
} from '../types/mas';
import type { SasApiCollection, DropdownOption } from '../types/api';

/**
 * Get all MAS modules with pagination, shaped for dropdown options.
 */
export async function getAllMasModules(
  placeholderText: string,
  start: number = 0,
  limit: number = 20,
  first: boolean = true
): Promise<DropdownOption[]> {
  const data = await viyaGet<SasApiCollection<MasModule>>(
    `/microanalyticScore/modules?start=${start}&limit=${limit}`
  );

  let options: DropdownOption[] = [];
  if (first) {
    options.push({ value: '', innerHTML: placeholderText });
  }

  if (data?.items) {
    for (const item of data.items) {
      options.push({ value: item.id, innerHTML: item.name });
    }
  }

  // Recursive pagination
  if (data?.items && data.items.length === limit) {
    const moreOptions = await getAllMasModules(
      placeholderText,
      start + limit,
      limit,
      false
    );
    options = options.concat(moreOptions);
  }

  return options;
}

/**
 * Get detailed information about a specific MAS module.
 */
export async function getMASModuleInformation(
  moduleID: string
): Promise<MasModuleInformation> {
  return viyaGet<MasModuleInformation>(
    `/microanalyticScore/modules/${moduleID}`
  );
}

/**
 * Get the source code of a MAS module.
 */
export async function getMASModuleCode(
  moduleID: string
): Promise<string> {
  const data = await viyaGet<{ source: string }>(
    `/microanalyticScore/modules/${moduleID}/source`
  );
  return data?.source ?? '';
}

/**
 * Get the inputs/outputs for a MAS module step.
 */
export async function getMASModuleInputs(
  moduleStepID: string
): Promise<MasModuleInformation> {
  return viyaGet<MasModuleInformation>(
    `/microanalyticScore/modules/${moduleStepID}`
  );
}

/**
 * Score a MAS module step with the given inputs.
 */
export async function scoreMASModule(
  moduleStepID: string,
  moduleStepInput: MasScoreInput[]
): Promise<MasScoreResult> {
  const response = await viyaFetch(
    `/microanalyticScore/modules/${moduleStepID}`,
    {
      method: 'POST',
      body: JSON.stringify({ inputs: moduleStepInput }),
    }
  );

  if (!response.ok && response.status === 400) {
    const errorText = await response.text();
    window.alert(errorText);
    return {} as MasScoreResult;
  }

  return response.json();
}

/**
 * Delete a MAS module.
 */
export async function deleteMASModule(
  moduleID: string
): Promise<number> {
  const response = await viyaFetch(
    `/microanalyticScore/modules/${moduleID}`,
    { method: 'DELETE' }
  );
  return response.status;
}
