/**
 * Create a Machine Learning Pipeline Automation
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} dataTableUri - The URI of the table which is the base table
 * @param {String} name - Basename of the Project - a random string is added for uniquness automatically
 * @param {String} description - Description for the MS Project
 * @param {Object} analyticsProjectAttributes - You have to at least provide "targetVariable" with a value but you can set all project attributes here
 * @param {Object} settings - Optional, set the general behavior of the MLPA - a sensible default is applied to run the created pipeline automatically and give a time limit of 10 Minutes
 * @param {String} type - Optional - the type of project created by the MLPA, currently only predeictive is allowed and set as default
 * @returns {Promise/Object} - Returns a promise that if successfull contains an object with the MLPA ID, MLPA Name and MS Project ID
 */
async function createMLPA(
    VIYAHOST,
    dataTableUri,
    name,
    description,
    analyticsProjectAttributes,
    settings = { autoRun: true, maxModelingTime: 10 },
    type = 'predictive'
) {
    let MLPARESPONSE = await fetch(
        `${VIYAHOST}/mlPipelineAutomation/projects`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/vnd.sas.analytics.ml.pipeline.automation.project+json',

                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: JSON.stringify({
                dataTableUri: dataTableUri,
                name: name,
                description: description,
                analyticsProjectAttributes: analyticsProjectAttributes,
                settings,
                type: type,
            }),
        }
    );
    if (!MLPARESPONSE.ok) {
        if (
            MLPARESPONSE.status === 403 &&
            MLPARESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = MLPARESPONSE.headers.get('x-csrf-header');
            let t = MLPARESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            MLPARESPONSE = await fetch(
                `${VIYAHOST}/mlPipelineAutomation/projects`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/vnd.sas.analytics.ml.pipeline.automation.project+json',

                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        dataTableUri: dataTableUri,
                        name: name,
                        description: description,
                        analyticsProjectAttributes: analyticsProjectAttributes,
                        settings,
                        type: type,
                    }),
                }
            );
        } else if (MLPARESPONSE.status == 449) {
            let urlStatusResponse = MLPARESPONSE?.url.split('&').splice(1);
            await fetch(
                `${VIYAHOST}/mlPipelineAutomation/projects?${urlStatusResponse[0]}&${urlStatusResponse[1]}`,
                {
                    // mode: 'no-cors',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/vnd.sas.analytics.ml.pipeline.automation.project+json',

                        'X-CSRF-TOKEN':
                            document?.csrfToken != undefined
                                ? document.csrfToken
                                : '',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        dataTableUri: dataTableUri,
                        name: name,
                        description: description,
                        analyticsProjectAttributes: analyticsProjectAttributes,
                        settings,
                        type: type,
                    }),
                }
            );
        }
    }
    let MLPARESPONSEJSON = await MLPARESPONSE.json();
    return {
        id: MLPARESPONSEJSON?.id,
        name: MLPARESPONSEJSON?.name,
        analyticsProjectID:
            MLPARESPONSEJSON?.analyticsProjectAttributes?.analyticsProjectId,
    };
}
