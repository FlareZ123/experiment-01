'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ACE,chooseOwnerCursedBlastAceTrainerOpportunity:choose}=
  require('../../simulation/twinleaf/agent15/owner-cursed-blast-ace-option.cjs');

function view({own=6,opp=6,ownerHand=[ACE,'Fog Crystal CRE'],
  opponentHandCount=7,donor='Dusclops SFA',supporterUsed=0,
  supporterLocked=false,activeDamage=0,activeHp=210}={}){
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:ownerHand,
    ownTurnResources:{supporterPlayedTurn:supporterUsed,
      supporterPlayLocked:supporterLocked},
    ownPublic:{
      prizeCount:own,active:{printing:'Mewtwo & Mew-GX UNM'},
      bench:[{printing:donor,abilities:['Cursed Blast']}],
      publicTurnRestrictions:{supporterPlayLocked:supporterLocked}
    },
    opponentPublic:{
      prizeCount:opp,handCount:opponentHandCount,
      active:{printing:'Shadow Rider Calyrex V CRE',
        hp:activeHp,damage:activeDamage},bench:[]
    }
  };
}
test('held Ace enabled by self-KO from equal Prizes',()=>{
  const p=choose(view());
  assert.equal(p.mode,'ace-enable');
  assert.equal(p.sourcePrinting,'Dusclops SFA');
  assert.equal(p.targetSlot,'ACTIVE');
  assert.equal(p.nextSupporterPrinting,ACE);
  assert.equal(p.printedPrizeCostToOpponent,1);
  assert.equal(p.requiresNativeAceTrainerLegality,true);
  assert.equal(p.outcomeCertified,false);
});
test('both printed Stage1 donors and unmodified damage cap accepted',()=>{
  const p=choose(view({donor:'Dusclops PRE',activeDamage:100}));
  assert.equal(p.sourcePrinting,'Dusclops PRE');
  assert.equal(p.targetRemainingHp,110);
});
test('avoid killing a one-Prize opponent before Ace can be enabled',()=>{
  assert.equal(choose(view({activeHp:50})),null);
});
test('Ace is already playable when owner is behind; no reason to self-KO',()=>{
  assert.equal(choose(view({own:6,opp:5})),null);
});
test('self-KO does not grant the opponent their last Prize',()=>{
  assert.equal(choose(view({own:1,opp:1})),null);
});
test('opponent hand below disruption threshold is not worth the Prize',()=>{
  assert.equal(choose(view({opponentHandCount:4})),null);
});
test('own hand above draw advantage budget is rejected',()=>{
  assert.equal(choose(view({ownerHand:[ACE,'A','B','C']})),null);
});
test('Supporter quota, lock or missing Ace rejects plan',()=>{
  assert.equal(choose(view({supporterUsed:1})),null);
  assert.equal(choose(view({supporterLocked:true})),null);
  assert.equal(choose(view({ownerHand:['Fog Crystal CRE']})),null);
});
test('no hidden opponent hand access',()=>{
  const v=view();
  Object.defineProperty(v.opponentPublic,'hand',{get(){throw Error('hidden read');}});
  Object.defineProperty(v.opponentPublic,'deck',{get(){throw Error('hidden read');}});
  assert.ok(choose(v));
});
