'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {paidRetreatPublic,chooseReserveRecipient,
  withPaidReserveRecipient}=
  require('../simulation/twinleaf/agent6-paid-reserve-recipient-hook.cjs');
const {withThreeBasicPaidPivot}=
  require('../simulation/twinleaf/agent6-three-basic-paid-pivot-bot.cjs');
const P='Psychic Energy MEE';
const cat={basicEnergies:new Set([P]),basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,specialConditions:{ASLEEP:11,PARALYZED:12}};
function view(n=2){
  return {decisionKind:'owner-root',actorSeat:1,globalTurn:20,
    ownHand:[P],
    ownTurnResources:{retreatedTurn:0,energyPlayedTurn:19,
      energyPlayLocked:false},
    ownPublic:{publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{printing:'Dialga-GX UPR',printed:{retreatCost:[9,9,9]},
        energies:Array(n).fill(P),tools:[],abilities:[],
        attacks:[{name:'Overclock',cost:[9],damage:0}],
        publicRestrictions:{},specialConditions:[]},
      bench:[{printing:'Shadow Rider Calyrex V CRE',energies:[P],
        attacks:[{name:'Shadow Mist',cost:[5],damage:10}],
        publicRestrictions:{},specialConditions:[]},null]},
    opponentPublic:{active:{hp:260,damage:70},bench:[]}};
}
const original=()=>({handIndex:0,printing:P,slot:'bench',
  index:0,attackName:'Shadow Mist'});

test('exact one Basic short retarget preserves held card and index',()=>{
  const x=chooseReserveRecipient(view(),cat,original());
  assert.equal(x.slot,'active');
  assert.equal(x.index,0);
  assert.equal(x.handIndex,0);
  assert.equal(x.printing,P);
  assert.equal(x.reserveOpportunity,true);
  assert.equal(paidRetreatPublic(view(3),cat,3)?.fundedBench.attackName,
    'Shadow Mist');
});

test('Skyliner, Tool, wrong fee, fully paid and no funded Bench veto',()=>{
  const a=view();a.ownPublic.bench.push({
    printing:'Latias ex SSP',abilities:['Skyliner']});
  assert.equal(chooseReserveRecipient(a,cat,original()).slot,'bench');
  const b=view();b.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(paidRetreatPublic(b,cat,2),null);
  const c=view();c.ownPublic.active.printed.retreatCost=[9,9];
  assert.equal(paidRetreatPublic(c,cat,2),null);
  assert.equal(chooseReserveRecipient(view(3),cat,original()).slot,'bench');
  const d=view();d.ownPublic.bench[0].energies=[];
  assert.equal(paidRetreatPublic(d,cat,2),null);
});

test('wrong held Basic and quota used preserve original',()=>{
  const a=view();a.ownHand[0]='Fire Energy MEE';
  assert.deepEqual(chooseReserveRecipient(a,cat,original()),original());
  const b=view();b.ownTurnResources.energyPlayedTurn=20;
  assert.deepEqual(chooseReserveRecipient(b,cat,original()),original());
});

test('selection remains invariant to concealed opponent fields',()=>{
  const a=view();
  const hidden=new Proxy({},{get(){throw Error('hidden-zone read');}});
  a.opponentPublic.hand=hidden;a.opponentPublic.deck=hidden;
  assert.equal(chooseReserveRecipient(a,cat,original()).slot,'active');
});

test('source-independent temporary module hook restores prior selector',()=>{
  const mod=require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
  const old=mod.chooseActorEnergyRecipient;
  mod.chooseActorEnergyRecipient=()=>original();
  try{
    const baseline=mod.chooseActorEnergyRecipient;
    const tested=withPaidReserveRecipient(()=>
      mod.chooseActorEnergyRecipient(view(),cat));
    assert.equal(tested.result.slot,'active');
    assert.equal(tested.audit.proposedBySeat[1],1);
    assert.strictEqual(mod.chooseActorEnergyRecipient,baseline);
  }finally{
    mod.chooseActorEnergyRecipient=old;
  }
});

function botDeps(nativeCost){
  class PassTurnAction{}
  class RetreatAction{
    constructor(id,benchIndex){this.id=id;this.benchIndex=benchIndex;}
  }
  class Bot{decodeNextAction(){return new PassTurnAction();}}
  class Store{
    constructor(){this.state=null;}
    reduceEffect(_state,effect){effect.cost=[...nativeCost];}
  }
  class CheckRetreatCostEffect{constructor(){this.cost=[];}}
  return {SimpleTacticsAi:Bot,RetreatAction,Store,
    CheckRetreatCostEffect,observe:()=>view(3),catalog:cat};
}

test('native fee exact three returns actual typed paid retreat',()=>{
  const deps=botDeps([9,9,9]);
  const prior=deps.SimpleTacticsAi.prototype.decodeNextAction;
  const state={turn:20,activePlayer:1,prompts:[],
    players:[{id:'seat0'},{id:'seat1'}]};
  const r=withThreeBasicPaidPivot(()=>
    new deps.SimpleTacticsAi().decodeNextAction(state),deps);
  assert.ok(r.result instanceof deps.RetreatAction);
  assert.equal(r.result.id,'seat1');
  assert.equal(r.result.benchIndex,0);
  assert.equal(r.audit.typedRetreatsBySeat[1],1);
  assert.strictEqual(deps.SimpleTacticsAi.prototype.decodeNextAction,prior);
});

test('native mismatched effective fee vetoes paid action',()=>{
  const deps=botDeps([]);
  const state={turn:20,activePlayer:1,prompts:[],
    players:[{id:'seat0'},{id:'seat1'}]};
  const r=withThreeBasicPaidPivot(()=>
    new deps.SimpleTacticsAi().decodeNextAction(state),deps);
  assert.equal(r.result.constructor.name,'PassTurnAction');
  assert.equal(r.audit.ownerNominalOffersBySeat[1],1);
  assert.equal(r.audit.typedRetreatsBySeat[1],0);
});
