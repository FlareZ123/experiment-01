'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { auditArchivedBridge } =
  require('../simulation/evaluation/agent1-archived-compressor-receipt-gate.cjs');

const { censusOriginalActionRoots } = require(
  '../simulation/evaluation/agent1-rank17-archived-action-census.cjs');
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
  const receipts=auditArchivedBridge(archive);
  const roster=JSON.parse(readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const census=censusOriginalActionRoots(archive,roster);
  const source=census.roles.source,reference=census.roles.reference;
  assert.deepEqual({total:source.total,prompts:source.byAction.ResolvePromptAction,
    pass:source.byAction.PassTurnAction,play:source.byAction.PlayCardAction,
    attack:source.byAction.AttackAction??0,energy:source.manualEnergyAttachments},
  {total:2015,prompts:1324,pass:551,play:140,attack:0,energy:0},
  'Original source attack/Energy observations have drifted');
  assert.deepEqual({total:reference.total,play:reference.byAction.PlayCardAction,
    attack:reference.attemptedAttacks,energy:reference.manualEnergyAttachments},
  {total:2629,play:305,attack:372,energy:162},
  'Original reference native action rates have drifted');
  assert.equal(source.playedByPrintedCategory['Pokémon'],134);
  assert.equal(source.playedByPrintedCategory.Trainer,6);
  assert.equal(source.playedByPrintedCategory.Energy,0);
  assert.equal(reference.playedByPrintedCategory.Energy,162);
  return { ...receipts, nativeOwnerRootCensus:census, rawSha256: actual };
}

if (require.main === module) {
  assert.equal(process.argv.length, 3, 'Provide the exact downloaded raw JSON path');
  process.stdout.write('ARCHIVED_COMPRESSOR_NATIVE ' +
    JSON.stringify(inspectArchive(process.argv[2])) + '\n');
}

module.exports = { ARCHIVE_SHA256, inspectArchive };
