// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos need the old pipeline's treatment (resize, the 2894
// bottom-half crop), so they are prepared up front — resized once to
// generated/ with stable names — and the stylesheets reference them via
// plain url(), so Vite bundles and content-hashes them. The gallery is
// then injected into #engagement-shoot from the bundle fileNames, so the
// gallery and the CSS reference the same file per photo. The Analytics
// snippet is inlined from js/google-analytics.js, and the body is minified
// the way the old minify_html step did. Everything else the old plugin
// did — the <head> composition, the body assembly, the relative <img>
// paths — now lives in index.html itself, so Vite handles it.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';
import type { Plugin } from 'vite';
import { prepareAssets } from './build-assets';

// The sorted engagement filenames, as written to generated/ by
// prepareAssets(). The gallery is matched back to the bundle assets Vite
// emits for the CSS url()s by originalFileName.
let engagementFiles: string[] | null = null;

// The script-include tag in index.html that transformIndexHtml replaces
// with the inlined Analytics snippet from js/google-analytics.js.
const GA_SCRIPT_TAG = '<script src="/js/google-analytics.js"></script>';

// Vite emits a CSS url() asset as assets/<basename>-<hash>.<ext> and
// records the source path in originalFileName. Match on that — it is
// exact, including for hyphenated ids like 3100-2.
function assetForPhoto(bundle: OutputBundle, file: string) {
    return Object.values(bundle).find(
        (entry) =>
            entry.type === 'asset' &&
            entry.originalFileName === `generated/engagement/${file}`,
    );
}

export function lizanddustinPlugin(): Plugin {
    return {
        name: 'lizanddustin-build',

        async buildStart() {
            // Resize the images to generated/ before Sass runs, so the
            // url()s in the stylesheets resolve to real files.
            engagementFiles = await prepareAssets();
        },

        // Runs after vite:build-html has emitted index.html into the
        // bundle, so the gallery can be injected into the built page.
        // (generateBundle otherwise runs first and index.html is not
        // in the bundle yet.)
        generateBundle: {
            order: 'post',
            handler(_options: NormalizedOutputOptions, bundle: OutputBundle): void {
                if (!engagementFiles) {
                    throw new Error('assets were not prepared before generateBundle');
                }
                const indexHtml = bundle['index.html'];
                if (!indexHtml || indexHtml.type !== 'asset') {
                    throw new Error('index.html asset not found in bundle');
                }
                if (typeof indexHtml.source !== 'string') {
                    throw new Error('index.html asset has no string source');
                }

                // Match each engagement photo to the bundle asset Vite
                // emitted for the CSS url() to it, so the gallery and the
                // CSS reference the same file. A photo with no matching
                // asset was not referenced from the CSS and would 404 —
                // fail the build loudly instead of shipping a broken
                // gallery link. Sort by original path, as before:
                // '3100-2.jpg' sorts before '3100.jpg' ('-' < '.'), which
                // a plain id sort would reverse.
                const sortedItems = engagementFiles
                    .map((file) => `media/images/engagement/${file}`)
                    .sort()
                    .map((original) => {
                        const file = original.slice('media/images/engagement/'.length);
                        const asset = assetForPhoto(bundle, file);
                        if (!asset || asset.type !== 'asset') {
                            throw new Error(
                                `no bundle asset found for engagement photo ${file}`,
                            );
                        }
                        const served = `/${asset.fileName}`;
                        return `<li><a href="#!gallery&image=${served}" style="background-image:url(${served})"></a></li>`;
                    })
                    .join('');
                const html = indexHtml.source;
                if (!html.includes('<div id="engagement-shoot"></div>')) {
                    throw new Error('engagement-shoot div not found in index.html');
                }
                indexHtml.source = html.replace(
                    '<div id="engagement-shoot"></div>',
                    `<div id="engagement-shoot"><ul>${sortedItems}</ul></div>`,
                );
            },
        },

        // Runs before Vite's own index.html processing so the inlined
        // Analytics snippet is in place when it bundles the page.
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

                // Minify the body the way the old minify_html step did: drop
                // comments and collapse whitespace between tags.
                return withAnalytics.replace(
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
