'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {reportCoverage} = require('../twinleaf/card-coverage.cjs');
const {planAichi} = require('./aichi-pilot.cjs');
const {auditSourcePrintings,VERSION} =
  require('./agent49-native-print-release-gate.cjs');

const OUTPUT_PATH = path.resolve(process.cwd(),
  'agent49-pinned-source-native-print-coverage.json');

/**
 * Save one complete audit in a locked, atomic replacement. Every workflow run
 * uses its own checkout, while the lock prevents accidental same-host writers.
 * @param {string} filename
 * @param {string} content
 */
function writeAtomicLocked(filename, content) {
  const lockPath = filename + '.lock';
  const lock = fs.openSync(lockPath, 'wx');
  const temp = filename + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, content, 'utf8');
    fs.renameSync(temp, filename);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(lock);
    fs.unlinkSync(lockPath);
  }
}

/**
 * Execute real pinned CardManager coverage and the existing resolver without
 * assuming all cards are implemented or paper-equivalent.
 * @returns {object}
 */
function main() {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  const coverage = reportCoverage(manifest);
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const audit = auditSourcePrintings(manifest, coverage, plan);
  const blocked = audit.ranks.filter(rank =>
    rank.status === 'NATIVE_PRINT_OR_DECK_RESOLUTION_BLOCKED');
  const printingCounts = {};
  for (const rank of audit.ranks) {
    for (const card of rank.printings) {
      printingCounts[card.nativeIdStatus] =
        (printingCounts[card.nativeIdStatus] ?? 0) + card.count;
    }
  }
  const rank15 = audit.ranks.find(r => r.rank === 15);
  const current = {
    schema: 'agent49-actual-pinned-source-printing-coverage-v1',
    checkerVersion: VERSION,
    enginePin: plan.engineRevision,
    sourceManifestDigest:plan.manifestDigest,
    sourceFrozen:plan.originalSourceFiles?.matchedFrozenReference === true,
    sourceListings:audit.sourceLists,
    missingRanks:audit.missingRanks,
    exactNativeIdRanks:audit.exactNativeIdRanks,
    blockedRanks:blocked.map(r => ({
      rank:r.rank,
      nativeStatus:r.engineStatus,
      substitutions:r.nativeSubstitutions,
      unsupportedOriginalPrints:r.printings
        .filter(c => c.nativeIdStatus === 'UNSUPPORTED_OR_AMBIGUOUS_PRINT')
        .map(c => ({
          name:c.name, count:c.count, requested:c.requested
        }))
    })),
    rank15RelevantOriginalPrints:rank15.printings
      .filter(p => p.name === 'Buneary' || p.name === 'Mega Lopunny ex'),
    originalPrintedCopyStatuses:printingCounts,
    requiredFixtures:[],
    skippedNativeFixtures:'NOT_EXECUTED_IN_THIS_CENSUS',
    semanticEffectsCertified:false,
    ownerPolicyCertified:false,
    competitiveQualifiedGames:0,
    completeField:false,
    audit
  };
  writeAtomicLocked(OUTPUT_PATH, JSON.stringify(current, null, 2)+'\n');
  console.log('AGENT49_PINNED_PRINT_CENSUS',JSON.stringify({
    schema:current.schema,
    enginePin:current.enginePin,
    published:current.sourceListings,
    missing:current.missingRanks,
    exactNativeIdRanks:current.exactNativeIdRanks,
    blockedRanks:current.blockedRanks.map(x=>x.rank),
    rank15:current.rank15RelevantOriginalPrints,
    statuses:current.originalPrintedCopyStatuses,
    semanticEffectsCertified:false,
    competitiveQualifiedGames:0,
    artifact:path.basename(OUTPUT_PATH)
  }));
  return current;
}

if (require.main === module) main();
module.exports = {main,writeAtomicLocked,OUTPUT_PATH};
