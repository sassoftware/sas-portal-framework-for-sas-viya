/**
 *
 * Get File Content returns the File Content
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} fileURI  - The full URI for the file (e.g. /files/files/<Folder-URI>)
 * @param {String} contentType - [Optional] The type of content the file should be - [Default] application/json
 * @returns {Promise/File Content} - Returns a promise that if successfull contains the content of the File
 */
async function getFileContent(
    VIYAHOST,
    fileURI,
    contentType = 'application/json'
) {
    try {
        const FILECONTENT = await fetch(`${VIYAHOST}${fileURI}/content`, {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                Accept: contentType,
                'Content-Type': contentType,
            },
            credentials: 'include',
            redirect: 'follow',
        });
        return FILECONTENT;
    } catch {
        console.log(`The call to ${VIYAHOST}${fileURI} was unsuccessfull`);
    }
}
