const PHONE_REGEX = /(?:\+62|62|0)8[1-9][0-9]{7,11}/g;

function maskPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length <= 8) {
    return '*'.repeat(cleaned.length);
  }

  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-4);

  return `${prefix}${'*'.repeat(cleaned.length - 8)}${suffix}`;
}

function detectPhone(input) {
  const matches = [];

  let match;

  while ((match = PHONE_REGEX.exec(input)) !== null) {
    matches.push({
      type: 'phone',
      severity: 'medium',
      value: match[0],
      preview: maskPhone(match[0]),
      index: match.index
    });
  }

  return matches;
}

module.exports = detectPhone;