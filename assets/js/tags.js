// ============================================
// TAGS MODULE - Tag Management
// ============================================

import { CONFIG } from './config.js';

/**
 * Tags Manager for filtering and displaying posts by tags
 */
export class TagsManager {
    constructor(posts) {
        this.posts = posts;
    }

    /**
     * Update posts reference
     * @param {Array} posts 
     */
    setPosts(posts) {
        this.posts = posts;
    }

    /**
     * Get all unique tags from posts
     * @returns {Array<{name: string, count: number}>} Tags with counts
     */
    getAllTags() {
        const tagCounts = new Map();

        this.posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    const normalizedTag = tag.toLowerCase();
                    tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
                });
            }
        });

        return Array.from(tagCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get all unique categories
     * @returns {Array<{name: string, count: number}>}
     */
    getAllCategories() {
        const categoryCounts = new Map();

        this.posts.forEach(post => {
            if (post.category) {
                const cat = post.category;
                categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
            }
        });

        return Array.from(categoryCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get posts by tag
     * @param {string} tag - Tag name
     * @returns {Array} Filtered posts
     */
    getPostsByTag(tag) {
        const normalizedTag = tag.toLowerCase();
        return this.posts.filter(post =>
            post.tags &&
            post.tags.some(t => t.toLowerCase() === normalizedTag)
        );
    }

    /**
     * Get posts by category
     * @param {string} category - Category name
     * @returns {Array} Filtered posts
     */
    getPostsByCategory(category) {
        return this.posts.filter(post => post.category === category);
    }

    /**
     * Check if tag exists
     * @param {string} tag 
     * @returns {boolean}
     */
    hasTag(tag) {
        const normalizedTag = tag.toLowerCase();
        return this.posts.some(post =>
            post.tags &&
            post.tags.some(t => t.toLowerCase() === normalizedTag)
        );
    }
}
