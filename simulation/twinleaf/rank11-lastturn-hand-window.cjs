'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');

const SOURCE_SEED = 1111464409;
const SOURCE_RANK = 11;
const OPPONENT_SEAT = 0;
const CANDIDATE_SEAT = 1;

/**
 * Inspect only the source opponent's own decision information set on its
 * last turn before the retrospective New Moon copied Poltergeist KO.
 * The selected seed is a mechanical positive control, never a win-rate draw.
 * No policy, reducer, hidden state or branch action is changed.
 * @returns {object}
 */
function run() {
  const opponent = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  }).opponents.find(entry => entry.rank === SOURCE_RANK);
  assert.equal(opponent?.status, 'ready');
  assert.equal(opponent.cards.length, 60);
  const candidate = pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length, 60);
  const game = runArm(candidate, opponent.cards, CANDIDATE_SEAT,
    SOURCE_SEED, 350, true, true, false, false);
  assert.equal(game.seed, SOURCE_SEED);
  assert.equal(game.verifiedByDrawLog, true);
  assert.equal(game.firstTurnSlot, OPPONENT_SEAT);
  assert.equal(game.finished, true);
  assert.deepEqual(game.prizesRemaining, [2, 0]);

  const terminalCopy = game.attackDeclarationTrace.find(entry =>
    entry.turnBefore === 36 &&
    entry.playerSlot === CANDIDATE_SEAT &&
    entry.attackName === 'Poltergeist' &&
    entry.triggerAction !== 'AttackAction');
  assert.ok(terminalCopy && terminalCopy.actionOrdinal === 272,
    'Expected immutable source copied-attack positive control');

  const turn = 35;
  const ownDecisions = game.decisionTrace.filter(entry =>
    entry.turnBefore === turn && entry.playerSlot === OPPONENT_SEAT);
  const pass = ownDecisions.find(entry => entry.action === 'PassTurnAction');
  assert.ok(pass, 'Original source rank11 opponent must complete turn35');
  const finalHand = pass.decisionHandBefore;
  assert.equal(finalHand?.perspectiveSeat, OPPONENT_SEAT);
  assert.ok(Array.isArray(finalHand.ownHandPrintings));
  const playedActions = game.rootActionLedger.filter(entry =>
    entry.turnBefore === turn && entry.playerSlot === OPPONENT_SEAT);
  const afterOpponent = game.copycatTurnStartEvidence.find(entry =>
    entry.turn === 36 && entry.candidateSeat === CANDIDATE_SEAT);
  assert.ok(afterOpponent, 'Expected true candidate start after opponent turn35');
  const snapshots = ownDecisions.map(entry => ({
    actionOrdinal: entry.actionOrdinal,
    action: entry.action,
    card: entry.card ?? null,
    ability: entry.ability ?? null,
    ownHandBefore: entry.decisionHandBefore?.ownHandPrintings ?? null,
    publicBoardBeforePass: entry.publicBoardBeforePass ?? null
  }));
  const terminalChoices = game.decisionTrace.filter(entry =>
    entry.turnBefore === 36 && entry.attackChoice?.selection).map(entry => ({
      actionOrdinal: entry.actionOrdinal,
      attackChoice: entry.attackChoice.selection
    }));

  return {
    schema: 'rank11-source-last-turn35-own-hand-review-v1',
    sourceRank: SOURCE_RANK,
    sourceSeed: SOURCE_SEED,
    seedWasRetrospectivelySelected: true,
    actualFirstSeat: game.firstTurnSlot,
    candidateSeat: CANDIDATE_SEAT,
    sourceDeckHashes: game.deckHashes,
    engine: game.engine,
    policy: game.policy,
    turn35: {
      decisions: snapshots,
      rootActions: playedActions,
      ownHandBeforePass: finalHand.ownHandPrintings,
      opponentHandSizeBeforePass: finalHand.opponentHandSize,
      carmineHeldAtPass: finalHand.ownHandPrintings.some(name =>
        name.startsWith('Carmine ')),
      supporterPlayed: playedActions.filter(entry =>
        entry.action === 'PlayCardAction' &&
        ['Carmine', 'Marnie', "Boss's Orders", 'Guzma', 'Professor'].some(name =>
          entry.card?.startsWith(name))),
      sourcePublicBoardAtPass: pass.publicBoardBeforePass?.[OPPONENT_SEAT] ?? null
    },
    candidateTurn36: {
      actualTurn: afterOpponent.turn,
      sourcePublicBoard: afterOpponent.board[OPPONENT_SEAT],
      opponentActive: afterOpponent.board[CANDIDATE_SEAT]?.active?.name ?? null,
      terminalAttackOrdinal: terminalCopy.actionOrdinal,
      selectedAttacks: terminalChoices
    },
    legalityAndCounterfactualNotTested: true,
    independentlyQualifiedCompetitiveGames: 0,
    caveat: 'Read-only source own-hand evidence after actual bot actions. Neither legal alternative nor outcome sensitivity is established by this inventory.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {run, SOURCE_SEED, SOURCE_RANK};
