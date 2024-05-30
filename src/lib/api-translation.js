import dictionaryEn from "../../locales/en/api-responses.json";

const fetchLanguageFile = async (locale, section) => {
  try {
    const finalDictionary = await import(
      `../../locales/${locale}/api-responses.json`
    );

    if (!finalDictionary)
      throw new Error(`No dictionary found for ${locale}/api-responses.json`);

    return finalDictionary[section];
  } catch (e) {
    console.error(e);
  }
  return dictionaryEn[section];
};

async function translateApi(req, section) {
  const locale = req.cookies.get("NEXT_LOCALE") || "en";
  const dictionary = await fetchLanguageFile(locale, section);

  return {
    t: (key, ...args) => {
      let text = dictionary[key] || key;
      if (args.length === 0) return text;

      if (typeof args[0] === "object") {
        return Object.entries(args[0]).reduce((acc, [key, value]) => {
          return acc.replace(`{${key}}`, value);
        }, text);
      }

      return args.reduce((acc, value, index) => {
        return acc.replace(`{${index}}`, value);
      }, text);
    },
  };
}

export default translateApi;
