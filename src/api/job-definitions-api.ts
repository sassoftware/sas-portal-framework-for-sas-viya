/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaPost, viyaGet } from './http-client';
import type { FolderPathResolution, JobDefinition } from '../types';

interface FolderMemberDetail {
  id: string;
  name: string;
  uri: string;
  type?: string;
  contentType?: string;
  parentFolderUri?: string;
}

/**
 * Resolve a SAS Content path (e.g. "/Public/Content/SAS Jobs/Display Macro Variables")
 * to a job definition URI (e.g. "/jobDefinitions/definitions/{id}").
 *
 * Uses the folders findByPath API (POST /folders/paths) to locate the folder member,
 * then follows the member URI to get the job definition URI.
 */
export async function resolveJobDefinitionPath(
  contentPath: string
): Promise<string | null> {
  // Split path into segments, filtering out empty strings from leading slash
  const items = contentPath.split('/').filter((s) => s.length > 0);

  if (items.length === 0) {
    return null;
  }

  try {
    // Step 1: Resolve path to folder member via findByPath
    const pathResult = await viyaPost<FolderPathResolution>(
      '/folders/paths',
      { items, contentType: 'jobDefinition' },
      'application/vnd.sas.content.folder.path+json'
    );

    // Find the self link to get the full member details
    const selfLink = pathResult.links?.find((l) => l.rel === 'self');
    if (!selfLink) {
      return null;
    }

    // Step 2: Follow the self link to get the member detail with the job definition URI
    const memberDetail = await viyaGet<FolderMemberDetail>(selfLink.uri);

    return memberDetail.uri ?? null;
  } catch (e) {
    console.error(
      `Failed to resolve job definition path: ${contentPath}`,
      e
    );
    return null;
  }
}

/**
 * Get a job definition by its URI.
 */
export async function getJobDefinition(
  definitionUri: string
): Promise<JobDefinition> {
  return viyaGet<JobDefinition>(definitionUri);
}
