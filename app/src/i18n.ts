import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from 'bimdown-editor/src/i18n/en.json';
import zh from 'bimdown-editor/src/i18n/zh.json';

const LEGACY_KEY = 'bimclaw-lang';
const NEW_KEY = 'bimdown-lang';

// Migrate legacy key
const oldVal = localStorage.getItem(LEGACY_KEY);
const newVal = localStorage.getItem(NEW_KEY);
if (oldVal && !newVal) {
  localStorage.setItem(NEW_KEY, oldVal);
}

const saved = newVal || oldVal;
const detected = navigator.language.startsWith('zh') ? 'zh' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: saved || detected,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: string) {
  localStorage.setItem(NEW_KEY, lang);
  localStorage.setItem(LEGACY_KEY, lang);
  i18n.changeLanguage(lang);
}

export default i18n;
