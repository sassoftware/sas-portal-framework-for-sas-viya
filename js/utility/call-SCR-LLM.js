/**
 * Returns the Output of a LLM running in SCR adhearing to the defined API structure
 *
 * @param {String} SCREndpoint - The fully qualified SCR endpoint under which all the LLMs are being hosted
 * @param {String} model - Specify the specific model - check with the LLM API
 * @param {String} systemPrompt - Specify the system prompt
 * @param {String} userPrompt - Specify the user prompt
 * @param {Object} options - [Optional] Defaults to {}, specify additional LLM call options
 * @returns {Promise/LLM Response} - The parsed response from the LLM request is returned
 */
async function callSCRLLM(
    SCREndpoint,
    model,
    systemPrompt,
    userPrompt,
    options = {}
) {
    let stringOptionsSCRLLM = '{';
    Object.keys(options).forEach((key, index) => {
        if(index > 0) {
            stringOptionsSCRLLM = stringOptionsSCRLLM.concat(',', key, ':', options[key])
        } else {
            stringOptionsSCRLLM = stringOptionsSCRLLM.concat(key, ':', options[key])
        }
    })
    stringOptionsSCRLLM = stringOptionsSCRLLM.concat('}')

    const SCRLLMRESPONSE = await fetch(
        `${SCREndpoint}/${model}/${model}`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: [
                    {
                        name: "systemPrompt",
                        value: systemPrompt
                    },
                    {
                        name: "userPrompt",
                        value: userPrompt
                    },
                    {
                        name: "options",
                        value: stringOptionsSCRLLM
                    }
                ]
            })
        }
    )
    if(SCRLLMRESPONSE.status === 200) {
        const SCRLLMRESPONSEJSON = await SCRLLMRESPONSE.json();
        return SCRLLMRESPONSEJSON?.data;
    } else {
        return {error: `Request for ${model} failed with the HTTP code: ${SCRLLMRESPONSE.status}`}
    }
}
