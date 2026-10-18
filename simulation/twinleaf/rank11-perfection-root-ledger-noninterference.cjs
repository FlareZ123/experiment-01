'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runMatch} = require('./headless.cjs');
const {withoutTrace} = require('./trace-noninterference.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED = 1111464409;
const CANDIDATE_SEAT = 1;

/**
 * Observe the same authentic source-dealt copied-attack game with capture
 * enabled and disabled. A previously selected positive seed is used solely
 * for noninterference and source attack-declaration lineage validation.
 * @returns {object} Exact single-source evidence, without win-rate inference.
 */
function run() {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  assert.equal(plan.engineRevision, PIN);
  const opponent = plan.opponents.find(row => row.rank === 11);
  assert.equal(opponent?.status, 'ready');
  const candidate = pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length, 60);
  assert.equal(opponent.cards.length, 60);
  const request = {
    deckA: opponent.cards, deckB: candidate,
    seed: SEED, maxActions: 350,
    label: 'rank11-source-Perfection-root-ledger-isolation',
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    supporterDecisionCorrection: true,
    leleEntryAbilityLockCorrection: true,
    entryDrawLockCorrection: true,
    isolatePolicyRandomness: true,
    pendingEndTurnSwitchCleanupCorrection: true,
    captureAttackPassProbes: true,
    captureCopycatTurnStartSeat: CANDIDATE_SEAT,
    newMoonNativeOpeningPivotSeat: CANDIDATE_SEAT
  };
  const control = runMatch({...request, captureDecisionTrace: false});
  const traced = runMatch({...request, captureDecisionTrace: true});
  assert.equal(traced.verifiedByDrawLog, true);
  assert.equal(control.verifiedByDrawLog, true);
  assert.equal(traced.firstTurnSlot, 0);
  assert.equal(control.firstTurnSlot, traced.firstTurnSlot);
  assert.deepEqual(withoutTrace(traced), withoutTrace(control),
    'Read-only root and copied-attack selection capture changed the source Store trajectory');
  assert.equal(control.rootActionLedger, null);
  assert.equal(control.decisionTrace, null);
  assert.equal(traced.rootActionLedgerProtocol,
    'actual-store-root-action-ledger-v1');

  const roots = traced.rootActionLedger;
  assert.equal(roots.length, traced.actions);
  for (let ordinal=0;ordinal<roots.length;ordinal++) {
    assert.equal(roots[ordinal].actionOrdinal, ordinal);
    if (ordinal) {
      assert.equal(roots[ordinal].turnBefore, roots[ordinal-1].turnAfter);
    }
  }

  const candidateDeclarations = traced.attackDeclarationTrace.filter(row =>
    row.playerSlot === CANDIDATE_SEAT);
  const copied = candidateDeclarations.filter(row =>
    row.triggerAction === 'ResolvePromptAction');
  assert.ok(copied.length >= 2,
    'Expected actual source Store logs for both known Perfection copied attacks');
  for (const declared of copied) {
    const root = roots[declared.actionOrdinal];
    assert.equal(root.playerSlot, CANDIDATE_SEAT);
    assert.equal(root.action, 'ResolvePromptAction');
    assert.equal(root.pendingPrompt, 'ChooseAttackPrompt');
    assert.equal(root.attackChoice?.attackName, declared.attackName);
    assert.ok(root.attackChoice?.printing?.startsWith('Gengar & Mimikyu-GX TEU'));
    const selected = traced.decisionTrace.find(row =>
      row.actionOrdinal === declared.actionOrdinal);
    assert.equal(selected?.attackChoice?.selection?.attackName,
      root.attackChoice.attackName);
    assert.equal(selected?.attackChoice?.selection?.printing,
      root.attackChoice.printing);
  }
  const initial = copied[0];
  const terminalCopied = copied.at(-1);
  const opponentReplies = roots.filter(row =>
    row.playerSlot === 0 &&
    row.turnBefore > initial.turnBefore &&
    row.turnBefore < terminalCopied.turnBefore &&
    row.action !== 'ResolvePromptAction');
  assert.ok(opponentReplies.length > 0,
    'Copied attack must precede at least one real opposing non-prompt root choice');

  const terminal = traced.terminalTransition;
  assert.equal(traced.finished, true);
  assert.equal(traced.winner, CANDIDATE_SEAT);
  assert.equal(terminal?.after?.winner, CANDIDATE_SEAT);
  assert.equal(terminal?.actionName, 'ResolvePromptAction');
  assert.equal(terminal?.pendingPrompt, 'WaitPrompt');
  assert.equal(terminal.actionLineage?.initiatingAction?.actionName,
    'UseAbilityAction');
  assert.equal(terminal.before.players[CANDIDATE_SEAT].prizesRemaining, 1);
  assert.equal(terminal.after.players[CANDIDATE_SEAT].prizesRemaining, 0);
  assert.equal(terminal.before.players[0].inPlayPokemon -
    terminal.after.players[0].inPlayPokemon, 1);
  assert.deepEqual(traced.prizesRemaining, [2,0]);

  return {
    kind:'rank11-authentic-delegated-Perfection-ledger-noninterference-v1',
    pinnedEngine: PIN, sourceRank: 11, candidatePhysicalSeat: CANDIDATE_SEAT,
    seed: SEED, seedRetrospectivelySelected: true,
    sourceActuallyFirst: true, sourceDrawVerified: true,
    candidateDeckPrints: candidate.length, opponentDeckPrints: opponent.cards.length,
    observedRootActions: roots.length,
    rootLedgerSha256: createHash('sha256')
      .update(JSON.stringify(roots)).digest('hex'),
    copiedStoreDeclarations: copied.map(row => ({
      ordinal: row.actionOrdinal, turn: row.turnBefore,
      attack: row.attackName,
      printedSource: roots[row.actionOrdinal].attackChoice.printing,
      rootAction: row.triggerAction
    })),
    opponentNonPromptRootRepliesBetweenCopies: opponentReplies.length,
    terminalPublicEffect: {
      opponentInPlayBefore: terminal.before.players[0].inPlayPokemon,
      opponentInPlayAfter: terminal.after.players[0].inPlayPokemon,
      candidatePrizesBefore: terminal.before.players[1].prizesRemaining,
      candidatePrizesAfter: terminal.after.players[1].prizesRemaining
    },
    effectEvidence: 'Store-observed terminal Prize and opponent in-play change, not independently paper-validated',
    exactGameParityWithoutTraceCapture: true,
    engineFinished: traced.finished,
    qualifiedCompetitiveGames: 0,
    caveat: 'One previously selected source deal with weak opponent policy; no independent representative game or 99.5% inference.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {run, SEED};
