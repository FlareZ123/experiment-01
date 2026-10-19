'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} directory @returns {string[]} */
function listCommonJs(directory) {
  return fs.readdirSync(directory, {withFileTypes:true})
    .flatMap(entry => {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) return listCommonJs(full);
      return entry.isFile() && entry.name.endsWith('.cjs') ? [full] : [];
    });
}

/**
 * Parse CommonJS module content without executing it or loading dependencies.
 * @param {string} source
 * @returns {string|null} Error message, or null when syntactically valid.
 */
function checkSource(source) {
  const body = source.replace(/^#![^\r\n]*/, '');
  try {
    new Function('require', 'module', 'exports', '__filename', '__dirname', body);
    return null;
  } catch (error) {
    return String(error);
  }
}

/** @param {string} [repositoryRoot] @returns {{checked:number,failures:object[]}} */
function checkRepository(repositoryRoot = root) {
  const directories = ['scripts', 'simulation', 'tests'];
  const files = directories.flatMap(name => listCommonJs(path.join(repositoryRoot, name)));
  const failures = [];
  for (const file of files) {
    const error = checkSource(fs.readFileSync(file, 'utf8'));
    if (error) failures.push({path:path.relative(repositoryRoot, file), error});
  }
  return {checked:files.length, failures};
}

if (require.main === module) {
  const report = checkRepository();
  for (const failure of report.failures) {
    console.error(`INVALID_CJS ${failure.path}: ${failure.error}`);
  }
  console.log(`CJS_SYNTAX checked=${report.checked} invalid=${report.failures.length}`);
  if (report.failures.length) process.exitCode = 1;
}

module.exports = {checkSource, checkRepository};
