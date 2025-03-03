/**
 * Returns a list of model repositories
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {Object} modelRepositoryInterfaceText - Contains all of the Model Repository relevant language interface
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @param {Boolean} first - Optional - Specify if it is the first request or a subsquent - default is true
 * @returns {Promise/Array of Model Repositories} - Returns a Promise that should resolve into a list of model repositories
 */
async function getAllModelRepositories(
    VIYAHOST,
    modelRepositoryInterfaceText,
    start = 0,
    limit = 20,
    first = true
) {
    let modelRepositories = [];

    // If it is the first call, then append an explainer text
    if (first) {
        modelRepositories.push({
            value: modelRepositoryInterfaceText?.modelRepositorySelect,
            innerHTML: modelRepositoryInterfaceText?.modelRepositorySelect,
        });
    }

    // Call the Model Repository service for all the repositories
    const modelRepositoryResponse = await fetch(
        `${VIYAHOST}/modelRepository/repositories?start=${start}&limit=${limit}`,
        {
            // mode: 'no-cors',
            method: 'get',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
    );

    // Parse the response
    const modelRepositoryContents = await modelRepositoryResponse.json();
    for (const repository of modelRepositoryContents?.items) {
        let currentRepository = {};
        currentRepository['value'] = repository?.id;
        currentRepository['innerHTML'] = repository?.name;
        modelRepositories.push(currentRepository);
    }

    // Make more calls if more modules exist
    if (modelRepositoryContents?.items?.length > 0) {
        let startCounter = modelRepositoryContents?.start + limit;
        const additionalModelRepositories = await getAllModelRepositories(
            VIYAHOST,
            modelRepositoryInterfaceText,
            startCounter,
            limit,
            false
        );
        modelRepositories.push(...additionalModelRepositories);
    }

    return modelRepositories;
}
