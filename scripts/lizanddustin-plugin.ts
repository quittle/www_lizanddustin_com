// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos live in media/images/engagement/ at their served size
// (resized in place), so the stylesheets reference them via plain url()
// and Vite bundles + content-hashes them. The gallery is injected into
// #engagement-shoot at transform time carrying only the photo id; its
// thumbnails get their background from the per-id CSS rules in
// css/engagement-photos.scss, which reference the same url() as the
// detail ::before rules, so the gallery and the CSS share one file per
// photo. The photo id list the stylesheet iterates is served in memory
// by a Sass custom importer below — no file is written to disk. The
// Analytics snippet is inlined from js/google-analytics.js, and the body
// is minified the way the old minify_html step did. Everything else the
// old plugin did — the <head> composition, the body assembly, the
// relative <img> paths — now lives in index.html itself, so Vite handles it.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Importer } from 'sass';
import type { Plugin } from 'vite';

const ENGAGEMENT_DIR = path.join(import.meta.dirname, '..', 'media', 'images', 'engagement');

let cachedFiles: string[] | null = null;
function readEngagementFiles(): string[] {
    if (cachedFiles === null) {
        cachedFiles = readdirSync(ENGAGEMENT_DIR)
            .filter((file) => file.endsWith('.jpg'))
            .sort();
    }
    return cachedFiles;
}

// The photo id list as an in-memory file: a Sass custom importer serves
// it when main.scss asks for it, so no file is written to disk.
// (Sass requires canonicalize + load for a custom importer — findFileUrl
// is only for file-based importers, and may not be combined with load.)
const engagementIdsImporter: Importer<'async'> = {
    async canonicalize(url: string) {
        // Sass resolves relative imports to file:// URLs before calling
        // canonicalize, so match the resolved path as well as the bare name.
        const pathname = url.startsWith('file://') ? new URL(url).pathname : url;
        if (
            url === 'engagement-photo-ids' ||
            pathname.endsWith('/engagement-photo-ids') ||
            pathname.endsWith('/engagement-photo-ids.scss')
        ) {
            return new URL('in-memory:engagement-photo-ids');
        }
        return null;
    },
    async load(_url: URL) {
        const ids = readEngagementFiles().map((file) => file.slice(0, -'.jpg'.length));
        return {
            contents: `$engagement-photo-ids: (${ids.map((id) => `"${id}"`).join(', ')});`,
            syntax: 'scss' as const,
        };
    },
};

// The script-include tag in index.html that transformIndexHtml replaces
// with the inlined Analytics snippet from js/google-analytics.js.
const GA_SCRIPT_TAG = '<script src="/js/google-analytics.js"></script>';

export function lizanddustinPlugin(): Plugin {
    return {
        name: 'lizanddustin-build',

        config() {
            return {
                css: {
                    preprocessorOptions: {
                        scss: {
                            importer: engagementIdsImporter,
                        },
                    },
                },
            };
        },

        // Runs before Vite's own index.html processing so the injected
        // gallery <li>s and the inlined Analytics snippet are in place
        // when it bundles the page.
        transformIndexHtml: {
            order: 'pre',
            handler(html: string): string {
                // Inline the Analytics snippet from its own source file,
                // as the old build did.
                if (!html.includes(GA_SCRIPT_TAG)) {
                    throw new Error('google-analytics script tag not found in index.html');
                }
                const withAnalytics = html.replace(
                    GA_SCRIPT_TAG,
                    () =>
                        `<script>${readFileSync(path.join(import.meta.dirname, '..', 'js', 'google-analytics.js'), 'utf8').trim()}</script>`,
                );

                // Generate the engagement gallery. Each <li> carries only
                // the photo id — the thumbnail background comes from the
                // per-id CSS rule, and the href carries the id the same
                // way the old build's image= value did (nothing reads
                // that value; getIdFromHash only takes the part before
                // '&', so the click opens the gallery detail as before).
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

                // Minify the body the way the old minify_html step did: drop
                // comments and collapse whitespace between tags.
                return withGallery.replace(
                    /(<body>)([\s\S]*?)(<\/body>)/,
                    (_match: string, open: string, content: string, close: string) =>
                        open +
                        content.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim() +
                        close,
                );
            },
        },
    };
}
