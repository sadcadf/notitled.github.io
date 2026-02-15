// ============================================
// THEME MANAGER
// ============================================

import { CONFIG } from '../core/config.js';

const THEME_CYCLE = ['dark', 'reading', 'light'];

/**
 * Manages light/dark/reading theme switching
 */
export class ThemeManager {
    constructor() {
        this.toggleButton = document.querySelector('.theme-toggle');
    }

    /**
     * Initialize theme from saved preference or system default
     */
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && THEME_CYCLE.includes(savedTheme)) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    /**
     * Setup theme toggle button listener
     */
    setupToggle() {
        if (!this.toggleButton) return;

        this.toggleButton.addEventListener('click', () => this.toggle());
    }

    /**
     * Cycle through themes: dark → reading → light → dark
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const currentIndex = THEME_CYCLE.indexOf(currentTheme);
        const newTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        this.updateMetaThemeColor(newTheme);
    }

    /**
     * Update meta theme-color for browser UI
     * @param {string} theme
     */
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const colors = { dark: '#1a1a1a', reading: '#1e1e1c', light: '#ffffff' };
            metaThemeColor.setAttribute('content', colors[theme] || '#1a1a1a');
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }
}
