'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {visibleFullBenchDeadFamily,auditRank11DeadFamilyVsPoison}=
  require('../simulation/evaluation/agent45-rank11-dead-family-vs-poison.cjs');

const trubbish=(energies)=>({name:'Trubbish',energyCards:energies,
  printedAttacks:[{name:'Call for Family',cost:[7]},
    {name:'Super Poison Breath',cost:[7,9]}]});
const opponent=(damage)=>({name:'Girafarig',damage});
const bench=Array.from({length:5},(_,i)=>({name:i>1?'Mega Absol ex':
  'Crobat V',energyCards:[]}));
const attack={actionOrdinal:12,turnBefore:15,attackName:'Call for Family',
  settledPromptChain:true,
  publicBoardBefore:[{active:opponent(0),bench:[]},
    {active:trubbish(['Darkness Energy SVE','Darkness Energy SVE']),bench}],
  publicBoardAfter:[{active:opponent(0),bench:[]},
    {active:trubbish(['Darkness Energy SVE','Darkness Energy SVE']),bench}]};

test('full-Bench zero-effect family has a printed two-Energy poisonous alternative',()=>{
  const x=visibleFullBenchDeadFamily(attack,1,0);
  assert.equal(x.paperOpportunityObserved,true);
  assert.equal(x.activeEnergyCardCount,2);
  assert.equal(x.benchedMegaAbsolWithoutEnergy,3);
});

test('unpaid, changed recipient, or nonfull-Bench cases fail closed',()=>{
  const one={...attack,publicBoardBefore:[attack.publicBoardBefore[0],
    {...attack.publicBoardBefore[1],active:trubbish(['Darkness Energy SVE'])}]};
  assert.equal(visibleFullBenchDeadFamily(one,1,0).paperOpportunityObserved,false);
  const damaged={...attack,publicBoardAfter:[{active:opponent(20)},
    attack.publicBoardAfter[1]]};
  assert.equal(visibleFullBenchDeadFamily(damaged,1,0).paperOpportunityObserved,false);
  const short={...attack,publicBoardBefore:[attack.publicBoardBefore[0],
    {...attack.publicBoardBefore[1],bench:bench.slice(0,4)}]};
  assert.equal(visibleFullBenchDeadFamily(short,1,0).fullBench,false);
  assert.equal(visibleFullBenchDeadFamily({...attack,attackName:'Other'},1,0),null);
});

test('only exact Get Lost null response in empty opposing discard is counted',()=>{
  const event={kind:'ChooseCardsPrompt',selectedCards:null,
    actorSeat:0,ordinal:3,sourceZone:'discard',sourceZoneCardCountBefore:0,
    nativePromptAllowCancel:true};
  const row={trial:{id:'11:2:A:champion-reference',rank:11},
    sourceSeat:1,candidateSeat:0,
    sourceAttackSettlement:{attacks:[attack]},
    rootActionLedger:[
      {actionOrdinal:2,playerSlot:0,action:'AttackAction',attack:'Get Lost'},
      {actionOrdinal:3,playerSlot:0,action:'ResolvePromptAction',
        pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:2}],
    nativePromptChoices:{events:[event]},endReason:'action-limit',
    finished:false,winner:null,finalPrizes:[6,6]};
  const a=auditRank11DeadFamilyVsPoison({rows:[row]});
  assert.equal(a.rank11AttemptedArms,1);
  assert.equal(a.fullBenchAlternativePayableNoEffect,1);
  assert.equal(a.candidateGetLostEmptyDiscardCancellations,1);
  row.nativePromptChoices.events[0]={...event,sourceZoneCardCountBefore:1};
  assert.equal(auditRank11DeadFamilyVsPoison({rows:[row]}).
    candidateGetLostEmptyDiscardCancellations,0);
});

test('archive original rank filter preserves actual attempts',()=>{
  const a=auditRank11DeadFamilyVsPoison({rows:[{trial:{id:'6:foo',rank:6}}]});
  assert.equal(a.rank11AttemptedArms,0);
  assert.equal(a.sourceCallForFamilyAttacks,0);
});
