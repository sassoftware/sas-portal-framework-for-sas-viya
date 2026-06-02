/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import type { ObjectDefinition } from '../types';

registerObjectType({
  type: 'linkList',
  async build(definition: ObjectDefinition, paneID: string): Promise<HTMLElement> {
    const list = document.createElement('ul');
    list.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    const links = (definition as Record<string, unknown>).links as Array<{
      link: string;
      displayText: string;
    }> | undefined;

    if (links) {
      for (const linkItem of links) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = linkItem.link;
        a.innerText = linkItem.displayText;

        if ((definition as Record<string, unknown>).clickBehavior === 'tab') {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        }

        li.appendChild(a);
        list.appendChild(li);
      }
    }

    return list;
  },
});
