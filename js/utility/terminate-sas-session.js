/**
 * Terminate a SAS Session - it is suggested to use the window.onbeforeunload event to terminate the SAS Session
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} sasSessionID - The ID of the SAS session to be ended
 * @returns {String} - returns the status code
 */
async function terminateSASSession(VIYAHOST, sasSessionID) {
    let SESSIONRESPONSE = await fetch(`${VIYAHOST}/compute/sessions/${SESSIONJSON.id}`, {
        // mode: 'no-cors',
        method: 'delete',
        headers: {Accept: '*/*'},
            credentials: 'include',
    });
    if (!SESSIONRESPONSE.ok) {
        if (
            SESSIONRESPONSE.status === 403 &&
            SESSIONRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = SESSIONRESPONSE.headers.get('x-csrf-header');
            let t = SESSIONRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            SESSIONRESPONSE = await fetch(`${VIYAHOST}/compute/sessions/${SESSIONJSON.id}`, {
                // mode: 'no-cors',
                method: 'delete',
                headers: {Accept: '*/*'},
                    credentials: 'include',
            });
        }
    }
    return SESSIONRESPONSE.status;
}
