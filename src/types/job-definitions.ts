/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SasApiLink } from './api';

export interface JobDefinitionProperty {
  name: string;
  value: string;
  defaultValue?: string;
}

export interface JobDefinitionParameter {
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  label?: string;
}

export interface JobDefinition {
  id: string;
  name: string;
  description?: string;
  type?: string;
  code?: string;
  parameters?: JobDefinitionParameter[];
  properties?: JobDefinitionProperty[];
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  links?: SasApiLink[];
}

/** Response from POST /folders/paths (findByPath API) */
export interface FolderPathResolution {
  id: string;
  name: string;
  uri?: string;
  type?: string;
  contentType?: string;
  parentFolderUri?: string;
  links?: SasApiLink[];
}
