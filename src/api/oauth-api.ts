/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAppState } from '../state/app-state';
import type { OAuthClient } from '../types/oauth';
import type { DropdownOption } from '../types/api';

interface OAuthResponse {
  responseCode: string;
  responseText: string;
}

/**
 * Helper for OAuth API calls that use Bearer token auth.
 */
async function oauthFetch(
  path: string,
  method: string,
  accessToken: string,
  body?: string
): Promise<Response> {
  const { config } = getAppState();
  return fetch(`${config.viyaHost}${path}`, {
    method,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
}

/**
 * Get all OAuth clients, shaped for dropdown options.
 */
export async function getAllOAuthClients(
  placeholderText: string,
  start: number = 1,
  limit: number = 100,
  first: boolean = true
): Promise<DropdownOption[]> {
  const { config } = getAppState();
  const response = await fetch(
    `${config.viyaHost}/SASLogon/oauth/clients?startIndex=${start}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  let options: DropdownOption[] = [];
  if (first) {
    options.push({ value: '', innerHTML: placeholderText });
  }

  if (data?.resources) {
    for (const item of data.resources) {
      options.push({
        value: item.client_id,
        innerHTML: item.client_id,
      });
    }
  }

  if (data?.resources && data.resources.length === limit) {
    const more = await getAllOAuthClients(
      placeholderText,
      start + limit,
      limit,
      false
    );
    options = options.concat(more);
  }

  return options;
}

/**
 * Get details for a specific OAuth client.
 */
export async function getSpecificOAuthClient(
  oauthClientName: string
): Promise<OAuthClient> {
  const { config } = getAppState();
  const response = await fetch(
    `${config.viyaHost}/SASLogon/oauth/clients/${oauthClientName}`,
    {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );
  return response.json();
}

/**
 * Create a new OAuth client.
 */
export async function createOAuthClient(
  clientDefinition: string,
  accessToken: string
): Promise<OAuthResponse> {
  const response = await oauthFetch(
    '/SASLogon/oauth/clients',
    'POST',
    accessToken,
    clientDefinition
  );

  if (response.status === 201) {
    return {
      responseCode: 'success',
      responseText: await response.text(),
    };
  }
  return { responseCode: 'danger', responseText: await response.text() };
}

/**
 * Update an existing OAuth client.
 */
export async function updateOAuthClient(
  clientID: string,
  clientDefinition: string,
  accessToken: string
): Promise<OAuthResponse> {
  const response = await oauthFetch(
    `/SASLogon/oauth/clients/${clientID}`,
    'PUT',
    accessToken,
    clientDefinition
  );

  if (response.status === 200) {
    return {
      responseCode: 'success',
      responseText: await response.text(),
    };
  }
  return { responseCode: 'danger', responseText: await response.text() };
}

/**
 * Update an OAuth client's secret.
 */
export async function updateOAuthClientSecret(
  clientID: string,
  clientSecretBody: string,
  accessToken: string
): Promise<OAuthResponse> {
  const response = await oauthFetch(
    `/SASLogon/oauth/clients/${clientID}/secret`,
    'PUT',
    accessToken,
    clientSecretBody
  );

  if (response.status === 200) {
    return {
      responseCode: 'success',
      responseText: await response.text(),
    };
  }
  return { responseCode: 'danger', responseText: await response.text() };
}

/**
 * Delete an OAuth client.
 */
export async function deleteOAuthClient(
  clientID: string,
  accessToken: string
): Promise<OAuthResponse> {
  const response = await oauthFetch(
    `/SASLogon/oauth/clients/${clientID}`,
    'DELETE',
    accessToken
  );

  if (response.status === 200) {
    return {
      responseCode: 'success',
      responseText: 'Client deleted',
    };
  }
  return { responseCode: 'danger', responseText: await response.text() };
}
