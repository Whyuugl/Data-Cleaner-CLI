const JWT_REGEX =
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;

function maskJWT(token) {
  if (token.length <= 20) {
    return '[REDACTED_JWT]';
  }

  return `${token.slice(0, 10)}...${token.slice(-6)}`;
}

function detectJWT(input) {
  const matches = [];

  let match;

  while ((match = JWT_REGEX.exec(input)) !== null) {
    matches.push({
      type: 'jwt',
      severity: 'high',
      value: match[0],
      preview: maskJWT(match[0]),
      index: match.index
    });
  }

  return matches;
}

module.exports = detectJWT;
