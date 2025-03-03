/**
 *
 * Get the result of a SAS Information Catalog Search
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} searchString - The search string that you want to search for
 * @param {String} searchIndex - Default is empty - used to filter the search result by content type, find all via <Viya-Host>/catalog/search/indices?limit=100
 * @param {String} searchType - Default free, you can swtich between free form text search to faceted search by using faceted or free
 * @returns {Promise/File Content} - Returns a promise that if successfull contains the search result
 */
async function searchInformationCatalog(
    VIYAHOST,
    searchString,
    searchIndex = '',
    searchType = 'free',
    searchStartCounter = 0,
    searchLimit = 50
) {
    let SEARCHRESULTS = [];

    const SEARCHRESULTRAW = await fetch(
        `${VIYAHOST}/catalog/search?${
            searchType == 'free' ? '' : '/facets'
        }q=${searchString}${
            searchIndex != '' ? '&index=' + searchIndex : ''
        }&start=${searchStartCounter}`,
        {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            redirect: 'follow',
        }
    );
    const SEARCHRESULT = await SEARCHRESULTRAW.json();
    SEARCHRESULTS.push(...[SEARCHRESULT?.items]);

    // Make more calls if more search results exist
    if (SEARCHRESULT?.items?.length > 0) {
        let startCounter = SEARCHRESULT?.start + 10;
        if (startCounter < searchLimit) {
            const additionaSearches = await searchInformationCatalog(
                VIYAHOST,
                searchString,
                searchIndex,
                searchType,
                startCounter
            );
            SEARCHRESULTS.push(...additionaSearches);
        }
    }
    return SEARCHRESULTS;
}
