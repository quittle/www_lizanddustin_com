// Vite build for the static site. index.html is the entry point: the
// <head> (title, meta, Google Fonts, and a script include referencing the
// Google Analytics snippet, which the plugin inlines into the built page)
// and the body are written out in full there, and Vite bundles the module
// script, the stylesheet, and the relative <img> paths. The bespoke
// steps — the engagement photos, the gallery injection, the Analytics
// inlining, and the body minify — live in scripts/lizanddustin-plugin.ts;
// see that file for why no stock loader covers them.
//
// Notes / known deltas vs the old Bazel build:
//   - The old build's gallery glob matched nothing, so the live site's
//     gallery is empty. This build uses the glob as intended and populates
//     the gallery; the stale "There are no images so far" line is dropped.
//   - JS is minified with esbuild instead of Closure ADVANCED, and is a
//     modern ES module instead of ES5-transpiled output.
//   - PNGs other than the luma logo are copied through unminified (the old
//     build ran pngtastic over them).
//   - The /rsvp -> /#rsvp redirect is a hosting concern, not part of the
//     build; it belongs in the deploy configuration (follow-up PR).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vite';
import { lizanddustinPlugin } from './scripts/lizanddustin-plugin';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const config: UserConfig = {
    plugins: [lizanddustinPlugin()],
    // Nothing is served verbatim: every served file comes from the build
    // (the Analytics snippet is inlined from js/google-analytics.js), so
    // there is no public/ directory to copy.
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

export default config;
