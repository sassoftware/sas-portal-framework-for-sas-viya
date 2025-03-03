/**
 *
 * Get the result of a SAS Information Catalog Search
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} instanceID - The ID of the catalog instance for which you want information
 * @param {String} query - The search query you want to be applied
 * @returns {Promise/File Content} - Returns a promise that if successfull contains the search result
 */
async function getInformationCatalogInstance(VIYAHOST, instanceID, query) {
    let INSTANCERESULTRAW = await fetch(`${VIYAHOST}/catalog/instances`, {
        // mode: 'no-cors',
        method: 'post',
        headers: {
            Accept: 'application/vnd.sas.metadata.instance.archive+json',
            'Content-Type': 'application/vnd.sas.metadata.instance.query+json',
            'X-CSRF-TOKEN':
                document?.csrfToken != undefined ? document.csrfToken : '',
        },
        body: JSON.stringify({
            query: `${query}`,
            parameters: { t: { id: instanceID } },
        }),
        credentials: 'include',
        redirect: 'follow',
    });

    if (!INSTANCERESULTRAW.ok) {
        if (
            INSTANCERESULTRAW.status === 403 &&
            INSTANCERESULTRAW.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = INSTANCERESULTRAW.headers.get('x-csrf-header');
            let t = INSTANCERESULTRAW.headers.get('x-csrf-token');
            document.csrfToken = t;
            INSTANCERESULTRAW = await fetch(`${VIYAHOST}/catalog/instances`, {
                // mode: 'no-cors',
                method: 'post',
                headers: {
                    Accept: 'application/vnd.sas.metadata.instance.archive+json',
                    'Content-Type':
                        'application/vnd.sas.metadata.instance.query+json',
                    'X-CSRF-TOKEN':
                        document?.csrfToken != undefined
                            ? document.csrfToken
                            : '',
                },
                body: JSON.stringify({
                    query: `${query}`,
                    parameters: { t: { id: instanceID } },
                }),
                credentials: 'include',
                redirect: 'follow',
            });
        }
    }

    const INSTANCERESULT = await INSTANCERESULTRAW.json();
    return INSTANCERESULT;
}
