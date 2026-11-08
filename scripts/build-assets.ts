// Build-time asset preparation: resize the engagement photos and the luma
// logo with sharp (the same treatment as the old pipeline — height 1000px;
// 2961.jpg to width 2000px; 2894.jpg cropped to its bottom half first, as
// in media/images/engagement/BUILD; luma logo to width 600px) and write
// them to generated/ on disk with stable names. The stylesheets reference
// them via plain url() and Vite bundles + content-hashes them: the detail
// ::before rules and the gallery thumbnail rules in css/engagement-photos.scss
// both reference the same url(), so each photo is emitted once and shared.
// The gallery <li>s are injected at transform time carrying only the photo
// id — no URL anywhere in the HTML. No SHA-1 naming, no SCSS maps, no
// manifest, no emitFile. One generated SCSS file is written:
// generated/scss/engagement-photo-ids.scss, the folder-derived id list
// the stylesheet iterates, so the list can never drift from the folder.
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const GENERATED_DIR = path.join(ROOT, 'generated');
const GENERATED_SCSS_DIR = path.join(GENERATED_DIR, 'scss');
const ENGAGEMENT_DIR = path.join(ROOT, 'media/images/engagement');
const GENERATED_ENGAGEMENT_DIR = path.join(GENERATED_DIR, 'engagement');
const GENERATED_LUMA_DIR = path.join(GENERATED_DIR, 'luma');

// Resize one engagement photo the way the old BUILD did, and return its bytes.
async function resizeEngagementPhoto(file: string): Promise<Buffer> {
    const input = sharp(path.join(ENGAGEMENT_DIR, file));
    if (file === '2961.jpg') {
        return input.resize({ width: 2000 }).jpeg().toBuffer();
    }
    if (file === '2894.jpg') {
        // crop_image(height="50%", y_offset="50%") takes the bottom half.
        const { width, height } = await input.metadata();
        if (width === undefined || height === undefined) {
            throw new Error(`Cannot read dimensions of ${file}`);
        }
        const top = Math.floor(height / 2);
        return input
            .extract({ left: 0, top, width, height: height - top })
            .resize({ height: 1000 })
            .jpeg()
            .toBuffer();
    }
    return input.resize({ height: 1000 }).jpeg().toBuffer();
}

// Resize the photos and write them to generated/ with stable names.
// Also write generated/scss/engagement-photo-ids.scss: the sorted list of
// photo ids, so css/engagement-photos.scss iterates the folder contents
// instead of a hand-kept list — a photo added to or removed from the
// folder appears in (or disappears from) both the gallery and the CSS
// with no list edit, and drift is impossible. The per-photo settings
// (zoom/shift) stay hand-kept in the stylesheet; only two photos have any.
// Returns the sorted engagement filenames, so the plugin can inject the
// gallery <li>s in the same order the old manifest build used.
export async function prepareAssets(): Promise<string[]> {
    await mkdir(GENERATED_ENGAGEMENT_DIR, { recursive: true });
    await mkdir(GENERATED_LUMA_DIR, { recursive: true });
    await mkdir(GENERATED_SCSS_DIR, { recursive: true });

    const engagementFiles = (await readdir(ENGAGEMENT_DIR))
        .filter((file) => file.endsWith('.jpg'))
        .sort();
    for (const file of engagementFiles) {
        const buffer = await resizeEngagementPhoto(file);
        await writeFile(path.join(GENERATED_ENGAGEMENT_DIR, file), buffer);
    }

    const engagementIds = engagementFiles.map((file) => file.slice(0, -'.jpg'.length));
    await writeFile(
        path.join(GENERATED_SCSS_DIR, 'engagement-photo-ids.scss'),
        `$engagement-photo-ids: (${engagementIds.map((id) => `"${id}"`).join(', ')});\n`,
    );

    // Luma logo: resize wide.png to width 600px, as in media/images/luma/BUILD.
    const lumaBuffer = await sharp(path.join(ROOT, 'media/images/luma/wide.png'))
        .resize({ width: 600 })
        .png()
        .toBuffer();
    await writeFile(path.join(GENERATED_LUMA_DIR, 'wide.png'), lumaBuffer);

    return engagementFiles;
}
