/**
 * Delete a specifc model content file
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - The ID of the model from which the content should be deleted
 * @param {String} contentID - The ID of the content that should be deleted
 * @returns {Promise/Object of Client deletion Response} - Returns a Promise that should resolve into a status code
 */
async function deleteModelContet(VIYAHOST, modelID, contentID) {
    let DELETEMODELCONTENTRESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/contents/${contentID}`,
        {
            // mode: 'no-cors',
            method: 'delete',
            headers: {
                'Accept': '*/*',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : ''
            },
            credentials: 'include'
        }
    );
    if (!DELETEMODELCONTENTRESPONSE.ok) {
        if (
            DELETEMODELCONTENTRESPONSE.status === 403 &&
            DELETEMODELCONTENTRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = DELETEMODELCONTENTRESPONSE.headers.get('x-csrf-header');
            let t = DELETEMODELCONTENTRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            DELETEMODELCONTENTRESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/models/${modelID}/contents/${contentID}`,
                {
                    // mode: 'no-cors',
                    method: 'delete',
                    headers: {
                        'Accept': '*/*',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                }
            );
        }
    }

    return DELETEMODELCONTENTRESPONSE.status
}