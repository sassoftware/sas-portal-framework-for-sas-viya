/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * A function that checks a string for being a valid Python package name:
 * - https://peps.python.org/pep-0508/
 * - https://peps.python.org/pep-0008/
 * @param {String} name - Potential name of the variable
 * @returns {Object} - has two attributes isValid {Boolean} and correctedName {String}
 */
function validateAndCorrectPackageName(inputString) {
  // Convert to lowercase and replace invalid characters with hyphens
  let correctedName = inputString.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Remove leading/trailing and consecutive hyphens
  correctedName = correctedName.replace(/^-+|-+$/g, '').replace(/-{2,}/g, '');

  // Determine if the original input was already valid
  const isValid = inputString === correctedName;

  // Handle edge case of an empty corrected name
  if (correctedName === '') {
    return {
      isValid: false,
      correctedName: 'invalidpackagename'
    };
  }

  // 5. Return the result object
  return {
    isValid: isValid,
    correctedName: correctedName
  };
}