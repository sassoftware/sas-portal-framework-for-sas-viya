/**
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {*} mlpaProjectID - The ID of the MLPA Project of which the Champion should be published or registered
 * @param {*} action - Optional, the default value is to just register the mode - the other value is publish
 * @param {*} destinationName - Optional, Enter the name of the target publishing destination, default is maslocal - only applicable with action = publish
 * @returns
 */
async function publishMLPAChampion(
    VIYAHOST,
    mlpaProjectID,
    action = 'register',
    destinationName = 'maslocal'
) {
    const PUBLISHURL = `${VIYAHOST}/mlPipelineAutomation/projects/${mlpaProjectID}/models/@championModel?action=${action}${
        action === 'publish' ? '&destinationName=' + destinationName : ''
    }`;

    let MLPARPUBLISHESPONSE = await fetch(PUBLISHURL, {
        // mode: 'no-cors',
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN':
                document?.csrfToken != undefined ? document.csrfToken : '',
        },
        credentials: 'include',
    });
    if (!MLPARPUBLISHESPONSE.ok) {
        if (
            MLPARPUBLISHESPONSE.status === 403 &&
            MLPARPUBLISHESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = MLPARPUBLISHESPONSE.headers.get('x-csrf-header');
            let t = MLPARPUBLISHESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            MLPARPUBLISHESPONSE = await fetch(PUBLISHURL, {
                // mode: 'no-cors',
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': t,
                },
                credentials: 'include',
            });
        }
    }

    return await MLPARPUBLISHESPONSE.json();
}
