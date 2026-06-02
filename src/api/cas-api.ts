/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaFetch } from './http-client';

/**
 * Create a new CAS session on the specified server.
 */
export async function createCASSession(
  casServer: string
): Promise<string> {
  const response = await viyaFetch(
    `/casManagement/servers/${casServer}/sessions`,
    { method: 'POST' }
  );
  const session = await response.json();
  return session.id;
}

/**
 * Terminate a CAS session.
 */
export async function terminateCASSession(
  casServer: string,
  casSessionID: string
): Promise<number> {
  const response = await viyaFetch(
    `/casManagement/servers/${casServer}/sessions/${casSessionID}`,
    { method: 'DELETE' }
  );
  return response.status;
}
