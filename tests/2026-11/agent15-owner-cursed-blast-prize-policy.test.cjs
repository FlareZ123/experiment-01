'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {chooseOwnerCursedBlastPrizeConversion:choose} =
  require('../../simulation/twinleaf/agent15/owner-cursed-blast-prize-policy.cjs');

const rules = Object.freeze({
  'Shadow Rider Calyrex V CRE':2,
  'Shadow Rider Calyrex VMAX CRE':3,
  'Oranguru V ASR':2,
  'Trubbish FST':1,
  'Koffing CEC':1
});
function view({ownPrizes=4,oppPrizes=4,source='Dusclops SFA',
              sources,opponent,oppBench=[]}={}){
  const mon=printing=>({printing,abilities:['Cursed Blast'],
    publicRestrictions:{}});
  return {decisionKind:'owner-root',globalTurn:18,actorSeat:0,
    ownPublic:{prizeCount:ownPrizes,active:{printing:'Unown AOR'},
      bench:(sources??[source]).map(mon)},
    opponentPublic:{prizeCount:oppPrizes,
      active:opponent??{
        printing:'Shadow Rider Calyrex V CRE',hp:210,damage:200},
      bench:oppBench}};
}

test('stage-1 five counters converts a two-Prize source target',()=>{
  const r=choose(view(),rules);
  assert.equal(r.sourcePrinting,'Dusclops SFA');
  assert.equal(r.targetPrinting,'Shadow Rider Calyrex V CRE');
  assert.equal(r.damageCounters,5);
  assert.equal(r.hypotheticalNetPrizeAdvantage,1);
  assert.equal(r.hypotheticalImmediatePrizeWin,false);
  assert.equal(r.requiresNativePaymentAndPrizeSettlement,true);
  assert.equal(r.outcomeCertified,false);
});

test('rank31 original Dusclops PRE can use the same 50-damage proposal',()=>{
  assert.equal(choose(view({source:'Dusclops PRE'}),rules).sourcePrinting,
    'Dusclops PRE');
});

test('one-Prize target is rejected when not a finishing Prize',()=>{
  assert.equal(choose(view({opponent:{printing:'Trubbish FST',hp:70,
    damage:60}}),rules),null);
});

test('one-Prize immediate win is offered when opponent cannot self-KO-win',()=>{
  const r=choose(view({ownPrizes:1,oppPrizes:2,
    opponent:{printing:'Trubbish FST',hp:70,damage:60}}),rules);
  assert.equal(r.hypotheticalImmediatePrizeWin,true);
  assert.equal(r.hypotheticalNetPrizeAdvantage,0);
});

test('self-KO is never proposed when opponent has one Prize remaining',()=>{
  assert.equal(choose(view({ownPrizes:1,oppPrizes:1}),rules),null);
});

test('unverified target Prize value or out-of-range damage rejects',()=>{
  assert.equal(choose(view({opponent:{printing:'Unknown V CRE',hp:210,
    damage:200}}),rules),null);
  assert.equal(choose(view({opponent:{printing:'Oranguru V ASR',hp:210,
    damage:150}}),rules),null);
});

test('chooses smaller self-KO donor for the same exact Prize payoff',()=>{
  const r=choose(view({sources:['Dusknoir PRE','Dusclops PRE']}),rules);
  assert.equal(r.sourcePrinting,'Dusclops PRE');
  assert.equal(r.sourceBenchIndex,1);
});

test('Dusknoir 130 counters converts a VMAX on Bench',()=>{
  const r=choose(view({sources:['Dusknoir PRE'],
    opponent:{printing:'Trubbish FST',hp:70,damage:0},
    oppBench:[{printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:200}]
  }),rules);
  assert.equal(r.targetPrinting,'Shadow Rider Calyrex VMAX CRE');
  assert.equal(r.targetSlot,'BENCH');
  assert.equal(r.targetIndex,0);
  assert.equal(r.hypotheticalNetPrizeAdvantage,2);
});

test('rejects source without printed Ability, locked root, stale game state',()=>{
  const v=view();v.ownPublic.bench[0].abilities=[];
  assert.equal(choose(v,rules),null);
  const l=view();l.ownPublic.bench[0].publicRestrictions.cursedBlastAlreadyUsed=true;
  assert.equal(choose(l,rules),null);
  const s=view();s.decisionKind='owner-prompt';
  assert.equal(choose(s,rules),null);
});

test('does not inspect any opponent hidden cards',()=>{
  const v=view();
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,key,{get(){throw Error('hidden read');}});
  assert.ok(choose(v,rules));
});
