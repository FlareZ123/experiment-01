'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {responseProposal,withBehindResponseNative,
  withRegisteredBehindResponse}=
  require('../simulation/twinleaf/agent14-behind-counter-response-native.cjs');
const {CATCHER,LILLIE}=
  require('../simulation/evaluation/agent14-post-claw-response-opportunity.cjs');

function view(seat=0){
  return {decisionKind:'owner-root',globalTurn:32,actorSeat:seat,
    ownHand:['Squawkabilly ex PAL',CATCHER,LILLIE],
    ownTurnResources:{itemPlayLocked:false,supporterPlayedTurn:0,
      supporterPlayLocked:false},
    ownPublic:{prizeCount:6,deckCount:15,active:{energies:[]},
      bench:[null],resolvingSupporter:[],publicTurnRestrictions:{
        itemPlayLocked:false,supporterPlayLocked:false}},
    opponentPublic:{prizeCount:5,active:{energies:['Darkness Energy SVE',
      'Darkness Energy SVE','Darkness Energy SVE']},
      bench:[{printing:'Garbodor BKP',energies:[],
        printed:{retreatCost:[1,1]}}]}}
}
test('paper-preserving response planner separates observed, catcher, lillie',()=>{
  for(const mode of ['observe','catcher','lillie']){
    const r=responseProposal(view(), 'PlayCardAction','Squawkabilly ex PAL',mode);
    assert.equal(r.printing,mode==='observe'?null:
      mode==='catcher'?CATCHER:LILLIE);
    assert.equal(r.handIndex,mode==='observe'?null:mode==='catcher'?1:2);
  }
  assert.equal(responseProposal(view(),'AttackAction',null,'catcher'),null);
  assert.equal(responseProposal(view(),'PlayCardAction','Fog Crystal CRE','catcher'),null);
  assert.equal(responseProposal(view(),'PassTurnAction',null,'catcher')?.printing,CATCHER);
});
test('Item lock, equal Prize, eligible Lillie and public funding preserve boundaries',()=>{
  const x=view();x.ownTurnResources.itemPlayLocked=true;
  assert.equal(responseProposal(x,'PassTurnAction',null,'catcher'),null);
  assert.ok(responseProposal(x,'PassTurnAction',null,'lillie'));
  x.ownTurnResources.itemPlayLocked=false;x.ownPublic.prizeCount=5;
  assert.equal(responseProposal(x,'PassTurnAction',null,'catcher'),null);
  assert.equal(responseProposal(x,'PassTurnAction',null,'lillie'),null);
  x.ownPublic.prizeCount=6;x.opponentPublic.active.energies=[];
  assert.equal(responseProposal(x,'PassTurnAction',null,'catcher'),null);
  x.opponentPublic.active.energies=['a','b','c'];x.ownPublic.active.energies=['x'];
  assert.equal(responseProposal(x,'PassTurnAction',null,'lillie'),null);
});
class AddPlayerAction{}
class PassTurnAction{constructor(id){this.id=id;}}
class PlayCardAction{
  constructor(id,handIndex,target){this.id=id;this.handIndex=handIndex;
    this.target=target;}
}
class Store{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){this.accepted.push(action);return this.state;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PlayCardAction(this.client.id,0,{
    player:2,slot:2,index:0});}
}
function fakeState(){
  return {players:[
    {id:101,hand:{cards:[
      {fullName:'Squawkabilly ex PAL'},
      {fullName:CATCHER,canPlay:()=>true},
      {fullName:LILLIE,canPlay:()=>true}]}},
    {id:202,hand:{cards:[]}}
  ],activePlayer:0,prompts:[]};
}
function execute(mode,seat=0){
  const st=fakeState();
  if(seat===1){st.players[1].hand=st.players[0].hand;
    st.players[0].hand={cards:[]};st.activePlayer=1;}
  const store=new Store(st),d=SimpleTacticsAi.prototype.decodeNextAction,
    dispatch=Store.prototype.dispatch;
  const r=withBehindResponseNative(()=>{
    store.dispatch(new AddPlayerAction());
    const candidate=new SimpleTacticsAi(st.players[seat].id).decodeNextAction(st);
    store.dispatch(candidate);
    return {candidate,store};
  },mode,{Store,SimpleTacticsAi,
    cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
    observe:(_,owner)=>view(owner)});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,d);
  assert.strictEqual(Store.prototype.dispatch,dispatch);
  return r;
}
test('actual observer mode is true no-op and records eligible root',()=>{
  const r=execute('observe');
  assert.equal(r.result.candidate.handIndex,0);
  assert.equal(r.audit.observedEligible,1);
  assert.equal(r.audit.proposed,0);
  assert.equal(r.audit.events[0].StoreAccepted,null);
});
test('typed native Counter Catcher replaces selected late Squawk, Store accepts',()=>{
  const r=execute('catcher');
  assert.equal(r.result.candidate.handIndex,1);
  assert.deepEqual(r.result.candidate.target,{player:0,slot:0,index:0});
  assert.equal(r.audit.nativeEligible,1);
  assert.equal(r.audit.accepted,1);
  assert.equal(r.audit.events[0].StoreAccepted,true);
  assert.equal(r.audit.events[0].ownerHandPrintings[2],LILLIE);
});
test('typed native Lillie is selected symmetrically on second physical seat',()=>{
  const r=execute('lillie',1);
  assert.equal(r.result.candidate.id,202);
  assert.equal(r.result.candidate.handIndex,2);
  assert.equal(r.audit.accepted,1);
  assert.equal(r.audit.events[0].seat,1);
});
test('native canPlay throws: preserve original root and failure evidence',()=>{
  const s=fakeState();s.players[0].hand.cards[1].canPlay=()=>{
    throw Error('CANNOT_PLAY_THIS_CARD');};
  const store=new Store(s);
  const r=withBehindResponseNative(()=>{
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi(101).decodeNextAction(s);
  },'catcher',{Store,SimpleTacticsAi,observe:()=>view(),
    cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}}});
  assert.equal(r.result.handIndex,0);
  assert.equal(r.audit.events[0].nativePreflight,'native-canPlay-rejected');
  assert.equal(r.audit.accepted,0);
});
test('registered composition restores the original owner-root export',()=>{
  const root={withActorOnlyRootPolicy:run=>run()};
  const original=root.withActorOnlyRootPolicy;
  const trials=[{id:'a'},{id:'b'}];
  const r=withRegisteredBehindResponse(()=>{
    root.withActorOnlyRootPolicy(()=>0,{});
    root.withActorOnlyRootPolicy(()=>1,{});
    return 42;
  },trials,'catcher',{root,wrap:run=>({result:run(),audit:{marker:true}})});
  assert.equal(r.result,42);
  assert.equal(r.audit.nativeCompositions,2);
  assert.deepEqual(r.audit.trialAudits.map(x=>x.trialId),['a','b']);
  assert.strictEqual(root.withActorOnlyRootPolicy,original);
});
