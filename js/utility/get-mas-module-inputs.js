/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Returns the Input and Output Information of a MAS Module
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} moduleStepID - The ID of the MAS module and step for which inputs/outputs are collected
 * @returns {Promise/Object of MAS Module} - Returns a Promise that should resolve into the inputs/outputs
 */
async function getMASModuleInputs(VIYAHOST, moduleStepID) {
    const MASINPUTS = await fetch(
        `${VIYAHOST}/microanalyticScore/modules/${moduleStepID}`,
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

    const MASINPUTSCONTENT = await MASINPUTS.json();
    return MASINPUTSCONTENT;
}
