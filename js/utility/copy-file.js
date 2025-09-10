/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Creates a copy of the file
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} fileToCopyURI - The full /files/files of the file that should be copied
 * @param {String} targetParentFolderURI - The full /folders/folders URI of the target parent folder
 * @returns {Promise/Object of Folder} - Returns a Promise that should resolve into the copied file response
 */
async function copyFile(
    VIYAHOST,
    fileToCopyURI,
    targetParentFolderURI,
) {
    let COPYFILERESPONSE = await fetch(
        `${VIYAHOST}${fileToCopyURI}/copy?parentFolderUri=${targetParentFolderURI}`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
            redirect: 'follow',
        }
    );
    if (!COPYFILERESPONSE.ok) {
        if (
            COPYFILERESPONSE.status === 403 &&
            COPYFILERESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = COPYFILERESPONSE.headers.get('x-csrf-header');
            let t = COPYFILERESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            COPYFILERESPONSE = await fetch(
                `${VIYAHOST}${fileToCopyURI}/copy?parentFolderUri=${targetParentFolderURI}`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    redirect: 'follow',
                }
            );
        }
    }
    return COPYFILERESPONSE;
}