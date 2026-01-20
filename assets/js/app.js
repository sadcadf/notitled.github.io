// ============================================
// BLOG APPLICATION - Main Entry Point
// ============================================

import { CONFIG } from './config.js';
import { calculateReadTime, debounce } from './utils.js';
import { ThemeManager } from './theme.js';
import { Router } from './router.js';
import { PostsAPI } from './api.js';
import { SEOManager } from './seo.js';
import { TagsManager } from './tags.js';
import { Paginator } from './pagination.js';
import { TOCGenerator } from './toc.js';
import { ShareManager } from './share.js';
import {
    renderPostsList,
    renderPost,
    renderSearchPage,
    renderSearchResults,
    renderContactsPage,
    renderError,
    renderTagsPage,
    renderTagPosts
} from './templates.js';

// Global Error Handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Main Blog Application
 */
class Blog {
    constructor() {
        // DOM elements
        this.app = document.getElementById('app');
        this.loading = document.getElementById('loading');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');

        // Managers
        this.theme = new ThemeManager();
        this.api = new PostsAPI();
        this.seo = new SEOManager();
        this.tags = new TagsManager([]);
        this.paginator = new Paginator();
        this.toc = new TOCGenerator();
        this.share = new ShareManager();
        this.tocObserver = null;
        this.router = new Router((view, slug, updateMeta) => this.handleNavigation(view, slug, updateMeta));

        this.init();
    }

    async init() {
        // Configure marked.js
        this.configureMarked();

        // Initialize theme
        this.theme.init();
        this.theme.setupToggle();

        // Initialize share
        this.share.init();

        // Setup UI
        this.setupScrollToTop();

        // Load posts
        await this.api.loadPosts();

        // Update tags manager with posts
        this.tags.setPosts(this.api.getPosts());

        // Initialize router (handles initial route)
        this.router.init();

        // Initial render
        await this.render();

        // Register Service Worker
        this.registerServiceWorker();
    }

    /**
     * Configure marked.js parser
     */
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false
            });
        }
    }

    /**
     * Register Service Worker for PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    /**
     * Handle navigation events from router
     */
    async handleNavigation(view, slug, updateMeta) {
        if (updateMeta) {
            const post = slug && view === 'post' ? this.api.findBySlug(slug) : null;
            this.seo.update(view, post);
        }
        await this.render();
    }

    /**
     * Setup scroll to top button
     */
    setupScrollToTop() {
        if (!this.scrollToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
                this.scrollToTopBtn.classList.add('visible');
            } else {
                this.scrollToTopBtn.classList.remove('visible');
            }

            const { view } = this.router.getCurrentRoute();
            if (view === 'post') {
                this.updateReadingProgress();
            }
        });

        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Update reading progress bar
     */
    updateReadingProgress() {
        const progressBar = document.querySelector('.reading-progress');
        if (!progressBar) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (window.scrollY / documentHeight) * 100;

        progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }

    /**
     * Add reading progress bar to page
     */
    addReadingProgress() {
        const existing = document.querySelector('.reading-progress');
        if (existing) existing.remove();

        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);
    }

    /**
     * Main render function
     */
    async render() {
        this.showLoading();

        // Cleanup previous TOC observer
        if (this.tocObserver) {
            this.tocObserver.disconnect();
            this.tocObserver = null;
        }

        const { view, slug, tag, page } = this.router.getCurrentRoute();
        let content = '';

        switch (view) {
            case 'home':
                content = this.renderHome(page);
                break;
            case 'post':
                content = await this.renderPostView(slug);
                break;
            case 'search':
                content = renderSearchPage();
                break;
            case 'contacts':
                content = renderContactsPage();
                break;
            case 'tags':
                content = renderTagsPage(this.tags.getAllTags());
                break;
            case 'tag':
                content = this.renderTagView(tag || slug);
                break;
            default:
                content = this.renderHome(page);
        }

        // Remove reading progress bar if not on post page
        if (view !== 'post') {
            const existing = document.querySelector('.reading-progress');
            if (existing) existing.remove();
        }

        // Update DOM
        requestAnimationFrame(() => {
            this.app.innerHTML = content;
            this.hideLoading();

            this.setupDynamicListeners(view);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Render home page with pagination
     */
    renderHome(page = 1) {
        const posts = this.api.getPosts();
        const { items, pagination } = this.paginator.paginate(posts, page);
        return renderPostsList(items, pagination);
    }

    /**
     * Render posts filtered by tag
     */
    renderTagView(tagName) {
        const posts = this.tags.getPostsByTag(tagName);
        return renderTagPosts(tagName, posts);
    }

    /**
     * Render post view with loaded content and TOC
     */
    async renderPostView(slug) {
        const post = this.api.findBySlug(slug);

        if (!post) {
            return renderError();
        }

        let content = await this.api.loadPost(slug);
        const readTime = calculateReadTime(content);

        // Generate TOC
        const { toc, html: modifiedContent } = this.toc.generate(content);
        const tocHTML = this.toc.render(toc);

        // Store TOC data for scroll spy
        this.currentTOC = toc;

        return renderPost(post, modifiedContent, readTime, tocHTML);
    }

    /**
     * Setup dynamic event listeners after render
     */
    setupDynamicListeners(view) {
        // Post card click handlers
        if (view === 'home' || view === 'tag') {
            this.setupPostCardListeners();
        }

        // Pagination handlers
        if (view === 'home') {
            this.setupPaginationListeners();
        }

        // Tag click handlers (prevent card navigation)
        this.setupTagClickListeners();

        // Back button
        const backButton = this.app.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.router.navigateTo('home');
            });
        }

        // Reading progress and TOC for posts
        if (view === 'post') {
            this.addReadingProgress();

            // Setup TOC scroll spy
            if (this.currentTOC && this.currentTOC.length > 0) {
                this.tocObserver = this.toc.setupScrollSpy(this.currentTOC);
            }

            // TOC link smooth scroll
            document.querySelectorAll('.toc-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Setup share button
            this.setupShareButton();
        }

        // Search page setup
        if (view === 'search') {
            this.setupSearchPage();
        }
    }

    /**
     * Setup post card click listeners
     */
    setupPostCardListeners() {
        const cards = this.app.querySelectorAll('.post-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking a tag
                if (e.target.closest('.tag')) return;

                const slug = card.dataset.slug;
                this.router.navigateTo('post', slug);
            });
        });
    }

    /**
     * Setup tag click listeners
     */
    setupTagClickListeners() {
        const tags = this.app.querySelectorAll('.tag[data-tag]');
        tags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tagName = tag.dataset.tag;
                this.router.navigateTo('tag', tagName);
            });
        });
    }

    /**
     * Setup pagination button listeners
     */
    setupPaginationListeners() {
        const pagination = this.app.querySelector('.pagination');
        if (!pagination) return;

        pagination.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page && !btn.disabled) {
                    this.router.goToPage(page);
                }
            });
        });
    }

    /**
     * Setup share button click listener
     */
    setupShareButton() {
        const shareBtn = this.app.querySelector('.share-button');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const post = {
                    slug: shareBtn.dataset.slug,
                    title: shareBtn.dataset.title,
                    excerpt: shareBtn.dataset.excerpt
                };

                this.share.open(post, shareBtn);
            });
        }
    }

    /**
     * Setup search page functionality
     */
    setupSearchPage() {
        const searchInput = document.getElementById('search-page-input');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !searchResults) return;

        const displayResults = debounce((query) => {
            const results = this.api.search(query);
            searchResults.innerHTML = renderSearchResults(results, query);

            // Setup click handlers for result cards
            this.setupPostCardListeners();
            this.setupTagClickListeners();
        });

        searchInput.addEventListener('input', (e) => {
            displayResults(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                displayResults('');
            }
        });
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        if (this.loading) {
            this.loading.classList.remove('hidden');
        }
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        if (this.loading) {
            this.loading.classList.add('hidden');
        }
    }
}

// ============================================
// INITIALIZE APP
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Blog();
    });
} else {
    new Blog();
}
