/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ObjectDefinition, InterfaceText } from '../types';

export interface ObjectBuilder {
  type: string;
  build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement>;
}

const registry = new Map<string, ObjectBuilder>();

export function registerObjectType(builder: ObjectBuilder): void {
  registry.set(builder.type, builder);
}

export function getObjectBuilder(type: string): ObjectBuilder | undefined {
  return registry.get(type);
}
