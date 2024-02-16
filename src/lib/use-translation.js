import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { dictionaryEn } from "./default-dictionaries";

function useDictionary(section) {
  const router = useRouter();

  const [dictionary, setDictionary] = useState({
    ...dictionaryEn[section],
    locale: "en",
  });

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
    };

    const isEnglish = !router.locale || router.locale === "en";
    if (isEnglish) return;

    fetchDictionary(section);
  }, [router, section]);

  return (key) => dictionary[key] || key;
}

export default useDictionary;