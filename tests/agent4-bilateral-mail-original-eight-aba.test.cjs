'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {eligibleMailHandIndex,MAIL}=
  require('../simulation/twinleaf/agent4-bilateral-mail-root-choice.cjs');
const {compare}=
  require('../simulation/evaluation/agent4-bilateral-mail-aba-compare.cjs');
const reg=require('../results/aichi-2026/registrations/agent4-bilateral-mail-original-eight-aba-v1-20261105.json');

const item={fullName:MAIL,canPlay:()=>true};
const make=()=>({activePlayer:1,prompts:[],players:[
  {id:0,deck:{cards:[{}]},hand:{cards:[]}},
  {id:1,deck:{cards:[{}]},hand:{cards:[item]}}
]});
const observation=(state,seat)=>({
  actorSeat:seat,decisionKind:'owner-root',ownHand:[MAIL],
  ownTurnResources:{itemPlayLocked:false},
  ownPublic:{publicTurnRestrictions:{itemPlayLocked:false}}
});
test('physical owner Mail is available only on native-payable Item-open root',()=>{
  const state=make(),store={};
  assert.equal(eligibleMailHandIndex(state,1,store,observation),0);
  assert.equal(eligibleMailHandIndex(state,0,store,observation),null);
  state.prompts=[{result:undefined}];
  assert.equal(eligibleMailHandIndex(state,1,store,observation),null);
});
test('no owner deck, native rejection or public lock prevents proposal',()=>{
  const state=make();
  state.players[1].deck.cards=[];
  assert.equal(eligibleMailHandIndex(state,1,{},observation),null);
  state.players[1].deck.cards=[{}];
  state.players[1].hand.cards[0]={fullName:MAIL,canPlay:()=>false};
  assert.equal(eligibleMailHandIndex(state,1,{},observation),null);
  state.players[1].hand.cards[0]=item;
  const locked=(s,n)=>({...observation(s,n),
    ownTurnResources:{itemPlayLocked:true}});
  assert.equal(eligibleMailHandIndex(state,1,{},locked),null);
});
function result(change=false){
  return {manifest:{observedTwinleafGitCommit:reg.pinnedTwinleaf},
    rawDevelopment:{rows:reg.seededOriginalTrialIds.map((id,i)=>({
      trial:{id},status:null,fullPhysicalDealFingerprint:'whole'+i,
      sourceDealFingerprint:'source'+i,originalSourceSeat:1,
      rootActionLedger:[{actionOrdinal:0,action:'PlayCardAction'},
        {actionOrdinal:1,action:change?'PlayCardAction':'PassTurnAction'}]
    }))}};
}
test('all original eight A/B/A physical openings and root repeat verify',()=>{
  const panel=compare(result(),result(true),result(),
    {proposalCountsBySeat:[0,2]},reg);
  assert.equal(panel.originalEight,8);
  assert.equal(panel.sameAllPhysicalOpenings,true);
  assert.equal(panel.ARepeatFullyDeterministic,true);
  assert.equal(panel.panel[0].firstTreatedRootDivergence,1);
  assert.equal(panel.panel[0].sourceSeat,1);
  assert.equal(panel.panel[2].sourceSeat,0);
  assert.deepEqual(panel.panel[0].changeAudit.treatedPublicRootTape
    .map(root=>root.action),['PlayCardAction','PlayCardAction']);
  assert.equal(panel.panel[2].changeAudit,null);
  assert.equal(panel.panel[0].changeAudit.onlyPublicNativeActions,true);
  assert.equal(panel.qualifiedCompetitiveGames,0);
});
test('a changed control root makes the A-repeat determinism gate fail',()=>{
  const a=result(),b=result(true),c=result(true);
  const panel=compare(a,b,c,{},reg);
  assert.equal(panel.ARepeatFullyDeterministic,false);
});
test('one altered full physical deal makes only that panel fail',()=>{
  const a=result(),b=result(true),c=result();
  b.rawDevelopment.rows[2].fullPhysicalDealFingerprint='bad-deal';
  const panel=compare(a,b,c,{},reg);
  assert.equal(panel.sameAllPhysicalOpenings,false);
  assert.equal(panel.panel[2].fullOpeningParity,false);
});
