/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Updates a file with the specified content
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} fileURI - The full /files/files URI of the file
 * @param {Blob} content - The content of the file as a blob
 * @returns {Promise/Object of User Infos} - Returns a Promise that should resolve into a success/failure notification if the file was updated
 */
async function updateFileContent(VIYAHOST, fileURI, content) {
    let FILEDEFINITION = await getFile(VIYAHOST, fileURI);
    const ETAG = FILEDEFINITION.headers.get('ETag');
    const FILEOBJECT = await FILEDEFINITION.json();
    let UPDATEFILERESPONSE = await fetch(`${VIYAHOST}${fileURI}/content`, {
        // mode: 'no-cors',
        method: 'put',
        headers: {
            'If-Match': ETAG,
            credentials: 'include',
            Accept: 'application/vnd.sas.file+json, application/json, application/vnd.sas.error+json',
            'Content-Type': FILEOBJECT?.contentType,
            'X-CSRF-TOKEN':
                document?.csrfToken != undefined ? document.csrfToken : '',
        },
        body: content,
        redirect: 'follow',
    });
    if (!UPDATEFILERESPONSE.ok) {
        if (
            UPDATEFILERESPONSE.status === 403 &&
            UPDATEFILERESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = UPDATEFILERESPONSE.headers.get('x-csrf-header');
            let t = UPDATEFILERESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            UPDATEFILERESPONSE = await fetch(`${VIYAHOST}${fileURI}/content`, {
                method: 'put',
                headers: {
                    'If-Match': ETAG,
                    credentials: 'include',
                    Accept: 'application/vnd.sas.file+json, application/json, application/vnd.sas.error+json',
                    'Content-Type': FILEOBJECT?.contentType,
                    'X-CSRF-TOKEN': t,
                },
                credentials: 'include',
                body: content,
                redirect: 'follow',
            });
        }
    }
    return UPDATEFILERESPONSE;
}
