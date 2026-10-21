'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceMarnie,withSourceMarnieAfterPass}=
  require('../simulation/twinleaf/agent43-source-t7-marnie-after-pass.cjs');

function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:7,
    ownHand:['Marnie SSH','Garbodor BKP','Shopping Center EVS'],
    ownPublic:{
      active:{printing:'Garbodor BKP',energies:[]},
      bench:[{printing:'Oranguru V ASR',energies:['Darkness Energy MEE']}],
      deckCount:20,publicTurnRestrictions:{supporterPlayLocked:false}
    },
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}
  };
}
class PassTurnAction{}
class PlayCardAction{
  constructor(playerId,handIndex,target){
    this.playerId=playerId;this.handIndex=handIndex;this.target=target;
  }
}
function fixture(){
  const active={turn:7,activePlayer:0,prompts:[],
    players:[{id:101,hand:{cards:['Marnie SSH','Garbodor BKP']}},
      {id:202,hand:{cards:['OPPONENT_SECRET']}}]};
  class Bot{
    constructor(){this.client={id:101};this.acts=0;}
    decodeNextAction(){this.acts++;return new PassTurnAction();}
  }
  class Store{
    constructor(state){this.state=state;this.called=0;}
    dispatch(action){this.called++;return action;}
  }
  const bot=new Bot(),store=new Store(active);
  const headless={runMatch:()=>{
    const action=bot.decodeNextAction(active);
    return store.dispatch(action);
  }};
  const deps={SimpleTacticsAi:Bot,Store,headless,
    cardActions:{PlayCardAction,PlayerType:{ANY:'ANY'},
      SlotType:{BOARD:'BOARD'}},observe:()=>view()};
  return {active,Bot,Store,bot,store,headless,deps};
}

test('the held owner-only Marnie at T7 replaces the original Pass via native Store',()=>{
  const f=fixture();
  const beforeDecode=f.Bot.prototype.decodeNextAction;
  const beforeDispatch=f.Store.prototype.dispatch;
  const beforeRun=f.headless.runMatch;
  const {result,audit}=withSourceMarnieAfterPass(
    ()=>f.headless.runMatch(),f.deps);
  assert.ok(result instanceof PlayCardAction);
  assert.equal(result.playerId,101);
  assert.equal(result.handIndex,0);
  assert.equal(result.target.player,'ANY');
  assert.equal(audit.StoreAccepted,1);
  assert.equal(audit.StoreRejected,0);
  assert.equal(audit.eligibleMarniePasses,1);
  assert.equal(audit.firstProposal.sourceOwnedHandIndex,0);
  assert.equal(f.active.players[1].hand.cards[0],'OPPONENT_SECRET');
  assert.strictEqual(f.Bot.prototype.decodeNextAction,beforeDecode);
  assert.strictEqual(f.Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(f.headless.runMatch,beforeRun);
});
test('missing Marnie, Supporter spent, and empty recovery Bench reject proposal',()=>{
  const v=view();
  assert.deepEqual(chooseSourceMarnie(v),{handIndex:0,printing:'Marnie SSH'});
  assert.equal(chooseSourceMarnie({...v,ownHand:['Garbodor BKP']}),null);
  assert.equal(chooseSourceMarnie({...v,globalTurn:8}),null);
  assert.equal(chooseSourceMarnie({...v,actorSeat:1}),null);
  assert.equal(chooseSourceMarnie({...v,ownTurnResources:{
    supporterPlayedTurn:7,supporterPlayLocked:false}}),null);
  assert.equal(chooseSourceMarnie({...v,ownPublic:{...v.ownPublic,
    bench:[{printing:'Oranguru V ASR',energies:[]}]}}),null);
});
test('non-own turn and ordinary non-Pass roots preserve original native decision',()=>{
  const f=fixture();
  f.active.activePlayer=1;
  const r=withSourceMarnieAfterPass(()=>f.headless.runMatch(),f.deps);
  assert.ok(r.result instanceof PassTurnAction);
  assert.equal(r.audit.StoreAccepted,0);
  const g=fixture();
  class AttachEnergyAction{}
  g.Bot.prototype.decodeNextAction=function(){return new AttachEnergyAction();};
  const q=withSourceMarnieAfterPass(()=>g.headless.runMatch(),g.deps);
  assert.ok(q.result instanceof AttachEnergyAction);
  assert.equal(q.audit.StoreAccepted,0);
});
test('native dispatch abort restores every hook without swallowing the Store error',()=>{
  const f=fixture();
  f.Store.prototype.dispatch=function(){throw Error('Store failure');};
  const bd=f.Bot.prototype.decodeNextAction;
  const bs=f.Store.prototype.dispatch;
  const br=f.headless.runMatch;
  assert.throws(()=>withSourceMarnieAfterPass(
    ()=>f.headless.runMatch(),f.deps),/Store failure/);
  assert.strictEqual(f.Bot.prototype.decodeNextAction,bd);
  assert.strictEqual(f.Store.prototype.dispatch,bs);
  assert.strictEqual(f.headless.runMatch,br);
});
