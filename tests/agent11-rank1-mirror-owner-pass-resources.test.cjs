'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,summarizeOwnerPassResources,
  withActualOwnerPassResourceObserver}=
  require('../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');

function syntheticOwnerView(turn=7){
  return {
    actorSeat:0,globalTurn:turn,decisionKind:'owner-root',
    ownHand:['Psychic Energy MEE','Double Colorless Energy SUM',
      'Guzma BUS','Psychic Energy MEE'],
    ownTurnResources:{
      supporterPlayedTurn:0,retreatedTurn:-1,
      energyPlayedTurn:turn-1,stadiumPlayedTurn:-1,
      itemPlayLocked:false,supporterPlayLocked:false,
      energyPlayLocked:false
    },
    ownPublic:{prizeCount:6,active:{
      printing:'Marshadow UNB',energies:[],tools:[],damage:0
    },bench:[null,{printing:'Tapu Lele-GX GRI',
      energies:['Psychic Energy MEE'],tools:[],damage:10},null]}
  };
}

test('retrospective pre-Pass receipt conserves physical copies and all Bench slots',()=>{
  const view=syntheticOwnerView();
  const row=summarizeOwnerPassResources(view,9);
  assert.equal(row.schema,VERSION);
  assert.equal(row.rootOrdinal,9);
  assert.equal(row.handBasicPsychicCount,2);
  assert.deepEqual(row.handBasicPsychicPrintings,
    ['Psychic Energy MEE','Psychic Energy MEE']);
  assert.equal(row.normalHandEnergyAttachmentStillOpen,true);
  assert.equal(row.bench.length,3);
  assert.equal(row.benchCount,1);
  assert.equal(row.bench[1].energies[0],'Psychic Energy MEE');
  assert.equal(row.ownerRemainingPrizes,6);
  assert.equal(row.opponentConcealedZonesInspected,false);
  assert.deepEqual(view.ownHand,['Psychic Energy MEE',
    'Double Colorless Energy SUM','Guzma BUS','Psychic Energy MEE']);
});

test('an already spent attachment or lock closes ordinary hand attachment signal',()=>{
  const a=syntheticOwnerView();
  a.ownTurnResources.energyPlayedTurn=7;
  assert.equal(summarizeOwnerPassResources(a,0)
    .normalHandEnergyAttachmentStillOpen,false);
  a.ownTurnResources.energyPlayedTurn=6;
  a.ownTurnResources.energyPlayLocked=true;
  assert.equal(summarizeOwnerPassResources(a,0)
    .normalHandEnergyAttachmentStillOpen,false);
});

test('fail closed on prompt state, unsupported actor seat, or missing hand',()=>{
  const v=syntheticOwnerView();
  assert.throws(()=>summarizeOwnerPassResources({...v,decisionKind:'owner-prompt'},1));
  assert.throws(()=>summarizeOwnerPassResources({...v,actorSeat:3},1));
  assert.throws(()=>summarizeOwnerPassResources({...v,ownHand:undefined},1));
  assert.throws(()=>summarizeOwnerPassResources(v,-1));
});

test('one genuine Store source Pass, opponent Pass, and a speculative Store skipped',()=>{
  class AddPlayerAction {}
  class PassTurnAction {constructor(clientId){this.clientId=clientId;}}
  class MockStore {
    constructor(){this.state={players:[{id:'source'},{id:'opponent'}],activePlayer:0};this.accepted=[];}
    dispatch(action){this.accepted.push(action);return this.accepted.length;}
  }
  let observeCount=0;
  const actual=new MockStore(),speculative=new MockStore();
  // The mock observer is an acting-owner view; opponent hidden fields are
  // forbidden and any attempt to read them is deliberately made to throw.
  Object.defineProperty(actual.state.players[1],'hand',{
    get(){throw Error('opponent concealed hand access');}
  });
  const result=withActualOwnerPassResourceObserver(()=>{
    const a=actual.dispatch(new AddPlayerAction());
    speculative.dispatch(new PassTurnAction('source'));
    const b=actual.dispatch(new PassTurnAction('source'));
    actual.dispatch(new PassTurnAction('opponent'));
    return {a,b};
  },{Store:MockStore,sourceSeat:0,actorObservation:(_state,seat)=>{
    assert.equal(seat,0);
    observeCount++;
    return syntheticOwnerView(7);
  }});
  assert.equal(result.result.a,1);
  assert.equal(result.result.b,2);
  assert.equal(result.audit.actualStores,1);
  assert.equal(result.audit.selectedSourcePassCount,1);
  assert.equal(result.audit.sourcePasses[0].rootOrdinal,1);
  assert.equal(observeCount,1);
  assert.equal(actual.accepted.length,3);
  assert.equal(speculative.accepted.length,1);
  assert.equal(result.audit.decisionsChanged,false);
  assert.equal(result.audit.opponentConcealedZonesInspected,false);
});

test('observer restores native dispatch descriptor after an actual Store failure',()=>{
  class AddPlayerAction {}
  class PassTurnAction {constructor(clientId){this.clientId=clientId;}}
  class MockStore{
    constructor(){this.state={players:[{id:'source'},{id:'opponent'}]};}
    dispatch(action){
      if(action.constructor.name==='PassTurnAction')throw Error('native rejection');
      return 'accepted';
    }
  }
  const before=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  let thrown=null;
  try{
    withActualOwnerPassResourceObserver(()=>{
      const store=new MockStore();
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PassTurnAction('source'));
    },{Store:MockStore,actorObservation:()=>syntheticOwnerView()});
  }catch(error){thrown=error;}
  assert.match(thrown?.message??'',/native rejection/);
  assert.equal(thrown.agent11OwnerPassResourceAudit.selectedSourcePassCount,1);
  assert.equal(thrown.agent11OwnerPassResourceAudit.errorCount,1);
  assert.deepEqual(Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),before);
});
