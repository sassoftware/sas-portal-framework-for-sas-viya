/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns the Output of a LLM running in SCR adhearing to the defined API structure
 *
 * @param {String} SCREndpoint - The fully qualified SCR endpoint under which all the LLMs are being hosted
 * @param {String} model - Specify the specific model - check with the LLM API
 * @param {String} systemPrompt - Specify the system prompt
 * @param {String} userPrompt - Specify the user prompt
 * @param {Object} options - [Optional] Defaults to {}, specify additional LLM call options
 * @param {String} deploymentType - [Optional] Defaults to 'k8s', specify the deployment type of the LLM Container - either 'k8s' or 'aca'
 * @returns {Promise/LLM Response} - The parsed response from the LLM request is returned
 */
async function callSCRLLM(
    SCREndpoint,
    model,
    systemPrompt,
    userPrompt,
    options = {},
    deploymentType = 'k8s'
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

    let llmEndpoint = '';
    if (deploymentType === 'k8s') {
        llmEndpoint = `${SCREndpoint}/${model}/${model}`;
    } else if (deploymentType === 'aca') {
        llmEndpoint = `https://${llm}.${endpoint}/${llm}`;
    }

    const SCRLLMRESPONSE = await fetch(
        `${llmEndpoint}`,
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
