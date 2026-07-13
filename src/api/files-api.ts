/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaGetRaw } from './http-client';
import type { FileResource } from '../types/api';

/**
 * Get the content of a file by its URI. Returns the raw Response for caller to parse.
 */
export async function getFileContent(
  fileURI: string,
  contentType: string = 'application/json'
): Promise<Response> {
  try {
    return await viyaGetRaw(`${fileURI}/content`, contentType);
  } catch {
    console.log(`The call to ${fileURI}/content was unsuccessful`);
    return new Response(null, { status: 500 });
  }
}

/**
 * Get a file resource (metadata, not content).
 */
export async function getFile(fileURI: string): Promise<Response> {
  return viyaFetch(fileURI, {
    accept:
      'application/vnd.sas.file+json;version=4,application/vnd.sas.file+json;version=3,application/vnd.sas.file+json;version=2,application/vnd.sas.file+json',
  });
}

/**
 * Create a new file in a folder.
 */
export async function createFile(
  parentFolderURI: string,
  content: Blob,
  fileName: string,
  contentType: string = 'application/json'
): Promise<Response> {
  return viyaFetch(
    `/files/files?parentFolderUri=${parentFolderURI}`,
    {
      method: 'POST',
      body: content,
      contentType,
      headers: {
        'Content-Disposition': `attachment;filename*=UTF-8''${fileName}`,
      },
    }
  );
}

/**
 * Update existing file content.
 */
export async function updateFileContent(
  fileURI: string,
  content: Blob
): Promise<Response> {
  // First get the file metadata for ETag and content type
  const fileResponse = await getFile(fileURI);
  const etag = fileResponse.headers.get('etag') ?? '';
  const fileContentType =
    fileResponse.headers.get('content-type') ?? 'application/json';

  return viyaFetch(`${fileURI}/content`, {
    method: 'PUT',
    body: content,
    contentType: fileContentType,
    headers: {
      'If-Match': etag,
    },
  });
}

/**
 * Copy a file to a target folder.
 */
export async function copyFile(
  fileToCopyURI: string,
  targetParentFolderURI: string
): Promise<Response> {
  return viyaFetch(
    `${fileToCopyURI}/copy?parentFolderUri=${targetParentFolderURI}`,
    { method: 'POST' }
  );
}

/**
 * Delete any SAS Viya content by URI.
 */
export async function deleteSASViyaContent(
  contentURI: string,
  urlParameter: string = ''
): Promise<{ responseCode: string; responseText: string }> {
  const response = await viyaFetch(`${contentURI}${urlParameter}`, {
    method: 'DELETE',
  });
  if (response.status === 204) {
    return { responseCode: 'success', responseText: 'Content deleted' };
  }
  return {
    responseCode: 'danger',
    responseText: `Delete failed with status ${response.status}`,
  };
}
