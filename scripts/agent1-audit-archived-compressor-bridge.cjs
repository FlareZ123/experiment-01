'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { auditArchivedBridge } =
  require('../simulation/evaluation/agent1-archived-compressor-receipt-gate.cjs');

const ARCHIVE_SHA256 =
  '617e983ac7a05a18b6944fce7f6c54168b49972efd4f139cf9126a052a5e096d';

/**
 * Strictly read a pre-existing immutable original native Store archive.
 * This script runs no games and makes no modifications.
 * @param {string} filename Native raw JSON from Actions artifact 13209864119.
 * @returns {object}
 */
function inspectArchive(filename) {
  const raw = readFileSync(filename);
  const actual = createHash('sha256').update(raw).digest('hex');
  assert.equal(actual, ARCHIVE_SHA256, 'Unpinned archived Store bytes');
  const archive = JSON.parse(raw.toString('utf8'));
  return { ...auditArchivedBridge(archive), rawSha256: actual };
}

if (require.main === module) {
  assert.equal(process.argv.length, 3, 'Provide the exact downloaded raw JSON path');
  process.stdout.write('ARCHIVED_COMPRESSOR_NATIVE ' +
    JSON.stringify(inspectArchive(process.argv[2])) + '\n');
}

module.exports = { ARCHIVE_SHA256, inspectArchive };
