// The bespoke pieces of the build, which no Vite loader expresses: the
// engagement photos live in media/images/engagement/ at their served size
// (resized in place), so the stylesheets reference them via plain url()
// and Vite bundles + content-hashes them. The gallery is injected into
// #engagement-shoot at transform time carrying only the photo id; its
// thumbnails get their background from the per-id CSS rules in
// css/engagement-photos.scss, which reference the same url() as the
// detail ::before rules, so the gallery and the CSS share one file per
// photo. The photo id list the stylesheet iterates is served in memory
// by a Sass custom importer below — no file is written to disk. index.html
// holds the head and body.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import type { Importer } from 'sass';
import type { Plugin } from 'vite';

const ENGAGEMENT_DIR = path.join(import.meta.dirname, '..', 'media', 'images', 'engagement');

function readEngagementFiles(): string[] {
    return readdirSync(ENGAGEMENT_DIR)
        .filter((file) => file.endsWith('.jpg'))
        .sort();
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

        transformIndexHtml: {
            order: 'pre',
            handler(html: string): string {
                // The href's image= value is never read; getIdFromHash
                // only takes the part before '&'.
                const galleryItems = readEngagementFiles()
                    .map((file) => {
                        const id = path.basename(file, '.jpg');
                        return `<li><a data-gallery-img="${id}" href="#!gallery&image=${id}"></a></li>`;
                    })
                    .join('');
                const withGallery = html.replace(
                    '<div id="engagement-shoot"></div>',
                    `<div id="engagement-shoot"><ul>${galleryItems}</ul></div>`,
                );

                return withGallery;
            },
        },
    };
}
