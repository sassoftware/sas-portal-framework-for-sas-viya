/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AppConfig } from './state/app-state';

export const config: AppConfig = {
  // SAS Viya host URL
  viyaHost: window.location.origin,
  // SAS Viya content folder that contains the portal structure
  portalFolderUri: '68384628-8305-4285-9f16-0cdc57d13dc5',
  // Name that appears in the top left of the portal
  portalName: 'SAS Portal',
};
