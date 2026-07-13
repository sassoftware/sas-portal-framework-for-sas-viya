/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComputeContext {
  id: string;
  name: string;
  description?: string;
  version?: number;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface ComputeSession {
  id: string;
  name?: string;
  state?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface ComputeJob {
  id: string;
  state?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

export interface CasSession {
  id: string;
  name?: string;
  state?: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}
