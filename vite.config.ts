// Vite build for the static site. index.html is the entry point: the
// <head> (title, meta, Google Fonts, and a script include referencing the
// Google Analytics snippet, which the plugin inlines into the built page)
// and the body are written out in full there, and Vite bundles the module
// script, the stylesheet, and the relative <img> paths. The bespoke
// steps — the engagement photos, the gallery injection, and the Analytics
// inlining — live in scripts/lizanddustin-plugin.ts; see that file for
// why no stock loader covers them. HTML minification is handled by
// vite-plugin-minify (its defaults strip comments and collapse whitespace).
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
import type { UserConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { lizanddustinPlugin, readEngagementFiles } from './scripts/lizanddustin-plugin';

const config: UserConfig = {
    plugins: [lizanddustinPlugin(), ViteMinifyPlugin()],
    build: {
        // Never inline assets as data: URLs; the old build served every
        // image as its own content-hashed file.
        assetsInlineLimit: 0,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // The legacy SCSS uses @import and `/` division; keep it
                // compiling as-is rather than modernizing it in this migration.
                silenceDeprecations: ['import', 'slash-div'],
                // The photo id list for the engagement-photos loop,
                // injected above every SCSS file's source (no @use in the
                // project, so a plain prepend is safe). Re-reads the
                // folder on each compilation, so no file is written to disk.
                additionalData: (source: string) => {
                    const ids = readEngagementFiles().map((file) => path.basename(file, '.jpg'));
                    return `$engagement-photo-ids: (${ids.map((id) => `"${id}"`).join(', ')});\n${source}`;
                },
            },
        },
    },
};

export default config;
