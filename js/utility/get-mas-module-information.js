/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns the Information of a MAS Module
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} moduleID - The ID of the MAS module for which information is collected
 * @returns {Promise/Object of MAS Module} - Returns a Promise that should resolve into the MAS information
 */
async function getMASModuleInformation(VIYAHOST, moduleID) {
    const MASINFO = await fetch(
        `${VIYAHOST}/microanalyticScore/modules/${moduleID}`,
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

    const MASINFOCONTENT = await MASINFO.json();
    return MASINFOCONTENT;
}
