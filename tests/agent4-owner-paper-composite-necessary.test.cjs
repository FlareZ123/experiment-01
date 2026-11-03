'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {screenOwnerTrainerPaperNecessity}=
  require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');

/**
 * @param {string[]} hand
 * @param {number|null} [ownPrizes]
 * @param {number|null} [opponentPrizes]
 * @returns {object}
 */
function view(hand,ownPrizes=6,opponentPrizes=6){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:5,
    ownHand:[...hand],
    ownPublic:{active:{printing:'Mew V FST',tools:[]},
      bench:[null,null],stadium:[],prizeCount:ownPrizes},
    opponentPublic:{active:{printing:'Mew V FST',tools:[]},
      bench:[null,null],stadium:[],prizeCount:opponentPrizes},
    ownTurnResources:{itemPlayLocked:false,supporterPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0}
  };
}

/** @param {object} v @param {number} i @param {string} [type] */
const row=(v,i,type='Item')=>({
  handIndex:i,printing:v.ownHand[i],type,publicBlocker:null,
  nativeEnumeratorOffered:true
});

test('same root consolidates printed Prize and removal-target vetoes',()=>{
  const v=view(['Counter Catcher PAR','Field Blower GRI',
    'Lost Vacuum LOR','Roxanne ASR','Psychic Energy SVE']);
  const result=screenOwnerTrainerPaperNecessity(v,[
    row(v,0),row(v,1),row(v,2),row(v,3,'Supporter')
  ]);
  assert.equal(result.heldTrainerCopies,4);
  assert.equal(result.provenNecessaryConditionFailures,4);
  assert.equal(result.remainingUnresolvedCopies,0);
  assert.deepEqual(result.rows.map(r=>r.necessaryBlockers),[
    ['printed-prize:public-prize-prerequisite-failed'],
    ['printed-removal-target:no-public-removal-target'],
    ['printed-removal-target:no-public-removal-target'],
    ['printed-prize:public-prize-prerequisite-failed']
  ]);
  assert.ok(result.rows.every(r=>r.paperPlayable===false));
  assert.equal(result.allRemainingArePaperLegal,false);
});

test('satisfied necessary predicates remain unresolved and read-only',()=>{
  const v=view(['Counter Catcher PAR','Field Blower GRI',
    'Lost Vacuum LOR','Psychic Energy SVE'],6,5);
  v.opponentPublic.active.tools=['Tool Jammer BST'];
  const before=structuredClone(v);
  const rows=[row(v,0),row(v,1),row(v,2)];
  const result=screenOwnerTrainerPaperNecessity(v,rows);
  assert.equal(result.provenNecessaryConditionFailures,0);
  assert.ok(result.rows.every(r=>r.paperPlayable===null));
  assert.equal(result.rows[0].printedPrizePrerequisite,
    'public-prize-predicate-satisfied-other-conditions-unknown');
  assert.equal(result.rows[1].exactTargetEligibility,'public-target-present');
  assert.equal(result.rows[1].removalTargetCertificate
    .targets[0].printing,'Tool Jammer BST');
  assert.deepEqual(v,before);
  const samePublic=structuredClone(v);
  samePublic.opponentPublic.unrelatedPrivateFixture=['arbitrary'];
  assert.deepEqual(
    screenOwnerTrainerPaperNecessity(samePublic,rows),result);
});

test('unavailable Prize counts and protected Prism Stadium preserve unknown',()=>{
  const v=view(['Counter Catcher PAR','Field Blower GRI'],null,null);
  v.opponentPublic.stadium=['Thunder Mountain LOT'];
  const report=screenOwnerTrainerPaperNecessity(v,[row(v,0),row(v,1)]);
  assert.equal(report.provenNecessaryConditionFailures,0);
  assert.equal(report.rows[0].printedPrizePrerequisite,
    'public-prize-count-unavailable');
  assert.equal(report.rows[1].exactTargetEligibility,
    'prism-star-stadium-protection-unresolved');
  assert.ok(report.rows.every(r=>r.paperPlayable===null));
});
