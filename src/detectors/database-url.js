const DATABASE_URL_REGEX =
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"'`]+/gi;

function maskDatabaseUrl(value) {
  try {
    const url = new URL(value);

    if (url.username) {
      url.username = '***';
    }

    if (url.password) {
      url.password = '***';
    }

    return url.toString();
  } catch {
    return '[REDACTED_DATABASE_URL]';
  }
}

function detectDatabaseUrl(input) {
  const matches = [];
  let match;

  while ((match = DATABASE_URL_REGEX.exec(input)) !== null) {
    const preview = maskDatabaseUrl(match[0]);

    if (preview === match[0]) {
      continue;
    }

    matches.push({
      type: 'database_url',
      severity: 'critical',
      value: match[0],
      preview,
      index: match.index
    });
  }

  return matches;
}

module.exports = detectDatabaseUrl;
