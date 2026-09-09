const BEARER_REGEX = /\bBearer\s+[A-Za-z0-9._~+/=-]+\b/gi;

function maskBearerToken(value) {
  const parts = value.split(/\s+/);
  const token = parts.slice(1).join(' ');

  if (!token) {
    return 'Bearer [REDACTED]';
  }

  if (token.length <= 12) {
    return 'Bearer [REDACTED]';
  }

  return `Bearer ${token.slice(0, 6)}...${token.slice(-4)}`;
}

function detectBearerToken(input) {
  const matches = [];

  let match;

  while ((match = BEARER_REGEX.exec(input)) !== null) {
    matches.push({
      type: 'bearer_token',
      severity: 'high',
      value: match[0],
      preview: maskBearerToken(match[0]),
      index: match.index
    });
  }

  return matches;
}

module.exports = detectBearerToken;