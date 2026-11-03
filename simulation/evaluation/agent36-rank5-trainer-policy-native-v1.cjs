'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {gitBlobHash} = require('./agent36-profile-provenance-gate.cjs');
const {sourceTrainerPlaysFromNativeRow} =
  require('../../scripts/agent9-rank5-original-trainer-source-plays.cjs');

const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION = 'results/aichi-2026/registrations/agent36-rank5-trainer-competence-v1-20261103.json';
const PINNED_REGISTRATION_BLOB = '286a336f4fb19879f7a92df850eb997a5fe60d1c';
const VERSION = 'agent36-rank5-original-trainer-competence-paired-native-v1';

/** @returns {object} Immutable original-roster and selected-policy preflight. */
function preflight() {
  const bytes = fs.readFileSync(path.join(ROOT, REGISTRATION));
  assert.equal(gitBlobHash(bytes), PINNED_REGISTRATION_BLOB,
    'Changed pre-outcome rank5 source-policy and seed preregistration');
  const m = JSON.parse(bytes.toString('utf8'));
  assert.equal(m.sourceRank, 5);
  assert.equal(m.totalExpectedArms, 16);
  assert.equal(m.actionCapPerArm, 120);
  assert.deepEqual(m.candidateIds,
    ['champion-reference', 'new-moon-lockbreaker-v1']);
  assert.equal(m.registeredGroups.length, 4);
  assert.equal(new Set(m.registeredGroups.map(g => g.seed)).size, 4);
  assert.equal(m.originalRosterGitBlobSha,
    gitBlobHash(fs.readFileSync(path.join(ROOT,
      'results/aichi-2026/full-decklists.json'))));
  assert.equal(m.sourceAdmissionLedgerGitBlobSha,
    gitBlobHash(fs.readFileSync(path.join(ROOT,
      'results/aichi-2026/original-printed60-admission-v1.json'))));
  const admission = JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/original-printed60-admission-v1.json'), 'utf8'));
  const original = admission.rows.find(row => row.rank === 5);
  assert.equal(original.printed60Sha256, m.originalSource60Sha256);
  assert.equal(original.physicalCards, 60);
  for(const [file, sha] of Object.entries(m.sourceCodeBlobShas)) {
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT, file))), sha,
      'Selected source policy changed from independently registered bytes: ' + file);
  }
  assert.deepEqual(Object.keys(m.modes),
    ['baseline', 'sourceTrainerComposite']);
  for(const mode of Object.values(m.modes)) {
    assert.equal(mode.options.nativeRootActionLimit, 120);
    assert.equal(mode.options.nativeAcceptedTargets, true);
    assert.equal(mode.options.paperQuickBallPayment, true);
    assert.equal(mode.options.sharedPaperPaymentPortfolio, true);
  }
  return m;
}

/**
 * Match both printed name and original set, allowing only orthographic
 * variation such as Dedenne-GX versus Dedenne GX in the native recorder.
 * Different printings are never silently collapsed.
 * @param {string} text Printed identity with source set.
 * @returns {string}
 */
function printingKey(text) {
  return text.normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'').toLowerCase();
}

/** @returns {Map<string,string>} Original registered source names and categories. */
function sourcePrintingTypes() {
  const roster=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank5=roster.decks.find(d=>d.rank===5);
  assert.ok(rank5);
  const types=new Map();
  for(const card of rank5.cards) {
    const key=printingKey(card.name+' '+card.printing.set);
    assert.ok(!types.has(key),'Registered source printing collision');
    assert.ok(['Pokémon','Trainer','Energy'].includes(card.category));
    types.set(key,card.category);
  }
  assert.equal(rank5.cards.reduce((n,card)=>n+card.count,0),60);
  return types;
}

/** @param {object} raw Genuine original source native Store row. */
function classifySourceRow(raw) {
  const seat = raw.trial?.candidateSlot === 'A' ? 1 : 0;
  assert.equal(raw.trial?.rank, 5);
  assert.equal(raw.sourceSeat, seat);
  const base = {
    id: raw.trial?.id,
    sourceSeat: seat,
    sourceDealFingerprint: raw.sourceDealFingerprint ?? null,
    actualStarterSeat: raw.actualStarterSeat ?? null,
    nativeStatus: raw.status ?? null,
    nativeEndReason: raw.endReason ?? null,
    sourceAttackDeclarations: raw.attackDeclarations?.source ?? null,
    competitiveQualified: false
  };
  try {
    const plays = sourceTrainerPlaysFromNativeRow(raw);
    const original=sourcePrintingTypes();
    const counts={pokemon:0,energy:0,trainer:0};
    const unmatched=[];
    for(const [printing,n] of Object.entries(plays.sourcePrintings)) {
      const category=original.get(printingKey(printing));
      if(category==='Pokémon')counts.pokemon+=n;
      else if(category==='Energy')counts.energy+=n;
      else if(category==='Trainer')counts.trainer+=n;
      else unmatched.push(printing);
    }
    assert.deepEqual(unmatched,[],
      'Unrecognized source printing, require independent physical review');
    assert.equal(counts.pokemon+counts.trainer+counts.energy,
      plays.totalSourcePlayCards);
    return {...base, nativeCardPlaysCertified: true,
      acceptedSourceTrainerPlays: counts.trainer,
      sourcePrintings: plays.sourcePrintings,
      sourceCardClassCounts: counts,
      candidateAcceptedFogCrystal: plays.candidateAcceptedFogCrystal};
  } catch (error) {
    return {...base, nativeCardPlaysCertified: false,
      acceptedSourceTrainerPlays: null,
      sourceClassificationError: String(error?.message ?? error)};
  }
}

/** @param {object} result Complete native development batch. */
function characterizeMode(result) {
  const rows = result.rows.map(classifySourceRow);
  assert.equal(rows.length, 8);
  const eligible = rows.filter(row => row.nativeCardPlaysCertified);
  return {
    attempted: rows.length, sourceClassified: eligible.length,
    unclassifiedOrAborted: rows.length - eligible.length,
    acceptedOriginalSourceTrainerPlays: eligible.reduce(
      (n,row) => n + row.acceptedSourceTrainerPlays, 0),
    acceptedOriginalSourceTrainerPlaysBoundedToClassifiedRows: true,
    sourceAttackDeclarations: rows.reduce((n,row) =>
      n + (Number.isSafeInteger(row.sourceAttackDeclarations) ?
        row.sourceAttackDeclarations : 0), 0),
    sourceAttackDeclarationCountIncomplete: rows.some(row =>
      !Number.isSafeInteger(row.sourceAttackDeclarations)),
    paperCompetitiveGames: 0, rows
  };
}

/**
 * Run 8 exact two-candidate physical arms twice with frozen source and
 * unchanged candidate 60s. No native terminal is a competitive game.
 * @param {{runDevelopment?:Function}} [deps] Pure test seam.
 * @returns {object}
 */
function run(deps = {}) {
  const m = preflight();
  const selected = m.registeredGroups.flatMap(group =>
    m.candidateIds.map(candidateId => ({
      ...group, candidateId,
      id: [group.rank, group.repeat, group.candidateSlot, candidateId].join(':')
    })));
  assert.equal(selected.length, 8);
  const execute = deps.runDevelopment ??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const modes = {};
  for(const [name, mode] of Object.entries(m.modes)) {
    try {
      const output = execute({
        ...mode.options,
        registeredTrials: selected,
        allowAdditionalOriginalSourceRanks: true,
        registeredFrameName: VERSION + '-' + name
      });
      assert.equal(output.attempted, 8);
      assert.deepEqual(output.rows.map(row => row.trial.id),
        selected.map(row => row.id));
      modes[name] = {
        count: characterizeMode(output),
        raw: output
      };
    } catch (error) {
      modes[name] = {
        count: {scheduled: 8, nativeAttemptsVerified: null,
          sourceClassified: 0, unclassifiedOrAborted: 8,
          acceptedOriginalSourceTrainerPlays: null,
          paperCompetitiveGames: 0,
          batchError: String(error?.stack ?? error)},
        raw: null
      };
    }
  }
  const a = modes.baseline.count.rows;
  const b = modes.sourceTrainerComposite.count.rows;
  const paired = Array.from({length: 8}, (_,i) => {
    const control = a?.[i] ?? null;
    const variant = b?.[i] ?? null;
    const sourceDealMatch = Boolean(control?.sourceDealFingerprint &&
      variant?.sourceDealFingerprint &&
      control.sourceDealFingerprint === variant.sourceDealFingerprint);
    return {
      trial: selected[i],
      exactSameSourcePhysicalDeal: sourceDealMatch,
      sourceTrainerDelta: sourceDealMatch &&
        Number.isSafeInteger(control?.acceptedSourceTrainerPlays) &&
        Number.isSafeInteger(variant?.acceptedSourceTrainerPlays) ?
        variant.acceptedSourceTrainerPlays -
        control.acceptedSourceTrainerPlays : null,
      baseline: control,
      sourceTrainerComposite: variant,
      competitiveQualified: false
    };
  });
  return {
    version: VERSION, registrationBlob: PINNED_REGISTRATION_BLOB,
    registeredAtUtc: m.registeredAtUtc, sourceRank: 5,
    pinnedVendorRevision: m.vendorPinnedRevision,
    sourcePrinted60Sha256: m.originalSource60Sha256,
    unchangedCandidateIds: m.candidateIds,
    allRegisteredAttempts: 16, independentPhysicalSeeds: 4,
    modes, paired, competitiveQualifiedGames: 0,
    estimatedFieldWinRate: null,
    missingOriginalFieldRanks: [23,25,28]
  };
}

/** @param {string} destination @param {object} value */
function writeAtomic(destination,value) {
  const parent = path.dirname(destination);
  fs.mkdirSync(parent,{recursive:true});
  const lock = destination + '.lock';
  const temporary = destination + '.' + randomUUID() + '.tmp';
  const fd = fs.openSync(lock, 'wx');
  try {
    fs.writeFileSync(temporary, JSON.stringify(value,null,2)+'\n',
      {flag:'wx'});
    fs.renameSync(temporary,destination);
  } finally {
    fs.closeSync(fd);
    fs.rmSync(lock);
    if(fs.existsSync(temporary))fs.rmSync(temporary);
  }
}

if(require.main === module) {
  const report = process.argv.includes('--preflight') ?
    {mode:'PREFLIGHT_ONLY', registration:preflight(), competitiveQualifiedGames:0} :
    run();
  const output = process.argv.includes('--preflight') ?
    'agent36-rank5-trainer-preflight.json' :
    'agent36-rank5-trainer-native-results.json';
  writeAtomic(path.resolve(process.cwd(),output),report);
  process.stdout.write(JSON.stringify({
    version: VERSION, mode: process.argv.includes('--preflight') ?
      'preflight' : 'native',
    baseline: report.modes?.baseline?.count ?? null,
    treatment: report.modes?.sourceTrainerComposite?.count ?? null,
    competitiveQualifiedGames: 0
  }, null, 2) + '\n');
}

module.exports = {
  VERSION, PINNED_REGISTRATION_BLOB,
  preflight, classifySourceRow, characterizeMode,run,writeAtomic
};
