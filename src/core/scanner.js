const detectEmail = require('../detectors/email');
const detectPhone = require('../detectors/phone');
const detectIPv4 = require('../detectors/ipv4');
const detectJWT = require('../detectors/jwt');
const detectBearerToken = require('../detectors/bearer-token');
const detectDatabaseUrl = require('../detectors/database-url');
const detectSecret = require('../detectors/secret');

const detectors = [
  detectDatabaseUrl,
  detectBearerToken,
  detectJWT,
  detectSecret,
  detectEmail,
  detectPhone,
  detectIPv4
];

function getLineNumber(input, index) {
  return input.slice(0, index).split('\n').length;
}

function overlaps(a, b) {
  const aStart = a.index;
  const aEnd = a.index + a.value.length;

  const bStart = b.index;
  const bEnd = b.index + b.value.length;

  return aStart < bEnd && bStart < aEnd;
}

function scan(input) {
  const detections = [];

  for (const detector of detectors) {
    const results = detector(input);

    for (const result of results) {
      const alreadyCovered = detections.some(existing =>
        overlaps(existing, result)
      );

      if (!alreadyCovered) {
        detections.push({
          ...result,
          line: getLineNumber(input, result.index)
        });
      }
    }
  }

  return detections.sort((a, b) => a.index - b.index);
}

module.exports = {
  scan
};