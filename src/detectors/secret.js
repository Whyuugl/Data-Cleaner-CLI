const SECRET_REGEX =
  /["']?(api[_-]?key|secret|password|passwd|client[_-]?secret|access[_-]?token)["']?\s*[:=]\s*(?:"([^"\r\n]{8,})"|'([^'\r\n]{8,})'|([^\s"',}\]]{8,}))/gi;

function maskSecret(value) {
  const keyMatch = value.match(
    /["']?(api[_-]?key|secret|password|passwd|client[_-]?secret|access[_-]?token)["']?/i
  );

  const key = keyMatch ? keyMatch[1] : 'secret';

  return `${key}=[REDACTED_SECRET]`;
}

function detectSecret(input) {
  const matches = [];
  let match;

  while ((match = SECRET_REGEX.exec(input)) !== null) {
    const value = match[2] || match[3] || match[4];

    if (/^\[REDACTED_/i.test(value)) {
      continue;
    }

    matches.push({
      type: 'secret',
      severity: 'critical',
      value: match[0],
      preview: maskSecret(match[0]),
      index: match.index
    });
  }

  return matches;
}

module.exports = detectSecret;
