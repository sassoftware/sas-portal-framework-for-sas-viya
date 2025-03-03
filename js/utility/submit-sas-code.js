/**
 * Create a SAS Session
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} computeContextID - ID of the SAS Compute Context
 * @param {String} sessionName - Name of the Session
 * @param {String} sessionDescription - Optional, Description for the Session
 * @param {Object} sessionAttributes - Optional, specify context attributes as an Object with the attribute name as the key and the value as the value
 * @param {Array of Strings} sessionEnvironmentOptions - Optional, specify an array of SAS System options
 * @param {Array of Strings} sessionEnvironmentAutoexecLines - Optional, specify lines of SAS code to be run as a autoexec
 *
 * @returns {Promise/String/Object} - returns the SAS Session ID
 */
/**
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} sessionID - A SAS Compute Session ID
 * @param {Array of Strings} code - An Array of Strings containing SAS Code
 * @param {Object} attributes - Optional, attributes to change the behavior of the job request, default is to reset the Log Lines
 * @param {Boolean} waitForJobComplition - Optional, wait for a job to
 *
 */
async function submitSASCode(
    VIYAHOST,
    sessionID,
    code,
    attributes = { resetLogLinesNumbers: true },
    waitForJobComplition = true
) {
    let JOBRESPONSE = await fetch(
        `${VIYAHOST}/compute/sessions/${sessionID}/jobs`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                credentials: 'include',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            body: JSON.stringify({
                code: code,
                attributes: attributes,
            }),
        }
    );
    if (!JOBRESPONSE.ok) {
        if (
            JOBRESPONSE.status === 403 &&
            JOBRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = JOBRESPONSE.headers.get('x-csrf-header');
            let t = JOBRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            JOBRESPONSE = await fetch(
                `${VIYAHOST}/compute/contexts/${computeContextID}/sessions`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        credentials: 'include',
                        'X-CSRF-TOKEN': t,
                    },
                    body: JSON.stringify({
                        code: code,
                        attributes: attributes,
                    }),
                }
            );
        }
    }

    let JOBRESPONSEJSON = await JOBRESPONSE.json();
    let RESPONSE = JOBRESPONSEJSON?.id;

    if (waitForJobComplition) {
        let isJobComplete = ['completed', 'canceled', 'warning', 'error'];
        JOBWAIT = await getSASJobState(VIYAHOST, sessionID, RESPONSE);
    }

    return RESPONSE;
}
