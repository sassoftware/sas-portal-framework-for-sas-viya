/**
 * Returns the In- and Outputs of a SCR endpoint
 * @param {String} endpoint - The SCR endpoint
 * @returns {Array} - The first entry is the inputs and the second the outputs
 */
async function getSCRMetadata(endpoint) {
    let variableDefinitions = [];

    // Call the SCR metadata endpoint
    const SCRMETADATARESPONSE = await fetch(`${endpoint}/apiMeta/api`);

    // Parse the response
    if(SCRMETADATARESPONSE.status === 200) {
        const SCRMETADATA = await SCRMETADATARESPONSE.json();
        variableDefinitions.push(SCRMETADATA?.definitions?.PCRInput?.properties?.data?.properties);
        variableDefinitions.push(SCRMETADATA?.definitions?.PCROutput?.properties?.data?.properties);
        return variableDefinitions;
    } else {
        return [`Request for ${endpoint} failed with the HTTP code: ${SCRMETADATARESPONSE.status} - please check the SCR endpoint.`]
    }
}
