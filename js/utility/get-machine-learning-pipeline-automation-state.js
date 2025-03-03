/**
 *
 * Get the state of a MLPA Project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} mlpaProjectID  - The MLPA Project ID of which you want the state
 *
 * @returns {Promise/String} - Returns a promise that if successfull contains the MLPA State
 */
async function getMachineLearningPipelineAutomationState(
    VIYAHOST,
    mlpaProjectID
) {
    const STATE = await fetch(
        `${VIYAHOST}/mlPipelineAutomation/projects/${mlpaProjectID}/state`,
        {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                Accept: 'text/plain',
            },
            credentials: 'include',
            redirect: 'follow',
        }
    );
    return await STATE.text();
}
