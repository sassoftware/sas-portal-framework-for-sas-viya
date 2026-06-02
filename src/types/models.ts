/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelProject {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  repositoryId?: string;
  folderId?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  createdBy?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  algorithm?: string;
  tool?: string;
  targetVariable?: string;
  scoreCodeType?: string;
  trainTable?: string;
  function?: string;
  items?: Model[];
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface ModelContent {
  id?: string;
  name: string;
  role?: string;
  fileUri?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface ModelVariable {
  id?: string;
  name: string;
  role?: string;
  type?: string;
  length?: number;
  level?: string;
  order?: number;
}

export interface ModelRepository {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface ModelVersion {
  id: string;
  modelId: string;
  versionNumber: number;
  links?: Array<{ rel: string; href: string; method: string }>;
}
