// Build-time asset preparation: resize the engagement photos and the luma
// logo with sharp (the same treatment as the old pipeline — height 1000px;
// 2961.jpg to width 2000px; 2894.jpg cropped to its bottom half first, as
// in media/images/engagement/BUILD; luma logo to width 600px) and write
// them to generated/ on disk with stable names. The stylesheets reference
// them via plain url() and Vite bundles + content-hashes them; the gallery
// is injected from the bundle fileNames in generateBundle. No SHA-1 naming,
// no SCSS maps, no manifest — the resized files are the single source of
// truth for both the CSS and the gallery.
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const GENERATED_DIR = path.join(ROOT, 'generated');
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
// Returns the sorted engagement filenames, so the plugin can match them
// back to the bundle assets Vite emits for the CSS url()s.
export async function prepareAssets(): Promise<string[]> {
    await mkdir(GENERATED_ENGAGEMENT_DIR, { recursive: true });
    await mkdir(GENERATED_LUMA_DIR, { recursive: true });

    const engagementFiles = (await readdir(ENGAGEMENT_DIR))
        .filter((file) => file.endsWith('.jpg'))
        .sort();
    for (const file of engagementFiles) {
        const buffer = await resizeEngagementPhoto(file);
        await writeFile(path.join(GENERATED_ENGAGEMENT_DIR, file), buffer);
    }

    // Luma logo: resize wide.png to width 600px, as in media/images/luma/BUILD.
    const lumaBuffer = await sharp(path.join(ROOT, 'media/images/luma/wide.png'))
        .resize({ width: 600 })
        .png()
        .toBuffer();
    await writeFile(path.join(GENERATED_LUMA_DIR, 'wide.png'), lumaBuffer);

    return engagementFiles;
}
