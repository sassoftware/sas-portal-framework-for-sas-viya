/**
 *
 * Get Folder Content returns all Items of a Folder by the Folders URI
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} folderURI  - The full URI for the folder (e.g. /folders/foldesr/<Folder-URI>)
 * @param {String} urlParams - [Optional] Ability to pass additional query parameters like sortBy and filter - [Default] Empty
 * @returns {Promise/Array} - Returns a promise that if successfull contains an Array of Folder content Items
 */
async function getFolderContent(VIYAHOST, folderURI, urlParams = '') {
    try {
        const FOLDERCONTENT = await fetch(
            `${VIYAHOST}${folderURI}/members${urlParams}`,
            {
                // mode: 'no-cors',
                method: 'get',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        );
        const RESPONSE = await FOLDERCONTENT.json();
        return RESPONSE?.items;
    } catch {
        console.log(
            `The call to ${VIYAHOST}${folderURI}${urlParams} was unsuccessfull`
        );
    }
}
