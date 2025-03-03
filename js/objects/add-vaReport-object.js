/**
 * Creates a VA Report Object
 *
 * @param {Object} vaReportObject - Contains the definition of the VAReport Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a VA Report object
 */
async function addVAReportObject(vaReportObject, paneID) {
    let vaReportContainer = document.createElement('div');
    vaReportContainer.setAttribute('id', `${paneID}-obj-${vaReportObject?.id}`);

    // Check for full report, page or object
    let vaDisplayObject;
    if (vaReportObject?.pageName) {
        vaDisplayObject = document.createElement('sas-report-page');
        vaDisplayObject.setAttribute('pageName', vaReportObject?.pageName);
    } else if (vaReportObject?.objectName) {
        vaDisplayObject = document.createElement('sas-report-object');
        vaDisplayObject.setAttribute('objectName', vaReportObject?.objectName);
    } else {
        vaDisplayObject = document.createElement('sas-report');
        // Hide Navigation if designated by the user
        if (vaReportObject?.hideNavigation === true) {
            vaDisplayObject.setAttribute('hideNavigation', true);
        } else if (vaReportObject?.hideNavigation === false) {
            vaDisplayObject.setAttribute('hideNavigation', false);
        }
    }

    // Add universal attributes
    // Add height to the object
    if (typeof vaReportObject?.reportHeight === 'string') {
        vaDisplayObject.style.height = vaReportObject?.reportHeight;
    } else {
        vaDisplayObject.style.height = vaReportObject?.height;
    }
    // Add authentication - defaults to credentials
    if (vaReportObject?.authenticationType === 'guest') {
        vaDisplayObject.setAttribute('authenticationType', 'guest');
    } else {
        vaDisplayObject.setAttribute('authenticationType', 'credentials');
    }
    // Add Viya-URL - defaults to VIYA
    if (typeof vaReportObject?.viyaURL === 'string') {
        vaDisplayObject.setAttribute('url', vaReportObject?.viyaURL);
    } else {
        vaDisplayObject.setAttribute('url', window.VIYA);
    }
    // Add the Report URI
    vaDisplayObject.setAttribute('reportUri', vaReportObject?.reportURI);
    vaDisplayObject.id = `${paneID}-obj-${vaReportObject?.id}-element`;

    vaReportContainer.appendChild(vaDisplayObject);

    return vaReportContainer;
}
