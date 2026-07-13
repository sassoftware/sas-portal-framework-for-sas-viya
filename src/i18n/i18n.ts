/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Get Interface Language returns the language file based on the browser language setting.
 * Falls back to English if the browser language is not supported.
 */

import type { InterfaceText } from '../types';

export async function getInterfaceLanguage(): Promise<InterfaceText> {
  const browserLanguage = navigator.language.split('-')[0] ?? 'en';

  try {
    const response = await fetch(`./language/${browserLanguage}.json`);
    if (response.ok) {
      return (await response.json()) as InterfaceText;
    }
  } catch {
    // Fall through to English default
  }

  // Default to English
  const fallback = await fetch('./language/en.json');
  return (await fallback.json()) as InterfaceText;
}
