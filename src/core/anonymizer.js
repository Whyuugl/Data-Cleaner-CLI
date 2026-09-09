const { scan } = require('./scanner');
const { replacementFor: scrubReplacementFor } = require('./sanitizer');

function padded(number) {
  return String(number).padStart(3, '0');
}

function anonymize(input) {
  const detections = scan(input);
  const counters = {};
  const replacements = new Map();
  let output = input;

  for (const detection of detections) {
    const key = `${detection.type}:${detection.value}`;

    if (replacements.has(key)) {
      continue;
    }

    counters[detection.type] = (counters[detection.type] || 0) + 1;
    replacements.set(key, anonymizedValueFor(detection, counters[detection.type]));
  }

  for (const detection of [...detections].sort((a, b) => b.index - a.index)) {
    output =
      output.slice(0, detection.index) +
      replacements.get(`${detection.type}:${detection.value}`) +
      output.slice(detection.index + detection.value.length);
  }

  return {
    output,
    detections
  };
}

function anonymizedValueFor(detection, count) {
  const id = padded(count);

  switch (detection.type) {
    case 'email':
      return `user${id}@example.test`;
    case 'phone':
      return `080000000${id}`;
    case 'ipv4':
      return `192.0.2.${count}`;
    default:
      return scrubReplacementFor(detection);
  }
}

module.exports = {
  anonymize,
  anonymizedValueFor
};
