'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const INPUT = path.join(ROOT, 'agent39-temple-owner-policy-nine-dde-native.json');
const OUTPUT = path.join(ROOT, 'agent39-temple-owner-policy-nine-dde-root-audit.json');
const study = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
assert.equal(study.schema, 'agent39-temple-actor-native-nine-dde-prospective-v1');
assert.equal(study.comparison.groups.length, 18);
assert.equal(study.allNativeRows.length, 36);

/** @param {object} row */
const roots = row => row.roots ?? [];
/** @param {object} root */
const temple = root => root.action === 'PlayCardAction' &&
  root.card === 'Temple of Sinnoh';
/** @param {object} root */
const apex = root => root.action === 'AttackAction' &&
  root.attack === 'Apex Dragon';
const groups = study.comparison.groups.map(group => {
  const control = roots(group.control), treatment = roots(group.treatment);
  const target = group.treatment.candidateSeat === 0 ? 1 : 0;
  const presentTemple = treatment.filter(temple);
  const referenceTemple = control.filter(temple);
  const difference = [];
  let i = 0;
  while (i < Math.min(control.length, treatment.length) &&
    JSON.stringify(control[i]) === JSON.stringify(treatment[i])) i += 1;
  for (const value of presentTemple) {
    const after = treatment.filter(root =>
      root.actionOrdinal > value.actionOrdinal &&
      root.playerSlot === target && apex(root));
    difference.push({
      TempleActionOrdinal: value.actionOrdinal,
      TempleTurn: value.turnBefore,
      sourceApexAfterPlay: after.length,
      firstThreeSourceApexAfterPlay: after.slice(0, 3).map(root => ({
        ordinal: root.actionOrdinal, turn: root.turnBefore
      }))
    });
  }
  return {
    key: group.key, rank: group.rank, comparable: group.comparable,
    firstDivergenceOrdinal: i,
    controlFirstDifferent: control[i] ?? null,
    treatmentFirstDifferent: treatment[i] ?? null,
    controlTemple: referenceTemple.length,
    treatmentTemple: presentTemple.length,
    templeEvents: presentTemple,
    sourceApexInControl: control.filter(root =>
      root.playerSlot === target && apex(root)).length,
    sourceApexInTreatment: treatment.filter(root =>
      root.playerSlot === target && apex(root)).length,
    postTempleSourceApexCensus: difference,
    controlNativeFinished: group.control.nativeFinished,
    treatmentNativeFinished: group.treatment.nativeFinished,
    controlNativeWinner: group.control.nativeWinner,
    treatmentNativeWinner: group.treatment.nativeWinner,
    controlError: group.control.error ?? null,
    treatmentError: group.treatment.error ?? null,
    actualStarterMatch: group.starterMatched,
    sourceDealMatch: group.sourceMatched
  };
});
const all = {
  schema: 'agent39-temple-owner-policy-actual-stadium-root-reducer-v1',
  sourceRun: study.execution.codeRevision,
  registrationSha256: study.preflight.registrationSha256,
  pinnedTwinleaf: study.execution.pinnedTwinleaf,
  groups,
  summary: {
    comparison: study.comparison.summary,
    controlPlayedTemple: groups.reduce((n, g) => n + g.controlTemple, 0),
    treatmentPlayedTemple: groups.reduce((n, g) => n + g.treatmentTemple, 0),
    treatmentGroupsWithTemple: groups.filter(g => g.treatmentTemple > 0).length,
    treatmentTempleWithMatchedOriginal: groups.filter(g =>
      g.comparable && g.treatmentTemple > 0).length,
    sourceApexInControl: groups.reduce((n, g) => n + g.sourceApexInControl, 0),
    sourceApexInTreatment: groups.reduce((n, g) => n + g.sourceApexInTreatment, 0),
    controlErrors: groups.filter(g => g.controlError).length,
    treatmentErrors: groups.filter(g => g.treatmentError).length,
    treatmentErrorSamples: groups.filter(g => g.treatmentError)
      .map(g => ({ key: g.key, reason: g.treatmentError,
        playedTemple: g.treatmentTemple, divergence: g.firstDivergenceOrdinal }))
      .slice(0, 18),
    paperQualifiedGames: 0,
    uncertainty: 'Apex after played Temple does not establish Stadium still active or energy payment legality; opponent may replace it. Native winner is not a qualified match.'
  }
};
const lock = OUTPUT + '.lock', fd = fs.openSync(lock, 'wx', 0o600);
const temp = OUTPUT + '.tmp.' + process.pid;
try {
  fs.writeFileSync(temp, JSON.stringify(all, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(temp, OUTPUT);
} finally {
  if (fs.existsSync(temp)) fs.unlinkSync(temp);
  fs.closeSync(fd);
  fs.unlinkSync(lock);
}
console.log('AGENT39_TEMPLE_OWNER_POLICY_ROOT_AUDIT ' +
  JSON.stringify({ ...all.summary,
    templeGroups: groups.filter(g => g.treatmentTemple > 0)
      .map(g => ({ key: g.key, matched: g.comparable,
        play: g.templeEvents.map(r => r.actionOrdinal),
        controlWinner: g.controlNativeWinner,
        treatmentWinner: g.treatmentNativeWinner,
        sourceApexControl: g.sourceApexInControl,
        sourceApexTreatment: g.sourceApexInTreatment })) }));
