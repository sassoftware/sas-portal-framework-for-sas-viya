/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch } from './http-client';

interface SCRInput {
  name: string;
  value: string | number;
}

/**
 * Get SCR metadata (inputs and outputs) from the OpenAPI endpoint.
 */
export async function getSCRMetadata(
  endpoint: string
): Promise<[Record<string, unknown>, Record<string, unknown>] | [string]> {
  try {
    const response = await fetch(`${endpoint}/apiMeta/api`);
    if (!response.ok) {
      return [
        `Request for ${endpoint} failed with the HTTP code: ${response.status} - please check the SCR endpoint.`,
      ];
    }
    const data = await response.json();
    const definitions = data?.definitions ?? data?.components?.schemas ?? {};
    // Drill down to the field map: definitions.PCRInput.properties.data.properties
    const inputs = definitions?.PCRInput?.properties?.data?.properties ?? {};
    const outputs = definitions?.PCROutput?.properties?.data?.properties ?? {};
    return [inputs, outputs];
  } catch {
    return ['Error fetching SCR metadata'];
  }
}

/**
 * Score using an SCR endpoint.
 */
export async function scoreSCR(
  scrEndpoint: string,
  scrInput: SCRInput[]
): Promise<unknown> {
  const response = await viyaFetch(scrEndpoint, {
    method: 'POST',
    body: JSON.stringify({ inputs: scrInput }),
  });

  if (!response.ok && response.status === 400) {
    const errorText = await response.text();
    window.alert(errorText);
    return {};
  }

  return response.json();
}

/**
 * Call an LLM deployed via SCR.
 */
export async function callSCRLLM(
  scrEndpoint: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: Record<string, unknown> = {},
  deploymentType: string = 'k8s'
): Promise<unknown> {
  let llmURL: string;
  if (deploymentType === 'aca') {
    llmURL = `https://${model.replaceAll('_', '-')}.${scrEndpoint}/${model}`;
  } else {
    llmURL = `${scrEndpoint}/${model}/${model}`;
  }

  // Build options string
  let optionsString = '';
  for (const [key, value] of Object.entries(options)) {
    optionsString += `,"${key}": ${JSON.stringify(value)}`;
  }

  const body = `{"inputs": [{"name": "SYS_PROMPT", "value": ${JSON.stringify(systemPrompt)}}, {"name": "USER_PROMPT", "value": ${JSON.stringify(userPrompt)}}${optionsString}]}`;

  try {
    const response = await fetch(llmURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (response.status !== 200) {
      return { error: `LLM call failed with status ${response.status}` };
    }

    return response.json();
  } catch (e) {
    return { error: String(e) };
  }
}
