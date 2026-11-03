'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {classifyNativeTrainerAfterPass,VERSION}=
  require('../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs');

class PlayCardAction {
  constructor(handIndex){this.handIndex=handIndex;}
}
class PassTurnAction {}
const ITEM='Battle VIP Pass FST';
const SUPPORT='Professor Sycamore XY';
const CARMINE='Carmine TWM';
const TOOL='Float Stone BKT';
const STADIUM='Silent Lab PRC';
const POKEMON='Mew V FST';
const catalog=new Map([
  [ITEM,{name:'Battle VIP Pass',type:'Item'}],
  [SUPPORT,{name:'Professor Sycamore',type:'Supporter'}],
  [CARMINE,{name:'Carmine',type:'Supporter',
    firstTurnSupporterException:true}],
  [TOOL,{name:'Float Stone',type:'Tool'}],
  [STADIUM,{name:'Silent Lab',type:'Stadium'}]
]);

/** @param {object} [override] */
function ownerView(override={}){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:2,
    ownHand:[ITEM,SUPPORT,CARMINE,TOOL,STADIUM,POKEMON],
    ownPublic:{active:{printing:POKEMON,tools:[]},
      bench:[null,null,null,null,null],stadium:[]},
    opponentPublic:{stadium:[]},
    ownTurnResources:{itemPlayLocked:false,toolPlayLocked:false,
      supporterPlayLocked:false,stadiumPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0},
    ...override
  };
}
/** @param {object} view @param {object|null} action */
const classify=(view,action)=>classifyNativeTrainerAfterPass(
  view,action,catalog,PlayCardAction);

test('only genuine hand-indexed native Trainer plays may replace unsupported Pass',()=>{
  assert.equal(typeof VERSION,'string');
  const ok=classify(ownerView(),new PlayCardAction(0));
  assert.deepEqual(ok,{
    selected:true,reason:'native-proposed-generic-unblocked-trainer',
    printing:ITEM,type:'Item',handIndex:0,
    unresolvedPaperPayment:true,unresolvedPaperTarget:true,
    unresolvedNativePrompt:true,unqualifiedNativeDecision:true
  });
  assert.equal(classify(ownerView(),new PassTurnAction()).reason,
    'native-did-not-propose-play-card');
  assert.equal(classify(ownerView(),new PlayCardAction(5)).reason,
    'proposed-card-not-trainer');
  assert.equal(classify(ownerView(),new PlayCardAction(6)).reason,
    'invalid-owner-hand-index');
  assert.equal(classify(ownerView(),new PlayCardAction(-1)).selected,false);
  assert.equal(classify(ownerView(),new PlayCardAction(NaN)).selected,false);
});

test('used Supporter and public Item lock veto native proposals',()=>{
  const supporter=ownerView();
  supporter.ownTurnResources.supporterPlayedTurn=1;
  const denied=classify(supporter,new PlayCardAction(1));
  assert.equal(denied.reason,'generic-public-rule-block');
  assert.equal(denied.publicBlocker,'supporter-already-consumed');
  const item=ownerView();
  item.ownTurnResources.itemPlayLocked=true;
  assert.equal(classify(item,new PlayCardAction(0)).publicBlocker,
    'public-item-lock');
});

test('first-player Supporter rule preserves printed exception',()=>{
  const first=ownerView({globalTurn:1});
  const illegal=classify(first,new PlayCardAction(1));
  assert.equal(illegal.publicBlocker,
    'first-player-opening-supporter-rule');
  const exception=classify(first,new PlayCardAction(2));
  assert.equal(exception.selected,true);
  assert.equal(exception.type,'Supporter');
});

test('Tool slot and same-name Stadium gates are enforced from public board',()=>{
  const v=ownerView();
  v.ownPublic.active.tools=[TOOL];
  assert.equal(classify(v,new PlayCardAction(3)).publicBlocker,
    'no-public-open-tool-slot');
  v.ownPublic.stadium=[STADIUM];
  assert.equal(classify(v,new PlayCardAction(4)).publicBlocker,
    'same-named-stadium-in-play');
});

test('changing concealed opponent cards cannot alter owner-visible decision',()=>{
  const a=ownerView();
  a.opponentPublic.concealedHand=['MUST_NOT_USE_A'];
  const b=ownerView();
  b.opponentPublic.concealedHand=['MUST_NOT_USE_B'];
  assert.deepEqual(classify(a,new PlayCardAction(0)),
    classify(b,new PlayCardAction(0)));
});

test('no native Store or simulated benefit is consulted for eligibility',()=>{
  const v=ownerView();
  Object.defineProperty(v,'opponentHiddenDeck',{get(){
    throw new Error('Forbidden hidden deck access');
  }});
  assert.equal(classify(v,new PlayCardAction(4)).selected,true);
});
