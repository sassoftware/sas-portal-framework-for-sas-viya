/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaPost } from './http-client';
import type { FolderMember, FolderResource } from '../types/api';

/**
 * Get all items of a folder by the folder's URI.
 */
export async function getFolderContent(
  folderURI: string,
  urlParams: string = ''
): Promise<FolderMember[] | undefined> {
  try {
    const response = await viyaFetch(`${folderURI}/members${urlParams}`);
    const data = await response.json();
    return data?.items;
  } catch {
    console.log(
      `The call to ${folderURI}${urlParams} was unsuccessful`
    );
  }
}

/**
 * Create a new folder under a parent folder.
 */
export async function createFolder(
  folderName: string,
  parentFolderURI: string,
  folderDescription: string = ''
): Promise<FolderResource> {
  return viyaPost<FolderResource>(
    `/folders/folders?parentFolderUri=${parentFolderURI}`,
    { name: folderName, description: folderDescription }
  );
}
