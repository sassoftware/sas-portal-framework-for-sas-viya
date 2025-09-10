/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns the Scored Results of a MAS Module
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} moduleStepID - The ID of the MAS module which is to be scored
 * @param {Array of Objects} moduleStepInput - An array of input objects for the MAS Module
 * @returns {Promise/Object of MAS Module} - Returns a Promise that should resolve into the scored results
 */
async function scoreMASModule(VIYAHOST, moduleStepID, moduleStepInput) {
  let MASSCORE = await fetch(
    `${VIYAHOST}/microanalyticScore/modules/${moduleStepID}`,
    {
      // mode: 'no-cors',
      method: 'post',
      headers: {
        credentials: 'include',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN':
          document?.csrfToken != undefined ? document.csrfToken : '',
      },
      body: JSON.stringify({
        inputs: moduleStepInput,
      }),
      redirect: 'follow',
    }
  );
  if (!MASSCORE.ok) {
    if (
      MASSCORE.status === 403 &&
      MASSCORE.headers.get('x-forbidden-reason') === 'CSRF'
    ) {
      let h = MASSCORE.headers.get('x-csrf-header');
      let t = MASSCORE.headers.get('x-csrf-token');
      document.csrfToken = t;
      MASSCORE = await fetch(
        `${VIYAHOST}/microanalyticScore/modules/${moduleStepID}`,
        {
          // mode: 'no-cors',
          method: 'post',
          headers: {
            credentials: 'include',
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': t,
          },
          body: JSON.stringify({
            inputs: moduleStepInput,
          }),
          redirect: 'follow',
        }
      );
    } else if (MASSCORE.status === 400) {
      window.alert(await MASSCORE.json());
    }
  }

  const MASSCORECONTENT = await MASSCORE.json();
  return MASSCORECONTENT;
}
