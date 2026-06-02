/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MasModule {
  id: string;
  name: string;
  description?: string;
  scope?: string;
  language?: string;
  version?: number;
  createdBy?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface MasModuleStep {
  id: string;
  moduleId?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface MasModuleInput {
  name: string;
  type: string;
  dim?: number;
  length?: number;
}

export interface MasModuleInformation {
  id: string;
  name: string;
  description?: string;
  scope?: string;
  language?: string;
  version?: number;
  createdBy?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  stepIds?: string[];
  warnings?: string[];
}

export interface MasScoreInput {
  name: string;
  value: string | number;
}

export interface MasScoreResult {
  moduleId?: string;
  stepId?: string;
  outputs?: Array<{ name: string; value: unknown }>;
  version?: number;
}
