/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Get file returns the file
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} fileURI  - The full URI for the file - /files/files/<Folder-URI>
 * @param {String} contentType - [Optional] The type of content the file should be - [Default] application/json
 * @returns {Promise/File Content} - Returns a promise that if successfull contains the content of the File
 */
async function getFile(VIYAHOST, fileURI) {
    const FILE = await fetch(`${VIYAHOST}${fileURI}`, {
        // mode: 'no-cors',
        method: 'get',
        headers: {
            Accept: 'application/vnd.sas.file+json, application/vnd.sas.file+json;version=1, application/vnd.sas.file+json;version=2, application/vnd.sas.file+json;version=3, application/vnd.sas.file+json;version=4, application/json, application/vnd.sas.error+json',
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        redirect: 'follow',
    });
    return FILE;
}
