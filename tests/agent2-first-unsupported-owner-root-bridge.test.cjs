'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {snapshotFirstUnsupportedOwnerRoot}=require(
  '../simulation/twinleaf/agent2-first-unsupported-owner-root-observer.cjs');

function view(){
  return {
    decisionKind:'owner-root',globalTurn:17,phase:2,actorSeat:0,
    ownHand:['Quick Ball FST','VS Seeker PHF'],
    ownPublic:{
      active:{name:'Regidrago V',energies:[],
        attacks:[],specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],
      deckCount:22,discard:['Quick Ball FST'],prizeCount:5,
      stadium:[],lostZone:[],resolvingSupporter:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{printing:'Bunnelby PRC'},
      bench:[null,'Snorlax PGO',null,null,null],
      discard:[],stadium:[],deckCount:27},
    ownTurnResources:{
      supporterPlayedTurn:0,itemPlayLocked:false,
      supporterPlayLocked:false,energyPlayedTurn:17
    },
    opponentPrivateHand:['SECRET_1'],
    ownUnsearchedDeckOrder:['SECRET_2']
  };
}
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  basicEnergyTypes:{},colorlessEnergyType:9,specialConditions:{}
};

function observeAbort(withDiagnostic){
  class AddPlayerAction{}
  class PlayCardAction{constructor(){}}
  class PassTurnAction{constructor(){}}
  class AttackAction{constructor(){}}
  class Store{
    constructor(){this.state={
      turn:17,phase:2,activePlayer:0,prompts:[],
      players:[{id:10},{id:20}]
    };}
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){
      const error=Error('Native raw-State policy forbidden');
      error.code='OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED';
      throw error;
    }
  }
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const shown=view();
  let thrown;
  try{
    withActorOnlyRootPolicy(()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      new SimpleTacticsAi(10).decodeNextAction(store.state);
    },{
      SimpleTacticsAi,Store,observe:()=>shown,
      getCatalog:()=>catalog,
      getNativeTrainerCatalog:()=>({}),
      GamePhase:{PLAYER_TURN:2,FINISHED:7},
      cardActions:{PlayCardAction,PlayerType:{ANY:1,BOTTOM_PLAYER:0},
        SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
      gameActions:{AttackAction,PassTurnAction},
      nativeOwnerTrainerFallback:true,
      ownerFallbackDiagnosticView:withDiagnostic
    });
  }catch(error){thrown=error;}
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.equal(thrown?.code,'OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED');
  return {thrown,shown};
}

test('first live unsupported root carries full detached owner view only when enabled',()=>{
  const {thrown,shown}=observeAbort(true);
  const audit=thrown.actorNativeTrainerFallbackAbortAudit;
  assert.equal(audit.attemptedUnsupportedPasses,1);
  assert.equal(audit.selectedNativeTrainerRoots,0);
  const first=audit.firstUnsupportedOwnerRoot;
  assert.deepEqual(first,snapshotFirstUnsupportedOwnerRoot(shown));
  assert.equal(first.ownerView.actorSeat,0);
  assert.equal(first.ownerView.globalTurn,17);
  assert.equal(JSON.stringify(first).includes('SECRET_1'),false);
  assert.equal(JSON.stringify(first).includes('SECRET_2'),false);
});

test('default disabled quarantine abort receipt shape unchanged',()=>{
  const {thrown}=observeAbort(false);
  const audit=thrown.actorNativeTrainerFallbackAbortAudit;
  assert.equal(audit.attemptedUnsupportedPasses,1);
  assert.equal('firstUnsupportedOwnerRoot' in audit,false);
  assert.equal(audit.rootInstalled,true);
});

test('real quarantine guard catches first owner unsupported fallback after exact public capture',()=>{
  const {withNativeRawStateFallbackQuarantine,CODE}=require(
    '../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
  class AddPlayerAction{}
  class PlayCardAction{}
  class AttackAction{}
  class PassTurnAction{}
  class Store{
    constructor(){this.state={turn:17,phase:2,activePlayer:0,prompts:[],
      players:[{id:10},{id:20}]};}
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){
      throw Error('Native hidden State decoder must never execute');
    }
  }
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const known=view();
  let caught;
  try{
    withNativeRawStateFallbackQuarantine(()=>
      withActorOnlyRootPolicy(()=>{
        const store=new Store();
        store.dispatch(new AddPlayerAction());
        new SimpleTacticsAi(10).decodeNextAction(store.state);
      },{
        SimpleTacticsAi,Store,observe:()=>known,getCatalog:()=>catalog,
        getNativeTrainerCatalog:()=>({}),
        GamePhase:{PLAYER_TURN:2,FINISHED:7},
        cardActions:{PlayCardAction,PlayerType:{ANY:1,BOTTOM_PLAYER:0},
          SlotType:{BOARD:0,ACTIVE:1,BENCH:2}},
        gameActions:{AttackAction,PassTurnAction},
        nativeOwnerTrainerFallback:true,
        ownerFallbackDiagnosticView:true
      }),{SimpleTacticsAi});
  }catch(error){caught=error;}
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,prior);
  assert.equal(caught?.code,CODE);
  assert.equal(caught.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
  assert.equal(
    caught.nativeRawStateFallbackQuarantine.originalNativeDecoderExecuted,
    false);
  assert.equal(caught.actorNativeTrainerFallbackAbortAudit
    .firstUnsupportedOwnerRoot.ownerVisibleSha256,
    snapshotFirstUnsupportedOwnerRoot(known).ownerVisibleSha256);
});
