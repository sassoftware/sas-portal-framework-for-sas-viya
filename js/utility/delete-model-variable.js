/**
 * Delete a specifc model content file
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - The ID of the model from which the content should be deleted
 * @param {String} variableID - The ID of the variable that should be deleted
 * @returns {Promise/Object of Client deletion Response} - Returns a Promise that should resolve into a status code
 */
async function deleteModelVariable(VIYAHOST, modelID, variableID) {
    let DELETEMODELVARIABLERESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/variables/${variableID}`,
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
    if (!DELETEMODELVARIABLERESPONSE.ok) {
        if (
            DELETEMODELVARIABLERESPONSE.status === 403 &&
            DELETEMODELVARIABLERESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = DELETEMODELVARIABLERESPONSE.headers.get('x-csrf-header');
            let t = DELETEMODELVARIABLERESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            DELETEMODELVARIABLERESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/models/${modelID}/variables/${variableID}`,
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

    return DELETEMODELVARIABLERESPONSE.status
}