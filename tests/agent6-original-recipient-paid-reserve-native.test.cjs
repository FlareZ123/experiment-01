'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {classifyBasicAttachmentRetreatReserve,
  withAcceptedBasicRetreatReserveWitness}=
    require('../simulation/twinleaf/agent6-accepted-basic-retreat-reserve-observer.cjs');
const {countReserveStages}=
  require('../simulation/evaluation/agent6-original-recipient-paid-reserve-native.cjs');

const psy='Psychic Energy MEE';
const cat={
  basicEnergies:new Set([psy]),basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,specialConditions:{ASLEEP:11,PARALYZED:12}
};

/** @returns {object} Immutable-looking owner-only native owner-root view. */
function view(){
  return {decisionKind:'owner-root',actorSeat:1,globalTurn:58,
    ownTurnResources:{retreatedTurn:0,energyPlayedTurn:57},
    ownPublic:{
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{
        printing:'Dialga-GX UPR',printed:{retreatCost:[9,9,9]},
        energies:[psy,psy],attacks:[{name:'Overclock',cost:[9],
          damage:0}],publicRestrictions:{},specialConditions:[]
      },
      bench:[{
        printing:'Trevenant & Dusknoir-GX SMP',
        energies:[psy,psy,psy],
        attacks:[{name:'Night Watch',cost:[5,5,5],damage:150}],
        publicRestrictions:{},specialConditions:[]
      }]
    },
    opponentPublic:{
      active:{hp:260,damage:50},bench:[]}
  };
}

/** @param {'bench'|'active'} position */
function physical(position='bench'){
  return {actorSeat:1,position,benchIndex:0,
    ownerHandPrinting:psy};
}

test('original paid one-Basic shortfall and funded Bench qualifies nominally',()=>{
  const x=classifyBasicAttachmentRetreatReserve(
    view(),cat,[9,9,9],physical());
  assert.equal(x.nominalReserveOpportunity,true);
  assert.equal(x.activeAttachedBasicCount,2);
  assert.equal(x.actualNativeEffectiveRetreatCost.length,3);
  assert.equal(x.knownFundedBenchAttacks[0].attackName,'Night Watch');
  assert.equal(x.opponentRemainingHP,210);
  assert.equal(x.nativeAlternativeRetreatOrAttackSettled,false);
  assert.equal(x.paperAlternativeAttachmentCertified,false);
});

test('Skyliner zero effective fee cannot become paid-reserve opportunity',()=>{
  const x=classifyBasicAttachmentRetreatReserve(
    view(),cat,[],physical());
  assert.equal(x.stages.nativePositiveColorlessRetreatFee,false);
  assert.equal(x.nominalReserveOpportunity,false);
});

test('third Active Basic already present excludes one-card shortfall',()=>{
  const state=view();
  state.ownPublic.active.energies.push(psy);
  const x=classifyBasicAttachmentRetreatReserve(
    state,cat,[9,9,9],physical());
  assert.equal(x.stages.exactlyOneBasicShortBeforeAttachment,false);
});

test('original Active attachment and wrong owner cannot be Bench receipt',()=>{
  const active=classifyBasicAttachmentRetreatReserve(
    view(),cat,[9,9,9],physical('active'));
  assert.equal(active.stages.originalPhysicallyAttachedToBench,false);
  const wrong=classifyBasicAttachmentRetreatReserve(
    view(),cat,[9,9,9],{...physical(),actorSeat:0});
  assert.equal(wrong.nominalReserveOpportunity,false);
});

test('missing viable funded Bench or consumed Retreat vetoes',()=>{
  const unfunded=view();
  unfunded.ownPublic.bench[0].energies=[psy];
  assert.equal(classifyBasicAttachmentRetreatReserve(
    unfunded,cat,[9,9,9],physical())
    .stages.previouslyFundedPositiveBenchAttack,false);
  const retreated=view();
  retreated.ownTurnResources.retreatedTurn=58;
  assert.equal(classifyBasicAttachmentRetreatReserve(
    retreated,cat,[9,9,9],physical())
    .stages.ownerCanRetreatThisTurn,false);
});

test('unmodeled attached Special Energy cannot certify Basic shortfall',()=>{
  const state=view();
  state.ownPublic.active.energies[0]='Double Colorless Energy XY';
  assert.equal(classifyBasicAttachmentRetreatReserve(
    state,cat,[9,9,9],physical())
    .stages.exactlyOneBasicShortBeforeAttachment,false);
});

test('owner-only classifier never touches opponent hidden zones',()=>{
  const state=view();
  const forbidden=new Proxy({},{get(){throw Error('hidden-zone read');}});
  state.opponentPublic.hand=forbidden;
  state.opponentPublic.deck=forbidden;
  state.opponentPublic.prizes=forbidden;
  assert.equal(classifyBasicAttachmentRetreatReserve(
    state,cat,[9,9,9],physical()).nominalReserveOpportunity,true);
});

test('counter verifies accepted physical rows and first failures',()=>{
  const yes=classifyBasicAttachmentRetreatReserve(
    view(),cat,[9,9,9],physical());
  const no=classifyBasicAttachmentRetreatReserve(
    view(),cat,[],physical());
  const entries=[
    {sourceOwnerSeat:1,nativeOriginalStoreAccepted:true,
      actualPhysicalBasicAttachment:true,stages:yes},
    {sourceOwnerSeat:1,nativeOriginalStoreAccepted:true,
      actualPhysicalBasicAttachment:true,stages:no}
  ];
  const out=countReserveStages(entries);
  assert.equal(out.observedBasicPlayRoots,2);
  assert.equal(out.physicallyWitnessedBasicAttachments,2);
  assert.equal(out.nominalReserveOpportunities,1);
  assert.equal(out.firstFailures.nativePositiveColorlessRetreatFee,1);
  assert.equal(out.failurePartitionComplete,true);
});

test('wrapped Store accepts genuine original basic to Bench and restores method',()=>{
  class FakeSlot{
    constructor(name,energy=[]){
      this.name=name;this.energies={cards:energy.map(fullName=>({fullName}))};
      this.tools=[];
    }
    getPokemonCard(){return this.name?{fullName:this.name}:null;}
  }
  class FakeStore{
    constructor(){this.state=null;}
    reduceEffect(_state,effect){effect.cost=[9,9,9];}
    dispatch(action){
      if(action.constructor.name==='PlayCardAction'){
        const own=this.state.players[1];
        const [card]=own.hand.cards.splice(action.handIndex,1);
        own.bench[0].energies.cards.push(card);
      }
      return 'native-original';
    }
  }
  class CheckRetreatCostEffect{
    constructor(player){this.player=player;this.cost=[];}
  }
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(){
      this.id='owner-1';this.handIndex=0;
      this.target={player:1,slot:1,index:0};
    }
  }
  const empty=()=>new FakeSlot(null);
  const state={
    phase:3,turn:58,activePlayer:1,prompts:[],
    players:[{
      id:'owner-0',hand:{cards:[]},active:new FakeSlot('Opponent'),
      bench:[empty(),empty(),empty(),empty(),empty()]
    },{
      id:'owner-1',hand:{cards:[{fullName:psy}]},
      active:new FakeSlot('Dialga-GX UPR',[psy,psy]),
      bench:[new FakeSlot('Trevenant & Dusknoir-GX SMP',[psy,psy,psy]),
        empty(),empty(),empty(),empty()]
    }]
  };
  const nativeStore=new FakeStore();
  nativeStore.state=state;
  const original=FakeStore.prototype.dispatch;
  const found=withAcceptedBasicRetreatReserveWitness(()=>{
    assert.equal(nativeStore.dispatch(new AddPlayerAction()),'native-original');
    assert.equal(nativeStore.dispatch(new PlayCardAction()),'native-original');
    return 'game-original';
  },{Store:FakeStore,CheckRetreatCostEffect,
    catalog:cat,observe:()=>view()});
  assert.equal(FakeStore.prototype.dispatch,original);
  assert.equal(found.result,'game-original');
  assert.equal(found.audit.nativeOriginalBasicPlayRoots,1);
  assert.equal(found.audit.physicalBasicAttachments,1);
  assert.equal(found.audit.nominalReserveOpportunities,1);
  assert.equal(found.audit.entries[0].stages.actualOriginalRecipient.position,
    'bench');
});

test('no actual physical change cannot manufacture a reserve opportunity',()=>{
  const observed=classifyBasicAttachmentRetreatReserve(
    view(),cat,[9,9,9],null);
  assert.equal(observed.stages.originalPhysicallyAttachedToBench,false);
  assert.equal(observed.nominalReserveOpportunity,false);
});
