'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceMarnie,chooseSourceGuzmaT9,withSourceMarnieAfterPass}=
  require('../simulation/twinleaf/agent43-source-t7-marnie-after-pass.cjs');

function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:7,
    ownHand:['Marnie SSH','Garbodor BKP','Shopping Center EVS'],
    ownPublic:{
      active:{printing:'Garbodor BKP',energies:[],tools:[]},
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

test('post-Marnie owner observation records later reachable cards without changing Pass',()=>{
  const f=fixture();
  let reads=0;
  f.deps.observe=()=>{
    reads++;
    return reads===1?view():{
      ...view(),ownHand:['Float Stone BKT','Darkness Energy MEE']
    };
  };
  f.headless.runMatch=()=>{
    const first=f.bot.decodeNextAction(f.active);
    f.store.dispatch(first);
    const second=f.bot.decodeNextAction(f.active);
    return f.store.dispatch(second);
  };
  const {result,audit}=withSourceMarnieAfterPass(
    ()=>f.headless.runMatch(),f.deps);
  assert.ok(result instanceof PassTurnAction);
  assert.equal(audit.StoreAccepted,1);
  assert.equal(audit.postMarnieOwnerDecisionRoots.length,1);
  const snap=audit.postMarnieOwnerDecisionRoots[0];
  assert.deepEqual(snap.sourceOwnedHand,
    ['Float Stone BKT','Darkness Energy MEE']);
  assert.equal(snap.globalTurn,7);
  assert.equal(snap.originalBotAction,'PassTurnAction');
  assert.equal(snap.observationPassedToPolicy,false);
  assert.equal(f.active.players[1].hand.cards[0],'OPPONENT_SECRET');
});

test('real owner-visible T9 Guzma opportunity needs Supporter entitlement and both Benches',()=>{
  const base=view();
  const eligible={...base,globalTurn:9,ownHand:['Guzma BUS','Dark Patch ASR'],
    opponentPublic:{bench:[{printing:'Gengar & Mimikyu-GX TEU'}]}};
  assert.deepEqual(chooseSourceGuzmaT9(eligible),{
    handIndex:0,printing:'Guzma BUS'
  });
  assert.equal(chooseSourceGuzmaT9({...eligible,globalTurn:7}),null);
  assert.equal(chooseSourceGuzmaT9({...eligible,ownHand:['Marnie SSH']}),null);
  assert.equal(chooseSourceGuzmaT9({...eligible,
    opponentPublic:{bench:[]}}),null);
  assert.equal(chooseSourceGuzmaT9({...eligible,ownTurnResources:{
    supporterPlayedTurn:7,supporterPlayLocked:false}}),null);
  assert.equal(chooseSourceGuzmaT9({...eligible,ownPublic:{
    ...eligible.ownPublic,bench:[{printing:'Oranguru V ASR',energies:[]}]
  }}),null);
});
test('optional two-root native source Marnie plus held Guzma preserves both actor choices',()=>{
  const f=fixture();
  let reads=0;
  f.deps.guzmaT9=true;
  f.deps.observe=()=>{
    reads++;
    return reads===1?view():{
      ...view(),globalTurn:9,
      ownHand:['Guzma BUS','Dark Patch ASR'],
      opponentPublic:{bench:[{printing:'Duskull CEC'}]}
    };
  };
  f.headless.runMatch=()=>{
    const first=f.bot.decodeNextAction(f.active);
    f.store.dispatch(first);
    f.active.turn=9;
    const second=f.bot.decodeNextAction(f.active);
    return f.store.dispatch(second);
  };
  const {result,audit}=withSourceMarnieAfterPass(
    ()=>f.headless.runMatch(),f.deps);
  assert.ok(result instanceof PlayCardAction);
  assert.equal(result.handIndex,0);
  assert.equal(audit.StoreAccepted,2);
  assert.equal(audit.guzmaT9Proposals,1);
  assert.equal(audit.guzmaT9Accepted,1);
  assert.equal(audit.guzmaT9Rejected,0);
  assert.equal(audit.postDispatch.kind,'guzma-t9');
  assert.equal(audit.postMarnieOwnerDecisionRoots.length,1);
  assert.equal(audit.postMarnieOwnerDecisionRoots[0].globalTurn,9);
  assert.equal(f.active.players[1].hand.cards[0],'OPPONENT_SECRET');
});
