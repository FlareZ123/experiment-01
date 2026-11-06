'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseOriginalRank6PostVoltGuzma,withOriginalRank6PostVoltGuzma}=
  require('../simulation/twinleaf/agent9-v7-guzma-owner-canary.cjs');
/** @returns {object} Exact source-owned detached visible root. */
function view(){
  return {decisionKind:'owner-root',globalTurn:5,actorSeat:0,
    ownHand:['Guzma BUS','Team Flare Grunt XY'],
    ownPublic:{active:{printing:'Iron Thorns ex TWM'},
      bench:[{printing:'Iron Thorns ex TWM'}],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{active:{printing:'Tapu Lele-GX GRI'},
      bench:[{printing:'Marshadow UNB'}]},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}};
}
test('exact genuine post-Volt printed prereqs and negative controls',()=>{
  const v=view();
  assert.deepEqual(chooseOriginalRank6PostVoltGuzma(v),{
    kind:'play-held-guzma-mobility',handIndex:0,
    printing:'Guzma BUS',benchIndex:0,opponentBenchIndex:0});
  for(const input of [
    {...v,globalTurn:16}, {...v,actorSeat:1},
    {...v,ownHand:['Guzma & Hala CEC']},
    {...v,opponentPublic:{...v.opponentPublic,bench:[]}},
    {...v,ownTurnResources:{supporterPlayedTurn:1,
      supporterPlayLocked:false}},
    {...v,ownPublic:{...v.ownPublic,
      publicTurnRestrictions:{supporterPlayLocked:true}}}]) {
    assert.equal(chooseOriginalRank6PostVoltGuzma(input),null);
  }
});
/** @returns {object} Synthetic two-player physical Store. */
function fixture(){
  class AddPlayerAction{}
  class PassTurnAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }}
  class Ai{constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction();}}
  class Store{constructor(state){this.state=state;this.actions=[];}
    dispatch(action){this.actions.push(action);return 'accepted';}}
  const state={turn:5,activePlayer:0,prompts:[],players:[
    {id:100,supporterTurn:0,hand:{cards:[{fullName:'Guzma BUS'}]}},
    {id:101,hand:{cards:[]}}]};
  const store=new Store(state),bot=new Ai(100);
  return {AddPlayerAction,PassTurnAction,PlayCardAction,Ai,Store,
    state,store,bot,deps:{SimpleTacticsAi:Ai,Store,PlayCardAction,
      PlayerType:{ANY:4},SlotType:{BOARD:9},observe:()=>view()}};
}
test('accepted exact native action is witnessed and all prototypes restored',()=>{
  const f=fixture(),beforeAi=f.Ai.prototype.decodeNextAction;
  const beforeStore=f.Store.prototype.dispatch;
  const out=withOriginalRank6PostVoltGuzma(()=>{
    f.store.dispatch(new f.AddPlayerAction());
    const action=f.bot.decodeNextAction(f.state);
    assert.ok(action instanceof f.PlayCardAction);
    assert.equal(action.id,100);
    assert.equal(action.handIndex,0);
    assert.deepEqual(action.target,{player:4,slot:9,index:0});
    return f.store.dispatch(action);
  },f.deps);
  assert.equal(out.result,'accepted');
  assert.equal(out.audit.submittedGuzmaRoots,1);
  assert.equal(out.audit.nativeStoreAcceptedGuzmaRoots,1);
  assert.equal(out.audit.records[0].acceptedStoreRoot,true);
  assert.strictEqual(f.Ai.prototype.decodeNextAction,beforeAi);
  assert.strictEqual(f.Store.prototype.dispatch,beforeStore);
});
test('clone Store and rejected original cannot qualify root',()=>{
  const f=fixture(),clone=new f.Store(f.state);
  const old=f.Store.prototype.dispatch;
  f.Store.prototype.dispatch=function(action){
    if(action instanceof f.PlayCardAction&&this===f.store)
      throw Error('rejected by real Store');
    return old.call(this,action);
  };
  const original=f.Store.prototype.dispatch;
  const out=withOriginalRank6PostVoltGuzma(()=>{
    f.store.dispatch(new f.AddPlayerAction());
    const action=f.bot.decodeNextAction(f.state);
    clone.dispatch(action);
    assert.throws(()=>f.store.dispatch(action),/rejected by real Store/);
  },f.deps);
  assert.equal(out.audit.nativeStoreAcceptedGuzmaRoots,0);
  assert.equal(out.audit.nativeStoreRejectedGuzmaRoots,1);
  assert.equal(out.audit.records[0].acceptedStoreRoot,false);
  assert.strictEqual(f.Store.prototype.dispatch,original);
});
test('genuinely unmatching root retains original native Pass',()=>{
  const f=fixture();
  const out=withOriginalRank6PostVoltGuzma(()=>{
    f.store.dispatch(new f.AddPlayerAction());
    assert.ok(f.bot.decodeNextAction(f.state) instanceof f.PassTurnAction);
  },{...f.deps,observe:()=>({...view(),globalTurn:16})});
  assert.equal(out.audit.submittedGuzmaRoots,0);
});
