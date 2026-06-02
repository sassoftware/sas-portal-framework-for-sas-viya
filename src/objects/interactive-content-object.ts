/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import type { ObjectDefinition } from '../types';

registerObjectType({
  type: 'interactiveContent',
  async build(definition: ObjectDefinition, paneID: string): Promise<HTMLElement> {
    const { config } = getAppState();
    const def = definition as Record<string, unknown>;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    let link = def.link as string ?? '';
    if (def.isViyaContent) {
      link = config.viyaHost + link;
    }
    iframe.setAttribute('src', link);
    iframe.style.width = '100%';
    iframe.style.border = 'none';

    const exception = def.exception as {
      isException?: number;
      width?: number;
      height?: number;
    } | undefined;

    if (exception?.isException) {
      iframe.style.width = `${exception.width}px`;
      iframe.style.height = `${exception.height}px`;
    } else {
      iframe.style.height = (def.height as string) ?? '100%';
    }

    return iframe;
  },
});
