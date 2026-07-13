/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Compute session data-access API for browsing SAS libraries, tables, and columns.
 * Used by the JSON prompt renderer for inputtable, columnselector, and libraryselector controls.
 */

import { viyaGet } from './http-client';
import type { ColumnInfo, LibraryInfo, TableInfo } from '../types';

interface DataCollection<T> {
  items?: T[];
  count?: number;
  start?: number;
  limit?: number;
}

const COLLECTION_ACCEPT = 'application/vnd.sas.collection+json';

/**
 * Get all libraries available in the compute session.
 */
export async function getLibraries(
  sessionId: string
): Promise<LibraryInfo[]> {
  const data = await viyaGet<DataCollection<LibraryInfo>>(
    `/compute/sessions/${sessionId}/data?limit=500`,
    COLLECTION_ACCEPT
  );
  return data?.items ?? [];
}

/**
 * Get all tables in a library.
 */
export async function getTables(
  sessionId: string,
  libref: string
): Promise<TableInfo[]> {
  const data = await viyaGet<DataCollection<TableInfo>>(
    `/compute/sessions/${sessionId}/data/${encodeURIComponent(libref)}?limit=500`,
    COLLECTION_ACCEPT
  );
  return data?.items ?? [];
}

/**
 * Get all columns for a table.
 */
export async function getColumns(
  sessionId: string,
  libref: string,
  table: string
): Promise<ColumnInfo[]> {
  const data = await viyaGet<DataCollection<ColumnInfo>>(
    `/compute/sessions/${sessionId}/data/${encodeURIComponent(libref)}/${encodeURIComponent(table)}/columns?limit=500`,
    COLLECTION_ACCEPT
  );
  return data?.items ?? [];
}

/**
 * Get rows from a table. Returns an array of row arrays (cells).
 */
export async function getTableRows(
  sessionId: string,
  libref: string,
  table: string,
  start: number = 0,
  limit: number = 100
): Promise<Array<{ cells: string[] }>> {
  const data = await viyaGet<DataCollection<{ cells: string[] }>>(
    `/compute/sessions/${sessionId}/data/${encodeURIComponent(libref)}/${encodeURIComponent(table)}/rows?start=${start}&limit=${limit}`,
    COLLECTION_ACCEPT
  );
  return data?.items ?? [];
}

/**
 * Fetch unique values for a specific column in a table.
 * Fetches columns first to find the column index, then paginates through rows
 * and collects unique values for that column.
 */
export async function getUniqueColumnValues(
  sessionId: string,
  libref: string,
  table: string,
  columnName: string
): Promise<string[]> {
  // Find the column index
  const columns = await getColumns(sessionId, libref, table);
  const colIndex = columns.findIndex(
    (c) => c.name.toUpperCase() === columnName.toUpperCase()
  );
  if (colIndex === -1) {
    return [];
  }

  // Paginate through rows and collect unique values
  const uniqueValues = new Set<string>();
  const pageSize = 500;
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const rows = await getTableRows(sessionId, libref, table, start, pageSize);
    for (const row of rows) {
      const cellValue = row.cells[colIndex];
      if (cellValue != null && cellValue !== '') {
        uniqueValues.add(cellValue.trim());
      }
    }
    hasMore = rows.length === pageSize;
    start += pageSize;
  }

  return Array.from(uniqueValues).sort((a, b) => a.localeCompare(b));
}
