// Vite build for the static site. index.html is the entry point: the
// <head> (title, meta, Google Fonts, and a script include referencing the
// Google Analytics snippet, which the plugin inlines into the built page)
// and the body are written out in full there, and Vite bundles the module
// script, the stylesheet, and the relative <img> paths. The bespoke
// steps — the engagement photos, the gallery injection, the Analytics
// inlining, and the body minify — live in scripts/lizanddustin-plugin.ts;
// see that file for why no stock loader covers them.
import type { UserConfig } from 'vite';
import { lizanddustinPlugin } from './scripts/lizanddustin-plugin';

const config: UserConfig = {
    plugins: [lizanddustinPlugin()],
    build: {
        // Never inline assets as data: URLs.
        assetsInlineLimit: 0,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // The SCSS uses @import and `/` division; keep it
                // compiling as-is.
                silenceDeprecations: ['import', 'slash-div'],
            },
        },
    },
};

export default config;
