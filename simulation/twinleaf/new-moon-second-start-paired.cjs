'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {pairedCandidateSlots} = require('./new-moon-lockbreak-source-diagnostic.cjs');
const original = require('../../results/als/new-moon-perfection-english-map.json');
const contender = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

const OPTIONS = Object.freeze({
  strictPromptValidation:true,
  forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,
  leleEntryAbilityLockCorrection:true,
  entryDrawLockCorrection:true,
  isolatePolicyRandomness:true,
  pendingEndTurnSwitchCleanupCorrection:true
});

/**
 * @param {string[]} candidate Frozen source or four-slot revised cards.
 * @param {string[]} opponent Exact published rank-6 opponent printing list.
 * @param {0|1} seat Candidate's physical slot.
 * @param {number} seed Reproducible unsigned 32-bit match seed.
 * @param {number} maxActions Strict upper bound on simulation actions.
 * @param {boolean} detailed Whether to preserve decision/audit evidence.
 * @param {boolean} [nativeOpeningPivot=false] Reorder only candidate selected starting Basics.
 */
function runArm(candidate, opponent, seat, seed, maxActions, detailed, nativeOpeningPivot=false) {
  return runMatch({
    ...OPTIONS,
    deckA:seat === 0 ? candidate : opponent,
    deckB:seat === 1 ? candidate : opponent,
    seed, maxActions,
    captureDecisionTrace:detailed,
    captureAttackPassProbes:detailed,
    ...(detailed ? {captureCopycatTurnStartSeat:seat} : {}),
    ...(nativeOpeningPivot ? {newMoonNativeOpeningPivotSeat:seat} : {})
  });
}

/** @param {object} game @param {0|1} seat */
function summarize(game, seat) {
  const own=game.decisionTrace.filter(row=>row.playerSlot===seat);
  const pass=own.filter(row=>row.action==='PassTurnAction');
  const turns=(game.copycatTurnStartEvidence||[]).slice(0,6)
    .map(row=>({
      turn:row.turn,
      active:row.board[seat]?.active?.name??null,
      activeEnergy:row.board[seat]?.active?.energyCards??[],
      opponentActive:row.board[1-seat]?.active?.name??null,
      candidateHand:row.candidateHand,
      candidateDiscard:row.candidateDiscard,
      usedGX:row.candidateUsedGX
    }));
  const playCount=names=>Object.entries(game.cardsPlayedBySeat[seat])
    .filter(([card])=>names.some(name=>card.startsWith(name)))
    .reduce((sum,[,n])=>sum+n,0);
  return {
    actualFirstSeat:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    finished:game.finished,
    outcomeUnqualified:true,
    engineWinner:game.winner,
    turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    ownDirectAttackCount:game.attackTrace.filter(row=>row.seat===seat).length,
    ownPerfectionCount:game.abilityTrace.filter(row=>row.seat===seat&&row.name==='Perfection').length,
    ownPassCount:pass.length,
    heldCounterFirstTurns:turns.map(row=>({turn:row.turn,
      items:row.candidateHand.filter(name=>name.startsWith('Field Blower')||name.startsWith('Canceling Cologne'))})),
    playedFieldBlower:playCount(['Field Blower']),
    playedCologne:playCount(['Canceling Cologne']),
    firstOwnTurns:turns,
    firstPasses:pass.slice(0,4).map(row=>({
      turn:row.turnBefore,
      active:row.publicBoardBeforePass?.[seat]?.active?.name??null,
      attackPassProbe:row.attackPassProbe??null
    })),
    firstOwnActions:own.slice(0,22).map(row=>({
      turn:row.turnBefore,action:row.action,
      card:row.card??null,attack:row.attack??null,ability:row.ability??null
    }))
  };
}

function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(row=>row.rank===6);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const rows=[];
  for(const seat of [0,1]) {
    const inspected=[];
    let selected=null;
    for(let repeat=0;repeat<32;repeat++) {
      const seeds=deriveSlotSeeds(20261017,'pilot',6,repeat);
      const seed=seeds[seat===0?'A':'B'];
      const probe=runArm(slots.source,opponent.cards,seat,seed,90,false);
      inspected.push({repeat,seed,first:probe.firstTurnSlot,
        verified:probe.verifiedByDrawLog});
      assert.ok(probe.firstTurnSlot===0||probe.firstTurnSlot===1,
        'Start-order probe failed to reach an authenticated first turn');
      assert.equal(probe.verifiedByDrawLog,true);
      if(probe.firstTurnSlot!==seat) {
        selected={repeat,seed};
        break;
      }
    }
    if(!selected) {
      rows.push({candidateSeat:seat,selected:null,inspected,
        diagnostic:'No authenticated candidate-second physical deal found in bounded search'});
      continue;
    }
    const arms=[];
    for(const variant of ['source','lockbreak']) {
      const game=runArm(slots[variant],opponent.cards,seat,selected.seed,350,true);
      assert.equal(game.firstTurnSlot,1-seat,
        'The paired source deck ceased to be the candidate-going-second stratum');
      assert.equal(game.verifiedByDrawLog,true);
      arms.push({variant,...summarize(game,seat)});
    }
    rows.push({candidateSeat:seat,selected,inspected,arms});
  }
  return {
    schema:'new-moon-rank6-authenticated-second-start-paired-v1',
    qualification:'Source-dealt, fixed lists and actual candidate-second first-turn validation; generic policy and card-effect fidelity unqualified',
    sourcePrintHash:original.sha256_id_counts,
    candidatePrintHash:contender.canonical_id_count_sha256,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seedProtocol:'aichi-decorrelated-slots-v3, pilot rank6, first 32 repeat indices, original source baseline first-turn screen, same physical slot and seed in two candidate arms',
    opponentRank:6,rows
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runArm,summarize};
