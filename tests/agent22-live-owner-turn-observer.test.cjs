'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withLiveOwnerRootStarts}=
  require('../simulation/twinleaf/agent22-live-owner-turn-observer.cjs');

class AddPlayerAction{
  constructor(id){this.id=id;}
}
function player(id){
  return {id,hand:{cards:[{fullName:id===101?'VS Seeker PHF':'SECRET HAND'}]},
    discard:{cards:[{fullName:"Steven's Resolve CES"}]},
    prizes:Array.from({length:6},()=>({cards:[{}]})),
    active:{getPokemonCard(){return {fullName:'Wobbuffet PHF'};}}};
}
class Store{
  constructor(){this.state={players:[],turn:1,phase:8,
    activePlayer:0,prompts:[]};}
  dispatch(action){
    if(action instanceof AddPlayerAction)
      this.state.players.push(player(action.id));
    return this.state;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'native-choice';}
}

test('real Store identity and owner seat authenticate root hand observation',()=>{
  const beforeDispatch=Store.prototype.dispatch;
  const beforeDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const owner=new SimpleTacticsAi(101);
  const reply=new SimpleTacticsAi(202);
  const v=withLiveOwnerRootStarts(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction(101));
    store.dispatch(new AddPlayerAction(202));
    const phantom=new Store();
    phantom.state={...store.state,players:store.state.players};
    assert.equal(owner.decodeNextAction(phantom.state),'native-choice');
    assert.equal(reply.decodeNextAction(store.state),'native-choice');
    assert.equal(owner.decodeNextAction(store.state),'native-choice');
    assert.equal(owner.decodeNextAction(store.state),'native-choice');
    store.state.turn=3;
    assert.equal(owner.decodeNextAction(store.state),'native-choice');
    return store.state;
  },{Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:8},sourceSeat:0});
  assert.equal(v.audit.authenticatedLiveStore,true);
  assert.deepEqual(v.audit.snapshots.map(x=>x.turn),[1,3]);
  assert.deepEqual(v.audit.snapshots[0].handPrintings,['VS Seeker PHF']);
  assert.ok(JSON.stringify(v.audit).includes("Steven's Resolve CES"));
  assert.equal(JSON.stringify(v.audit).includes('SECRET HAND'),false);
  assert.equal(v.audit.snapshots[0].opponentPrizesRemaining,6);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,beforeDecode);
});

test('scope restores both native prototypes after an experiment exception',()=>{
  const oldDispatch=Store.prototype.dispatch;
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  assert.throws(()=>withLiveOwnerRootStarts(()=>{throw Error('test');},
    {Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:8},sourceSeat:0}),
  /test/);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
});

test('pending native prompt blocks speculative owner-root sampling',()=>{
  const r=withLiveOwnerRootStarts(()=>{
    const s=new Store();
    s.dispatch(new AddPlayerAction(101));
    s.dispatch(new AddPlayerAction(202));
    s.state.prompts=[{result:undefined}];
    new SimpleTacticsAi(101).decodeNextAction(s.state);
    return 1;
  },{Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:8},sourceSeat:0});
  assert.equal(r.audit.snapshots.length,0);
});
