/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export type ObjectType =
  | 'text'
  | 'linkList'
  | 'interactiveContent'
  | 'vaReport'
  | 'masScore'
  | 'clientAdministrator'
  | 'runCustomCode'
  | 'scrScore'
  | 'dataProductRegistry'
  | 'dataProductMarketplace'
  | 'promptBuilder'
  | 'ragBuilder'
  | 'sasContentVAReport'
  | 'sasContentJob'
  | 'jobDefinition';

export interface PageGeneral {
  name: string;
  shorthand: string;
  numCols?: number;
  contact?: string;
  showNameOnPage?: boolean;
  visible?: boolean;
}

export interface PageObjectReference {
  uri: string;
  name?: string;
}

export interface PageLayout {
  general: PageGeneral;
  objects: PageObjectReference[];
}

export interface PortalLayout {
  displayOrder?: FolderMemberReference[];
}

export interface FolderMemberReference {
  uri: string;
  name?: string;
  contentType?: string;
}

export interface ObjectDefinition {
  id: string;
  name: string;
  type: ObjectType;
  width?: number;
  height?: string;
  objectBorder?: boolean;
  showNameOnPage?: boolean;
  // Text object properties
  content?: string;
  // VA Report object properties
  reportURI?: string;
  pageName?: string;
  objectName?: string;
  // Link list properties
  links?: LinkItem[];
  // Interactive content properties
  url?: string;
  iframeHeight?: string;
  iframeWidth?: string;
  // MAS Score properties
  moduleFilter?: string;
  // Run custom code properties
  computeContext?: string;
  code?: string[];
  action?: string;
  actionElement?: string;
  unloadCode?: string[];
  // Data product properties
  schemaURI?: string;
  folderURI?: string;
  ownerFolderURI?: string;
  headerAttributes?: string[];
  copyContent?: string[];
  // Prompt builder / RAG properties
  deploymentType?: string;
  llmURL?: string;
  llmName?: string;
  // SAS Content properties
  contentFolderURI?: string;
  // Job Definition properties
  contentPath?: string;
  // Generic additional properties
  [key: string]: unknown;
}

export interface LinkItem {
  displayText: string;
  link: string;
  tabBehavior?: string;
  isViyaContent?: boolean;
}
