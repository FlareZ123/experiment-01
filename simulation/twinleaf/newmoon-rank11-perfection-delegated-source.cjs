'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');
const {initialChoice} = require('./new-moon-rank11-native-gengar-hardmatchup.cjs');
const source = require('../../results/als/new-moon-perfection-english-map.json');
const contender = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

const SOURCE_RANK = 11;
const CANDIDATE_SEAT = 1;
const SOURCE_SEED = 1111464409;

/**
 * Replay a previously published source deal under the exact native Gengar
 * opening pivot. Investigate Perfection's copied endgame attack with real
 * Store attack declarations and causal turn-ending prompt lineage.
 *
 * This selected seed does not estimate encounter frequency or win rate.
 * @returns {object}
 */
function run() {
  const rank11 = planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  }).opponents.find(opponent => opponent.rank === SOURCE_RANK);
  assert.equal(rank11?.status,'ready');
  assert.equal(rank11.cards.length,60);
  const candidate = pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);

  const game = runArm(candidate,rank11.cards,CANDIDATE_SEAT,
    SOURCE_SEED,350,true,true);
  assert.equal(game.seed,SOURCE_SEED);
  assert.equal(game.firstTurnSlot,0,'This source seed must remain rank11-first');
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.attackDeclarationTraceProtocol,
    'real-store-attack-log-declarations-v1');

  const starting = initialChoice(game,CANDIDATE_SEAT);
  assert.ok(starting,'Actual initial Basic selection must include Gengar');
  assert.equal(starting.chosen[0],'Gengar & Mimikyu-GX TEU');
  assert.equal(starting.hand.includes('Psychic Energy SVE'),true);

  const attacks = game.attackDeclarationTrace.filter(entry =>
    entry.playerSlot === CANDIDATE_SEAT);
  const delegated = attacks.filter(entry =>
    entry.triggerAction !== 'AttackAction');
  assert.ok(delegated.length > 0,
    'Expected at least one actual Perfection selected copy Store log');

  const terminal = game.terminalTransition;
  assert.ok(terminal && game.finished && game.winner === CANDIDATE_SEAT);
  const lineage = terminal.actionLineage;
  assert.equal(lineage?.initiatingAction?.actionName,'UseAbilityAction');
  assert.ok(lineage.promptChain.some(entry =>
    entry.pendingPrompt === 'ChooseAttackPrompt'));
  const terminalAttack = delegated.find(entry =>
    entry.actionOrdinal >= lineage.initiatingAction.actionOrdinal &&
    entry.actionOrdinal <= lineage.promptChain.at(-1).actionOrdinal);
  assert.ok(terminalAttack,
    'Logged copied attack must be attributable to terminal prompt chain');
  const selectedCopies = game.decisionTrace.filter(row =>
    row.attackChoice?.selection &&
    row.actionOrdinal >= lineage.initiatingAction.actionOrdinal &&
    row.actionOrdinal <= terminalAttack.actionOrdinal);
  const terminalSelection = selectedCopies.at(-1);
  assert.ok(terminalSelection,
    'Terminal delegated attack must retain a real ChooseAttackPrompt selection');
  assert.equal(terminalSelection.attackChoice.selection.attackName,
    terminalAttack.attackName,
    'Selected printed attack must match the subsequent real Store attack declaration');
  assert.deepEqual(game.prizesRemaining,[2,0]);

  const raw = game.attackTrace.filter(entry => entry.seat === CANDIDATE_SEAT);
  const aroundCopy = game.decisionTrace.filter(entry =>
    entry.actionOrdinal >= lineage.initiatingAction.actionOrdinal &&
    entry.actionOrdinal <= lineage.promptChain.at(-1).actionOrdinal)
    .map(entry => ({
      ordinal:entry.actionOrdinal,turn:entry.turnBefore,action:entry.action,
      ability:entry.ability??null,attack:entry.attack??null,
      selection:entry.cardSelection?.selectedCards??null,
      attackChoice:entry.attackChoice?.selection??null
    }));

  return {
    schema:'real-source-rank11-perfection-delegated-terminal-attack-v1',
    sourceRank:SOURCE_RANK,candidatePhysicalSeat:CANDIDATE_SEAT,
    seed:SOURCE_SEED,seedWasConditionallySelected:true,
    engine:game.engine,sourcePrintHash:source.sha256_id_counts,
    candidatePrintHash:contender.canonical_id_count_sha256,
    observedStart:'rank11 first; candidate second, verified by source draw log',
    deckHashes:game.deckHashes,
    startingSourceHand:starting.hand,
    selectedBasicOrder:starting.chosen,
    fixedCandidateSlot:'lockbreak',
    nativeOpeningPivotApplied:true,
    finalActions:game.actions,finalTurns:game.turns,
    finished:game.finished,engineWinner:game.winner,
    finalPrizes:game.prizesRemaining,
    rawAttackActions:raw.length,realStoreAttackDeclarations:attacks.length,
    delegatedAttackDeclarations:delegated.length,
    attacks:attacks.map(entry=>({
      actionOrdinal:entry.actionOrdinal,globalTurn:entry.turnBefore,
      triggerAction:entry.triggerAction,name:entry.attackName,
      resolutionStatus:entry.resolutionStatus
    })),
    terminalAttack:terminalAttack.attackName,
    terminalSelectedPrinting:terminalSelection.attackChoice.selection.printing,
    terminalSelectionOrdinal:terminalSelection.actionOrdinal,
    terminalAttackChoice:terminalSelection.attackChoice,
    terminalAttackRootAction:terminalAttack.triggerAction,
    terminal:terminal,
    terminalPromptActions:aroundCopy,
    policy:game.policy,
    independentEffectQualification:false,
    opponentPolicyQualification:false,
    paperClockQualification:false,
    qualifiedCompetitiveGames:0,
    caveat:'Authentic source deal with previously selected opening; terminal engine logs and root prompt lineage show copied-attack declaration, not independent paper-rule or opponent-skill validation.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}

module.exports = {run,SOURCE_RANK,CANDIDATE_SEAT,SOURCE_SEED};
