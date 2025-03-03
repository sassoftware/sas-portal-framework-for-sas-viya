/**
 * Returns the Code of a MAS Module
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} moduleID - The ID of the MAS module for which code is collected
 * @returns {Promise/Object of MAS Module} - Returns a Promise that should resolve into the MAS Module code
 */
async function getMASModuleCode(VIYAHOST, moduleID) {
    const MODULECODE = await fetch(
        `${VIYAHOST}/microanalyticScore/modules/${moduleID}/source`,
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

    const MODULECODECONTENT = await MODULECODE.json();
    return MODULECODECONTENT?.source;
}
