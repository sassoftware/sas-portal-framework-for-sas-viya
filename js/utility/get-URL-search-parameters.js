/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Retrieves all URL parameters currently available
 * 
 * @returns {Object} - of all the URL paramters
 */
function getAllURLSearchParams() {
    return Object.fromEntries(new URLSearchParams(document.location.search))
}