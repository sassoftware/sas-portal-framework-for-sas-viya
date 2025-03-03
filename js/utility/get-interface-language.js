/**
 * Sets the language for the user interface for text generated by the portal itself
 *
 * @returns {Object} - Contains all of the static language interface
 */
async function getInterfaceLanguage() {
  // Load a json based on the browser language
  const userLang = navigator.language || navigator.userLanguage;
  const textLanguageJSON = await fetch(
    `./language/${userLang.substr(0, 2)}.json`
  );
  const textLanguageContent = await textLanguageJSON.json();

  return textLanguageContent;
}
