# Backup of s3://www.lizanddustin.com

One-time snapshot of the live site bucket, taken 2026-11-14 before the
first CloudFormation deploy (PR #9). The first deploy's upload Lambda
fails unless the bucket is empty and wipes every object on update, so
this preserves the legacy Bazel-built files in case anything is lost.

- 68 objects, 9,126,194 bytes (8.70 MB).
- `index.html` is the legacy built page; the hashed files are its assets.
- `rsvp` is a 0-byte object. Its WebsiteRedirectLocation (`/#rsvp`) is
  not stored in the file; `scripts/deploy` recreates it after each deploy.
