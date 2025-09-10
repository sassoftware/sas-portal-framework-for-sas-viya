/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Get summary report of a Data Mining Project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} mlpaProjectID  - The Data Mining Project ID of which you want the summary report
 *
 * @returns {Promise/String} - Returns a promise that if successfull contains the MLPA State
 */
async function getDataMiningProjectSummaryReport(
    VIYAHOST,
    dataMiningProjectID
) {
    const SUMMARYREPORTSJSON = await fetch(
        `${VIYAHOST}/dataMiningProjectResources/projects/${dataMiningProjectID}/summaryReports`,
        {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
            redirect: 'follow',
        }
    );
    return await SUMMARYREPORTSJSON.json();
}
