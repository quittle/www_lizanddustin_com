// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos live in media/images/engagement/ at their served size
// (resized in place), so the stylesheets reference them via plain url()
// and Vite bundles + content-hashes them. The gallery is injected into
// #engagement-shoot at transform time carrying only the photo id; its
// thumbnails get their background from the per-id CSS rules in
// css/engagement-photos.scss, which reference the same url() as the
// detail ::before rules, so the gallery and the CSS share one file per
// photo. The Analytics snippet is inlined from js/google-analytics.js,
// and the body is minified the way the old minify_html step did. Everything
// else the old plugin did — the <head> composition, the body assembly, the
// relative <img> paths — now lives in index.html itself, so Vite handles it.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { prepareAssets } from './build-assets';

// The sorted engagement filenames, in media/images/engagement/. The
// gallery <li>s are injected in the same order the old manifest build
// used: sorted by original path, so '3100-2.jpg' precedes '3100.jpg'
// ('-' < '.'), which a plain id sort would reverse.
let engagementFiles: string[] | null = null;

// The script-include tag in index.html that transformIndexHtml replaces
// with the inlined Analytics snippet from js/google-analytics.js.
const GA_SCRIPT_TAG = '<script src="/js/google-analytics.js"></script>';

export function lizanddustinPlugin(): Plugin {
    return {
        name: 'lizanddustin-build',

        async buildStart() {
            // Write the photo id list before Sass runs, so the stylesheet
            // iterates the folder contents.
            engagementFiles = await prepareAssets();
        },

        // Runs before Vite's own index.html processing so the injected
        // gallery <li>s and the inlined Analytics snippet are in place
        // when it bundles the page.
        transformIndexHtml: {
            order: 'pre',
            handler(html: string): string {
                if (!engagementFiles) {
                    throw new Error('assets were not prepared before transformIndexHtml');
                }
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
                const galleryItems = engagementFiles
                    .map((file) => `media/images/engagement/${file}`)
                    .sort()
                    .map((original) => {
                        const id = path.basename(original, '.jpg');
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
