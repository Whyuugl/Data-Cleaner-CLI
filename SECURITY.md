# Security Policy

DevSanitize is a local-first security tool. It should not send scanned file contents to external services or print raw credentials in normal output.

## Reporting Vulnerabilities

Please report security issues privately to the project maintainer.

Do not include real credentials, production logs, private customer data, or unreduced secrets in public issues. Use synthetic examples such as:

```text
API_KEY=abc123456789
postgresql://user:password@localhost:5432/app
```

Useful reports include:

- DevSanitize prints a raw secret in stdout or stderr.
- DevSanitize misses an obvious supported credential pattern.
- DevSanitize corrupts a file during sanitization.
- DevSanitize scans files that should be ignored by default.

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Privacy Guarantee

DevSanitize runs locally. The CLI, core scanner, sanitizer, anonymizer, Git guard, CI mode, and VS Code MVP do not perform telemetry or network requests.
