/**
 * 
 * @returns {Object} - of all the URL paramters
 */
function getAllURLSearchParams() {
    return Object.fromEntries(new URLSearchParams(document.location.search))
}