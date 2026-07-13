/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FolderMember {
  id?: string;
  name: string;
  uri: string;
  contentType?: string;
  type?: string;
  parentFolderUri?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
}

export interface SasApiCollection<T> {
  items: T[];
  count?: number;
  start?: number;
  limit?: number;
  links?: SasApiLink[];
}

export interface SasApiLink {
  method: string;
  rel: string;
  href: string;
  uri: string;
  type?: string;
}

/**
 * View-model shape used to populate <option> elements in dropdowns.
 */
export interface DropdownOption {
  value: string;
  innerHTML: string;
}

export interface UserInfo {
  id: string;
  name: string;
  title?: string;
  emailAddresses?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

export interface FileResource {
  id: string;
  name: string;
  parentUri?: string;
  contentType?: string;
  size?: number;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  links?: SasApiLink[];
}

export interface FolderResource {
  id: string;
  name: string;
  description?: string;
  parentFolderUri?: string;
  creationTimeStamp?: string;
  modifiedTimeStamp?: string;
  links?: SasApiLink[];
}
