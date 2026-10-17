'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');
const {pairedCandidateSlots} = require('./new-moon-lockbreak-source-diagnostic.cjs');

/**
 * Quickly sample actual engine first-turn order in authentic sourced 60-card
 * New Moon v1 and rank-6/8 opponent pairings. The action cap intentionally
 * disqualifies winner/turn/completion inference. This is a coin/start audit.
 */
function run() {
  initializeCards();
  const candidate=pairedCandidateSlots().source;
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const rows=[];
  for(const rank of [6,8]) {
    const opponent=plan.opponents.find(o=>o.rank===rank);
    assert.equal(opponent?.status,'ready');
    for(const candidateSeat of [0,1]) {
      for(let repeat=0;repeat<4;repeat++) {
        const seeds=deriveSlotSeeds(20261017,'pilot',rank,repeat);
        const seed=seeds[candidateSeat===0?'A':'B'];
        const game=runMatch({
          deckA:candidateSeat===0?candidate:opponent.cards,
          deckB:candidateSeat===1?candidate:opponent.cards,
          seed,maxActions:90,
          strictPromptValidation:true,
          forestSealSearchCorrection:true,
          supporterDecisionCorrection:true,
          leleEntryAbilityLockCorrection:true,
          entryDrawLockCorrection:true,
          isolatePolicyRandomness:true,
          pendingEndTurnSwitchCleanupCorrection:true
        });
        rows.push({
          rank,candidateSeat,repeat,seed,
          firstTurnSlot:game.firstTurnSlot,
          candidateGoingFirst:game.firstTurnSlot===candidateSeat,
          verifiedByDrawLog:game.verifiedByDrawLog,
          observedTurn:game.turns,
          actionCap:90
        });
      }
    }
  }
  assert.equal(rows.length,16);
  assert.ok(rows.every(row=>row.firstTurnSlot===0||row.firstTurnSlot===1));
  assert.ok(rows.every(row=>row.verifiedByDrawLog));
  const first=rows.filter(row=>row.candidateGoingFirst).length;
  const second=rows.length-first;
  return {
    schema:'new-moon-authentic-physical-seats-first-turn-seed-audit-v1',
    source:'unchanged English-equivalent published New Moon 60; Aichi rank6/8 exact 60',
    physicalSeats:[0,1],ranks:[6,8],repeatRange:[0,3],
    rows,first,second,
    caveat:'Source-dealt 90-action start-order probe, no qualified matches, no card-effect strength inference; first turn requires actual engine verification, not seed parity or seat guess'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
