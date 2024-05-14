import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { dictionaryEn } from "./default-dictionaries";

function useDictionary(section) {
  const router = useRouter();

  const [dictionary, setDictionary] = useState({
    ...dictionaryEn[section],
    locale: "en",
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchLanguageFile = async (section) => {
      try {
        const finalDictionary = await import(
          `../../locales/${router.locale}/${section}.json`
        );

        if (!finalDictionary)
          throw new Error(
            `No dictionary found for ${router.locale}/${section}.json`
          );

        return finalDictionary;
      } catch (e) {
        console.error(e);
      }
      return dictionaryEn[section];
    };

    const fetchDictionary = async () => {
      const dictionary = await fetchLanguageFile(section);
      setDictionary({
        ...dictionary,
        locale: router.locale,
      });
      setHasLoaded(true);
    };

    const isEnglish = !router.locale || router.locale === "en";
    if (isEnglish) return setHasLoaded(true);

    fetchDictionary(section);
  }, [router, section]);

  return {
    t: (key, ...args) => {
      let text = dictionary[key] || key;
      if (!args.length) return text;
      
      if (typeof args[0] === "object") {
        return Object.entries(args[0]).reduce((acc, [key, value]) => {
          return acc.replace(`{{${key}}}`, value);
        }, text);
      }

      if (typeof args === "array") {
        return args.reduce((acc, value, index) => {
          return acc.replace(`{{${index}}}`, value);
        }, text);
      }

      return text;
    },
    hasLoaded,
  };
}

export default useDictionary;
