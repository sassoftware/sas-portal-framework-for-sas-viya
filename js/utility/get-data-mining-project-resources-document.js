/**
 *
 * Get summary report of a Data Mining Project
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} mlpaProjectID  - The Data Mining Project ID of which you want the summary report
 *
 * @returns {Promise/String} - Returns a promise that if successfull contains the MLPA State
 */
async function getDataMiningProjectResourcesDocument(
    VIYAHOST,
    atDocumentModifier
) {
    const DOCUMENTJSON = await fetch(`${VIYAHOST}${atDocumentModifier}`, {
        // mode: 'no-cors',
        method: 'get',
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
        redirect: 'follow',
    });
    return await DOCUMENTJSON.json();
}
