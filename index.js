const { scan } = require('./src/core/scanner');
const { sanitize } = require('./src/core/sanitizer');
const { anonymize } = require('./src/core/anonymizer');

module.exports = {
  scan,
  sanitize,
  anonymize
};
