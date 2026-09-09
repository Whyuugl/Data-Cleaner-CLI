# DevSanitize

Safe Data for Development.

DevSanitize is a local-first CLI that helps developers detect, redact, and anonymize sensitive data before sharing files with AI tools, Git, teammates, logs, tests, or bug reports.

It is not an antivirus, enterprise DLP, or secret manager. It is a small developer tool for the risky moment before you paste, commit, upload, or share a file.

## Why

Developers often work with production-like data:

- `.env` files
- API responses
- JSON/CSV fixtures
- application logs
- database URLs
- debugging payloads

Those files are easy to paste into an AI chat, attach to an issue, or commit by accident. DevSanitize gives you a quick local check before that happens.

## Install

```bash
npm install -g devsanitize
```

Or run without installing:

```bash
npx devsanitize scan .
```

During local development:

```bash
node bin/dev-sanitize.js scan examples/sample.json
```

## 30-Second Quick Start

```bash
devsanitize scan .
devsanitize scrub examples/sample.env
devsanitize scan examples/sample.sanitized.env
```

Example scan output:

```text
⚠️  Sensitive data detected:

1. [CRITICAL] secret
   Line : 1
   Value: API_KEY=[REDACTED_SECRET]
```

Raw secrets are not printed. Output uses safe previews.

## Commands

```bash
devsanitize scan <file|directory> [--json] [--quiet] [--ci]
devsanitize scrub <file> [--output <file>] [--dry-run]
devsanitize anonymize <file>
devsanitize guard [file|directory...]
```

Both `devsanitize` and `dev-sanitize` work as CLI names.

## Scan

Detect sensitive values without changing files:

```bash
devsanitize scan production.log
devsanitize scan src/
devsanitize scan . --json
devsanitize scan . --quiet
```

`scan --json` returns safe output only. Detection objects intentionally omit raw `value`.

Current JSON contract:

```json
{
  "file": "examples/sample.env",
  "status": "unsafe",
  "scanned": 1,
  "skipped": [],
  "size": 114,
  "count": 3,
  "summary": {
    "secret": 2,
    "database_url": 1
  },
  "detections": [
    {
      "file": "examples/sample.env",
      "type": "secret",
      "severity": "critical",
      "preview": "API_KEY=[REDACTED_SECRET]",
      "index": 0,
      "line": 1
    }
  ]
}
```

## Scrub

Create a sanitized copy. The original file is not modified.

```bash
devsanitize scrub production.log
devsanitize scrub users.json --output users.safe.json
devsanitize scrub .env --dry-run
```

Default output names:

```text
production.log -> production.sanitized.log
users.json -> users.sanitized.json
.env -> .env.sanitized
```

## Anonymize

Create a pseudonymous copy for safer fixtures, demos, tests, and AI prompts:

```bash
devsanitize anonymize users.json
```

Examples:

```text
wahyu@example.com -> user001@example.test
081234567890 -> 080000000001
192.168.1.20 -> 192.0.2.1
```

Secrets and credentials are redacted instead of converted into fake usable credentials.

## Git Guard

Block commits when high or critical findings are present:

```bash
devsanitize guard
devsanitize guard .
devsanitize guard src/
```

Without arguments, `guard` scans staged Git files. With arguments, it scans the files or directories you pass.

## CI

Use `--ci` for automation:

```bash
devsanitize scan . --ci --quiet
```

Exit codes:

```text
0 = clean
1 = sensitive data detected
2 = CLI, file, read, or large-file error
```

## Supported Formats

DevSanitize scans text content, so it works across common developer files:

- JSON
- JSONL
- CSV
- ENV
- LOG
- TXT
- YAML
- config files

It skips `.git`, `node_modules`, `dist`, `.next`, generated DevSanitize outputs, binary files, and files larger than 5 MB.

## Ignore File

Add `.devsanitizeignore` at the project root:

```text
node_modules/
dist/
*.min.js
fixtures/public/
```

## Detectors

| Type | Severity | Example |
| --- | --- | --- |
| `email` | `medium` | `wahyu@example.com` |
| `phone` | `medium` | `081234567890` |
| `ipv4` | `medium` | `192.168.1.20` |
| `jwt` | `high` | `eyJ...` |
| `bearer_token` | `high` | `Bearer ...` |
| `database_url` | `critical` | `postgresql://user:pass@host/db` |
| `secret` | `critical` | `API_KEY=...` |

The generic secret detector is context-based. It looks for keys like `api_key`, `password`, `secret`, `client_secret`, and `access_token` instead of flagging every long random string.

## Programmatic API

```js
const { scan, sanitize, anonymize } = require('devsanitize');

const detections = scan('API_KEY=abc123456789');
const scrubbed = sanitize('API_KEY=abc123456789');
const anonymized = anonymize('email=wahyu@example.com');
```

The API is useful for editors, internal tooling, pre-commit wrappers, and test-data workflows.

## Privacy

DevSanitize is local-first:

- no telemetry
- no cloud scanning
- no external API calls
- no hidden network requests
- no raw secrets in normal CLI or JSON scan output

## VS Code Extension

A minimal VS Code extension scaffold lives in `vscode-extension/`.

It provides:

```text
DevSanitize: Scan Current File
DevSanitize: Scrub Current File
```

The extension reuses the same local scanner and sanitizer core.

## Known Limitations

- No streaming scanner yet; files larger than 5 MB are skipped.
- No syntax-aware parser yet; current scanning is raw-text based.
- No name detector yet; name anonymization needs more context to avoid noisy false positives.
- No automatic Git hook installer yet.
- VS Code extension is an MVP scaffold, not a packaged marketplace release.

## Roadmap

```text
0.1.0 = CLI MVP
0.2.0 = Git hook installer + CI examples
0.3.0 = parser-aware sanitization
1.0.0 = stable CLI/API contract
```

## Development

```bash
npm test
npm pack --dry-run
```

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Do not post real credentials in public issues.

## License

MIT
