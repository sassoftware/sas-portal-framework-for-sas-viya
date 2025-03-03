/**
 * Creates a Chat with Data Object
 *
 * @param {Object} chatWithDataObject - Contains the definition of the VAReport Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @param {Object} chatWithDataInterfaceText - Contains all of the Chat with Data relevant language interface
 * @returns a Chat with Data object
 */
async function addChatWithDataObject(
    chatWithDataObject,
    paneID,
    chatWithDataInterfaceText
) {
    const vacWrapper = document.createElement('div');
    vacWrapper.classList = 'container-fluid';
    vacWrapper.id = `${paneID}-obj-${chatWithDataObject?.id}-`;

    const vacRow = document.createElement('div');
    vacRow.classList = 'row';
    vacWrapper.appendChild(vacRow);

    const chatAreaContainer = document.createElement('div');
    chatAreaContainer.classList = 'col-md-3 p-4';
    chatAreaContainer.id = `${paneID}-obj-${chatWithDataObject?.id}-chat-area`;
    chatAreaContainer.style.height = '73vh';
    chatAreaContainer.style.overflowY = 'auto';
    vacRow.appendChild(chatAreaContainer);

    const chatHeader = document.createElement('h2');
    chatHeader.innerText = chatWithDataInterfaceText?.chatHeader;
    chatAreaContainer.appendChild(chatHeader);

    const chatBoxContainer = document.createElement('div');
    chatBoxContainer.id = `${paneID}-obj-${chatWithDataObject?.id}-chat-box`;
    chatAreaContainer.appendChild(chatBoxContainer);

    const chatContainer = document.createElement('div');
    chatContainer.id = `${paneID}-obj-${chatWithDataObject?.id}-chat-container`;
    chatAreaContainer.appendChild(chatContainer);

    const chatInputGroup = document.createElement('div');
    chatInputGroup.classList = 'input-group mt-3';
    chatContainer.appendChild(chatInputGroup);

    const chatUserInput = document.createElement('input');
    chatUserInput.type = 'text';
    chatUserInput.id = `${paneID}-obj-${chatWithDataObject?.id}-user-input`;
    chatUserInput.classList = 'form-control';
    chatUserInput.placeholder = chatWithDataInterfaceText?.placeholder;
    chatUserInput.onkeydown = handleKeyPress;
    chatInputGroup.appendChild(chatUserInput);

    const sendButton = document.createElement('button');
    sendButton.classList = 'send-button ml-2';
    sendButton.onclick = sendMessage;
    chatInputGroup.appendChild(sendButton);

    const sendIcon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
    );
    sendIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    sendIcon.setAttribute('width', '24');
    sendIcon.setAttribute('height', '24');
    sendIcon.setAttribute('viewBox', '0 0 24 24');
    sendButton.appendChild(sendIcon);

    const sendIconPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
    );
    sendIconPath.setAttribute('d', 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z');
    sendIconPath.style.fill = 'var(--color-action-background-emphasis-normal)';
    sendIcon.appendChild(sendIconPath);

    const vaAreaContainer = document.createElement('div');
    //vaAreaContainer.classList = 'col-md-9 bg-primary table-responsive';
    vaAreaContainer.classList = 'col-md-9 table-responsive';
    vaAreaContainer.id = `${paneID}-obj-${chatWithDataObject?.id}-VA-area`;
    vaAreaContainer.style.padding = 0;
    vaAreaContainer.style.height = '73vh';
    vacRow.appendChild(vaAreaContainer);

    // Function to print user messages in the chat box
    function printUserMessage(message) {
        const chatBox = document.getElementById(
            `${paneID}-obj-${chatWithDataObject?.id}-chat-box`
        );
        const userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.innerHTML = message;
        chatBox.appendChild(userDiv);
        scrollToBottom();
    }

    // Function that returns a resource URI
    function getFirstResourceURI(response) {
        for (const item of response) {
            for (const link of item.links) {
                if (link.rel === 'resource') {
                    return link.uri;
                }
            }
        }
        return null;
    }

    // Function to return n elements from an Information Catalog Response
    function subsetICResponse(
        ICRESPONSE,
        text,
        keyword,
        numOfElements = 3,
        start = 0
    ) {
        let parsedResponse = [];
        for (
            let currentResponseIndex = 0;
            currentResponseIndex < ICRESPONSE.length &&
            currentResponseIndex < start + numOfElements;
            currentResponseIndex++
        ) {
            parsedResponse.push({
                text: `${text} ${start + 1 + currentResponseIndex}`,
                keyword: keyword,
                message:
                    keyword === 'displayReport'
                        ? getFirstResourceURI([
                              ICRESPONSE[currentResponseIndex],
                          ])
                        : ICRESPONSE[currentResponseIndex],
            });
        }
        return parsedResponse;
    }

    function addHTMLICTable(tableData) {
        let baseTable = document.createElement('table');
        baseTable.classList = 'table table-striped';

        let baseTableHeader = document.createElement('thead');
        let baseTableHeaderRow = document.createElement('tr');
        let baseTableHeaderKeyCol = document.createElement('th');
        baseTableHeaderKeyCol.scope = 'col';
        baseTableHeaderKeyCol.innerText = 'Key';
        let baseTableHeaderValueCol = document.createElement('th');
        baseTableHeaderValueCol.scope = 'col';
        baseTableHeaderValueCol.innerText = 'Value';
        baseTableHeaderRow.appendChild(baseTableHeaderKeyCol);
        baseTableHeaderRow.appendChild(baseTableHeaderValueCol);
        baseTableHeader.appendChild(baseTableHeaderRow);
        baseTable.appendChild(baseTableHeader);

        let baseTableBody = document.createElement('tbody');

        hasAttributes = false;
        hasLinks = false;

        for (let key in tableData) {
            let currentRow = document.createElement('tr');
            let currentKey = document.createElement('td');
            currentKey.innerText = key;
            let currentValue = document.createElement('td');
            let skipIteration = false;
            switch (key) {
                case 'attributes':
                    currentValue.innerText = JSON.stringify(tableData[key]);
                    hasAttributes = true;
                    skipIteration = true;
                    break;
                case 'links':
                    currentValue.innerText = JSON.stringify(tableData[key]);
                    hasLinks = true;
                    skipIteration = true;
                    break;
                case 'id':
                    let linkElement = document.createElement('a');
                    linkElement.href = `${VIYA}/SASInformationCatalog/details/~fs~catalog~fs~instances~fs~${tableData[key]}`;
                    linkElement.innerText =
                        'Review more information in SAS Information Catalog';
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener noreferrer';
                    currentValue.appendChild(linkElement);
                    break;
                default:
                    currentValue.innerText = tableData[key];
            }
            currentRow.appendChild(currentKey);
            currentRow.appendChild(currentValue);
            if (!skipIteration) {
                baseTableBody.appendChild(currentRow);
            }
        }

        if (hasAttributes) {
            let justAttributes = tableData['attributes'];
            for (let key in justAttributes) {
                let currentRow = document.createElement('tr');
                let currentKey = document.createElement('td');
                currentKey.innerText = key;
                let currentValue = document.createElement('td');
                currentValue.innerText = justAttributes[key];
                currentRow.appendChild(currentKey);
                currentRow.appendChild(currentValue);
                baseTableBody.appendChild(currentRow);
            }
        }

        if (hasLinks) {
            let justLinks = tableData['links'][0];
            for (let key in justLinks) {
                let currentRow = document.createElement('tr');
                let currentKey = document.createElement('td');
                currentKey.innerText = key;
                let currentValue = document.createElement('td');
                currentValue.innerText = justLinks[key];
                currentRow.appendChild(currentKey);
                currentRow.appendChild(currentValue);
                baseTableBody.appendChild(currentRow);
            }
        }

        baseTable.appendChild(baseTableBody);
        return baseTable;
    }

    async function collectICResponses(mainSearchTerms, indexType) {
        let mainSearchCatalogResponse = [];
        for (
            let mainSearchTerm = 0;
            mainSearchTerm < mainSearchTerms.length;
            mainSearchTerm++
        ) {
            mainSearchCatalogResponse.push(
                await searchInformationCatalog(
                    VIYA,
                    mainSearchTerms[mainSearchTerm],
                    indexType
                )
            );
        }
        let mainSearchResults = [];
        let mainSearchUniqueIDs = [];
        mainSearchCatalogResponse = mainSearchCatalogResponse.flat();

        function inArray(target, array) {
            for (var jSearch = 0; jSearch < array.length; jSearch++) {
                if (array[jSearch][1] === target) {
                    return array[jSearch][0];
                }
            }
            return -1;
        }

        for (
            let iSearch = 0;
            iSearch < mainSearchCatalogResponse.length;
            iSearch++
        ) {
            let isMainSearchUnique = inArray(
                mainSearchCatalogResponse[iSearch].id,
                mainSearchUniqueIDs
            );
            if (isMainSearchUnique > -1) {
                mainSearchResults[isMainSearchUnique].score +=
                    mainSearchCatalogResponse[iSearch].score;
            } else {
                mainSearchUniqueIDs.push([
                    iSearch,
                    mainSearchCatalogResponse[iSearch].id,
                ]);
                mainSearchResults.push(mainSearchCatalogResponse[iSearch]);
            }
        }
        mainSearchResults = mainSearchResults
            .flat()
            .sort(
                (aMainSearch, bMainSearch) =>
                    parseFloat(bMainSearch.score) -
                    parseFloat(aMainSearch.score)
            );

        // Remove sashadt for explore
        mainSearchResults = mainSearchResults.filter(
            (obj) => !obj.name.includes('.sashdat')
        );

        return mainSearchResults;
    }

    let columnLevelInformation = [];

    // Function to react to the users action
    async function runUserAction(keyword, message) {
        let prompt;
        let LLMRESPONSE;
        let ICResponse;
        let VAResponseContainer = document.getElementById(
            `${paneID}-obj-${chatWithDataObject?.id}-VA-area`
        );
        let mainSearchTerms;
        switch (keyword) {
            case 'data':
                printBotMessage(
                    chatWithDataInterfaceText?.understandRequest,
                    []
                );
                prompt = CWDPROMPTS(
                    keyword,
                    message,
                    chatWithDataObject?.model
                );
                LLMRESPONSE = await callLLM(
                    chatWithDataObject?.apiEndpoint,
                    chatWithDataObject?.apiKey,
                    chatWithDataObject?.model,
                    prompt
                );
                mainSearchTerms = Object.values(JSON.parse(LLMRESPONSE)).flat();
                printBotMessage(chatWithDataInterfaceText?.dataSearch, []);
                ICResponse = await collectICResponses(
                    mainSearchTerms,
                    'datasets'
                );
                printBotMessage(chatWithDataInterfaceText?.dataDisplay, [
                    ...subsetICResponse(
                        ICResponse,
                        'Display Table',
                        'displayTable'
                    ),
                    ...subsetICResponse(
                        ICResponse,
                        'Select Table',
                        'selectTable'
                    ),
                    {
                        text: 'Recommend Table',
                        keyword: 'recommendTable',
                        message: ICResponse[0],
                    },
                ]);
                break;
            case 'report':
                printBotMessage(
                    chatWithDataInterfaceText?.understandRequest,
                    []
                );
                prompt = CWDPROMPTS(
                    keyword,
                    message,
                    chatWithDataObject?.model
                );
                LLMRESPONSE = await callLLM(
                    chatWithDataObject?.apiEndpoint,
                    chatWithDataObject?.apiKey,
                    chatWithDataObject?.model,
                    prompt
                );
                mainSearchTerms = Object.values(JSON.parse(LLMRESPONSE)).flat();
                printBotMessage(chatWithDataInterfaceText?.reportSearch, []);
                ICResponse = await collectICResponses(
                    mainSearchTerms,
                    'reports'
                );
                printBotMessage(
                    chatWithDataInterfaceText?.reportDisplay,
                    subsetICResponse(ICResponse, 'Report', 'displayReport')
                );
                break;
            case 'displayReport':
                VAResponseContainer.innerHTML = '';
                vaAreaContainer.style.overflow = 'hidden';
                let newVAReport = await addVAReportObject(
                    { reportHeight: '730px', reportURI: message, id: 'DVAObj' },
                    'displayedVA'
                );

                VAResponseContainer.appendChild(newVAReport);
                currentVAReportURI = message;
                break;
            case 'displayTable':
                VAResponseContainer.innerHTML = '';
                vaAreaContainer.style.overflow = 'visible';
                let newICTable = addHTMLICTable(message);
                VAResponseContainer.appendChild(newICTable);
                break;
            case 'recommendTable':
                VAResponseContainer.innerHTML = '';
                printBotMessage(chatWithDataInterfaceText?.recommendATable);
                printBotMessage(
                    chatWithDataInterfaceText?.recommendedTableFound +
                        message?.name,
                    {
                        text: 'Display Table',
                        keyword: 'displayTable',
                        message: message,
                    }
                );
            case 'selectTable':
                VAResponseContainer.innerHTML = '';
                printBotMessage(chatWithDataInterfaceText?.createReport, []);
                let columnInfo = await getInformationCatalogInstance(
                    VIYA,
                    message?.id,
                    'match (t:dataSet)-[r:dataSetDataFields]->(c:dataField) return c'
                );
                columnLevelInformation = [];
                for (let col = 0; col < columnInfo.entities.length; col++) {
                    columnLevelInformation.push({
                        name: columnInfo.entities[col].name,
                        attributes: columnInfo.entities[col].attributes,
                        classification:
                            columnInfo.entities[col].attributes.casDataType ===
                            'varchar'
                                ? 'category'
                                : 'measure',
                    });
                }
                console.log(columnLevelInformation);
                createReportWithData(
                    window.VIYA,
                    `${chatWithDataInterfaceText?.reportTitle}${message?.name}`,
                    message?.attributes?.library,
                    message?.name
                );

                break;
            default:
                console.log(keyword);
            /*
                console.log(message);
                let result2 = CWDPROMPTS(
                    keyword,
                    message,
                    chatWithDataObject?.model
                );
                console.log(result2);
                */
        }
    }

    // Function to print bot messages with buttons
    function printBotMessage(message, buttons) {
        const chatBox = document.getElementById(
            `${paneID}-obj-${chatWithDataObject?.id}-chat-box`
        );
        const botDiv = document.createElement('div');
        botDiv.className = 'bot-message';
        botDiv.innerHTML = message;

        if (buttons && buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttons.forEach((buttonObject) => {
                const button = document.createElement('button');
                button.className = 'btn btn-primary mr-2';
                button.innerHTML = buttonObject.text;
                button.onclick = () => {
                    printBotMessage(
                        `${chatWithDataInterfaceText?.selectionChoice}${buttonObject.text}`,
                        []
                    );
                    runUserAction(buttonObject.keyword, buttonObject.message);
                };
                buttonContainer.appendChild(button);
            });
            botDiv.appendChild(buttonContainer);
        }

        chatBox.appendChild(botDiv);
        scrollToBottom();
    }

    let isFirstMessage = true;
    let currentVAReportURI;

    // Function to handle user input
    function sendMessage() {
        const userInput = document.getElementById(
            `${paneID}-obj-${chatWithDataObject?.id}-user-input`
        );
        const message = userInput.value;
        printUserMessage(message);

        if (message.trim() !== '') {
            if (isFirstMessage) {
                // Respond differently to the first message
                printBotMessage(chatWithDataInterfaceText?.firstQuestion, [
                    {
                        text: chatWithDataInterfaceText?.searchReport,
                        keyword: 'report',
                        message: message,
                    },
                    {
                        text: chatWithDataInterfaceText?.searchData,
                        keyword: 'data',
                        message: message,
                    },
                ]);
                isFirstMessage = false; // Set the flag to false after the first message
            } else {
                // Respond differently to follow-up messages
                /*
                printBotMessage(chatWithDataInterfaceText?.chooseOption, [
                    {
                        text: 'Option 1',
                        keyword: 'log',
                        message: message,
                    },
                    {
                        text: 'Option 2',
                        keyword: 'log',
                        message: message,
                    },
                    {
                        text: 'Option 3',
                        keyword: 'log',
                        message: message,
                    },
                ]);
                */
            }

            userInput.value = '';
        }
    }

    // Function to handle Enter key press in the input box
    function handleKeyPress(event) {
        if (event.keyCode === 13) {
            // Check if Enter key is pressed
            sendMessage(); // Trigger sendMessage function when Enter is pressed
        }
    }

    // Function to scroll to the bottom of the chat area
    function scrollToBottom() {
        const chatArea = document.getElementById(
            `${paneID}-obj-${chatWithDataObject?.id}-chat-area`
        );
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    return vacWrapper;
}
