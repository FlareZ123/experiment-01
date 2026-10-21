'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {openingSetupZones,cardCopyMultisetDigest,openingInventoriesMatch}=
  require('../simulation/twinleaf/opening-setup-zones.cjs');
const {captureSourceSetup}=require('../simulation/evaluation/aichi-setup-zone-capture.cjs');
const {captureSetupOnly}=require('../simulation/evaluation/aichi-setup-only-capture.cjs');

/** @param {string[]} names */
const zone=names=>({cards:names.map(fullName=>({fullName}))});
const player=id=>({
  id,hand:zone(['Hand-'+id]),active:zone(['Active-'+id]),
  bench:[zone(['Bench-'+id])],
  prizes:Array.from({length:6},(_,i)=>zone(['Prize-'+id+'-'+i])),
  deck:zone(['Deck-'+id])
});

test('real-turn setup observer captures detached hidden zones without inferring initial seven',()=>{
  const state={turn:1,activePlayer:1,players:[player(101),player(202)]};
  const observation=openingSetupZones(state);
  assert.equal(observation.schema,'pinned-root-postsetup-zones-v1');
  assert.equal(observation.firstTurnSlot,1);
  assert.equal(observation.originalStartingSevenReconstructed,false);
  assert.equal(observation.containsUnrevealedPrizeIdentities,true);
  assert.deepEqual(observation.seats[0].prizes[3],['Prize-101-3']);
  state.players[0].hand.cards[0].fullName='Mutated';
  assert.deepEqual(observation.seats[0].hand,['Hand-101']);
  assert.equal(openingSetupZones({...state,turn:0}),null);
  assert.throws(()=>openingSetupZones({...state,activePlayer:2}),/Store layout/);
});

test('source Store wrapper captures first turn once and restores dispatch on success and exception',()=>{
  class MockStore {
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action) {
      if(action==='start')this.state.turn=1;
      if(action==='later')this.state.players[0].hand.cards[0].fullName='Later';
      return action;
    }
  }
  const original=MockStore.prototype.dispatch;
  const {game,setupZones}=captureSourceSetup(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('start');
    store.dispatch('later');
    return {finished:false};
  });
  assert.equal(game.finished,false);
  assert.deepEqual(setupZones.seats[0].hand,['Hand-101']);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.throws(()=>captureSourceSetup(MockStore,()=>{throw new Error('Probe failed');}),
    /Probe failed/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('short source root sampler stops at first turn and restores Store dispatch',()=>{
  class MockStore{
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action){
      if(action==='turn1')this.state.turn=1;
      if(action==='should-not-run')throw Error('Sampler ran policy action');
    }
  }
  const original=MockStore.prototype.dispatch;
  const observed=captureSetupOnly(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('turn1');
    store.dispatch('should-not-run');
  });
  assert.equal(observed.stoppedAtFirstTurn,true);
  assert.deepEqual(observed.setupZones.seats[1].hand,['Hand-202']);
  assert.equal(MockStore.prototype.dispatch,original);
  const noTurn=captureSetupOnly(MockStore,()=>{
    const store=new MockStore();store.dispatch('setup-only');
  });
  assert.equal(noTurn.stoppedAtFirstTurn,false);
  assert.equal(noTurn.setupZones,null);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.throws(()=>captureSetupOnly(MockStore,()=>{throw Error('Real failure');}),
    /Real failure/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('headless root dispatch Error.cause preserves only exact first-turn stop token',()=>{
  class WrappedStore{
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action){
      if(action==='first')this.state.turn=1;
      return action;
    }
  }
  const native=WrappedStore.prototype.dispatch;
  const captured=captureSetupOnly(WrappedStore,()=>{
    const store=new WrappedStore();
    try{
      store.dispatch('first');
    }catch(cause){
      throw new Error('Twinleaf dispatch failed: undefined',{cause});
    }
  });
  assert.equal(captured.stoppedAtFirstTurn,true);
  assert.equal(captured.setupZones.firstTurnSlot,0);
  assert.equal(WrappedStore.prototype.dispatch,native);
  assert.throws(()=>captureSetupOnly(WrappedStore,()=>{
    throw new Error('Twinleaf dispatch failed: undefined',{
      cause:new Error('real engine failure')
    });
  }),/Twinleaf dispatch failed/);
  assert.equal(WrappedStore.prototype.dispatch,native);
});

test('opening conservation rejects a missing or replaced source printing copy',()=>{
  const players=[player(101),player(202)];
  for(const p of players){
    p.deck=zone(Array.from({length:51},(_,i)=>'Deck-'+p.id+'-'+i));
  }
  const snapshot=openingSetupZones({
    turn:1,activePlayer:0,players
  });
  const physicalSourceDecks=snapshot.seats.map(seat=>[
    ...seat.hand,...seat.active,...seat.bench.flat(),
    ...seat.prizes.flat(),
    ...Array.from({length:51},(_,i)=>'Deck-'+seat.playerId+'-'+i)
  ]);
  assert.deepEqual(snapshot.seats.map(seat=>seat.openingCopyCount),[60,60]);
  assert.equal(openingInventoriesMatch(snapshot.seats,physicalSourceDecks),true);
  assert.equal(openingInventoriesMatch(snapshot.seats,
    physicalSourceDecks.map(cards=>[...cards].reverse())),true);
  assert.equal(cardCopyMultisetDigest(physicalSourceDecks[0]),
    cardCopyMultisetDigest([...physicalSourceDecks[0]].reverse()));
  const replaced=physicalSourceDecks.map(cards=>[...cards]);
  replaced[0][0]='Different-Card';
  assert.equal(openingInventoriesMatch(snapshot.seats,replaced),false);
  assert.equal(openingInventoriesMatch(snapshot.seats,[
    physicalSourceDecks[0].slice(1),physicalSourceDecks[1]
  ]),false);
  assert.equal(openingInventoriesMatch(snapshot.seats,[
    physicalSourceDecks[1],physicalSourceDecks[0]
  ]),false);
  assert.equal(openingInventoriesMatch(null,physicalSourceDecks),false);
});

test('opt-in first-turn source fingerprint detects ordered hidden-deck drift',()=>{
  /** @param {string} id */
  const physicalPlayer=id=>{
    const p=player(id);
    p.active.tools=[];
    p.active.energies=zone([]);
    p.bench.forEach(slot=>{
      slot.tools=[];slot.energies=zone([]);
    });
    p.discard=zone([]);
    p.lostzone=zone([]);
    p.stadium=zone([]);
    p.supporter=zone([]);
    p.deck=zone(['First-'+id,'Second-'+id,'Third-'+id]);
    return p;
  };
  class MockStore{
    constructor(){
      this.state={
        turn:0,phase:1,activePlayer:0,prompts:[],
        players:[physicalPlayer('A'),physicalPlayer('B')]
      };
    }
    dispatch(action){
      if(action==='first'){
        this.state.turn=1;
        this.state.phase=2;
      }
    }
  }
  const original=MockStore.prototype.dispatch;
  const sample=reversedSource=>captureSetupOnly(MockStore,()=>{
    const store=new MockStore();
    if(reversedSource)store.state.players[1].deck.cards.reverse();
    store.dispatch('first');
  },{sourceSeat:1});
  const a=sample(false),b=sample(false),c=sample(true);
  assert.equal(a.stoppedAtFirstTurn,true);
  assert.equal(a.sourcePhysicalDeal?.schema,
    'initial-source-physical-position-sha256-v1');
  assert.match(a.sourcePhysicalDeal.digestSha256,/^[a-f0-9]{64}$/);
  assert.equal(a.sourcePhysicalDeal.digestSha256,
    b.sourcePhysicalDeal.digestSha256);
  assert.notEqual(a.sourcePhysicalDeal.digestSha256,
    c.sourcePhysicalDeal.digestSha256);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.equal(JSON.stringify(a.sourcePhysicalDeal).includes('First-B'),false);
  assert.throws(()=>captureSetupOnly(MockStore,()=>{},{
    sourceSeat:2
  }),/Source seat/);
  const plain=captureSetupOnly(MockStore,()=>{
    new MockStore().dispatch('first');
  });
  assert.equal(plain.sourcePhysicalDeal,null,
    'existing default capture must not fingerprint hidden deck order');
});

test('ordered source capture skips phase-eight setup and stops before first action',()=>{
  const makeSlot=cards=>({
    ...zone(cards),tools:[],energies:zone([])
  });
  const makePlayer=name=>({
    hand:zone(['Hand-'+name]),
    active:makeSlot(['Active-'+name]),
    bench:[makeSlot(['Bench-'+name])],
    prizes:Array.from({length:6},(_,i)=>zone(['Prize-'+name+'-'+i])),
    deck:zone(['Top-'+name,'Bottom-'+name]),
    discard:zone([]),lostzone:zone([]),stadium:zone([]),supporter:zone([])
  });
  class MockStore{
    constructor(){
      this.state={turn:0,phase:1,prompts:[],activePlayer:0,
        players:[makePlayer('A'),makePlayer('B')]};
    }
    dispatch(action){
      if(action==='turn-start-setup'){
        this.state.turn=1;
        this.state.phase=8;
        this.state.prompts=[{result:undefined}];
      }
      if(action==='last-prompt'){
        this.state.prompts=[];
        this.state.phase=2;
      }
      if(action==='player-action'){
        throw new Error('First player action was reached before observer');
      }
    }
  }
  const raw=MockStore.prototype.dispatch;
  let checkedSetupPhase=false;
  const observed=captureSetupOnly(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('turn-start-setup');
    checkedSetupPhase=store.state.phase===8;
    store.dispatch('last-prompt');
    store.dispatch('player-action');
  },{sourceSeat:1});
  assert.equal(checkedSetupPhase,true);
  assert.equal(observed.stoppedAtFirstTurn,true);
  assert.match(observed.sourcePhysicalDeal.digestSha256,/^[a-f0-9]{64}$/);
  assert.equal(MockStore.prototype.dispatch,raw);
});

test('settled draw-log first-player proof is opt-in and rejects false identities',()=>{
  const makeSlot=cards=>({...zone(cards),tools:[],energies:zone([])});
  const makePlayer=(id,name)=>({
    id,name,hand:zone(['Hand-'+name]),active:makeSlot(['Active-'+name]),
    bench:[],prizes:Array.from({length:6},(_,i)=>zone(['Prize-'+name+'-'+i])),
    deck:zone(['Remaining-'+name]),discard:zone([]),lostzone:zone([]),
    stadium:zone([]),supporter:zone([])
  });
  class MockStore{
    constructor(){
      this.state={turn:0,phase:1,prompts:[],activePlayer:1,
        logs:[],players:[makePlayer(101,'research-A'),makePlayer(202,'research-B')]};
    }
    dispatch(action){
      if(action==='early'){
        this.state.turn=1;
        this.state.phase=8;
        this.state.prompts=[{result:undefined}];
      }
      if(action==='draw'){
        this.state.logs=[{message:'LOG_PLAYER_DRAWS_CARD',
          params:{name:'research-B'}}];
        this.state.phase=2;
        this.state.prompts=[];
      }
      if(action==='unreachable')throw Error('First player turn advanced before proof');
    }
  }
  const original=MockStore.prototype.dispatch;
  const run=()=>captureSetupOnly(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('early');
    store.dispatch('draw');
    store.dispatch('unreachable');
  },{sourceSeat:0,captureFirstTurnEvidence:true});
  const observed=run();
  assert.equal(observed.stoppedAtFirstTurn,true);
  assert.deepEqual(observed.firstTurnEvidence,{
    firstTurnSlot:1,firstTurnPlayerId:202,
    firstTurnPlayerName:'research-B',
    firstDrawLogName:'research-B',verifiedByDrawLog:true
  });
  assert.equal(MockStore.prototype.dispatch,original);

  assert.throws(()=>captureSetupOnly(MockStore,()=>{},{
    captureFirstTurnEvidence:true
  }),/requires settled source-seat/);
  class WrongLogStore extends MockStore{
    dispatch(action){
      super.dispatch(action);
      if(action==='draw'){
        this.state.logs=[{message:'LOG_PLAYER_DRAWS_CARD',
          params:{name:'research-A'}}];
      }
    }
  }
  const wrong=WrongLogStore.prototype.dispatch;
  assert.throws(()=>captureSetupOnly(WrongLogStore,()=>{
    const store=new WrongLogStore();
    store.dispatch('early');
    store.dispatch('draw');
  },{sourceSeat:0,captureFirstTurnEvidence:true}),/contradicts first draw/);
  assert.equal(WrongLogStore.prototype.dispatch,wrong);
});
