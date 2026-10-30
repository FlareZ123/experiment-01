'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {reportCoverage} = require('../twinleaf/card-coverage.cjs');
const {initializeCards} = require('../twinleaf/headless.cjs');
const {planAichi} = require('./aichi-pilot.cjs');
const {auditSourcePrintings,auditNativeIdRoundTrips,VERSION} =
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
  const manager = initializeCards();
  const nativeRoundTrips = auditNativeIdRoundTrips(audit,
    nativeId => manager.getCardByName(nativeId));
  const blocked = audit.ranks.filter(rank =>
    rank.status === 'NATIVE_PRINT_OR_DECK_RESOLUTION_BLOCKED');
  const printingCounts = {};
  for (const rank of audit.ranks) {
    for (const card of rank.printings) {
      printingCounts[card.nativeIdStatus] =
        (printingCounts[card.nativeIdStatus] ?? 0) + card.count;
    }
  }
  // Separate cosmetic/display basic-Energy aliases from singleton/research
  // card implementation and ambiguity blockers. Classify actual unresolved
  // catalog rows rather than assuming every original set has one cause.
  const nonExactCopyFamilies={};
  const nonExactPrintRows=[];
  for (const rank of audit.ranks) {
    for (const card of rank.printings) {
      if(card.nativeIdStatus!=='UNSUPPORTED_OR_AMBIGUOUS_PRINT')
        continue;
      const set=card.requested.set,number=card.requested.number;
      const kind=set==='MEE'&&card.name.endsWith(' Energy')?
        'MEE_BASIC_ENERGY_DISPLAY_PRINT':
        card.name==="Player's Ceremony"&&set==='SP'&&number==='127'?
          'RESEARCH_ONLY_JAPANESE_PROMO':
          card.name==='Electrike'&&set==='PRC'&&number==='60'?
            'AMBIGUOUS_ANCIENT_TRAIT_PRINT':
            'OTHER_UNRESOLVED_NATIVE_PRINT';
      nonExactCopyFamilies[kind]=(nonExactCopyFamilies[kind]??0)+card.count;
      nonExactPrintRows.push({rank:rank.rank,name:card.name,
        count:card.count,sourcePrinting:card.requested,kind});
    }
  }
  const nativeIdMismatchKinds={};
  for (const row of nativeRoundTrips.blocked) {
    nativeIdMismatchKinds[row.status]=
      (nativeIdMismatchKinds[row.status]??0)+1;
  }
  const permittedEngineReady=plan.opponents
    .filter(row=>row.status==='ready').map(row=>row.rank);
  const permittedEngineUnresolved=plan.opponents
    .filter(row=>row.status==='unresolved-printings').map(row=>row.rank);
  const permittedProxyCopyReasons={};
  for(const rank of audit.ranks) {
    for(const modification of rank.nativeSubstitutions??[]) {
      const reason=modification.reason??'UNCLASSIFIED';
      permittedProxyCopyReasons[reason]=
        (permittedProxyCopyReasons[reason]??0)+modification.count;
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
    nonExactCopyFamilies,
    nonExactPrintRows,
    nativeIdMismatchKinds,
    permittedEngineReady,
    permittedEngineUnresolved,
    permittedProxyCopyReasons,
    requiredFixtures:[],
    skippedNativeFixtures:'NOT_EXECUTED_IN_THIS_CENSUS',
    semanticEffectsCertified:false,
    ownerPolicyCertified:false,
    competitiveQualifiedGames:0,
    completeField:false,
    nativeRoundTrips,
    audit
  };
  writeAtomicLocked(OUTPUT_PATH, JSON.stringify(current, null, 2)+'\n');
  console.log('AGENT49_PINNED_PRINT_CENSUS',JSON.stringify({
    schema:current.schema,
    enginePin:current.enginePin,
    published:current.sourceListings,
    missing:current.missingRanks,
    exactNativeIdRanks:current.exactNativeIdRanks,
    nativeRoundTripRows:current.nativeRoundTrips.expected,
    nativeRoundTripsConfirmed:current.nativeRoundTrips.confirmed,
    nativeIdMismatches:current.nativeRoundTrips.blocked.slice(0,16),
    blockedRanks:current.blockedRanks.map(x=>x.rank),
    rank15:current.rank15RelevantOriginalPrints,
    statuses:current.originalPrintedCopyStatuses,
    missingCopyFamilies:current.nonExactCopyFamilies,
    unresolvedRows:current.nonExactPrintRows.length,
    actualWrongOrAbsentLookupRows:current.nativeRoundTrips.blocked.filter(x=>
      x.status!=='NO_EXACT_NATIVE_CATALOG_ID').length,
    permittedEngineReadyRanks:current.permittedEngineReady,
    permittedEngineUnresolvedRanks:current.permittedEngineUnresolved,
    permittedProxyCopyReasons:current.permittedProxyCopyReasons,
    semanticEffectsCertified:false,
    competitiveQualifiedGames:0,
    artifact:path.basename(OUTPUT_PATH)
  }));
  return current;
}

if (require.main === module) main();
module.exports = {main,writeAtomicLocked,OUTPUT_PATH};
