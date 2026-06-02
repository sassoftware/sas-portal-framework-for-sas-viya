/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition } from '../types';

registerObjectType({
  type: 'text',
  async build(definition: ObjectDefinition, paneID: string): Promise<HTMLElement> {
    const zeroMd = document.createElement('zero-md');
    zeroMd.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    const script = document.createElement('script');
    script.setAttribute('type', 'text/markdown');
    script.textContent = definition?.content ?? '';

    zeroMd.appendChild(script);
    return zeroMd;
  },
});
