/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a folder
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} folderName - The full name of the folder. Note that a folder name must be unique within a folder
 * @param {String} parentFolderURI - The full /folders/folders URI of the parent folder. Set to none if you want to create a root folder
 * @param {String} folderDescription - [Optional] The description of the folder
 * @returns {Promise/Object of created file} - Returns a Promise that should resolve into the created folder
 */
async function createFolder(
    VIYAHOST,
    folderName,
    parentFolderURI,
    folderDescription = ''
) {
    let FOLDERCREATIONRESPONSE = await fetch(
        `${VIYAHOST}/folders/folders?parentFolderUri=${parentFolderURI}`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify({
                "name": folderName,
                "description": folderDescription
            }),
            redirect: 'follow',
        }
    );
    if (!FOLDERCREATIONRESPONSE.ok) {
        if (
            FOLDERCREATIONRESPONSE.status === 403 &&
            FOLDERCREATIONRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = FOLDERCREATIONRESPONSE.headers.get('x-csrf-header');
            let t = FOLDERCREATIONRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            FOLDERCREATIONRESPONSE = await fetch(
                `${VIYAHOST}/folders/folders?parentFolderUri=${parentFolderURI}`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        "name": folderName,
                        "description": folderDescription
                    }),
                    redirect: 'follow',
                }
            );
        }
    }
    return FOLDERCREATIONRESPONSE;
}
