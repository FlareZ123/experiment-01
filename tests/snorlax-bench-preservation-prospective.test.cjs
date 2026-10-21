'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  schedule, digest, summarize, firstRootDifference
} = require('../simulation/twinleaf/snorlax-bench-preservation-prospective.cjs');

test('fresh precommitted schedule covers both actual source seats and both ranks', () => {
  const rows = schedule();
  assert.equal(rows.length, 12);
  assert.deepEqual([...new Set(rows.map(r => r.rank))], [3, 7]);
  assert.deepEqual([...new Set(rows.map(r => r.sourceSeat))], [0, 1]);
  assert.equal(new Set(rows.map(r =>
    [r.rank, r.sourceSeat, r.repeat].join(':'))).size, 12);
  assert.equal(new Set(rows.map(r => r.seed)).size, 12);
  assert.ok(rows.every(r => Number.isInteger(r.seed) && r.seed >= 0 &&
    r.seed <= 0xffffffff));
  assert.deepEqual(schedule(), rows);
});

test('public root comparison spots exact first divergent action and tolerates unequal length', () => {
  const one = {turnBefore: 1, playerSlot: 0, action: 'ResolvePromptAction',
    pendingPrompt: 'ChooseCardsPrompt'};
  const two = {turnBefore: 1, playerSlot: 0, action: 'PlayCardAction',
    card: 'Snorlax PGO', pendingPrompt: null};
  const alternative = {...two, card: 'Water Energy'};
  assert.equal(firstRootDifference([one, two], [one, two]), null);
  assert.deepEqual(firstRootDifference([one, two], [one, alternative]), {
    ordinal: 1,
    ordinary: {
      turnBefore: 1, playerSlot: 0, action: 'PlayCardAction',
      pendingPrompt: null, card: 'Snorlax PGO', ability: null, attack: null
    },
    preserve: {
      turnBefore: 1, playerSlot: 0, action: 'PlayCardAction',
      pendingPrompt: null, card: 'Water Energy', ability: null, attack: null
    }
  });
  assert.equal(firstRootDifference([one], [one, two]).ordinal, 1);
});

test('summary retains genuine solo-board opportunity and native root provenance', () => {
  const ledger = [{turnBefore: 1, playerSlot: 1, action: 'PlayCardAction',
    pendingPrompt: null, card: 'Water Energy'}];
  const game = {
    firstTurnSlot: 1, verifiedByDrawLog: true,
    initialBoardAtFirstTurn: {players: [
      {seat: 0, active: 'Shadow Rider Calyrex V CRE', bench: []},
      {seat: 1, active: 'Snorlax PGO', bench: []}
    ]},
    snorlaxSoloOpeningEvents: [{sawSnorlax: true}],
    rootSoloSetupSelections: [{promptId: 12}],
    rootActionLedger: ledger,
    cardsPlayedBySeat: [{}, {'Water Energy': 1}],
    actionsBySeat: [{}, {PlayCardAction: 1}],
    attackDeclarationTrace: [],
    finalPublicBoard: {example: true},
    finished: false, winner: null,
    actions: 100, turns: 8, endReason: 'action-limit',
    prizesRemaining: [6, 6], deckHashes: ['a', 'b'],
    rules: {format: 'EXPANDED'}
  };
  const row = summarize(game, 1);
  assert.equal(row.soloAtFirstTurn, true);
  assert.equal(row.sourcePlayed['Water Energy'], 1);
  assert.deepEqual(row.nativeSetupResponses, [{promptId: 12}]);
  assert.deepEqual(row.rootActionLedger, ledger);
  assert.equal(row.rootActionSHA256, digest(ledger));
  assert.equal(row.competitiveGameQualified, false);
});

test('summary does not manufacture solo exposure or wins from missing observations', () => {
  const row = summarize({
    initialBoardAtFirstTurn: null, rootActionLedger: [],
    finished: false, winner: null
  }, 0);
  assert.equal(row.soloAtFirstTurn, false);
  assert.equal(row.sourceFirstTurnBoard, null);
  assert.deepEqual(row.nativeAttackDeclarations, []);
  assert.deepEqual(row.sourcePlayed, {});
  assert.equal(row.competitiveGameQualified, false);
});
