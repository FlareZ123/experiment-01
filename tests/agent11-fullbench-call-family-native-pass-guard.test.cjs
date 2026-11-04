'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {needsTrubbishFullBenchPass,withFullBenchTrubbishPassGuard}=require(
  '../simulation/twinleaf/agent11-fullbench-call-family-native-pass-guard.cjs');

class AttackAction {
  /** @param {string} playerId @param {string} name */
  constructor(playerId,name){this.playerId=playerId;this.name=name;}
}
class PassTurnAction {
  /** @param {string} playerId */
  constructor(playerId){this.playerId=playerId;}
}
class AddPlayerAction {}
class FakeStore {
  /** @param {object} state */
  constructor(state){this.state=state;this.received=[];}
  /** @param {object} action */
  dispatch(action){this.received.push(action);return action;}
}
class FakeBot {
  /** @param {string} playerId */
  constructor(playerId){this.client={id:playerId};}
  /** @param {object} state */
  decodeNextAction(state){return new AttackAction(this.client.id,state.attackName??'Call for Family');}
}
/** @param {number} count @param {string} [active] */
function board(count,active='Trubbish'){
  return [{active:{name:active},bench:Array.from({length:count},()=>({name:'Benched Pokémon'}))},
    {active:{name:'Mew VMAX'},bench:[]}];
}
/** @param {number} count @param {string} [active] */
function execute(count,active='Trubbish'){
  const state={turn:8,attackName:'Call for Family',
    players:[{id:'p0'},{id:'p1'}]};
  const store=new FakeStore(state),bot=new FakeBot('p0');
  const priorDecode=FakeBot.prototype.decodeNextAction,
    priorDispatch=FakeStore.prototype.dispatch;
  const result=withFullBenchTrubbishPassGuard(()=>{
    store.dispatch(new AddPlayerAction());
    const chosen=bot.decodeNextAction(state);
    store.dispatch(chosen);
    return chosen;
  },{SimpleTacticsAi:FakeBot,Store:FakeStore,PassTurnAction,
    observe:()=>board(count,active)});
  assert.strictEqual(FakeBot.prototype.decodeNextAction,priorDecode);
  assert.strictEqual(FakeStore.prototype.dispatch,priorDispatch);
  return {result,store};
}
test('pure gate only matches printed Trubbish Call for Family with all five Bench',()=>{
  assert.equal(needsTrubbishFullBenchPass(board(5),0,new AttackAction('p0','Call for Family')),true);
  assert.equal(needsTrubbishFullBenchPass(board(4),0,new AttackAction('p0','Call for Family')),false);
  assert.equal(needsTrubbishFullBenchPass(board(5,'Mew VMAX'),0,new AttackAction('p0','Call for Family')),false);
  assert.equal(needsTrubbishFullBenchPass(board(5),0,new AttackAction('p0','Techno Blast')),false);
  assert.equal(needsTrubbishFullBenchPass(board(5),0,new PassTurnAction('p0')),false);
  assert.equal(needsTrubbishFullBenchPass(board(5),1,new AttackAction('p1','Call for Family')),false);
});
test('full Bench actual Store root chooses one paid native Pass and exposes audit',()=>{
  const {result,store}=execute(5);
  assert(result.result instanceof PassTurnAction);
  assert.equal(result.result.playerId,'p0');
  assert.deepEqual(result.audit.selected,[{
    seat:0,turn:8,sourceAttack:'Call for Family',sourceActive:'Trubbish',sourcePublicBenchCount:5
  }]);
  assert.equal(result.audit.guardProposals,1);
  assert.equal(result.audit.acceptedPasses,1);
  assert.equal(result.audit.realStoreVisits,1);
  assert.equal(result.audit.paperQualified,false);
  assert.equal(store.received.at(-1),result.result);
});
test('four-slot and different-Pokémon cases retain original attack',()=>{
  for(const [bench,active] of [[4,'Trubbish'],[5,'Genesect V']]){
    const {result}=execute(bench,active);
    assert(result.result instanceof AttackAction);
    assert.equal(result.audit.guardProposals,0);
    assert.equal(result.audit.acceptedPasses,0);
  }
});
test('speculative actor state is untouched and no live-store side effect leaks',()=>{
  const state={turn:8,attackName:'Call for Family',
    players:[{id:'p0'},{id:'p1'}]};
  const other={...state};
  const original=FakeBot.prototype.decodeNextAction;
  const result=withFullBenchTrubbishPassGuard(()=>{
    const bot=new FakeBot('p0');
    const store=new FakeStore(state);
    store.dispatch(new AddPlayerAction());
    const speculative=bot.decodeNextAction(other);
    const live=bot.decodeNextAction(state);
    store.dispatch(live);
    return {speculative,live};
  },{SimpleTacticsAi:FakeBot,Store:FakeStore,PassTurnAction,observe:()=>board(5)});
  assert(result.result.speculative instanceof AttackAction);
  assert(result.result.live instanceof PassTurnAction);
  assert.equal(result.audit.nonLiveSkipped,1);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,original);
});
test('every native prototype is restored on a thrown work failure',()=>{
  const beforeDecode=FakeBot.prototype.decodeNextAction,
    beforeDispatch=FakeStore.prototype.dispatch;
  assert.throws(()=>withFullBenchTrubbishPassGuard(
    ()=>{throw Error('example Store failure');},
    {SimpleTacticsAi:FakeBot,Store:FakeStore,PassTurnAction,observe:()=>board(5)}),
  /example Store failure/);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,beforeDecode);
  assert.strictEqual(FakeStore.prototype.dispatch,beforeDispatch);
});
