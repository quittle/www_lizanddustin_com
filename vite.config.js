// Vite build for the static site. This replaces the previous build
// (see BUILD, removed in a follow-up PR); the page it produces is the same one
// the old html_page + minify_site_zip pipeline produced:
//   - <title>/meta/Google Fonts from index.json (the old html_page config)
//   - js/google-analytics.js inlined in <head>
//   - js/entry.js bundled as a deferred module script (the old deferred main.js)
//   - css/main.scss compiled with the generated image maps (see scripts/build-assets.mjs)
//   - the engagement gallery generated from the media/images/engagement/*.jpg glob
//     and injected into #engagement-shoot (the old //rules:gallery.bzl file_list)
//   - every generated asset served at /<sha1>.<ext>, as the old content-hashed build did
//
// Notes / known deltas vs the old build (see the PR description for detail):
//   - The old build's gallery glob was `!!media/images/engagement/*.jpg`, which
//     matched nothing, so the live site's gallery is empty. This build uses the
//     glob as intended and populates the gallery; the stale "There are no images
//     so far" line is dropped with it.
//   - JS is minified with esbuild instead of Closure ADVANCED, and is a modern
//     ES module instead of ES5-transpiled output. No Closure-specific behavior
//     is used by js/main.js or js/utils.js (the JSDoc @type annotations are
//     comments; there are no goog.* dependencies).
//   - PNGs other than the luma logo are copied through unminified (the old build
//     ran pngtastic over them).
//   - The /rsvp -> /#rsvp redirect is a hosting concern, not part of the build;
//     it belongs in the deploy configuration (follow-up PR).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareAssets } from './scripts/build-assets.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

let prepared = null;

function lizanddustinPlugin() {
    return {
        name: 'lizanddustin-build',

        async buildStart() {
            // Resize + hash images and generate the SCSS maps before Sass runs.
            prepared = await prepareAssets();
        },

        generateBundle() {
            // Emit the hashed images at the site root.
            for (const file of prepared.files) {
                this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source });
            }
        },

        // Runs before Vite's own index.html processing so the relative
        // <img> paths below are picked up and bundled by it.
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
            const config = JSON.parse(readFileSync(path.join(ROOT, 'index.json'), 'utf8'));

            const head = [
                `<title>${config.title}</title>`,
                `<meta name="application-name" content="${config.title}" />`,
                ...config.meta.map(
                    (meta) =>
                        `<meta name="${meta.name}" content="${meta.content}" />`,
                ),
                ...config.css_files.map(
                    (href) => `<link rel="stylesheet" href="${href}" type="text/css" />`,
                ),
                // Inline google-analytics.js, as the old html_page did.
                `<script>${readFileSync(path.join(ROOT, 'js/google-analytics.js'), 'utf8').trim()}</script>`,
            ].join('\n    ');

            let body = readFileSync(path.join(ROOT, 'index_body.html'), 'utf8');

            // Make the registry logo <img> paths relative so Vite bundles
            // and content-hashes them (absolute /... paths are treated as
            // public-dir files and copied through unhashed).
            body = body.replaceAll('src="/media/images/', 'src="media/images/');

            // Generate the engagement gallery from the JPG glob.
            const galleryItems = Object.entries(prepared.manifest)
                .filter(([original]) => original.startsWith('media/images/engagement/'))
                .sort(([a], [b]) => (a < b ? -1 : 1))
                .map(
                    ([, served]) =>
                        `<li><a href="#!gallery&image=${served}" style="background-image:url(${served})"></a></li>`,
                )
                .join('');
            body = body.replace(
                '<div id="engagement-shoot"></div>',
                `<div id="engagement-shoot"><ul>${galleryItems}</ul></div>`,
            );

            // The gallery is populated now, so the "no images" placeholder
            // that the empty-gallery build shipped with no longer applies.
            body = body.replace(/^[ \t]*There are no images so far[ \t]*\n/m, '');

            // Minify the way the old minify_html step did: drop comments
            // and collapse whitespace between tags.
            body = body
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/>\s+</g, '><')
                .trim();

            return html
                .replace('<!-- @head -->', head)
                .replace('<!-- @body -->', body);
            },
        },
    };
}

export default {
    plugins: [lizanddustinPlugin()],
    // No public/ directory: every served file comes from the build.
    publicDir: false,
    build: {
        // Never inline assets as data: URLs; the old build served every
        // image as its own content-hashed file.
        assetsInlineLimit: 0,
    },
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: [path.join(ROOT, 'generated/scss')],
                // The legacy SCSS uses @import, `/` division and the global
                // map-get() builtin; keep it compiling as-is rather than
                // modernizing it in this migration.
                silenceDeprecations: ['import', 'slash-div', 'global-builtin'],
            },
        },
    },
};
