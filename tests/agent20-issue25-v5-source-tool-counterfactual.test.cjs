'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  withRegisteredSourceToolCounterfactual,joinRegisteredToolCounterfactual,REGISTRATION
}=require('../simulation/evaluation/agent20-issue25-v5-source-tool-counterfactual.cjs');

const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

function fixture(valid){
  class FakeAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {constructor:{name:'PassTurnAction'}};}
  }
  class FakeToolPlay{
    constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
  }
  class FakeStore{
    constructor(){
      this.state={turn:2,activePlayer:0,prompts:[],players:[
        {id:101,hand:{cards:[{fullName:'Tool Jammer BST'}]},
          active:{tools:[]}},
        {id:102,hand:{cards:[]},active:{tools:[]}}
      ]};
    }
    dispatch(action){
      if(action instanceof FakeToolPlay){
        const player=this.state.players[0];
        const [tool]=player.hand.cards.splice(action.handIndex,1);
        player.active.tools.push(tool);
        return 'accepted';
      }
      return 'pass';
    }
  }
  const store=new FakeStore();
  const view={
    decisionKind:'owner-root',actorSeat:0,globalTurn:2,
    ownHand:['Tool Jammer BST'],
    ownPublic:{
      active:{tools:[]},bench:[null],
      publicTurnRestrictions:{toolPlayLocked:false}
    },
    ownTurnResources:{toolPlayLocked:false},
    opponentPublic:{handCount:3}
  };
  const ref=valid?hash(view):'incorrect-source-owner-snapshot';
  const registration={targets:[
    {id:'source-one',sourceSeat:0,globalTurn:2,toolPrinting:'Tool Jammer BST',
      expectedOwnerVisibleSha256:ref,targetSlot:'active',targetIndex:0},
    {id:'other-target',sourceSeat:1,globalTurn:8,
      toolPrinting:'Float Stone BKT'}
  ]};
  const headless={runMatch(){
    const action=new FakeAi(101).decodeNextAction(store.state);
    return store.dispatch(action);
  }};
  const oldDecode=FakeAi.prototype.decodeNextAction;
  const oldDispatch=FakeStore.prototype.dispatch;
  const oldMatch=headless.runMatch;
  const result=withRegisteredSourceToolCounterfactual(
    ()=>headless.runMatch({label:'registered-source-one'}),{
      headless,SimpleTacticsAi:FakeAi,Store:FakeStore,
      registration,catalog:new Set(['Tool Jammer BST']),
      observe:()=>view,
      types:{PlayCardAction:FakeToolPlay,
        PlayerType:{BOTTOM_PLAYER:0},
        SlotType:{ACTIVE:0,BENCH:1}},
      publicView:owner=>({active:{
        tools:owner.active.tools.map(c=>c.fullName)
      }}),
      printing:card=>card.fullName
    });
  assert.strictEqual(FakeAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(FakeStore.prototype.dispatch,oldDispatch);
  assert.strictEqual(headless.runMatch,oldMatch);
  return {result,store};
}

test('exact owner state converts Pass to one native Tool payment and physically attaches',()=>{
  const {result,store}=fixture(true);
  assert.equal(result.result,'accepted');
  assert.equal(result.audit.attempts.length,1);
  const event=result.audit.attempts[0];
  assert.equal(event.originalRootWasPass,true);
  assert.equal(event.registeredOwnerViewMatched,true);
  assert.equal(event.nativeToolActionConstructed,true);
  assert.equal(event.nativeToolActionAccepted,true);
  assert.equal(event.physicalToolAttached,true);
  assert.equal(event.handCopyConsumed,true);
  assert.deepEqual(store.state.players[0].hand.cards,[]);
  assert.deepEqual(store.state.players[0].active.tools,
    [{fullName:'Tool Jammer BST'}]);
  assert.deepEqual(store.state.players[1].hand.cards,[]);
});

test('any source-owner state drift fails closed and preserves original Pass',()=>{
  const {result,store}=fixture(false);
  assert.equal(result.result,'pass');
  const event=result.audit.attempts[0];
  assert.equal(event.originalRootWasPass,true);
  assert.equal(event.registeredOwnerViewMatched,false);
  assert.equal(event.nativeToolActionConstructed,false);
  assert.equal(event.nativeToolActionAccepted,false);
  assert.deepEqual(store.state.players[0].hand.cards,
    [{fullName:'Tool Jammer BST'}]);
  assert.deepEqual(store.state.players[0].active.tools,[]);
});


test('post-treatment attack scanner distinguishes opponent attack from initial energy and source reply',()=>{
  const rows=REGISTRATION.targets.map(t=>{
    const rootActionLedger=Array.from({length:t.passRootOrdinal},(_,i)=>({
      actionOrdinal:i,action:'ResolvePromptAction',
      playerSlot:t.sourceSeat,turnBefore:t.globalTurn
    }));
    rootActionLedger.push({
      actionOrdinal:t.passRootOrdinal,
      action:'PlayCardAction',card:t.toolPrinting.split(' ').slice(0,-1).join(' '),
      playerSlot:t.sourceSeat,turnBefore:t.globalTurn
    });
    rootActionLedger.push({
      actionOrdinal:t.passRootOrdinal+1,
      action:'PlayCardAction',card:'Psychic Energy',
      playerSlot:t.candidateSeat,turnBefore:t.globalTurn+1
    });
    rootActionLedger.push({
      actionOrdinal:t.passRootOrdinal+2,
      action:'AttackAction',attack:'Eon Blade',
      playerSlot:t.candidateSeat,turnBefore:t.globalTurn+1
    });
    rootActionLedger.push({
      actionOrdinal:t.passRootOrdinal+3,
      action:'PassTurnAction',
      playerSlot:t.sourceSeat,turnBefore:t.globalTurn+2
    });
    return {id:t.id,sourceDealFingerprint:t.expectedSourcePhysicalDealSha256,
      fullPhysicalDealFingerprint:t.expectedFullPhysicalDealSha256,
      rootActionLedger};
  });
  const intervention={attempts:REGISTRATION.targets.map(t=>({
    id:t.id,registeredOwnerViewMatched:true,
    originalRootWasPass:true,nativeToolActionAccepted:true,
    physicalToolAttached:true,handCopyConsumed:true,
    ownerActiveToolsBefore:[],ownerActiveToolsAfter:[t.toolPrinting],
    ownerHandBefore:[t.toolPrinting],ownerHandAfter:[]
  }))};
  const extra=Array.from({length:6},(_,i)=>({
    id:'extra-'+i,rootActionLedger:[]
  }));
  const report=joinRegisteredToolCounterfactual(
    {rawDevelopment:{rows:[...rows,...extra]}},intervention);
  assert.deepEqual(report.firstOpposingAttackObserved.map(x=>x.chosenAttack),
    ['Eon Blade','Eon Blade']);
  assert.deepEqual(report.originalSourceAttackObserved.map(x=>x.observed),
    [false,false]);
  assert.ok(report.cases.every(x=>
    x.firstOpposingAttack?.action==='AttackAction'&&
    x.firstActualOpponentRoot?.action==='PlayCardAction'&&
    x.nextSourceRootAfterOpposingAttack?.action==='PassTurnAction'));
  assert.equal(report.exactPreInterventionPhysicalStartsAndPrefix,false,
    'Synthetic prefixes cannot masquerade as the real original source');
  assert.equal(report.competitiveGamesQualified,0);
});
