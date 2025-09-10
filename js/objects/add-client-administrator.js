/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Create a Client Administrator
 *
 * @param {Object} clientAdministratorObject - Contains the definition of the Client Administrator
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} clientAdministratorText - Contains all of the client administrator relevant language interface
 * @returns a Client Administrator
 */
async function addClientAdministrator(
    clientAdministratorObject,
    paneID,
    clientAdministratorText
) {
    // Create the container for the client administrator
    let clientAdminContainer = document.createElement('div');
    clientAdminContainer.setAttribute(
        'id',
        `${paneID}-obj-${clientAdministratorObject?.id}`
    );

    // Add little explainer
    let clientExplainerText = document.createElement('p');
    clientExplainerText.innerHTML = `${clientAdministratorText?.oauthClientExplainer}`;

    // Add the Display for the Client Definition
    let clientDefinitionDisplay = document.createElement('div');
    clientDefinitionDisplay.setAttribute('class', 'accordion accordion-flush');
    clientDefinitionDisplay.setAttribute(
        'id',
        `${clientAdministratorObject?.id}-accordion`
    );

    // Add a separation line
    let newLine = document.createElement('br');
    clientDefinitionDisplay.appendChild(newLine);

    createAccordionItem(
        clientDefinitionDisplay,
        `${clientAdministratorObject?.id}-accordion`,
        'oauthClientDefinition',
        clientAdministratorText
    );

    // Store the definition of the currently selected client
    let currentClienObject;

    // Add the Client Selector
    let clientSelectorHeading = document.createElement('p');
    clientSelectorHeading.setAttribute('class', 'fs-3');
    clientSelectorHeading.innerText = `${clientAdministratorText?.oauthClientSelectorText}:`;

    let clientSelectorDropdown = document.createElement('select');
    clientSelectorDropdown.setAttribute('class', 'form-select');
    clientSelectorDropdown.setAttribute(
        'id',
        `${clientAdministratorObject?.id}-client-dropdown`
    );
    clientSelectorDropdown.onchange = async function () {
        let currentClient = this.options[this.selectedIndex].value;
        let currentClientDefinition = await getSpecificOAuthClients(
            VIYA,
            currentClient
        );

        currentClienObject = currentClientDefinition;

        let currentClientContent = [];
        for (let [key, value] of Object.entries(currentClientDefinition)) {
            if (Array.isArray(value) && value?.length > 0) {
                for (let i = 0; i < value?.length; i++) {
                    currentClientContent.push([key, value[i]]);
                }
            } else {
                currentClientContent.push([key, value]);
            }
        }

        // Create Table content
        let currentClientTableValue = {
            headers: [
                clientAdministratorText?.clientAdminAttribute,
                clientAdministratorText?.clientAdminValue,
            ],
            content: currentClientContent,
        };

        // Add Output Table
        addAccordionBody(
            `${clientAdministratorObject?.id}-accordion`,
            'oauthClientDefinition',
            'table',
            currentClientTableValue,
            clientAdministratorText?.oauthClientDownloadButton
        );

        document
            .getElementById(`${clientAdministratorObject?.id}-action-dropdown`)
            .dispatchEvent(new Event('change'));
    };

    // Add the Dropdown for all OAuth Clients
    let allOauthClients = await getAllOAuthClients(
        VIYA,
        clientAdministratorText?.oauthClientSelectorText
    );

    // Add the OAuth Clients to the dropdown
    for (const client in allOauthClients) {
        let clientOpt = document.createElement('option');
        clientOpt.value = allOauthClients[client]?.value;
        clientOpt.innerHTML = allOauthClients[client]?.innerHTML;
        clientSelectorDropdown.append(clientOpt);
    }

    // Add the Text Area were users can edit the client definition
    let clientDefinitionTextArea = document.createElement('textarea');
    clientDefinitionTextArea.setAttribute(
        'id',
        `${clientAdministratorObject?.id}-textarea`
    );
    clientDefinitionTextArea.setAttribute('class', 'form-control');
    clientDefinitionTextArea.setAttribute(
        'placeholder',
        `${clientAdministratorText?.oauthClientActionText[0]?.text}`
    );

    // Add Client Action submit button
    let clientActionSubmitButton = document.createElement('button');
    clientActionSubmitButton.setAttribute(
        'id',
        `${clientAdministratorObject?.id}-submit-btn`
    );
    clientActionSubmitButton.setAttribute('type', 'button');
    clientActionSubmitButton.setAttribute('class', 'btn btn-primary');
    clientActionSubmitButton.setAttribute('disabled', true);
    clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.default}`;
    clientActionSubmitButton.onclick = async function () {};

    // Add the Client Token Authentication
    let clientTokenAuthHeader = document.createElement('p');
    clientTokenAuthHeader.innerHTML = `${clientAdministratorText?.oauthClientAuthenticatorText1} <a href='${VIYA}/SASLogon/oauth/authorize?client_id=sas.cli&response_type=token' target='_blank' rel='noopener noreferrer'>${VIYA}//SASLogon/oauth/authorize?client_id=sas.cli&response_type=token</a> ${clientAdministratorText?.oauthClientAuthenticatorText2}`;
    let clientTokenAuthInput = document.createElement('input');
    clientTokenAuthInput.type = 'text';
    clientTokenAuthInput.className = 'form-control';
    clientTokenAuthInput.placeholder = 'URL';
    clientTokenAuthInput.id = `${clientAdministratorObject?.id}-authcode`;

    // Token value added by the user
    let clientTokenAuthValue = '';
    clientTokenAuthInput.onblur = function () {
        clientTokenAuthValue = this.value.slice(
            this.value.indexOf('&access_token=') + 14,
            this.value.indexOf('&', this.value.indexOf('&access_token=') + 14)
        );
        window.TOKENAUTHVALUE = clientTokenAuthValue;
    };

    // Add the OAuth Client Action Selector
    let clientActionHeading = document.createElement('p');
    clientActionHeading.setAttribute('class', 'fs-3');
    clientActionHeading.innerText = `${clientAdministratorText?.oauthClientActionText[0]?.text}:`;

    // Add the action responses
    let clientActionResponse = document.createElement('p');
    clientActionResponse.id = `${clientAdministratorObject?.id}-response`;

    let clientActionDropdown = document.createElement('select');
    clientActionDropdown.setAttribute('class', 'form-select');
    clientActionDropdown.setAttribute(
        'id',
        `${clientAdministratorObject?.id}-action-dropdown`
    );
    clientActionDropdown.onchange = async function () {
        let currentAction = this.options[this.selectedIndex].value;
        clientActionSubmitButton.setAttribute('value', currentAction);
        clientActionSubmitButton.onclick = async (e) => {
            if (clientTokenAuthValue.length < 10) {
                alert(clientAdministratorText?.oauthClientNoTokenError);
            } else {
                let actionResponse;
                let responseArea = document.getElementById(
                    `${clientAdministratorObject?.id}-response`
                );
                responseArea.innerHTML = '';
                if (e.target.value === 'delete') {
                    actionResponse = await deleteOAuthClient(
                        VIYA,
                        currentClienObject?.client_id,
                        clientTokenAuthValue
                    );
                } else if (e.target.value === 'create') {
                    actionResponse = await createOAuthClient(
                        VIYA,
                        document.getElementById(
                            `${clientAdministratorObject?.id}-textarea`
                        ).value,
                        clientTokenAuthValue
                    );
                } else if (e.target.value === 'update') {
                    actionResponse = await updateOAuthClient(
                        VIYA,
                        currentClienObject?.client_id,
                        document.getElementById(
                            `${clientAdministratorObject?.id}-textarea`
                        ).value,
                        clientTokenAuthValue
                    );
                } else if (e.target.value === 'secret') {
                    actionResponse = await updateSecretOAuthClient(
                        VIYA,
                        currentClienObject?.client_id,
                        document.getElementById(
                            `${clientAdministratorObject?.id}-textarea`
                        ).value,
                        clientTokenAuthValue
                    );
                }
                responseArea.style.color = `var(${actionResponse?.responseCode})`;
                responseArea.innerText = actionResponse?.responseText;
            }
        };
        if (currentAction === 'create') {
            clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.create}`;
            clientActionSubmitButton.removeAttribute('disabled');
            clientDefinitionTextArea.innerText =
                '{"client_id": "myclientid", "client_secret": "myclientsecret", "scope": ["openid"], "authorized_grant_types": ["authorization_code","refresh_token"], "redirect_uri": "urn:ietf:wg:oauth:2.0:oob"}';
        } else if (currentAction === 'update') {
            clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.update}`;
            clientActionSubmitButton.removeAttribute('disabled');
            clientDefinitionTextArea.innerText =
                currentClienObject === undefined
                    ? clientAdministratorText?.oauthClientSelectorText
                    : JSON.stringify(currentClienObject);
        } else if (currentAction === 'secret') {
            clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.secret}`;
            clientActionSubmitButton.removeAttribute('disabled');
            clientDefinitionTextArea.innerText =
                currentClienObject === undefined
                    ? clientAdministratorText?.oauthClientSelectorText
                    : `{"clientId": "${currentClienObject?.client_id}", "secret": "new-secret"}`;
        } else if (currentAction === 'delete') {
            clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.delete}`;
            clientActionSubmitButton.removeAttribute('disabled');
            clientDefinitionTextArea.innerText =
                currentClienObject === undefined
                    ? clientAdministratorText?.oauthClientSelectorText
                    : `${currentClienObject?.client_id}`;
        } else {
            clientActionSubmitButton.innerText = `${clientAdministratorText?.oauthClientActionButton?.default}`;
            clientActionSubmitButton.setAttribute('disabled', true);
            clientDefinitionTextArea.innerText = `${clientAdministratorText?.oauthClientActionText[0]?.text}`;
            clientActionSubmitButton.onclick = () => {};
        }
    };

    // Add the OAuth Client Actions to the dropdown
    for (const clientAction in clientAdministratorText?.oauthClientActionText) {
        let clientActionOpt = document.createElement('option');
        clientActionOpt.value =
            clientAdministratorText?.oauthClientActionText[clientAction]?.value;
        clientActionOpt.innerHTML =
            clientAdministratorText?.oauthClientActionText[clientAction]?.text;
        clientActionDropdown.append(clientActionOpt);
    }

    // Add a separation line
    let newLineACM2 = document.createElement('br');
    let newLineACM3 = document.createElement('br');
    let newLineACM4 = document.createElement('br');

    clientAdminContainer.appendChild(clientSelectorHeading);
    clientAdminContainer.appendChild(clientExplainerText);
    clientAdminContainer.appendChild(clientSelectorDropdown);
    clientAdminContainer.appendChild(clientDefinitionDisplay);
    clientAdminContainer.appendChild(newLineACM2);
    clientAdminContainer.appendChild(clientTokenAuthHeader);
    clientAdminContainer.appendChild(clientTokenAuthInput);
    clientAdminContainer.appendChild(clientActionHeading);
    clientAdminContainer.appendChild(clientActionDropdown);
    clientAdminContainer.appendChild(newLineACM3);
    clientAdminContainer.appendChild(clientDefinitionTextArea);
    clientAdminContainer.appendChild(newLineACM4);
    clientAdminContainer.appendChild(clientActionSubmitButton);
    clientAdminContainer.appendChild(clientActionResponse);

    return clientAdminContainer;
}
