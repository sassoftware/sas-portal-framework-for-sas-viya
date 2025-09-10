/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a Run Custom Code Object
 *
 * @param {Object} runCustomCodeObject - Contains the definition of the Run Custom Code Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns an empty div
 */
async function addRunCustomCode(runCustomCodeObject, paneID) {
  // Run Custom Code Container
  let runCustomCodeContainer = document.createElement('div');
  runCustomCodeContainer.setAttribute('id', `${paneID}-obj-${runCustomCodeObject?.id}`);
  // Get URL search paramaters for code evaluation
  let searchParams = getAllURLSearchParams();
  // retrieve the compute session
  let computeContext = await getComputeContext(window.VIYA, `eq(name,'${runCustomCodeObject?.computeContext}')`);
  let computeContextID = computeContext[0].id;
  // Check if a SAS Session already exists 
  if(!window.SASSESSION) {
    window.SASSESSION = await createSASSession(window.VIYA, computeContextID);
  }
  // Submit the code
  let response = await submitSASCode(window.VIYA, window.SASSESSION, eval(runCustomCodeObject?.code));
  // Check if the user as specified an action
  if(runCustomCodeObject?.action) {
    switch(runCustomCodeObject?.action) {
      case 'reloadReport':
        document.getElementById(runCustomCodeObject?.actionElement).getReportHandle().then((reportHandle) => {reportHandle.reloadReport()})
        break;
      case 'refreshData':
        document.getElementById(runCustomCodeObject?.actionElement).getReportHandle().then((reportHandle) => {reportHandle.refreshData()})
        break;
      default:
        console.log(`The ${runCustomCodeObject?.action} isn't supported at this time.`);
    }
  }
  // Check if the user wants an unload event
  if(eval(runCustomCodeObject?.unloadCode).length > 0) {
    window.addEventListener('beforeunload', function (event) {
      submitSASCode(window.VIYA, window.SASSESSION, eval(runCustomCodeObject?.unloadCode));
      terminateSASSession(window.VIYA, window.SASSESSION);
    });
  }

  return runCustomCodeContainer;
}