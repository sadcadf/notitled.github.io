import { TRANSLATIONS } from '../utils/translations.js';

/**
 * Manages application language state and translations
 */
export class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ru';
        this.init();
    }

    init() {
        // Handle language from URL parameter (?lang=en or ?lang=ru)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        if (urlLang && (urlLang === 'ru' || urlLang === 'en')) {
            this.currentLang = urlLang;
            localStorage.setItem('language', urlLang);

            // Clean up URL if needed (optional, but keeps it tidy)
            // const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
            // window.history.replaceState({path:cleanUrl}, '', cleanUrl);
        }

        document.documentElement.lang = this.currentLang === 'ru' ? 'ru' : 'en';

        // Update lang toggle aria-label
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.setAttribute('aria-label',
                this.currentLang === 'ru' ? 'Switch to English' : 'Переключить на русский'
            );
        }
    }

    /**
     * Get current language
     * @returns {string} 'ru' or 'en'
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Switch language
     * @param {string} lang - 'ru' or 'en'
     */
    setLanguage(lang) {
        if (this.currentLang === lang) return;
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
        window.location.reload(); // Simplest way to re-render everything with new strings
    }

    /**
     * Toggle language between ru and en
     */
    toggleLanguage() {
        const newLang = this.currentLang === 'ru' ? 'en' : 'ru';
        this.setLanguage(newLang);
    }

    /**
     * Get translated string by key path (e.g., 'nav.home')
     * @param {string} path - Key path
     * @returns {string} Translated string
     */
    t(path) {
        const keys = path.split('.');
        /** @type {any} */
        let result = TRANSLATIONS[/** @type {'ru'|'en'} */ (this.currentLang)];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                console.warn(`Translation key not found: ${path} for language: ${this.currentLang}`);
                return path;
            }
        }

        return result;
    }
}

export const i18n = new LanguageManager();
