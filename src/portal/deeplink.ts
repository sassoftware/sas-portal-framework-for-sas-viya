/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tab deep-linking: activates tabs from URL hash and updates URL on tab change.
 */

function activateTab(tabId: string): void {
  const tabButton = document.getElementById(tabId);
  if (tabButton) {
    const bsTab = new bootstrap.Tab(tabButton);
    bsTab.show();
    history.pushState(null, '', '#' + tabId);
  } else {
    console.warn(`Tab button with ID '${tabId}' not found.`);
  }
}

export function initializeTabsAndDeeplinks(): void {
  let attempts = 0;
  const maxAttempts = 20;
  const intervalTime = 1000;

  const checkTabsInterval = setInterval(() => {
    const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');

    if (tabButtons.length > 0 && document.readyState === 'complete') {
      clearInterval(checkTabsInterval);
      const initialHash = window.location.hash.substring(1);
      if (initialHash) {
        activateTab(initialHash);
      } else {
        const activeTabButton = document.querySelector(
          '.nav-tabs .nav-link.active'
        );
        if (activeTabButton) {
          history.replaceState(null, '', '#' + activeTabButton.id);
        } else {
          const firstTabButton = document.querySelector(
            '.nav-tabs .nav-link'
          );
          if (firstTabButton) {
            activateTab(firstTabButton.id);
          }
        }
      }

      tabButtons.forEach((button) => {
        button.addEventListener('shown.bs.tab', function (event) {
          const newTabId = (event.target as HTMLElement).id;
          history.pushState(null, '', '#' + newTabId);
        });
      });
    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(checkTabsInterval);
        console.error(
          'Max attempts reached: Tab elements not found after',
          (maxAttempts * intervalTime) / 1000,
          'seconds.'
        );
      }
    }
  }, intervalTime);
}
