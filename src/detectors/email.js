const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function maskEmail(email) {
  const [name, domain] = email.split('@');

  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function detectEmail(input) {
  const matches = [];

  let match;

  while ((match = EMAIL_REGEX.exec(input)) !== null) {
    if (match[0].toLowerCase().endsWith('@example.test')) {
      continue;
    }

    matches.push({
      type: 'email',
      severity: 'medium',
      value: match[0],
      preview: maskEmail(match[0]),
      index: match.index
    });
  }

  return matches;
}

module.exports = detectEmail;
