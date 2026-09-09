const { scan } = require('./scanner');

function replacementFor(detection) {
  switch (detection.type) {
    case 'jwt':
      return '[REDACTED_JWT]';
    case 'bearer_token':
      return 'Bearer [REDACTED]';
    case 'secret':
      return detection.value.replace(
        /(["']?(?:api[_-]?key|secret|password|passwd|client[_-]?secret|access[_-]?token)["']?\s*[:=]\s*)(?:"([^"\r\n]{8,})"|'([^'\r\n]{8,})'|([^\s"',}\]]{8,}))/i,
        (match, prefix, doubleQuoted, singleQuoted) => {
          if (doubleQuoted !== undefined) {
            return `${prefix}"[REDACTED_SECRET]"`;
          }

          if (singleQuoted !== undefined) {
            return `${prefix}'[REDACTED_SECRET]'`;
          }

          return `${prefix}[REDACTED_SECRET]`;
        }
      );
    default:
      return detection.preview;
  }
}

function sanitize(input) {
  const detections = scan(input);
  let output = input;

  for (const detection of [...detections].sort((a, b) => b.index - a.index)) {
    output =
      output.slice(0, detection.index) +
      replacementFor(detection) +
      output.slice(detection.index + detection.value.length);
  }

  return {
    output,
    detections
  };
}

module.exports = {
  sanitize,
  replacementFor
};
