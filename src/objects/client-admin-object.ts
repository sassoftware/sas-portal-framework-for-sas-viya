/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerObjectType } from './registry';
import { getAppState } from '../state/app-state';
import type { ObjectDefinition, InterfaceText } from '../types';
import {
  getAllOAuthClients,
  getSpecificOAuthClient,
  createOAuthClient,
  deleteOAuthClient,
  updateOAuthClient,
  updateOAuthClientSecret,
} from '../api/oauth-api';
import { createAccordionItem, addAccordionBody } from '../ui/accordion';

registerObjectType({
  type: 'clientAdministrator',
  async build(
    definition: ObjectDefinition,
    paneID: string,
    interfaceText?: InterfaceText
  ): Promise<HTMLElement> {
    const { config } = getAppState();
    const viyaHost = config.viyaHost;
    const clientAdministratorText = (interfaceText?.clientAdministrator ?? {}) as Record<string, unknown>;

    // Create the container for the client administrator
    const clientAdminContainer = document.createElement('div');
    clientAdminContainer.setAttribute('id', `${paneID}-obj-${definition?.id}`);

    // Add little explainer
    const clientExplainerText = document.createElement('p');
    clientExplainerText.innerHTML = `${clientAdministratorText?.oauthClientExplainer ?? ''}`;

    // Add the Display for the Client Definition
    const clientDefinitionDisplay = document.createElement('div');
    clientDefinitionDisplay.setAttribute('class', 'accordion accordion-flush');
    clientDefinitionDisplay.setAttribute('id', `${definition?.id}-accordion`);

    // Add a separation line
    const newLine = document.createElement('br');
    clientDefinitionDisplay.appendChild(newLine);

    createAccordionItem(
      clientDefinitionDisplay,
      `${definition?.id}-accordion`,
      'oauthClientDefinition',
      clientAdministratorText as Record<string, string>
    );

    // Store the definition of the currently selected client
    let currentClientObject: Record<string, unknown> | undefined;

    // Add the Client Selector
    const clientSelectorHeading = document.createElement('p');
    clientSelectorHeading.setAttribute('class', 'fs-3');
    clientSelectorHeading.innerText = `${clientAdministratorText?.oauthClientSelectorText ?? ''}:`;

    const clientSelectorDropdown = document.createElement('select');
    clientSelectorDropdown.setAttribute('class', 'form-select');
    clientSelectorDropdown.setAttribute('id', `${definition?.id}-client-dropdown`);
    clientSelectorDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      const currentClient = self.options[self.selectedIndex]!.value;
      const currentClientDefinition = await getSpecificOAuthClient(currentClient);

      currentClientObject = currentClientDefinition as unknown as Record<string, unknown>;

      const currentClientContent: [string, unknown][] = [];
      for (const [key, value] of Object.entries(currentClientDefinition)) {
        if (Array.isArray(value) && value?.length > 0) {
          for (let i = 0; i < value.length; i++) {
            currentClientContent.push([key, value[i]]);
          }
        } else {
          currentClientContent.push([key, value]);
        }
      }

      // Create Table content
      const currentClientTableValue = {
        headers: [
          clientAdministratorText?.clientAdminAttribute as string ?? '',
          clientAdministratorText?.clientAdminValue as string ?? '',
        ],
        content: currentClientContent,
      };

      // Add Output Table
      addAccordionBody(
        `${definition?.id}-accordion`,
        'oauthClientDefinition',
        'table',
        currentClientTableValue,
        clientAdministratorText?.oauthClientDownloadButton as string
      );

      document
        .getElementById(`${definition?.id}-action-dropdown`)
        ?.dispatchEvent(new Event('change'));
    };

    // Add the Dropdown for all OAuth Clients
    const allOauthClients = await getAllOAuthClients(
      clientAdministratorText?.oauthClientSelectorText as string ?? ''
    );

    // Add the OAuth Clients to the dropdown
    for (const client of allOauthClients) {
      const clientOpt = document.createElement('option');
      clientOpt.value = client.value;
      clientOpt.innerHTML = client.innerHTML;
      clientSelectorDropdown.append(clientOpt);
    }

    // Add the Text Area where users can edit the client definition
    const clientDefinitionTextArea = document.createElement('textarea');
    clientDefinitionTextArea.setAttribute('id', `${definition?.id}-textarea`);
    clientDefinitionTextArea.setAttribute('class', 'form-control');
    const actionTextArray = clientAdministratorText?.oauthClientActionText as Array<{ text: string; value: string }> | undefined;
    clientDefinitionTextArea.setAttribute(
      'placeholder',
      `${actionTextArray?.[0]?.text ?? ''}`
    );

    // Add Client Action submit button
    const clientActionSubmitButton = document.createElement('button');
    clientActionSubmitButton.setAttribute('id', `${definition?.id}-submit-btn`);
    clientActionSubmitButton.setAttribute('type', 'button');
    clientActionSubmitButton.setAttribute('class', 'btn btn-primary');
    clientActionSubmitButton.setAttribute('disabled', 'true');
    const actionButton = clientAdministratorText?.oauthClientActionButton as Record<string, string> | undefined;
    clientActionSubmitButton.innerText = `${actionButton?.default ?? ''}`;
    clientActionSubmitButton.onclick = async function () {};

    // Add the Client Token Authentication
    const clientTokenAuthHeader = document.createElement('p');
    clientTokenAuthHeader.innerHTML = `${clientAdministratorText?.oauthClientAuthenticatorText1 ?? ''} <a href='${viyaHost}/SASLogon/oauth/authorize?client_id=sas.cli&response_type=token' target='_blank' rel='noopener noreferrer'>${viyaHost}//SASLogon/oauth/authorize?client_id=sas.cli&response_type=token</a> ${clientAdministratorText?.oauthClientAuthenticatorText2 ?? ''}`;
    const clientTokenAuthInput = document.createElement('input');
    clientTokenAuthInput.type = 'text';
    clientTokenAuthInput.className = 'form-control';
    clientTokenAuthInput.placeholder = 'URL';
    clientTokenAuthInput.id = `${definition?.id}-authcode`;

    // Token value added by the user
    let clientTokenAuthValue = '';
    clientTokenAuthInput.onblur = function () {
      const self = this as unknown as HTMLInputElement;
      clientTokenAuthValue = self.value.slice(
        self.value.indexOf('&access_token=') + 14,
        self.value.indexOf('&', self.value.indexOf('&access_token=') + 14)
      );
    };

    // Add the OAuth Client Action Selector
    const clientActionHeading = document.createElement('p');
    clientActionHeading.setAttribute('class', 'fs-3');
    clientActionHeading.innerText = `${actionTextArray?.[0]?.text ?? ''}:`;

    // Add the action responses
    const clientActionResponse = document.createElement('p');
    clientActionResponse.id = `${definition?.id}-response`;

    const clientActionDropdown = document.createElement('select');
    clientActionDropdown.setAttribute('class', 'form-select');
    clientActionDropdown.setAttribute('id', `${definition?.id}-action-dropdown`);
    clientActionDropdown.onchange = async function () {
      const self = this as unknown as HTMLSelectElement;
      const currentAction = self.options[self.selectedIndex]!.value;
      clientActionSubmitButton.setAttribute('value', currentAction);
      clientActionSubmitButton.onclick = async (e: MouseEvent) => {
        if (clientTokenAuthValue.length < 10) {
          alert(clientAdministratorText?.oauthClientNoTokenError as string ?? '');
        } else {
          let actionResponse: { responseCode: string; responseText: string } | undefined;
          const responseArea = document.getElementById(`${definition?.id}-response`);
          if (responseArea) responseArea.innerHTML = '';
          if ((e.target as HTMLButtonElement).value === 'delete') {
            actionResponse = await deleteOAuthClient(
              (currentClientObject?.client_id as string) ?? '',
              clientTokenAuthValue
            );
          } else if ((e.target as HTMLButtonElement).value === 'create') {
            actionResponse = await createOAuthClient(
              (document.getElementById(`${definition?.id}-textarea`) as HTMLTextAreaElement).value,
              clientTokenAuthValue
            );
          } else if ((e.target as HTMLButtonElement).value === 'update') {
            actionResponse = await updateOAuthClient(
              (currentClientObject?.client_id as string) ?? '',
              (document.getElementById(`${definition?.id}-textarea`) as HTMLTextAreaElement).value,
              clientTokenAuthValue
            );
          } else if ((e.target as HTMLButtonElement).value === 'secret') {
            actionResponse = await updateOAuthClientSecret(
              (currentClientObject?.client_id as string) ?? '',
              (document.getElementById(`${definition?.id}-textarea`) as HTMLTextAreaElement).value,
              clientTokenAuthValue
            );
          }
          if (responseArea && actionResponse) {
            responseArea.style.color = `var(${actionResponse.responseCode})`;
            responseArea.innerText = actionResponse.responseText;
          }
        }
      };
      if (currentAction === 'create') {
        clientActionSubmitButton.innerText = `${actionButton?.create ?? ''}`;
        clientActionSubmitButton.removeAttribute('disabled');
        clientDefinitionTextArea.innerText =
          '{"client_id": "myclientid", "client_secret": "myclientsecret", "scope": ["openid"], "authorized_grant_types": ["authorization_code","refresh_token"], "redirect_uri": "urn:ietf:wg:oauth:2.0:oob"}';
      } else if (currentAction === 'update') {
        clientActionSubmitButton.innerText = `${actionButton?.update ?? ''}`;
        clientActionSubmitButton.removeAttribute('disabled');
        clientDefinitionTextArea.innerText =
          currentClientObject === undefined
            ? (clientAdministratorText?.oauthClientSelectorText as string ?? '')
            : JSON.stringify(currentClientObject);
      } else if (currentAction === 'secret') {
        clientActionSubmitButton.innerText = `${actionButton?.secret ?? ''}`;
        clientActionSubmitButton.removeAttribute('disabled');
        clientDefinitionTextArea.innerText =
          currentClientObject === undefined
            ? (clientAdministratorText?.oauthClientSelectorText as string ?? '')
            : `{"clientId": "${currentClientObject?.client_id}", "secret": "new-secret"}`;
      } else if (currentAction === 'delete') {
        clientActionSubmitButton.innerText = `${actionButton?.delete ?? ''}`;
        clientActionSubmitButton.removeAttribute('disabled');
        clientDefinitionTextArea.innerText =
          currentClientObject === undefined
            ? (clientAdministratorText?.oauthClientSelectorText as string ?? '')
            : `${currentClientObject?.client_id}`;
      } else {
        clientActionSubmitButton.innerText = `${actionButton?.default ?? ''}`;
        clientActionSubmitButton.setAttribute('disabled', 'true');
        clientDefinitionTextArea.innerText = `${actionTextArray?.[0]?.text ?? ''}`;
        clientActionSubmitButton.onclick = () => {};
      }
    };

    // Add the OAuth Client Actions to the dropdown
    if (actionTextArray) {
      for (const clientAction of actionTextArray) {
        const clientActionOpt = document.createElement('option');
        clientActionOpt.value = clientAction.value;
        clientActionOpt.innerHTML = clientAction.text;
        clientActionDropdown.append(clientActionOpt);
      }
    }

    // Add separation lines
    const newLineACM2 = document.createElement('br');
    const newLineACM3 = document.createElement('br');
    const newLineACM4 = document.createElement('br');

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
  },
});
