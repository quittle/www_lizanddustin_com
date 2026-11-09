// Vite build for the static site. index.html is the entry point: the
// <head> (title, meta, Google Fonts, and the Google Analytics snippet)
// and the body are written out in full there, and Vite bundles the module
// script, the stylesheet, and the relative <img> paths. The bespoke
// steps — the engagement photos and the gallery injection — live in
// scripts/lizanddustin-plugin.ts; see that file for why no stock loader
// covers them.
import type { UserConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { lizanddustinPlugin } from './scripts/lizanddustin-plugin';

const config: UserConfig = {
    plugins: [lizanddustinPlugin(), ViteMinifyPlugin()],
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
