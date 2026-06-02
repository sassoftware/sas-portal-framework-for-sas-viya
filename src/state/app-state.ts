/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppConfig {
  viyaHost: string;
  portalFolderUri: string;
  portalName: string;
}

export interface AppState {
  config: AppConfig;
  csrfToken: string | null;
  userName: string | null;
  sasSessionId: string | null;
}

let state: AppState | null = null;

export function initAppState(config: AppConfig): void {
  state = {
    config,
    csrfToken: null,
    userName: null,
    sasSessionId: null,
  };
}

export function getAppState(): AppState {
  if (!state) {
    throw new Error('AppState not initialized. Call initAppState() first.');
  }
  return state;
}
