# Changelog

All notable changes to DevSanitize will be documented here.

## 0.1.0 - CLI MVP

- Added local-first scanner for email, phone, IPv4, JWT, bearer token, database URL, and contextual secrets.
- Added scrub command for safe redaction without modifying the original file.
- Added anonymize command for stable pseudonymous email, phone, and IPv4 replacements.
- Added recursive directory scanning with `.devsanitizeignore`.
- Added binary-file and large-file skip protection.
- Added `scan --json`, `scan --quiet`, and `scan --ci`.
- Added `scrub --output` and `scrub --dry-run`.
- Added Git guard command for staged files or explicit file paths.
- Added npm package metadata, CLI bin aliases, and programmatic API exports.
- Added VS Code extension MVP scaffold.
- Added regression tests for overlap handling, false-positive control, and raw secret output safety.
