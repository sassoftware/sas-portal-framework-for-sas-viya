/**
 * Creates a file with the specified content
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} parentFolderURI - The full /folders/folders URI of the parent folder
 * @param {Blob} content - The content of the file as a blob
 * @param {String} fileName - The full name of the file
 * @param {String} contentType - [Optional] The type of content the file should be - [Default] application/json
 * @returns {Promise/Object of created file} - Returns a Promise that should resolve into the created file
 */
async function createFile(
    VIYAHOST,
    parentFolderURI,
    content,
    fileName,
    contentType = 'application/json'
) {
    let UPLOADFILERESPONSE = await fetch(
        `${VIYAHOST}/files/files?parentFolderUri=${parentFolderURI}`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': contentType,
                'Content-Disposition': `attachment;filename*=UTF-8''${fileName}`,
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: content,
            redirect: 'follow',
        }
    );
    if (!UPLOADFILERESPONSE.ok) {
        if (
            UPLOADFILERESPONSE.status === 403 &&
            UPLOADFILERESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = UPLOADFILERESPONSE.headers.get('x-csrf-header');
            let t = UPLOADFILERESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            UPLOADFILERESPONSE = await fetch(
                `${VIYAHOST}/files/files?parentFolderUri=${parentFolderURI}`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': t,
                        'Content-Disposition': `attachment;filename*=UTF-8''${fileName}`,
                    },
                    credentials: 'include',
                    body: content,
                    redirect: 'follow',
                }
            );
        }
    }
    return UPLOADFILERESPONSE;
}
