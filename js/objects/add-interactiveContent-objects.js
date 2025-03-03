/**
 * Create a Interactive Content Object
 *
 * @param {Object} interactiveContentObject - Contains the definition of the interactiveContent Object
 * @param {String} paneID - The shorthand of the page which will contain the object
 * @returns a interactive content object
 */
async function addInteractiveContentObject(interactiveContentObject, paneID) {
    let interactiveContentContainer = document.createElement('iframe');
    interactiveContentContainer.setAttribute(
        'id',
        `${paneID}-obj-${interactiveContentObject?.id}`
    );
    interactiveContentContainer.setAttribute(
        'src',
        interactiveContentObject?.isViyaContent
            ? `${window.VIYA}${interactiveContentObject?.link}`
            : interactiveContentObject?.link
    );

    // Check for CORS exceptions
    if (interactiveContentObject?.exception?.isException == 0) {
        interactiveContentContainer.style.width = '100%';
        if (interactiveContentObject?.height) {
            interactiveContentContainer.style.height = '93%';
        } else {
            interactiveContentContainer.setAttribute(
                'onload',
                'this.height=this.contentWindow.document.body.scrollHeight + 50;'
            );
        }
    } else {
        interactiveContentContainer.style.width = `${interactiveContentObject?.isException?.width}px`;
        interactiveContentContainer.style.height = `${interactiveContentObject?.isException?.height}px`;
    }

    return interactiveContentContainer;
}
