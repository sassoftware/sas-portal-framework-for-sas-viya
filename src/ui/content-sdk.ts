/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Helpers for the SAS Content SDK web components.
 */

interface SasContentProviderElement extends HTMLElement {
  accessRef?: { addChild?: unknown };
}

interface SasContentChildElement extends HTMLElement {
  onSelect: unknown;
}

/**
 * Make a sas-content-area (or other child) render once its sas-content-group is ready.
 *
 * A child hands itself to the group via `group.accessRef.addChild`, which the group
 * only registers after its own React tree has mounted. When both connect in the same
 * tick (as when the portal attaches a pane), the child's first render is silently
 * dropped and never retried. Wait for the group, then re-assign a property so the
 * child renders again — `addChild` replaces an existing entry, so this is harmless
 * if the first render did succeed.
 */
export function renderWhenGroupReady(
  group: HTMLElement,
  child: HTMLElement,
  isCurrent: () => boolean = () => true
): void {
  const provider = group as SasContentProviderElement;
  const element = child as SasContentChildElement;
  const deadline = Date.now() + 60_000;

  const check = () => {
    if (!isCurrent() || Date.now() > deadline) return;
    if (provider.isConnected && typeof provider.accessRef?.addChild === 'function') {
      // The property setter schedules a re-render
      element.onSelect = element.onSelect;
      return;
    }
    setTimeout(check, 100);
  };
  check();
}
