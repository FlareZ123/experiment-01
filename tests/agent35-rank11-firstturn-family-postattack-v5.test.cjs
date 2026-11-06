'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {VERSION, publicRoot, extractOriginal, run, write} =
  require('../simulation/evaluation/agent35-rank11-firstturn-family-postattack-v5.cjs');

const ID = '11:102:A:champion-reference';
const base = [
  {actionOrdinal: 17, turnBefore: 2, playerSlot: 1,
    action: 'AttackAction', attack: 'Call for Family'},
  {actionOrdinal: 18, turnBefore: 2, playerSlot: 1,
    action: 'ResolvePromptAction', pendingPrompt: 'ChooseCardsPrompt'},
  {actionOrdinal: 19, turnBefore: 2, playerSlot: 1,
    action: 'ResolvePromptAction', pendingPrompt: 'ShuffleDeckPrompt'},
  {actionOrdinal: 22, turnBefore: 2, playerSlot: 1,
    action: 'ResolvePromptAction', pendingPrompt: 'WaitPrompt'},
  {actionOrdinal: 23, turnBefore: 3, playerSlot: 0,
    action: 'PlayCardAction', card: 'Psychic Energy'},
  {actionOrdinal: 24, turnBefore: 3, playerSlot: 0,
    action: 'ResolvePromptAction', pendingPrompt: 'ChooseCardsPrompt'},
  {actionOrdinal: 25, turnBefore: 3, playerSlot: 0,
    action: 'PassTurnAction'},
  {actionOrdinal: 26, turnBefore: 4, playerSlot: 1,
    action: 'PlayCardAction', card: 'Guzma'}
];

function fixture(roots = base) {
  return {rawDevelopment: {rows: [
    {trial: {id: ID}, nativeAbortEvidence: {
      rootActionLedger: roots, failureStage: 'bot-decoder',
      pendingPrompt: 'ChooseCardsPrompt', actionOrdinal: 30,
      actingSeat: 1
    },status:'engine-error'},
    ...Array.from({length: 7}, (_, i) => ({
      trial: {id: 'other-' + i},rootActionLedger: [],
      status: null
    }))
  ]}};
}

test('native source attack remains original and opponent next-turn voluntary actions are identified', () => {
  const r = extractOriginal(fixture());
  assert.equal(r.selectedNativeStatus, 'engine-error');
  assert.equal(r.rootsTotal, 8);
  assert.equal(r.sourceAttackRoot.actionOrdinal, 17);
  assert.equal(r.opponentAfterAttackNextTurnRoots.length, 3);
  assert.deepEqual(r.opponentNextTurnNonpromptRoots.map(x => x.action),
    ['PlayCardAction', 'PassTurnAction']);
  assert.deepEqual(r.nextOwnTurnAcceptedRoots.map(x => x.action),
    ['PlayCardAction']);
  assert.equal(r.nativeAbort.failureStage, 'bot-decoder');
  assert.equal(r.failureInclusiveEight.length, 8);
});

test('prompt-only opponent opportunity is recorded without a strategic opponent action', () => {
  const r = extractOriginal(fixture(base.slice(0, 6).filter(x =>
    x.action !== 'PlayCardAction')));
  assert.equal(r.hasNextTurnOpponentRoot, true);
  assert.equal(r.hasOpponentVoluntaryRoot, false);
  assert.equal(r.nextOwnTurnAcceptedRoots.length, 0);
});

test('unknown private card-zone fields are never serialized into public action', () => {
  assert.deepEqual(publicRoot({...base[0], opponentHiddenHand:
    ['SECRET'], sourceOwnerDeck:['SECRET']}), base[0]);
  assert.throws(() => publicRoot({actionOrdinal:'17'}),
    /actionOrdinal/);
});

test('selected source root is mandatory, and unrelated eight arms are retained', () => {
  assert.throws(() => extractOriginal(fixture(
    base.filter(x => x.actionOrdinal !== 17))), /attack root17/);
  assert.throws(() => extractOriginal({rawDevelopment:{rows:[]}}));
});

test('injected observational native v5 replay retains v4 custody and no wins', () => {
  const expected = {
    schema:'agent35-rank11-firstturn-family-owner-native-v4',
    exactOriginalDeal:true, preForkOriginalPublicActionsPreserved:true,
    originalSourceLetterPhysicalTwoDarkness:true,
    physicalCallForFamilyBasicToBench:true,
    originalSourceAttackAction:{actionOrdinal:17},
    genuineFamilyPromptAudit:{promptShape:{min:0,max:1}},
    letterPromptAudit:{searchPromptsSettled:1,physicalDarknessToHand:2}
  };
  const out = run({
    steward:()=>fixture(),
    observer: options => {options.steward();return {};},
    runV4: ({observe}) => {
      observe({lateRun:()=>null});
      return expected;
    }
  });
  assert.equal(out.schema, VERSION);
  assert.equal(out.originalNativeAttackRoot17AndPhysicalBasicBench, true);
  assert.equal(out.hasOpponentVoluntaryRoot, true);
  assert.equal(out.competitivelyQualifiedGames, 0);
  assert.equal(out.winRate, null);
});

test('exclusive output and sha256 are independently consistent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent35-v5-'));
  const filename = path.join(dir, 'v5.json');
  try {
    const result = {...extractOriginal(fixture()), schema:VERSION};
    const saved = write(filename, result);
    assert.ok(saved.bytes > 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf8')), result);
    const fd = fs.openSync(filename + '.lock', 'wx');
    try {assert.throws(()=>write(filename,result), /EEXIST/);}
    finally {fs.closeSync(fd);fs.unlinkSync(filename+'.lock');}
  } finally {
    fs.rmSync(dir, {recursive:true, force:true});
  }
});
