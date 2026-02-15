// ============================================
// THEME MANAGER
// ============================================

import { CONFIG } from '../core/config.js';

/**
 * Manages light/dark theme and reading mode
 */
export class ThemeManager {
    constructor() {
        this.toggleButton = document.querySelector('.theme-toggle');
        this.readingButton = document.querySelector('.reading-toggle');
    }

    /**
     * Initialize theme from saved preference or system default
     */
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        const readingMode = localStorage.getItem('reading-mode');
        if (readingMode === 'on') {
            document.documentElement.setAttribute('data-reading', 'on');
        }
    }

    /**
     * Setup theme toggle button listener
     */
    setupToggle() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }
        if (this.readingButton) {
            this.readingButton.addEventListener('click', () => this.toggleReading());
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        this.updateMetaThemeColor(newTheme);
    }

    /**
     * Toggle reading mode on/off
     */
    toggleReading() {
        const isOn = document.documentElement.getAttribute('data-reading') === 'on';
        if (isOn) {
            document.documentElement.removeAttribute('data-reading');
            localStorage.removeItem('reading-mode');
        } else {
            document.documentElement.setAttribute('data-reading', 'on');
            localStorage.setItem('reading-mode', 'on');
        }
    }

    /**
     * Update meta theme-color for browser UI
     * @param {string} theme - 'light' or 'dark'
     */
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}
