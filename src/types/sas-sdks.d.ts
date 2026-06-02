/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Ambient type declarations for SAS SDKs loaded via CDN
 */

declare namespace sasAuthBrowser {
  interface CookieAuthenticationCredentialOptions {
    url: string;
  }

  interface CookieAuthenticationCredential {
    checkAuthenticated(): Promise<void>;
    loginPopup(): Promise<void>;
    logout(): Promise<void>;
  }

  function createCookieAuthenticationCredential(
    options: CookieAuthenticationCredentialOptions
  ): CookieAuthenticationCredential;
}

declare namespace bootstrap {
  class Tab {
    constructor(element: Element);
    show(): void;
  }

  class Modal {
    constructor(element: Element, options?: Record<string, unknown>);
    show(): void;
    hide(): void;
    static getInstance(element: Element): Modal | null;
  }

  class Collapse {
    constructor(element: Element, options?: Record<string, unknown>);
    show(): void;
    hide(): void;
    toggle(): void;
  }
}
