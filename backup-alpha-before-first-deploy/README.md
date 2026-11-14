# Backup of s3://alpha.lizanddustin.com

One-time snapshot of the alpha (staging) bucket, taken 2026-11-14 before
the first CloudFormation test deploy (PR #9). The upload Lambda requires
an empty bucket on create, so this preserves the 3 legacy images and the
`rsvp` redirect object in case anything is lost.

- 4 objects, 357,953 bytes (0.34 MB).
- The 3 images are also present in the www bucket.
- `rsvp` is a 0-byte object. Its WebsiteRedirectLocation (`/#rsvp`) is
  not stored in the file; `scripts/deploy` recreates it after each deploy.
