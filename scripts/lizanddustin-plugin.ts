// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos need the old pipeline's treatment (resize, the 2894
// bottom-half crop, SHA-1 content names, and the SCSS hash maps), so they
// are prepared up front and emitted as assets; the gallery is then injected
// into #engagement-shoot from the same manifest, the Analytics snippet is
// inlined from js/google-analytics.js, and the body is minified the way the
// old minify_html step did. Everything else the old plugin did — the <head>
// composition, the body assembly, the relative <img> paths — now lives in
// index.html itself, so Vite handles it.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { prepareAssets } from './build-assets';
import type { PreparedAssets } from './build-assets';

let prepared: PreparedAssets | null = null;

// The script-include tag in index.html that transformIndexHtml replaces
// with the inlined Analytics snippet from js/google-analytics.js.
const GA_SCRIPT_TAG = '<script src="/js/google-analytics.js"></script>';

export function lizanddustinPlugin(): Plugin {
    return {
        name: 'lizanddustin-build',

        async buildStart() {
            // Resize + hash images and generate the SCSS maps before Sass runs.
            prepared = await prepareAssets();
        },

        generateBundle() {
            if (!prepared) {
                throw new Error('assets were not prepared before generateBundle');
            }
            // Emit the hashed images at the site root.
            for (const file of prepared.files) {
                this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source });
            }
        },

        // Runs before Vite's own index.html processing so the injected
        // gallery <li>s and the inlined Analytics snippet are in place
        // when it bundles the page.
        transformIndexHtml: {
            order: 'pre',
            handler(html: string): string {
                if (!prepared) {
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

                // Generate the engagement gallery from the JPG glob.
                const galleryItems = Object.entries(prepared.manifest)
                    .filter(([original]) => original.startsWith('media/images/engagement/'))
                    .sort(([a], [b]) => (a < b ? -1 : 1))
                    .map(
                        ([, served]) =>
                            `<li><a href="#!gallery&image=${served}" style="background-image:url(${served})"></a></li>`,
                    )
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
