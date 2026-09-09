const fs = require('fs');
const path = require('path');

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const DEFAULT_IGNORES = [
  '.git/',
  'node_modules/',
  'dist/',
  '.next/',
  '.devsanitizeignore',
  '*.sanitized.*',
  '*.anonymized.*',
  'devsanitize-*.tgz'
];

function toSlash(value) {
  return value.replace(/\\/g, '/');
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegex(pattern) {
  return new RegExp(`^${escapeRegex(pattern).replace(/\*/g, '[^/]*')}$`);
}

function readIgnoreFile(cwd) {
  const ignorePath = path.join(cwd, '.devsanitizeignore');

  if (!fs.existsSync(ignorePath)) {
    return [];
  }

  return fs.readFileSync(ignorePath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function ignored(relativePath, isDirectory, patterns) {
  const normalized = toSlash(relativePath);
  const basename = path.posix.basename(normalized);

  return patterns.some(pattern => {
    const clean = toSlash(pattern).replace(/^\/+/, '');

    if (clean.endsWith('/')) {
      const dir = clean.slice(0, -1);
      return isDirectory
        ? normalized === dir || normalized.startsWith(`${dir}/`) || basename === dir
        : normalized.startsWith(`${dir}/`);
    }

    if (clean.includes('*')) {
      return globToRegex(clean).test(normalized) || globToRegex(clean).test(basename);
    }

    return normalized === clean || basename === clean || normalized.startsWith(`${clean}/`);
  });
}

function binaryFile(filePath) {
  const buffer = Buffer.alloc(8000);
  const fd = fs.openSync(filePath, 'r');

  try {
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead).includes(0);
  } finally {
    fs.closeSync(fd);
  }
}

function collectFiles(inputs, options = {}) {
  const cwd = options.cwd || process.cwd();
  const patterns = [...DEFAULT_IGNORES, ...readIgnoreFile(cwd)];
  const files = [];
  const skipped = [];

  function add(inputPath, explicit = false) {
    const absolute = path.resolve(cwd, inputPath);
    const relative = toSlash(path.relative(cwd, absolute)) || '.';

    let stats;

    try {
      stats = fs.statSync(absolute);
    } catch {
      skipped.push({ path: inputPath, reason: 'not_found' });
      return;
    }

    if (!(explicit && stats.isFile()) && ignored(relative, stats.isDirectory(), patterns)) {
      skipped.push({ path: relative, reason: 'ignored' });
      return;
    }

    if (stats.isDirectory()) {
      for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
        add(path.join(relative, entry.name), false);
      }
      return;
    }

    if (!stats.isFile()) {
      skipped.push({ path: relative, reason: 'not_file' });
      return;
    }

    if (stats.size > MAX_FILE_BYTES) {
      skipped.push({ path: relative, reason: 'too_large' });
      return;
    }

    if (binaryFile(absolute)) {
      skipped.push({ path: relative, reason: 'binary' });
      return;
    }

    files.push(relative);
  }

  for (const input of inputs) {
    add(input, true);
  }

  return { files, skipped };
}

module.exports = {
  MAX_FILE_BYTES,
  collectFiles,
  ignored
};
