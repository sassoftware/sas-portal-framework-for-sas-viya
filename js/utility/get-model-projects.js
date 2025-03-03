/**
 * Returns a list of Model Manager projects
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} query - Optional - Add a query to filter the results
 * @param {Integer} start - Optional - Specify from where the request should start - default is 0
 * @param {Integer} limit - Optional - Specify how many items should be requested at a time - default is 20
 * @returns {Promise/Array of Model Manager Projects} - Returns a Promise that should resolve into a list of Model Manager Projects
 */
async function getModelProjects(
    VIYAHOST,
    query = '',
    start = 0,
    limit = 50
) {
    let modelProjects = [];

    // Call the model repository endpoint to get all projects
    const projectResponse = await fetch(
        `${VIYAHOST}/modelRepository/projects?start=${start}&limit=${limit}&filter=${query}`,
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
    const projectContents = await projectResponse.json();
    for (const project of projectContents?.items) {
        let currentProject = {};
        currentProject['value'] = project?.id;
        currentProject['innerHTML'] = project?.name;
        modelProjects.push(currentProject);
    }

    // Make more calls if more projects exist
    if (projectContents?.items?.length > 0) {
        let startCounter = projectContents?.start + limit;
        const additionalProjects = await getModelProjects(
            VIYAHOST,
            query,
            startCounter,
            limit
        );
        modelProjects.push(...additionalProjects);
    }

    return modelProjects;
}
