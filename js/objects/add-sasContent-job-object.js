/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a SAS Content Job Object
 *
 * @param {Object} sasContentJobObject - Contains the definition of the SAS Content Job Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} scjInterfaceText - Contains all of the static language interface for the SAS Content Job Object
 * @returns a SAS Content Job object
 */
async function addSASContentJobObject(sasContentJobObject, paneID, scjInterfaceText) {
    let sasContentJobContainer = document.createElement('div');
    sasContentJobContainer.setAttribute('id', `${paneID}-obj-${sasContentJobObject?.id}`);

    let sasContentGroup = document.createElement('sas-content-group');
    sasContentGroup.id = `${paneID}-obj-${sasContentJobObject?.id}-cg`;
    sasContentGroup.className = 'col-12';
    sasContentGroup.setAttribute('url', window.VIYA);
    sasContentGroup.initialFilterValue = {
        queryModeFilter: "or(eq(contentType,'jobDefinition'),eq(contentType,'folder'))"
    };
    // Check if the a folder filter has been specified
    if (sasContentJobObject?.folderFilter?.length > 0) {
        let folderFilter = {
            "type": "folderUri",
            "value": sasContentJobObject?.folderFilter
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
    // Job Header
    let sasContentJobName = document.createElement('h3');
    let sasJobContainer = document.createElement('div');
    sasJobContainer.style.height = '75vh';
    let sasJob = document.createElement('iframe');

    let sasContentArea = document.createElement('sas-content-area');
    sasContentArea.id = `${paneID}-obj-${sasContentJobObject?.id}-ca`;
    //sasContentArea.style.height = '30vh';
    sasContentArea.setAttribute('url', window.VIYA);
    sasContentArea.setAttribute('selection-mode', 'single');
    sasContentArea.setAttribute('initial-selection-index', 0);
    sasContentArea.onSelect = async (value) => {
        console.log(value);
        if (value && value.length > 0 && value[0]?.resource?.type?.sasType === 'jobDefinition') {
            const job = value[0];
            const jobExecutionUrl = await contentSdkComponents.getSASJobExecutionUrl(job.resource.id, window.VIYA);
            if (jobExecutionUrl) {
                if (sasContentJobObject?.jobName === 1) {
                    sasContentJobName.innerText = job.name;
                }
                sasJobContainer.style.display = 'block';
                sasJob.src = jobExecutionUrl;
            } else {
                if (sasContentJobObject?.jobName === 1) {
                    sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText;
                }
                sasJobContainer.style.display = 'none';
                sasJob.src = 'about:blank';
            }
        } else {
            if (sasContentJobObject?.jobName === 1) {
                sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText;
            }
            sasJobContainer.style.display = 'none';
            sasJob.src = 'about:blank';
        }
    }

    sasContentGroup.appendChild(sasContentArea);

    // Job display
    if (sasContentJobObject?.jobName === 1) {
        sasContentJobName.id = `${paneID}-obj-${sasContentJobObject?.id}-jn`;
        console.log(scjInterfaceText);
        sasContentJobName.innerText = scjInterfaceText?.noJobSelectedText;
        sasContentGroup.appendChild(sasContentJobName);
    }
    sasJob.id = `${paneID}-obj-${sasContentJobObject?.id}-sj`;
    sasJob.src = 'about:blank';
    sasJob.style.overflow = 'hidden';
    sasJob.style.border = '0';
    sasJob.style.height = '70vh';
    sasJob.style.width = '70vh';
    sasJobContainer.appendChild(sasJob);
    sasContentGroup.appendChild(sasJobContainer);

    sasContentJobContainer.appendChild(sasContentGroup);

    return sasContentJobContainer;
}
