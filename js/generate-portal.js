/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generate the Portal based on a Target SAS Viya Content Folder which contains the Portal structure
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} portalFolderURI - The full URI for the folder that contains all Portal Use Cases(e.g. /folders/foldesr/<Folder-URI>)
 * @param {HTMLDivElement} portalContainer - A HTML Div Element that will contain the Portal
 */
async function generatePortal(VIYAHOST, portalFolderURI, portalContainer) {
    // Add the Navbar to the Portal Container
    let portalNavBar = document.createElement('ul');
    portalNavBar.classList.add('nav', 'nav-tabs');
    portalNavBar.setAttribute('id', 'SASPORTALNAVBAR');
    portalNavBar.setAttribute('role', 'tablist');
    portalContainer.appendChild(portalNavBar);

    // Add the Tab Container to the Portal Container
    let portalTabContainer = document.createElement('div');
    portalTabContainer.setAttribute('class', 'tab-content');
    portalTabContainer.setAttribute('id', 'SASPORTALTABCONTAINER');
    portalContainer.appendChild(portalTabContainer);

    // Get the interface language
    const interfaceText = await getInterfaceLanguage();

    let portalLayout = await getFolderContent(
        VIYAHOST,
        `/folders/folders/${portalFolderURI}`,
        '?filter=eq(name,"portal-layout.json")'
    );

    // Check if there is a special order or alphabetical is used
    let potentialPage;
    if (portalLayout?.length > 0) {
        // A special order is used
        let portLayoutResponse = await getFileContent(
            VIYAHOST,
            portalLayout[0]?.uri
        );
        let portalPageJSON = await portLayoutResponse.json();
        potentialPage = portalPageJSON?.displayOrder;
    } else {
        // Defaulting to alphabetical order
        potentialPage = await getFolderContent(
            VIYAHOST,
            `/folders/folders/${portalFolderURI}`,
            '?filter=eq(contentType,folder)&sortBy=name&limit=1000'
        );
    }

    // Get and Generate the actual Portal Content
    let firstTab = true;
    for (i in potentialPage) {
        let potentialPageContent = await getFolderContent(
            VIYAHOST,
            potentialPage[i]?.uri
        );
        for (j in potentialPageContent) {
            if (potentialPageContent[j]?.name === 'portal-page-layout.json') {
                let active = firstTab;
                firstTab = firstTab ? false : false;

                let portalPageLayout = await getFileContent(
                    VIYAHOST,
                    potentialPageContent[j]?.uri
                );
                let layout = await portalPageLayout.json();
                generateTabs(layout?.general, portalNavBar, active);
                generatePanes(
                    VIYAHOST,
                    layout,
                    portalTabContainer,
                    active,
                    interfaceText
                );
            }
        }
    }
}
