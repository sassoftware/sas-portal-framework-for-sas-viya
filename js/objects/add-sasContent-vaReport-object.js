/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a SAS Content VA Report Object
 *
 * @param {Object} sasContentVAReportObject - Contains the definition of the SAS Content VA Report Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} scvarInterfaceText - Contains all of the static language interface for the SAS Content VA Report Object
 * @returns a SAS Content VA Report object
 */
async function addSASContentVAReportObject(sasContentVAReportObject, paneID, scvarInterfaceText) {
    let sasContentVAReportContainer = document.createElement('div');
    sasContentVAReportContainer.setAttribute('id', `${paneID}-obj-${sasContentVAReportObject?.id}`);

    let sasContentGroup = document.createElement('sas-content-group');
    sasContentGroup.id = `${paneID}-obj-${sasContentVAReportObject?.id}-cg`;
    sasContentGroup.className = 'col-12';
    sasContentGroup.setAttribute('url', window.VIYA);
    sasContentGroup.initialFilterValue = {
        queryModeFilter: "or(eq(contentType,'report'),eq(contentType,'folder'))"
    };
    // Check if the a folder filter has been specified
    if (sasContentVAReportObject?.folderFilter?.length > 0) {
        let folderFilter = {
            "type": "folderUri",
            "value": sasContentVAReportObject?.folderFilter
        };
        sasContentGroup.initialNavigationValue = {
            location: folderFilter,
            locationContextPath: [folderFilter],
            locations: [folderFilter]
        };
    } else {
        let sasContentIdentifier = {
            type: "persistentLocation",
            value: "root"
        };
        sasContentGroup.initialNavigationValue = {
            location: sasContentIdentifier,
            locationContextPath: [sasContentIdentifier],
            locations: [sasContentIdentifier]
        };
    }
    // VA Report Header
    let sasContentReportName = document.createElement('h3');
    let sasReport = document.createElement('sas-report');

    let sasContentArea = document.createElement('sas-content-area');
    sasContentArea.id = `${paneID}-obj-${sasContentVAReportObject?.id}-ca`;
    sasContentArea.setAttribute('url', window.VIYA);
    sasContentArea.setAttribute('selection-mode', 'single');
    sasContentArea.setAttribute('initial-selection-index', 0);
    sasContentArea.onSelect = (value) => {
        let reportUri = '';
        if (value && value.length > 0 && value[0]?.resource?.type?.sasType === 'report') {
            if (sasContentVAReportObject?.reportName === 1) {
                sasContentReportName.innerText = value[0].name;
            }
            reportUri = value[0].resource.id;
        } else {
            if (sasContentVAReportObject?.reportName === 1) {
                sasContentReportName.innerText = scvarInterfaceText?.reportNotSelectedText;
            }
        }
        sasReport.reportUri = reportUri;
    }

    sasContentGroup.appendChild(sasContentArea);

    // VA Report display
    if (sasContentVAReportObject?.reportName === 1) {
        sasContentReportName.id = `${paneID}-obj-${sasContentVAReportObject?.id}-rn`;
        sasContentReportName.innerText = scvarInterfaceText?.reportNotSelectedText;
        sasContentGroup.appendChild(sasContentReportName);
    }
    sasReport.id = `${paneID}-obj-${sasContentVAReportObject?.id}-sr`;
    sasReport.setAttribute('url', window.VIYA);
    sasReport.setAttribute('hideNavigation', 'auto');
    sasReport.setAttribute('authenticationType', 'credentials');
    sasReport.style.height = '75vh';
    sasContentGroup.appendChild(sasReport);

    sasContentVAReportContainer.appendChild(sasContentGroup);

    return sasContentVAReportContainer;
}
