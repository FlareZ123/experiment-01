'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const {MODES} = require('./agent9-rank5-fusion-draw-root-upperbound.cjs');

const VERSION = 'agent9-original-rank5-native-trainer-play-census-v1';
const SOURCE_POKEMON = new Set([
  'Mew V FST', 'Mew VMAX FST', 'Genesect V FST',
  'Dedenne GX UNB', 'Crobat V DAA', "Lillie's Clefairy ex JTG"
]);
const SOURCE_ENERGY = new Set(['Double Colorless Energy SUM']);

/**
 * Reconcile every actual owner PlayCardAction from the authenticated native
 * source root ledger against the independently captured accepted-target
 * sidecar's full physically played printing. The source original 60 contains
 * precisely the six Pokémon identities and one Special Energy identity above.
 * Unknown printings remain explicit rather than silently called Trainers.
 * @param {object} row Complete native original rank-5 row.
 * @returns {object} Per-game source and opposing Fog Crystal action counts.
 */
function sourceTrainerPlaysFromNativeRow(row) {
  assert.ok(row && [0, 1].includes(row.sourceSeat));
  assert.ok(Array.isArray(row.rootActionLedger));
  assert.equal(row.rootActionLedger.length, row.rootActionCount);
  assert.equal(row.rootActionLedger.length, row.actionCount);
  const events = row.nativeAcceptedTargetSidecar?.events;
  assert.ok(Array.isArray(events), 'Require genuine accepted native action sidecar');
  const sourceSeat = row.sourceSeat;
  const roots = row.rootActionLedger.filter(e =>
    e.playerSlot === sourceSeat && e.action === 'PlayCardAction');
  const sourceEvents = events.filter(e =>
    e.storeAccepted === true && e.playerSlot === sourceSeat &&
    e.action === 'PlayCardAction');
  assert.equal(sourceEvents.length, roots.length,
    'Owner PlayCardAction ledger and physical print capture must reconcile');
  const counts = {pokemon: 0, energy: 0, trainer: 0, unknown: 0};
  const printings = {};
  for (const event of sourceEvents) {
    const printing = event.declared?.ownerHandPrinting;
    assert.ok(typeof printing === 'string' && printing.length > 0);
    printings[printing] = (printings[printing] ?? 0) + 1;
    if (SOURCE_POKEMON.has(printing)) counts.pokemon++;
    else if (SOURCE_ENERGY.has(printing)) counts.energy++;
    else counts.unknown++;
  }
  // The original source roster contains no other Pokémon or Energy. An
  // unknown must be physically reidentified from CardManager before it can
  // be classified as a Trainer. This preserves provenance without guessing.
  const candidateFog = events.filter(e =>
    e.storeAccepted === true && e.playerSlot === 1-sourceSeat &&
    e.action === 'PlayCardAction' &&
    e.declared?.ownerHandPrinting === 'Fog Crystal CRE').length;
  return {sourceSeat, totalSourcePlayCards: roots.length,
    sourceClassCounts: counts, sourcePrintings: printings,
    candidateAcceptedFogCrystal: candidateFog};
}

/**
 * @param {object} archive One immutable authentic original-rank5 native JSON.
 * @param {'v31'|'fusionMobility'} family Registered experiment family.
 * @returns {object} All original-source card-play classification receipts.
 */
function auditSourceTrainerPlays(archive, family) {
  assert.ok(Object.hasOwn(MODES, family));
  const expected = family === 'v31' ? 16 : 8;
  assert.equal(family === 'v31' ? archive?.attempted :
    archive?.requestedNativeAttempts, expected);
  const output = {version: VERSION, family,
    archivedAttempts: expected, modes: {},
    observedSourcePlayCards: 0, observedSourceUnclassified: 0,
    observedSourceTrainerPlays: 0, candidateFogCrystalAccepted: 0,
    competitiveQualifiedGames: 0};
  for (const name of MODES[family]) {
    const arms = archive.modes?.[name]?.attempts;
    assert.ok(Array.isArray(arms) && arms.length === expected / 2);
    const receipt = {arms: arms.length, sourcePlayCards: 0,
      sourcePokemon: 0, sourceEnergy: 0, sourceUnknown: 0,
      candidateFogCrystalAccepted: 0, perArm: []};
    const seen = new Set();
    for (const a of arms) {
      assert.equal(a.trial?.rank, 5);
      assert.ok(!seen.has(a.trial.id));
      seen.add(a.trial.id);
      const v = sourceTrainerPlaysFromNativeRow(a.rawNativeRow);
      receipt.sourcePlayCards += v.totalSourcePlayCards;
      receipt.sourcePokemon += v.sourceClassCounts.pokemon;
      receipt.sourceEnergy += v.sourceClassCounts.energy;
      receipt.sourceUnknown += v.sourceClassCounts.unknown;
      receipt.candidateFogCrystalAccepted += v.candidateAcceptedFogCrystal;
      receipt.perArm.push({trialId: a.trial.id, ...v});
    }
    output.observedSourcePlayCards += receipt.sourcePlayCards;
    output.observedSourceUnclassified += receipt.sourceUnknown;
    output.candidateFogCrystalAccepted += receipt.candidateFogCrystalAccepted;
    output.modes[name] = receipt;
  }
  assert.equal(output.observedSourceUnclassified, 0,
    'Unknown original-source printed PlayCardAction requires manual class review');
  return output;
}

if (require.main === module) {
  assert.equal(process.argv.length, 4);
  const [v31, mobility] = process.argv.slice(2).map(p =>
    JSON.parse(fs.readFileSync(p, 'utf8')));
  const reports = [auditSourceTrainerPlays(v31, 'v31'),
    auditSourceTrainerPlays(mobility, 'fusionMobility')];
  process.stdout.write(JSON.stringify({version:VERSION, reports,
    allArchivedAttempts:24,
    sourceNativePlayCardActions:reports.reduce((n,r)=>
      n+r.observedSourcePlayCards, 0),
    unknownSourcePrintings:reports.reduce((n,r)=>
      n+r.observedSourceUnclassified,0),
    candidateAcceptedFogCrystal:reports.reduce((n,r)=>
      n+r.candidateFogCrystalAccepted,0),
    competitiveQualifiedGames:0}, null, 2)+'\n');
}

module.exports = {VERSION, SOURCE_POKEMON, SOURCE_ENERGY,
  sourceTrainerPlaysFromNativeRow, auditSourceTrainerPlays};
