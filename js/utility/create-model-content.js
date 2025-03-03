/**
 * Creates a new SAS Model Manager Model Content
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} modelID - The ID of the model for which content should be added
 * @param {Object} modelContent - The object of the model content that should be uploaded
 * @param {String} modelContentFileName - The name that the file should have in SAS Model Manager
 * @param {String} modelContentRole - Optional, defaults to Documentation - define the role of the file within the model
 * @param {String} contentType - Optional, defaults to application/json - define the content type of the content to be uploaded
 * @returns {Promise/Object of Content and Status Code} - Returns a Promise that should resolve into content information and the status code
 */
async function createModelContent(
    VIYAHOST,
    modelID,
    modelContent,
    modelContentFileName,
    modelContentRole = 'Documentation',
    contentType = 'application/json'
) {
    const formData = new FormData();
    if (contentType === "multipart/form-data" && modelContent instanceof Uint8Array) {
        contentType = "application/octet-stream";
    } else if (typeof modelContent === 'object') {
        let modelContentJSONString = JSON.stringify(modelContent, null, 2);
        let modelContentBlob = new Blob([modelContentJSONString], {type: contentType});
        formData.append("files", modelContentBlob, modelContentFileName);
        formData.append('role', modelContentRole);
    }

    let CREATEMODELCONTENTRESPONSE = await fetch(
        `${VIYAHOST}/modelRepository/models/${modelID}/contents?onConflict=update`,
        {
            // mode: 'no-cors',
            method: 'post',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document?.csrfToken != undefined ? document.csrfToken : '',
            },
            credentials: 'include',
            body: formData,
            redirect: 'follow',
        }
    );
    if (!CREATEMODELCONTENTRESPONSE.ok) {
        if (
            CREATEMODELCONTENTRESPONSE.status === 403 &&
            CREATEMODELCONTENTRESPONSE.headers.get('x-forbidden-reason') === 'CSRF'
        ) {
            let h = CREATEMODELCONTENTRESPONSE.headers.get('x-csrf-header');
            let t = CREATEMODELCONTENTRESPONSE.headers.get('x-csrf-token');
            document.csrfToken = t;
            CREATEMODELCONTENTRESPONSE = await fetch(
                `${VIYAHOST}/modelRepository/models/${modelID}/contents?onConflict=update`,
                {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': t,
                    },
                    credentials: 'include',
                    body: formData,
                    redirect: 'follow',
                }
            );
        }
    }
    let CREATEMODELCONTENTRESPONSEJSON = await CREATEMODELCONTENTRESPONSE.json();
    return {response: CREATEMODELCONTENTRESPONSEJSON, status_code: CREATEMODELCONTENTRESPONSE.status};
}
