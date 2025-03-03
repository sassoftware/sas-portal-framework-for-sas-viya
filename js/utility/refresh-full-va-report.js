/**
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
