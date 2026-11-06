// Build-time asset preparation, mirroring what the previous build pipeline did:
//   - engagement photos resized (height 1000px; 2961.jpg to width 2000px;
//     2894.jpg cropped to its bottom half first, as in media/images/engagement/BUILD)
//   - luma logo resized to width 600px
//   - SCSS maps generated for the resized images (engagement_map, large_map,
//     luma_logo_map), the same three maps the old generate_variables rules produced
//
// Every generated asset is named by the SHA-1 of its contents, like the old
// minify_site_zip build, which served every asset at /<sha1>.<ext>.
//
// Outputs:
//   - generated/scss/*.scss   SCSS maps, consumed via includePaths (see vite.config.ts)
//   - { manifest, files }     original path -> served path, and the { fileName, source }
//                             buffers, emitted at the site root by the plugin (generateBundle)
import { createHash } from 'node:crypto';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const GENERATED_DIR = path.join(ROOT, 'generated');
const SCSS_DIR = path.join(GENERATED_DIR, 'scss');
const ENGAGEMENT_DIR = path.join(ROOT, 'media/images/engagement');

export interface PreparedAssetFile {
    fileName: string;
    source: Buffer;
}

export interface PreparedAssets {
    manifest: Record<string, string>;
    files: PreparedAssetFile[];
}

const sha1 = (buffer: Buffer): string => createHash('sha1').update(buffer).digest('hex');

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

function scssMap(variable: string, entries: Record<string, string>): string {
    const lines = Object.entries(entries).map(
        ([key, value]) => `    '${key}': '${value}',`,
    );
    return `$${variable}: (\n${lines.join('\n')}\n);\n`;
}

export async function prepareAssets(): Promise<PreparedAssets> {
    await mkdir(SCSS_DIR, { recursive: true });

    const files: PreparedAssetFile[] = [];
    const manifest: Record<string, string> = {};

    // Engagement photos: resize + hash, and build the two SCSS maps.
    const engagementFiles = (await readdir(ENGAGEMENT_DIR))
        .filter((file) => file.endsWith('.jpg'))
        .sort();
    const engagementMap: Record<string, string> = {};
    const largeMap: Record<string, string> = {};
    for (const file of engagementFiles) {
        const buffer = await resizeEngagementPhoto(file);
        const served = `/${sha1(buffer)}.jpg`;
        files.push({ fileName: served.slice(1), source: buffer });
        const original = `media/images/engagement/${file}`;
        manifest[original] = served;
        // The SCSS uses url(/#{$path}), so the map value is the bare
        // filename; the leading slash comes from the stylesheet.
        engagementMap[original] = served.slice(1);
        if (file === '2961.jpg') {
            largeMap[original] = served;
        }
    }
    await writeFile(
        path.join(SCSS_DIR, 'engagement_map.scss'),
        scssMap('engagement-photos-map', engagementMap),
    );
    await writeFile(
        path.join(SCSS_DIR, 'large_map.scss'),
        scssMap('large-images-map', largeMap),
    );

    // Luma logo: resize wide.png to width 600px, as in media/images/luma/BUILD.
    const lumaBuffer = await sharp(path.join(ROOT, 'media/images/luma/wide.png'))
        .resize({ width: 600 })
        .png()
        .toBuffer();
    const lumaServed = `/${sha1(lumaBuffer)}.png`;
    files.push({ fileName: lumaServed.slice(1), source: lumaBuffer });
    await writeFile(
        path.join(SCSS_DIR, 'luma_logo_map.scss'),
        scssMap('luma-logo', { 'media/images/luma/wide.png': lumaServed }),
    );

    return { manifest, files };
}
