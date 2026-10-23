/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Load the deployment configuration from config.json next to index.html, so admins
 * can configure a deployed portal without rebuilding it.
 */

import type { AppConfig } from '../state/app-state';

const settingTypes: Record<keyof AppConfig, 'string' | 'boolean'> = {
  viyaHost: 'string',
  portalFolderUri: 'string',
  portalName: 'string',
  showViyaLink: 'boolean',
};

/**
 * Merge config.json over the built-in defaults from src/config.ts. Settings the file
 * leaves out — or all of them, if the file is missing or invalid — keep their defaults.
 */
export async function loadRuntimeConfig(defaults: AppConfig): Promise<AppConfig> {
  let overrides: unknown;
  try {
    // Never cache it, so edits on the web server apply on the next page load
    const response = await fetch('./config.json', { cache: 'no-store' });
    if (response.status === 404) {
      return defaults;
    }
    if (!response.ok) {
      console.error(`[config] Failed to load config.json (HTTP ${response.status}), using the built-in configuration`);
      return defaults;
    }
    overrides = await response.json();
  } catch (e) {
    console.error('[config] Failed to read config.json, using the built-in configuration:', e);
    return defaults;
  }

  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    console.error('[config] config.json must contain a JSON object, using the built-in configuration');
    return defaults;
  }

  const config: AppConfig = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in settingTypes)) {
      console.warn(`[config] Ignoring unknown setting "${key}" in config.json`);
      continue;
    }
    const setting = key as keyof AppConfig;
    if (typeof value !== settingTypes[setting]) {
      console.warn(`[config] Ignoring "${key}" in config.json: expected a ${settingTypes[setting]}`);
      continue;
    }

    if (setting === 'viyaHost') {
      // An empty value keeps the default (the portal's own origin)
      const host = (value as string).trim().replace(/\/+$/, '');
      if (host) config.viyaHost = host;
    } else if (setting === 'portalFolderUri') {
      // Accept the full folder URI as copied from SAS Environment Manager
      const folderId = (value as string).trim().replace(/^\/folders\/folders\//, '');
      if (folderId) config.portalFolderUri = folderId;
    } else if (setting === 'portalName') {
      config.portalName = value as string;
    } else {
      config.showViyaLink = value as boolean;
    }
  }
  return config;
}
