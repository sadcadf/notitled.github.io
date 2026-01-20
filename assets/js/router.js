// ============================================
// ROUTER - Navigation & History Management
// ============================================

/**
 * Handles SPA navigation and browser history
 */
export class Router {
    constructor(onNavigate) {
        this.currentView = 'home';
        this.currentSlug = null;
        this.currentTag = null;
        this.currentPage = 1;
        this.onNavigate = onNavigate;
        this.navLinks = document.querySelectorAll('.nav-link');
    }

    /**
     * Initialize router with event listeners
     */
    init() {
        this.setupNavLinks();
        this.setupPopState();
        this.handleInitialRoute();
    }

    /**
     * Setup navigation link click handlers
     */
    setupNavLinks() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    /**
     * Handle browser back/forward buttons
     */
    setupPopState() {
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.currentView = e.state.view;
                this.currentSlug = e.state.slug;
                this.currentTag = e.state.tag || null;
                this.currentPage = e.state.page || 1;
                this.onNavigate(this.currentView, this.currentSlug, false);
            }
        });
    }

    /**
     * Handle initial page load route from URL hash
     */
    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            // Check for tag route: tag/tagname
            if (hash.startsWith('tag/')) {
                const tag = decodeURIComponent(hash.slice(4));
                this.navigateTo('tag', tag, false);
            }
            // Check for page route: page/2
            else if (hash.startsWith('page/')) {
                const page = parseInt(hash.slice(5)) || 1;
                this.currentPage = page;
                this.navigateTo('home', null, false);
            }
            // Static pages
            else if (['search', 'contacts', 'tags'].includes(hash)) {
                this.navigateTo(hash, null, false);
            }
            // Assume it's a post slug
            else if (hash) {
                this.navigateTo('post', hash, false);
            }
        }
    }

    /**
     * Navigate to a new view
     * @param {string} view - View name (home, post, search, contacts, tag, tags)
     * @param {string|null} slug - Post slug, tag name, or null
     * @param {boolean} pushState - Whether to push to browser history
     */
    navigateTo(view, slug = null, pushState = true) {
        this.currentView = view;
        this.currentSlug = slug;

        // Reset page when changing views (except pagination)
        if (view !== 'home') {
            this.currentPage = 1;
        }

        // Set tag for tag view
        if (view === 'tag') {
            this.currentTag = slug;
        } else {
            this.currentTag = null;
        }

        // Update active nav link
        this.updateActiveNavLink(view);

        // Update URL
        if (pushState) {
            const url = this.buildUrl(view, slug);
            history.pushState({ view, slug, tag: this.currentTag, page: this.currentPage }, '', url);
        }

        // Notify app of navigation
        this.onNavigate(view, slug, true);
    }

    /**
     * Navigate to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        this.currentPage = page;
        const url = page > 1 ? `#page/${page}` : '#';
        history.pushState({ view: 'home', slug: null, page }, '', url);
        this.onNavigate('home', null, true);
    }

    /**
     * Build URL for view
     * @param {string} view 
     * @param {string|null} slug 
     * @returns {string}
     */
    buildUrl(view, slug) {
        switch (view) {
            case 'tag':
                return `#tag/${encodeURIComponent(slug)}`;
            case 'post':
                return `#${slug}`;
            case 'home':
                return this.currentPage > 1 ? `#page/${this.currentPage}` : '#';
            default:
                return `#${view}`;
        }
    }

    /**
     * Update active state on nav links
     * @param {string} view - Current view
     */
    updateActiveNavLink(view) {
        this.navLinks.forEach(link => {
            const linkPage = link.dataset.page;
            // Home is active for home, tag views
            const isActive = linkPage === view ||
                (linkPage === 'home' && (view === 'tag' || view === 'tags'));
            link.classList.toggle('active', isActive);
        });
    }

    /**
     * Get current route info
     * @returns {{view: string, slug: string|null, tag: string|null, page: number}}
     */
    getCurrentRoute() {
        return {
            view: this.currentView,
            slug: this.currentSlug,
            tag: this.currentTag,
            page: this.currentPage
        };
    }
}
