/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * This function refreshes a SAS Visual Analytics report
 * @param {String} OBJECTID - ID of the <sas-report> HTML element
 */
function refreshVAReport(OBJECTID) {
    document
        .getElementById(OBJECTID)
        .getReportHandle()
        .then((e) => {
            e.reloadReport();
        });
}
