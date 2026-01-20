// ============================================
// POSTS API - Data Loading with Retry
// ============================================

import { CONFIG } from './config.js';
import { CacheManager } from './cache.js';
import { sleep } from './utils.js';

/**
 * Handles loading posts and markdown content
 */
export class PostsAPI {
    constructor() {
        this.cache = new CacheManager('blog_post_');
        this.posts = [];
        this.allPosts = [];
    }

    /**
     * Load posts index from JSON
     * @returns {Promise<Array>} Array of post metadata
     */
    async loadPosts() {
        try {
            const response = await fetch('posts/index.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить список постов');
            }

            this.allPosts = await response.json();
            this.posts = [...this.allPosts];

            // Sort by date (newest first)
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

            return this.posts;
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            this.posts = [];
            this.allPosts = [];
            return [];
        }
    }

    /**
     * Load single post markdown with retry logic
     * @param {string} slug - Post slug
     * @param {number} retries - Max retry attempts
     * @returns {Promise<string>} Parsed HTML content
     */
    async loadPost(slug, retries = CONFIG.MAX_RETRIES) {
        // Check cache first
        const cached = this.cache.get(slug);
        if (cached) {
            return cached;
        }

        // Retry mechanism
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(`posts/${slug}.md`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const markdown = await response.text();

                // Check if marked is available
                if (typeof marked === 'undefined') {
                    console.error('marked.js не загружен!');
                    throw new Error('Markdown парсер не загружен');
                }

                const html = marked.parse(markdown);

                // Cache the result
                this.cache.set(slug, html);

                return html;
            } catch (error) {
                const isLastAttempt = i === retries - 1;

                if (isLastAttempt) {
                    console.error('Failed to load post after retries:', error);
                    console.error('Slug:', slug);

                    return this.getErrorHTML(error.message);
                }

                // Exponential backoff
                const delay = CONFIG.RETRY_DELAY_BASE * (i + 1);
                console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    /**
     * Get error HTML template
     * @param {string} message - Error message
     * @returns {string} Error HTML
     */
    getErrorHTML(message) {
        return `
            <div class="error-state">
                <h2>😔 Пост не найден</h2>
                <p>К сожалению, этот пост недоступен.</p>
                <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 1rem;">
                    Ошибка: ${message}
                </p>
                <a href="#" class="back-button">Вернуться к постам</a>
            </div>
        `;
    }

    /**
     * Search posts by query
     * @param {string} query - Search query
     * @returns {Array} Matching posts
     */
    search(query) {
        if (!query.trim()) {
            return this.allPosts;
        }

        const lowerQuery = query.toLowerCase();
        return this.allPosts.filter(post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

    /**
     * Find post by slug
     * @param {string} slug - Post slug
     * @returns {Object|undefined} Post metadata
     */
    findBySlug(slug) {
        return this.posts.find(p => p.slug === slug) ||
            this.allPosts.find(p => p.slug === slug);
    }

    /**
     * Get all posts
     * @returns {Array} All posts
     */
    getPosts() {
        return this.posts;
    }
}
