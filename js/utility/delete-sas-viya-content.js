/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delete a specifc SAS Viya Content element
 *
 * @param {String} VIYAHOST - The Host URL of the SAS Viya Host
 * @param {String} contentURI - The URI of the SAS Viya Content that should be deleted
 * @param {String} urlParameter - Optional URI parameter that is added to the request - please note you have to also provide the ? mark
 * @returns {Promise/Object of Client deletion Response} - Returns a Promise that should resolve into a message if the content was deleted or not
 */
    async function deleteSASViyaContent(VIYAHOST, contentURI, urlParameter = '') {
        let deleteContentResponse = await fetch(
            `${VIYAHOST}${contentURI}${urlParameter}`,
            {
                // mode: 'no-cors',
                method: 'delete',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document?.csrfToken != undefined ? document.csrfToken : '',
                },
                credentials: 'include',
                redirect: 'follow'
            }
        );

        if (!deleteContentResponse.ok) {
            if (
                deleteContentResponse.status === 403 &&
                deleteContentResponse.headers.get('x-forbidden-reason') === 'CSRF'
            ) {
                let h = deleteContentResponse.headers.get('x-csrf-header');
                let t = deleteContentResponse.headers.get('x-csrf-token');
                document.csrfToken = t;
                deleteContentResponse = await fetch(
                    `${VIYAHOST}${contentURI}${urlParameter}`,
                    {
                        // mode: 'no-cors',
                        method: 'delete',
                        headers: {
                            Accept: 'application/json',
                            'X-CSRF-TOKEN':
                                document?.csrfToken != undefined ? document.csrfToken : '',
                        },
                        credentials: 'include',
                        redirect: 'follow'
                    })
                }
        }

        return {
            responseCode:
            deleteContentResponse?.status === 204
                    ? '--bs-success, green'
                    : '--bs-danger, red',
            responseText: `${deleteContentResponse?.status}${
                deleteContentResponse?.statusText === ''
                    ? ''
                    : `: ${deleteContentResponse?.statusText}`
            }`,
        };
    }
