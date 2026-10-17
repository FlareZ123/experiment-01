'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {auditRank10ShredWindow} = require('../scripts/aichi-rank10-shred-window.cjs');

/** @returns {object} Minimal valid input with original physical-seed contracts. */
function fixture() {
  return {
    trial:{seed:4246551499,candidatePhysicalSeat:1,
      id:'pilot:10:0:champion-reference:B'},
    alternate:{
      result:{
        copycatTurnStartEvidence:[{
          turn:28,candidateSeat:1,
          previousOpponentAttack:{
            source:'Regidrago VSTAR SIT',name:'Apex Dragon',gx:false
          },
          candidateUsedGX:true,
          ownDialga:{hand:0,discard:1,inPlay:0},
          mimikyu:[{location:'active',energyPrintings:[
            'Psychic Energy MEE','Psychic Energy MEE']}],
          board:[
            {active:{name:'Regidrago VSTAR',damage:210}},
            {active:{name:'Mimikyu',printedAttacks:[
              {name:'Copycat',cost:[5,9]}]}}
          ],
          prizeCounts:[3,4]
        }]
      },
      fullLiveDispatchTrace:[
        {step:208,before:{turn:27},attackChoice:{
          selection:{attackName:'Timeless-GX',printing:'Dialga-GX UPR'}}},
        {step:215,before:{turn:28},action:'RetreatAction'},
        {step:216,before:{turn:28},action:'PassTurnAction'},
        {step:220,before:{turn:29},attackChoice:{
          selection:{attackName:'Kaiser Tackle',printing:'Koraidon ex TEF'}}}
      ]
    }
  };
}

test('original source window supports a conditional two-Prize Shred KO',()=>{
  const x=auditRank10ShredWindow(fixture());
  assert.equal(x.conditionalTwoPrizeKnockout,true);
  assert.equal(x.gxAlreadySpent,true);
  assert.deepEqual([x.defenderDamage,x.printedShredDamage,x.defenderPrintedHP],
    [210,80,280]);
  assert.deepEqual([x.originalTimelessChoiceStep,x.missedRetreatStep,
    x.missedPassStep,x.nextOpponentKaiserTackleChoiceStep],
    [208,215,216,220]);
});

test('190 damage leaves the Regidrago VSTAR alive after Shred',()=>{
  const f=fixture();
  f.alternate.result.copycatTurnStartEvidence[0].board[0].active.damage=190;
  assert.equal(auditRank10ShredWindow(f).conditionalTwoPrizeKnockout,false);
});

test('the source gate fails for spent-GX Mimikyu with no payable Psychic',()=>{
  const f=fixture();
  f.alternate.result.copycatTurnStartEvidence[0].mimikyu[0]
    .energyPrintings=['Fire Energy SVE','Psychic Energy MEE'];
  assert.throws(()=>auditRank10ShredWindow(f));
});

test('the source gate fails for a different preceding attack or absent Dialga',()=>{
  const f=fixture();
  f.alternate.result.copycatTurnStartEvidence[0]
    .previousOpponentAttack.name='Kaiser Tackle';
  assert.throws(()=>auditRank10ShredWindow(f));
  const g=fixture();
  g.alternate.result.copycatTurnStartEvidence[0].ownDialga.discard=0;
  assert.throws(()=>auditRank10ShredWindow(g));
});

test('the source gate fails for a switched Mimikyu or a broken replay step',()=>{
  const f=fixture();
  f.alternate.result.copycatTurnStartEvidence[0].mimikyu[0].location='bench';
  assert.throws(()=>auditRank10ShredWindow(f));
  const g=fixture();
  g.alternate.fullLiveDispatchTrace[2].step=214;
  assert.throws(()=>auditRank10ShredWindow(g));
});
