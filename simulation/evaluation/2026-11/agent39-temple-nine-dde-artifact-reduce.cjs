'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const INPUT = path.join(ROOT, 'agent39-temple-nine-dde-native.json');
const OUTPUT = path.join(ROOT, 'agent39-temple-nine-dde-action-audit.json');
const study = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
assert.equal(study.schema, 'agent39-temple-fixed60-nine-dde-prospective-v1');
assert.equal(study.comparison.groups.length, 18);
assert.equal(study.allNativeRows.length, 36);

/** @param {object} action */
function isPlayedTemple(action) {
  return action?.action === 'PlayCardAction' &&
    JSON.stringify(action).includes('Temple of Sinnoh');
}
/** @param {object} action */
function mentionsTemple(action) {
  return JSON.stringify(action).includes('Temple of Sinnoh');
}
/** @param {object} row */
function inspectArm(row) {
  const roots = row.roots ?? [];
  return { id: row.id, rank: row.rank, candidateId: row.candidateId,
    roots: roots.length, paperQualified: false,
    playedTemple: roots.filter(isPlayedTemple).length,
    mentionsTemple: roots.filter(mentionsTemple).length,
    sourceApexDragonAttack: roots.filter(x =>
      x.action === 'AttackAction' && x.attack === 'Apex Dragon' &&
      x.playerSlot === (row.candidateSeat === 0 ? 1 : 0)).length,
    candidateAttackActions: roots.filter(x =>
      x.action === 'AttackAction' && x.playerSlot === row.candidateSeat).length,
    samples: roots.filter(mentionsTemple).slice(0, 3) };
}
const arms = study.comparison.groups.flatMap(g =>
  [inspectArm(g.champion), inspectArm(g.temple)]);
const temple = arms.filter(a => a.candidateId === 'temple-shadow-rider-v1');
const champion = arms.filter(a => a.candidateId === 'champion-reference');
const sample = temple.flatMap(x => x.samples.map(a => ({ id: x.id, root: a })));
const actions = study.comparison.groups.map(g => {
  const c = g.champion.roots ?? [], t = g.temple.roots ?? [];
  let firstDiff = 0;
  while (firstDiff < Math.min(c.length, t.length) &&
    JSON.stringify(c[firstDiff]) === JSON.stringify(t[firstDiff])) firstDiff += 1;
  return { key: g.key, comparable: g.comparable,
    championRoots: c.length, templeRoots: t.length,
    identicalActionPrefix: firstDiff,
    firstChampionRoot: c[firstDiff] ?? null,
    firstTempleRoot: t[firstDiff] ?? null };
});
const playCardSample = study.comparison.groups
  .flatMap(g => (g.temple.roots ?? []).filter(r => r.action === 'PlayCardAction')
    .map(r => ({ group: g.key, root: r }))).slice(0, 18);
const playCardTotal = study.comparison.groups
  .reduce((n, g) => n + (g.temple.roots ?? [])
    .filter(r => r.action === 'PlayCardAction').length, 0);
const result = {
  playedCardRootCount: playCardTotal,
  playedCardRootSamples: playCardSample,
  schema: 'agent39-temple-nine-dde-readonly-root-audit-v1',
  archivedStudySchema: study.schema,
  registrationDigest: study.preflight.registrationSha256,
  archivedNativeRun: 42576274998,
  observedTemplePlayedRoots: temple.reduce((n, a) => n + a.playedTemple, 0),
  originalRegidragoApexAttackRootsInTempleArms:
    temple.reduce((n, a) => n + a.sourceApexDragonAttack, 0),
  originalRegidragoApexAttackRootsInChampionArms:
    champion.reduce((n, a) => n + a.sourceApexDragonAttack, 0),
  armStatistics: arms,
  firstRootDifferences: actions,
  sampleTempleActionRoots: sample.slice(0, 24),
  limitation: 'Only native root action labels were inspected. Absence of an identifiable Temple action does not independently prove absence from play. No independent paper or clock admission.'
};
const lock = OUTPUT + '.lock';
const fd = fs.openSync(lock, 'wx', 0o600), temp = OUTPUT + '.tmp.' + process.pid;
try {
  fs.writeFileSync(temp, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(temp, OUTPUT);
} finally {
  if (fs.existsSync(temp)) fs.unlinkSync(temp);
  fs.closeSync(fd);
  fs.unlinkSync(lock);
}
console.log('AGENT39_TEMPLE_ACTION_AUDIT ' + JSON.stringify({
  playedTemple: result.observedTemplePlayedRoots,
  templeSourceApex: result.originalRegidragoApexAttackRootsInTempleArms,
  championSourceApex: result.originalRegidragoApexAttackRootsInChampionArms,
  templeMentionArms: temple.filter(a => a.mentionsTemple > 0).map(a => a.id),
  firstRootPairs: actions.length,
  playedCardRootCount: result.playedCardRootCount,
  playedCardRootSamples: result.playedCardRootSamples.slice(0, 3),
  firstTempleEventSamples: sample.slice(0, 5)
}));
