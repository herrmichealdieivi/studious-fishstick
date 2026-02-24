import { useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import arTranslations from '../translations/ar.json';

const translations = {
  en: enTranslations,
  ar: arTranslations
};

export function useTranslations(language = 'en') {
  const [text, setText] = useState(translations[language]);

  useEffect(() => {
    setText(translations[language] || translations.en);
  }, [language]);

  return text;
}
