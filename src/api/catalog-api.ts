/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch, viyaGet } from './http-client';

/**
 * Search the Information Catalog with pagination.
 */
export async function searchInformationCatalog(
  searchString: string,
  searchIndex: string = '',
  searchType: string = 'free',
  searchStartCounter: number = 0,
  searchLimit: number = 50
): Promise<unknown[]> {
  const indexParam = searchIndex ? `&index=${searchIndex}` : '';
  const facetPrefix = searchType === 'facet' ? '/facets' : '';
  const startParam =
    searchStartCounter > 0 ? `&start=${searchStartCounter}` : '';

  const data = await viyaGet<{ items?: unknown[]; count?: number }>(
    `/catalog/search${facetPrefix}?q=${searchString}${indexParam}${startParam}`
  );

  let results: unknown[] = [];
  if (data?.items) {
    results = results.concat(data.items);
  }

  // Recursive pagination
  if (data?.items && data.items.length > 0) {
    const more = await searchInformationCatalog(
      searchString,
      searchIndex,
      searchType,
      searchStartCounter + 10,
      searchLimit
    );
    results = results.concat(more);
  }

  return results;
}

/**
 * Get a specific Information Catalog instance.
 */
export async function getInformationCatalogInstance(
  instanceID: string,
  query: string
): Promise<unknown> {
  const response = await viyaFetch('/catalog/instances', {
    method: 'POST',
    body: JSON.stringify({
      query,
      parameters: { instanceId: instanceID },
    }),
    accept: 'application/vnd.sas.metadata.instance.archive+json',
    contentType: 'application/vnd.sas.metadata.instance.query+json',
  });
  return response.json();
}
