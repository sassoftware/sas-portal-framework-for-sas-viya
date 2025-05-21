/**
 * Delete a specifc model content file
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} moduleID - The ID of the MAS module for which information is collected
 * @returns {Promise/Object of Client deletion Response} - Returns a Promise that should resolve into a status code
 */
async function deleteMASModule(VIYAHOST, moduleID) {
    let DELETEMASMODULERESPONSE = await fetch(
        `${VIYAHOST}/microanalyticScore/modules/${moduleID}`,
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
    if (!DELETEMASMODULERESPONSE.ok) {
        if (
            DELETEMASMODULERESPONSE.status === 403 &&
            DELETEMASMODULERESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = DELETEMASMODULERESPONSE.headers.get('x-csrf-header');
            let t = DELETEMASMODULERESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            DELETEMASMODULERESPONSE = await fetch(
                `${VIYAHOST}/microanalyticScore/modules/${moduleID}`,
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

    return DELETEMASMODULERESPONSE.status
}