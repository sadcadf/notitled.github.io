// ============================================
// HTML TEMPLATES
// ============================================

import { CONFIG, CONTACTS } from './config.js';
import { formatDate, escapeHtml } from './utils.js';

/**
 * Render tags for a post
 * @param {Array} tags - Tag names
 * @returns {string} HTML string
 */
export function renderTags(tags) {
    if (!tags || tags.length === 0) return '';

    const tagsHTML = tags.map(tag =>
        `<a href="#tag/${encodeURIComponent(tag)}" class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`
    ).join('');

    return `<div class="post-tags">${tagsHTML}</div>`;
}

/**
 * Render a single post card
 * @param {Object} post - Post metadata
 * @param {number} index - Card index for animation delay
 * @param {boolean} showTags - Whether to show tags
 * @returns {string} HTML string
 */
export function renderPostCard(post, index = 0, showTags = true) {
    const previewHTML = post.preview ? `
        <div class="post-card-preview">
            <img src="${escapeHtml(post.preview)}" 
                 alt="${escapeHtml(post.title)}"
                 loading="lazy">
        </div>
    ` : '';

    const tagsHTML = showTags ? renderTags(post.tags) : '';

    return `
        <article class="post-card" data-slug="${post.slug}" style="animation-delay: ${index * CONFIG.ANIMATION_DELAY_INCREMENT}ms">
            ${previewHTML}
            <div class="post-card-content">
                <div class="post-card-date">${formatDate(post.date)}</div>
                <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
                <p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>
                ${tagsHTML}
                <div class="post-card-meta">
                    <span class="post-card-read-more">Читать далее</span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Render posts list grid with optional pagination
 * @param {Array} posts - Array of posts
 * @param {Object} pagination - Pagination info {currentPage, totalPages, hasNext, hasPrev}
 * @returns {string} HTML string
 */
export function renderPostsList(posts, pagination = null) {
    if (posts.length === 0) {
        return `
            <div class="empty-state">
                <h2>Пока нет постов</h2>
                <p>Добавьте свой первый пост в папку <code>posts/</code></p>
            </div>
        `;
    }

    const postsHTML = posts.map((post, index) => renderPostCard(post, index)).join('');
    const paginationHTML = pagination ? renderPagination(pagination) : '';

    return `
        <div class="posts-grid">
            ${postsHTML}
        </div>
        ${paginationHTML}
    `;
}

/**
 * Render pagination controls
 * @param {Object} pagination - {currentPage, totalPages, hasNext, hasPrev}
 * @returns {string} HTML string
 */
export function renderPagination(pagination) {
    if (!pagination || pagination.totalPages <= 1) return '';

    const { currentPage, totalPages, hasNext, hasPrev } = pagination;

    let pagesHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? 'active' : '';
        pagesHTML += `<button class="pagination-page ${isActive}" data-page="${i}">${i}</button>`;
    }

    return `
        <nav class="pagination" aria-label="Навигация по страницам">
            <button class="pagination-btn pagination-prev" ${!hasPrev ? 'disabled' : ''} data-page="${currentPage - 1}">
                ← Назад
            </button>
            <div class="pagination-pages">
                ${pagesHTML}
            </div>
            <button class="pagination-btn pagination-next" ${!hasNext ? 'disabled' : ''} data-page="${currentPage + 1}">
                Вперёд →
            </button>
        </nav>
    `;
}

/**
 * Render single post view with tags
 * @param {Object} post - Post metadata
 * @param {string} content - Parsed HTML content
 * @param {number} readTime - Reading time in minutes
 * @param {string} tocHTML - Table of contents HTML (optional)
 * @returns {string} HTML string
 */
export function renderPost(post, content, readTime, tocHTML = '') {
    const tagsHTML = renderTags(post.tags);

    return `
        <article class="post-view">
            <a href="#" class="back-button">Назад к постам</a>
            <header class="post-header">
                <div class="post-date">${formatDate(post.date)} • ${readTime} мин чтения</div>
                <h1 class="post-title">${escapeHtml(post.title)}</h1>
                ${tagsHTML}
                <div class="post-header-actions">
                    <button class="share-button" data-slug="${post.slug}" data-title="${escapeHtml(post.title)}" data-excerpt="${escapeHtml(post.excerpt)}" aria-label="Поделиться статьёй">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        <span>Поделиться</span>
                    </button>
                </div>
            </header>
            ${tocHTML}
            <div class="post-content">
                ${content}
            </div>
        </article>
    `;
}

/**
 * Render tags cloud page
 * @param {Array} tags - Array of {name, count}
 * @returns {string} HTML string
 */
export function renderTagsPage(tags) {
    if (tags.length === 0) {
        return `
            <div class="tags-page">
                <h1>Теги</h1>
                <div class="empty-state">
                    <p>Пока нет тегов</p>
                </div>
            </div>
        `;
    }

    const tagsHTML = tags.map(tag => `
        <a href="#tag/${encodeURIComponent(tag.name)}" class="tag-cloud-item">
            <span class="tag-name">${escapeHtml(tag.name)}</span>
            <span class="tag-count">${tag.count}</span>
        </a>
    `).join('');

    return `
        <div class="tags-page">
            <h1>Теги</h1>
            <div class="tags-cloud">
                ${tagsHTML}
            </div>
        </div>
    `;
}

/**
 * Render posts filtered by tag
 * @param {string} tagName - Tag name
 * @param {Array} posts - Filtered posts
 * @returns {string} HTML string
 */
export function renderTagPosts(tagName, posts) {
    const postsHTML = posts.length > 0
        ? posts.map((post, index) => renderPostCard(post, index)).join('')
        : '<div class="empty-state"><p>Нет постов с этим тегом</p></div>';

    return `
        <div class="tag-posts-page">
            <a href="#" class="back-button">Все посты</a>
            <h1>Тег: ${escapeHtml(tagName)}</h1>
            <p class="tag-posts-count">Постов: ${posts.length}</p>
            <div class="posts-grid">
                ${postsHTML}
            </div>
        </div>
    `;
}

/**
 * Render search page
 * @returns {string} HTML string
 */
export function renderSearchPage() {
    return `
        <div class="search-page">
            <h1>Поиск по постам</h1>
            
            <div class="search-container-page">
                <input type="search" 
                       class="search-input" 
                       id="search-page-input" 
                       placeholder="Начните вводить для поиска..." 
                       autocomplete="off" 
                       autofocus>
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
            </div>
            
            <div id="search-results" class="search-results">
                <p class="search-hint">Введите запрос для поиска по заголовкам и описаниям постов</p>
            </div>
        </div>
    `;
}

/**
 * Render search results
 * @param {Array} results - Matching posts
 * @param {string} query - Search query
 * @returns {string} HTML string
 */
export function renderSearchResults(results, query) {
    if (!query.trim()) {
        return '<p class="search-hint">Введите запрос для поиска по заголовкам и описаниям постов</p>';
    }

    if (results.length === 0) {
        return `
            <div class="empty-state">
                <h2>🔍 Ничего не найдено</h2>
                <p>Попробуйте изменить поисковый запрос</p>
            </div>
        `;
    }

    const postsHTML = results.map((post, index) => renderPostCard(post, index)).join('');

    return `
        <p class="search-count">Найдено постов: ${results.length}</p>
        <div class="posts-grid">
            ${postsHTML}
        </div>
    `;
}

/**
 * Render contacts page
 * @returns {string} HTML string
 */
export function renderContactsPage() {
    return `
        <div class="contacts-page">
            <h1>Контакты</h1>
            
            <div class="contact-item">
                <label>Email</label>
                <div class="contact-value">
                    <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>
                </div>
            </div>
            
            <div class="contact-item">
                <label>Telegram</label>
                <div class="contact-value">
                    <a href="https://t.me/${CONTACTS.telegram.replace('@', '')}" target="_blank" rel="noopener">${CONTACTS.telegram}</a>
                </div>
            </div>
            
            <div class="contact-item">
                <label>GitHub</label>
                <div class="contact-value">
                    <a href="https://github.com/${CONTACTS.github}" target="_blank" rel="noopener">github.com/${CONTACTS.github}</a>
                </div>
            </div>
            
            <div class="contact-item">
                <label>Twitter / X</label>
                <div class="contact-value">
                    <a href="https://twitter.com/${CONTACTS.twitter.replace('@', '')}" target="_blank" rel="noopener">${CONTACTS.twitter}</a>
                </div>
            </div>
            
            <div class="contact-item">
                <label>LinkedIn</label>
                <div class="contact-value">
                    <a href="https://linkedin.com/in/${CONTACTS.linkedin}" target="_blank" rel="noopener">linkedin.com/in/${CONTACTS.linkedin}</a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render error page
 * @returns {string} HTML string
 */
export function renderError() {
    return '<div class="error">Пост не найден</div>';
}
