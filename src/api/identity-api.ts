/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { viyaGet } from './http-client';
import type { UserInfo } from '../types/api';

/**
 * Get information about the currently authenticated user.
 */
export async function getUserInfo(
  contentType: string = 'application/json'
): Promise<UserInfo | undefined> {
  try {
    return await viyaGet<UserInfo>(
      '/identities/users/@currentUser',
      contentType
    );
  } catch {
    console.log('Unable to retrieve user information');
  }
}
