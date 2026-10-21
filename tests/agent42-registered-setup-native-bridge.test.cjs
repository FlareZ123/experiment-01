'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {deckDigest,emitNativeRegisteredSetupPair}=
  require('../simulation/evaluation/agent42-registered-setup-native-bridge.cjs');
const {CELLS,accruePairedFourCells}=
  require('../scripts/aichi-paired-four-cell-accrual.cjs');

const deck=prefix=>Array.from({length:60},(_,i)=>prefix+String(i));
const candidateDecks={champion:deck('champion-'),newmoon:deck('newmoon-')};
const sourceDeck=deck('source-');

function plan(){
  return {
    schema:'aichi-fourcell-paired-start-plan-v2',status:'precommitted',
    candidateIds:['champion','newmoon'],ranks:[6],
    candidateDeckHashes:Object.fromEntries(Object.entries(candidateDecks)
      .map(([id,cards])=>[id,deckDigest(cards)])),
    sourceDeckHashes:{6:deckDigest(sourceDeck)},
    quotas:{6:Object.fromEntries(CELLS.map(cell=>[cell,1]))},
    attempts:[{
      pairId:'6-seat0-10',rank:6,candidateSeat:0,seed:10,
      arms:[{candidateId:'champion',armId:'arm-c'},
        {candidateId:'newmoon',armId:'arm-n'}]
    }]
  };
}
const zone=ids=>({cards:ids.map(fullName=>({fullName}))});
const slot=ids=>({...zone(ids),tools:[],energies:zone([])});
function player(id,name,ids){
  return {
    id,name,hand:zone(ids.slice(0,7)),active:slot([ids[7]]),
    bench:[],prizes:ids.slice(8,14).map(id=>zone([id])),
    deck:zone(ids.slice(14)),discard:zone([]),lostzone:zone([]),
    stadium:zone([]),supporter:zone([])
  };
}
function makeRunner(settings={}){
  const calls=[];
  class Store{
    constructor(request){
      this.state={
        turn:0,phase:1,activePlayer:0,prompts:[],logs:[],
        players:[player(101,'research-A',request.deckA),
          player(202,'research-B',request.deckB)]
      };
    }
    dispatch(action){
      if(action==='intermediate'){
        this.state.turn=1;this.state.phase=8;
        this.state.prompts=[{result:undefined}];
      }
      if(action==='settled'){
        this.state.phase=2;this.state.prompts=[];
        this.state.logs=[{message:'LOG_PLAYER_DRAWS_CARD',
          params:{name:settings.wrongDraw?'research-B':'research-A'}}];
        if(settings.corruptSource){
          this.state.players[1].deck.cards[0].fullName='corrupt-source';
        }
      }
      if(action==='normal-turn-root'){
        throw new Error('GAME POLICY WAS RUN');
      }
    }
  }
  const original=Store.prototype.dispatch;
  const runMatch=request=>{
    calls.push(request);
    if(settings.failOne&&request.deckA[0]==='newmoon-0'){
      throw new Error('synthetic genuine Store setup failure');
    }
    const store=new Store(request);
    store.dispatch('intermediate');
    store.dispatch('settled');
    store.dispatch('normal-turn-root');
  };
  return {Store,runMatch,calls,original};
}

test('two frozen original-Store setup-only receipts accrue one real four-cell stratum',()=>{
  const deps=makeRunner();
  const obs=emitNativeRegisteredSetupPair(plan(),'6-seat0-10',
    candidateDecks,sourceDeck,deps);
  assert.equal(deps.calls.length,2);
  assert.equal(deps.Store.prototype.dispatch,deps.original,
    'Native Store dispatch must be restored after every setup');
  assert.equal(obs.allArmsVerified,true);
  assert.equal(obs.gameOutcomesRead,false);
  assert.equal(obs.fullyPaperGameQualified,false);
  assert.deepEqual(obs.arms.map(arm=>arm.firstTurnSlot),[0,0]);
  assert.equal(obs.arms[0].sourcePhysicalDealSha256,
    obs.arms[1].sourcePhysicalDealSha256);
  const result=accruePairedFourCells(plan(),[obs]);
  assert.equal(result.plannedPairs.length,1);
  assert.equal(result.plannedPairs[0].cell,'seat0-candidate-first');
  assert.equal(result.complete,false);
  assert.equal(result.competitiveWinRateCertified,false);
});

test('changed candidate deck rejected before running either Store setup',()=>{
  const deps=makeRunner(),other={...candidateDecks,
    newmoon:[...candidateDecks.newmoon]};
  other.newmoon[0]='different-printing';
  assert.throws(()=>emitNativeRegisteredSetupPair(plan(),'6-seat0-10',
    other,sourceDeck,deps),/Candidate 60 changed/);
  assert.equal(deps.calls.length,0);
  assert.equal(deps.Store.prototype.dispatch,deps.original);
});

test('changed source 60 rejected before running either Store setup',()=>{
  const deps=makeRunner(),other=[...sourceDeck];
  other[11]='swapped-printing';
  assert.throws(()=>emitNativeRegisteredSetupPair(plan(),'6-seat0-10',
    candidateDecks,other,deps),/Source 60 changed/);
  assert.equal(deps.calls.length,0);
});

test('physical source conservation failure is retained and blocks paired quota',()=>{
  const deps=makeRunner({corruptSource:true});
  const obs=emitNativeRegisteredSetupPair(plan(),'6-seat0-10',
    candidateDecks,sourceDeck,deps);
  assert.equal(obs.allArmsVerified,false);
  assert.ok(obs.arms.every(arm=>arm.inventoryVerified===false));
  const result=accruePairedFourCells(plan(),[obs]);
  assert.equal(result.blocked,true);
  assert.equal(result.retainedAttempts[0].reason,'unverified-setup');
  assert.equal(result.plannedPairs.length,0);
  assert.equal(deps.Store.prototype.dispatch,deps.original);
});

test('wrong first draw and arm engine error both fail closed without a completed match',()=>{
  for(const config of [{wrongDraw:true},{failOne:true}]){
    const deps=makeRunner(config);
    const obs=emitNativeRegisteredSetupPair(plan(),'6-seat0-10',
      candidateDecks,sourceDeck,deps);
    assert.equal(obs.allArmsVerified,false);
    assert.equal(accruePairedFourCells(plan(),[obs]).blocked,true);
    assert.ok(obs.arms.some(arm=>arm.setupError!==null));
    assert.equal(deps.Store.prototype.dispatch,deps.original);
  }
});

test('unknown registered physical pairing cannot introduce a new seed',()=>{
  const deps=makeRunner();
  assert.throws(()=>emitNativeRegisteredSetupPair(plan(),'unregistered',
    candidateDecks,sourceDeck,deps),/Unknown registered pair/);
  assert.equal(deps.calls.length,0);
});
