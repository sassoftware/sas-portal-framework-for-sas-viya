/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OAuthClient {
  client_id: string;
  name?: string;
  scope?: string[];
  authorized_grant_types?: string[];
  redirect_uri?: string[];
  access_token_validity?: number;
  refresh_token_validity?: number;
  authorities?: string[];
  autoapprove?: string[];
  allowedorigins?: string[];
}
