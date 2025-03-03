/**
 * Returns the User Information of the currently signed in User
 * Please note this API is undocumented and thus might change without warning
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} contentType - [Optional] The type of content the file should be - [Default] application/json
 * @returns {Promise/Object of User Infos} - Returns a Promise that should resolve into the users information
 */
async function getUserInfo(VIYAHOST, contentType = 'application/json') {
    try {
        const USERINFORESPONSE = await fetch(
            `${VIYAHOST}/identities/users/@currentUser`,
            {
                // mode: 'no-cors',
                method: 'get',
                headers: {
                    Accept: contentType,
                    'Content-Type': contentType,
                },
                redirect: 'follow',
                credentials: 'include',
            }
        );
        const USERINFO = await USERINFORESPONSE.json();
        return USERINFO;
    } catch {
        console.log(`The call to get the user info was unsuccessfull`);
    }
}
