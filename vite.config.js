import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,woff2,svg,png,webp,json}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/posts\/.*\.md$/, /^\/posts\/.*\.json$/],
                runtimeCaching: [
                    {
                        urlPattern: /\/posts\/.*\.(md|json)$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'posts-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 3600,
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Notitled',
                short_name: '101',
                description: 'love tech',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#0066ff',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/assets/images/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                    {
                        src: '/assets/images/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
        }),
    ],
});
