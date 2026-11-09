// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos live in media/images/engagement/ at their served size
// (resized in place), so the stylesheets reference them via plain url()
// and Vite bundles + content-hashes them. The gallery is injected into
// #engagement-shoot at transform time carrying only the photo id; its
// thumbnails get their background from the per-id CSS rules in
// css/engagement-photos.scss, which reference the same url() as the
// detail ::before rules, so the gallery and the CSS share one file per
// photo. The photo id list the stylesheet iterates is injected by
// vite.config.ts via additionalData — no file is written to disk. The
// Analytics snippet is inlined from js/google-analytics.js. Everything
// else the old plugin did — the <head> composition, the body assembly,
// the relative <img> paths — now lives in index.html itself, so Vite
// handles it. HTML minification is handled by vite-plugin-minify.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ENGAGEMENT_DIR = path.join(import.meta.dirname, '..', 'media', 'images', 'engagement');

export function readEngagementFiles(): string[] {
    return readdirSync(ENGAGEMENT_DIR)
        .filter((file) => file.endsWith('.jpg'))
        .sort();
}

const GA_SCRIPT_TAG = '<script src="/js/google-analytics.js"></script>';

export function lizanddustinPlugin(): Plugin {
    return {
        name: 'lizanddustin-build',

        transformIndexHtml: {
            order: 'pre',
            handler(html: string): string {
                if (!html.includes(GA_SCRIPT_TAG)) {
                    throw new Error('google-analytics script tag not found in index.html');
                }
                const withAnalytics = html.replace(
                    GA_SCRIPT_TAG,
                    () =>
                        `<script>${readFileSync(path.join(import.meta.dirname, '..', 'js', 'google-analytics.js'), 'utf8').trim()}</script>`,
                );

                // The href's image= value is never read; getIdFromHash
                // only takes the part before '&'.
                const galleryItems = readEngagementFiles()
                    .map((file) => {
                        const id = path.basename(file, '.jpg');
                        return `<li><a data-gallery-img="${id}" href="#!gallery&image=${id}"></a></li>`;
                    })
                    .join('');
                const withGallery = withAnalytics.replace(
                    '<div id="engagement-shoot"></div>',
                    `<div id="engagement-shoot"><ul>${galleryItems}</ul></div>`,
                );

                return withGallery;
            },
        },
    };
}
