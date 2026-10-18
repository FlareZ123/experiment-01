'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
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

  const args=[candidate,rank11.cards,CANDIDATE_SEAT,SOURCE_SEED,350,
    true,true,false];
  const control=runArm(...args,false);
  const game=runArm(...args,true);
  const stable=entry=>JSON.stringify({
    actions:entry.actions,turns:entry.turns,winner:entry.winner,
    prizes:entry.prizesRemaining,
    root:entry.rootActionLedger,
    attacks:entry.attackDeclarationTrace,terminal:entry.terminalTransition
  });
  const controlDigest=crypto.createHash('sha256').update(stable(control)).digest('hex');
  const observedDigest=crypto.createHash('sha256').update(stable(game)).digest('hex');
  assert.equal(observedDigest,controlDigest,
    'Read-only Trainer-count observation must preserve complete root-ledger and terminal outcome');
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
  const publicBefore=terminal.before.players;
  const publicAfter=terminal.after.players;
  assert.equal(terminal.actionName,'ResolvePromptAction');
  assert.equal(terminal.pendingPrompt,'WaitPrompt');
  assert.equal(publicBefore[CANDIDATE_SEAT].prizesRemaining,1);
  assert.equal(publicAfter[CANDIDATE_SEAT].prizesRemaining,0);
  assert.equal(publicBefore[1-CANDIDATE_SEAT].inPlayPokemon-
    publicAfter[1-CANDIDATE_SEAT].inPlayPokemon,1,
  'Terminal prompt must knock out one source Pokemon in real Store');
  assert.equal(terminal.after.winner,CANDIDATE_SEAT);
  assert.ok(lineage.promptChain.at(-1).actionOrdinal>
    terminalSelection.actionOrdinal,
  'Prize transition must follow the selected attack, not be assumed at declaration');
  const terminalPublicEffect={
    sourceInPlayBefore:publicBefore[1-CANDIDATE_SEAT].inPlayPokemon,
    sourceInPlayAfter:publicAfter[1-CANDIDATE_SEAT].inPlayPokemon,
    candidatePrizesBefore:publicBefore[CANDIDATE_SEAT].prizesRemaining,
    candidatePrizesAfter:publicAfter[CANDIDATE_SEAT].prizesRemaining,
    finalPromptOrdinal:lineage.promptChain.at(-1).actionOrdinal,
    scope:'observed engine KO and Prize shift after selected copied-attack chain'
  };
  assert.deepEqual(game.prizesRemaining,[2,0]);
  const effectWindows=game.poltergeistEffectTrace;
  assert.ok(Array.isArray(effectWindows) && effectWindows.length>0);
  const printedEffect=effectWindows.find(entry=>
    entry.actionOrdinal===terminalAttack.actionOrdinal);
  assert.ok(printedEffect,
    'The actual copied Poltergeist Store action must have a retrospective printed-count event');
  assert.equal(printedEffect.attackerSeat,CANDIDATE_SEAT);
  assert.equal(printedEffect.assessment?.printedBaseDamage,
    printedEffect.before[1-CANDIDATE_SEAT].handTrainerCount*50,
  'Printed 50xTrainer damage must use the defender actual physical pre-attack hand');
  assert.equal(printedEffect.assessment.prizeChange,-1,
    'The copied attack chain must contain the terminal candidate Prize transfer');
  assert.equal(printedEffect.assessment.defenderInPlayChange,-1,
    'The copied attack chain must retain the observed opponent KO');

  const priorCopiedPoltergeist=delegated.find(entry=>
    entry.attackName==='Poltergeist' &&
    entry.actionOrdinal<terminalAttack.actionOrdinal);
  assert.ok(priorCopiedPoltergeist,
    'Bounded replay must include a nonterminal authentic copied attack');
  const priorChoice=game.decisionTrace.find(entry=>
    entry.actionOrdinal===priorCopiedPoltergeist.actionOrdinal &&
    entry.attackChoice?.selection?.attackName==='Poltergeist');
  assert.equal(priorChoice?.attackChoice?.selection?.printing,
    'Gengar & Mimikyu-GX TEU');
  const priorEffect=effectWindows.find(entry=>
    entry.actionOrdinal===priorCopiedPoltergeist.actionOrdinal);
  assert.ok(priorEffect?.assessment &&
    Array.isArray(priorEffect.publicBefore),
    'Nonterminal Poltergeist must have true pre-attack public board and observed reducer effect');
  const firstSourceReply=game.rootActionLedger.find(row=>
    row.turnBefore>priorCopiedPoltergeist.turnBefore &&
    row.playerSlot===1-CANDIDATE_SEAT &&
    row.action!=='ResolvePromptAction');
  assert.ok(firstSourceReply,'Expected real following rank11 source player action');
  const nextSourceTurn=game.rootActionLedger.filter(row=>
    row.turnBefore===firstSourceReply.turnBefore);
  assert.ok(nextSourceTurn.some(row=>
    row.action==='PassTurnAction'||row.action==='AttackAction'||
    row.turnAfter>row.turnBefore),
  'Need a complete source turn to associate copied-effect result and opponent response');
  const stadiumReply=nextSourceTurn.find(row=>
    row.playerSlot===1-CANDIDATE_SEAT &&
    row.action==='PlayCardAction' && row.card==='Shopping Center');
  const benchChoice=nextSourceTurn.find(row=>
    row.playerSlot===CANDIDATE_SEAT &&
    row.action==='ResolvePromptAction' && row.pendingPrompt==='ChoosePokemonPrompt');
  assert.ok(stadiumReply && benchChoice,
    'Observed source reply must include Shopping Center and candidate Bench choice');
  const followingCandidateTurn=game.copycatTurnStartEvidence.find(row=>
    row.turn>firstSourceReply.turnBefore);
  assert.ok(followingCandidateTurn && followingCandidateTurn.candidateSeat===CANDIDATE_SEAT);
  const beforeCandidateBench=priorEffect.publicBefore[CANDIDATE_SEAT].bench.length;
  const afterCandidateBench=followingCandidateTurn.board[CANDIDATE_SEAT].bench.length;
  assert.equal(beforeCandidateBench,8,
    'Printed Sky Field exposure source must have eight candidate Benched Pokémon');
  assert.equal(afterCandidateBench,5,
    'Replacing Sky Field should expose the candidate reduced to five Benched Pokémon');
  const benchContraction={
    publicCandidateBenchBefore:priorEffect.publicBefore[CANDIDATE_SEAT].bench.map(p=>p.name),
    publicCandidateBenchNextTurn:followingCandidateTurn.board[CANDIDATE_SEAT].bench.map(p=>p.name),
    candidateBenchCountBefore:beforeCandidateBench,
    candidateBenchCountNextTurn:afterCandidateBench,
    activeStadiumBefore:priorEffect.publicBefore[CANDIDATE_SEAT].stadium,
    activeStadiumNextTurn:followingCandidateTurn.board[CANDIDATE_SEAT].stadium,
    stadiumPlayedOrdinal:stadiumReply.actionOrdinal,
    candidateBenchPromptOrdinal:benchChoice.actionOrdinal,
    nextCandidateTurn:followingCandidateTurn.turn,
    observationScope:'authentic source sequence, public board before copied attack versus first candidate decision after opponent Shopping Center and Marnie; causality beyond ordered Store actions not independently replayed'
  };
  const earlierCopiedResponse={
    copiedDeclarationOrdinal:priorCopiedPoltergeist.actionOrdinal,
    copiedGlobalTurn:priorCopiedPoltergeist.turnBefore,
    selectedPrinting:priorChoice.attackChoice.selection.printing,
    selectedAttack:priorChoice.attackChoice.selection.attackName,
    beforePublicBoard:priorEffect.publicBefore,
    afterPublicBoard:priorEffect.steps.at(-1)?.publicAfter??priorEffect.publicAfter,
    physicalPrintedEffect:priorEffect.assessment,
    attackReducerSteps:priorEffect.steps.map(row=>({
      ordinal:row.actionOrdinal,action:row.actionName,pendingPrompt:row.pendingPrompt
    })),
    nextSourceTurn:firstSourceReply.turnBefore,
    firstOpponentActionOrdinal:firstSourceReply.actionOrdinal,
    opponentRootActions:nextSourceTurn,
    benchContraction,
    opponentPolicyQualified:false,
    paperEffectQualified:false
  };

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
    schema:'real-source-rank11-perfection-delegated-effect-response-and-bench-v3',
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
    terminalPublicEffect,
    nonterminalCopiedResponse:earlierCopiedResponse,
    poltergeistEffect:{
      ...printedEffect.assessment,
      firstActionOrdinal:printedEffect.actionOrdinal,
      resolvedActionOrdinals:printedEffect.steps.map(entry=>entry.actionOrdinal),
      handObservationTiming:'after own attack selection; before actual Store copied attack dispatch',
      observedReducerWindow:true,
      outcomeControlDigest:controlDigest,
      observedDigest,
      observerNoninterferenceVerified:true
    },
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
