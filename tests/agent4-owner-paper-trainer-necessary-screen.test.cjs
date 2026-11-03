'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VIP,VERSION,printedTrainerTurnScreen,screenOwnerTrainerPaperNecessity
}=require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');
const {classifyNativeTrainerAfterPass}=
  require('../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs');

class PlayCardAction{
  /** @param {number} handIndex */
  constructor(handIndex){this.handIndex=handIndex;}
}

/** @param {string[]} hand @param {number} turn */
function owner(hand,turn=2){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:turn,
    ownHand:[...hand],
    ownPublic:{active:{printing:'Mew V FST',tools:[]},
      bench:[null,null,null,null,null],stadium:[],deckCount:20},
    opponentPublic:{stadium:[]},
    ownTurnResources:{
      itemPlayLocked:false,supporterPlayLocked:false,
      toolPlayLocked:false,stadiumPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0
    }
  };
}
/** @param {object} view @param {number} handIndex @param {boolean} offered */
function row(view,handIndex,offered=true){
  return {
    handIndex,printing:view.ownHand[handIndex],type:'Item',
    publicBlocker:null,nativeEnumeratorOffered:offered
  };
}

test('exact FST printed VIP turn veto is independent of stale native offers',()=>{
  assert.match(VERSION,/agent4/);
  for(const turn of [3,4,7,13]){
    const v=owner([VIP],turn);
    const gate=printedTrainerTurnScreen(v,VIP);
    assert.equal(gate.blocker,'battle-vip-pass-first-turn-expired');
    assert.equal(gate.positivelyCertified,false);
    const result=screenOwnerTrainerPaperNecessity(v,[row(v,0,true)]);
    assert.equal(result.enumeratorOfferedCopies,1);
    assert.equal(result.provenNecessaryConditionFailures,1);
    assert.equal(result.rows[0].paperPlayable,false);
    assert.deepEqual(result.rows[0].necessaryBlockers,
      ['printed-temporal:battle-vip-pass-first-turn-expired']);
  }
});

test('turns 1 and 2 are unresolved, never paper-playable certificates',()=>{
  for(const turn of [1,2]){
    const v=owner([VIP],turn);
    const result=screenOwnerTrainerPaperNecessity(v,[row(v,0)]);
    assert.equal(result.remainingUnresolvedCopies,1);
    assert.equal(result.rows[0].printedTemporalStatus,
      'unresolved-opening-turn');
    assert.equal(result.rows[0].paperPlayable,null);
    assert.equal(result.allRemainingArePaperLegal,false);
  }
});

test('mandatory printed hand payments independently veto or stay unpaid',()=>{
  for(const [printing,required] of [
    ['Quick Ball FST',1],['Ultra Ball MEG',2],['Secret Box TWM',3]
  ]){
    const short=owner([printing,...Array(required-1).fill('Psychic Energy SVE')]);
    const impossible=screenOwnerTrainerPaperNecessity(short,[row(short,0)]);
    assert.equal(impossible.rows[0].paperPlayable,false);
    assert.equal(impossible.rows[0].printedMandatoryHandPayment,
      'physically-impossible');
    assert.deepEqual(impossible.rows[0].necessaryBlockers,
      ['printed-hand-payment:all-known-mandatory-hand-cost-modes-impossible']);
    const full=owner([...short.ownHand,'Psychic Energy SVE']);
    const possible=screenOwnerTrainerPaperNecessity(full,[row(full,0)]);
    assert.equal(possible.rows[0].printedMandatoryHandPayment,
      'physically-possible-unpaid');
    assert.equal(possible.rows[0].paperPlayable,null);
    assert.equal(possible.rows[0].physicalCustodySettlement,'unverified');
  }
});

test('each independent necessary blocker is retained with explicit unknowns',()=>{
  const v=owner([VIP,'Quick Ball FST'],5);
  const rows=[row(v,0),row(v,1,false)];
  rows[0].publicBlocker='public-item-lock';
  const r=screenOwnerTrainerPaperNecessity(v,rows);
  assert.deepEqual(r.rows[0].necessaryBlockers,[
    'generic-public:public-item-lock',
    'printed-temporal:battle-vip-pass-first-turn-expired'
  ]);
  assert.equal(r.rows[1].paperPlayable,null);
  assert.equal(r.rows[1].nativeEnumeratorOffered,false);
  assert.equal(r.provenNecessaryConditionFailures,1);
  assert.equal(r.rows[1].exactTargetEligibility,'unverified');
});

test('native enumerator omissions do not certify inability to play',()=>{
  const a=owner(["Trainers' Mail ROS"],4);
  const rowA=row(a,0,false);
  const record=screenOwnerTrainerPaperNecessity(a,[rowA]);
  assert.equal(record.rows[0].paperPlayable,null);
  assert.equal(record.rows[0].nativeEnumeratorOffered,false);
  assert.equal(record.rows[0].printedTemporalStatus,
    'unmodeled-print-specific-turn-rule');
  assert.equal(record.remainingUnresolvedCopies,1);
});

test('owner hand integrity and opponent hidden-info invariance',()=>{
  const a=owner([VIP,'Secret Box TWM'],7);
  const b=owner([VIP,'Secret Box TWM'],7);
  Object.defineProperty(b,'opponentSecretDeck',{
    get(){throw new Error('Illegal concealed deck access');}
  });
  a.opponentPublic.concealedHand=['A'];
  b.opponentPublic.concealedHand=['B'];
  assert.deepEqual(
    screenOwnerTrainerPaperNecessity(a,[row(a,0),row(a,1)]),
    screenOwnerTrainerPaperNecessity(b,[row(b,0),row(b,1)])
  );
  assert.throws(()=>screenOwnerTrainerPaperNecessity(a,
    [row(a,0),row(a,0)]),/Duplicate physical owner-hand index/);
  assert.throws(()=>screenOwnerTrainerPaperNecessity(a,
    [{...row(a,0),printing:'Wrong'}]),/Expected values/);
  assert.throws(()=>printedTrainerTurnScreen(
    {...a,decisionKind:'owner-prompt'},VIP),/owner-root/);
});

test('generic fallback rejects late VIP offered by native bot',()=>{
  const catalog=new Map([[VIP,{name:'Battle VIP Pass',type:'Item'}]]);
  const late=owner([VIP],5);
  const denied=classifyNativeTrainerAfterPass(
    late,new PlayCardAction(0),catalog,PlayCardAction);
  assert.equal(denied.selected,false);
  assert.equal(denied.reason,'printed-temporal-rule-block');
  assert.equal(denied.printedTemporalBlocker,
    'battle-vip-pass-first-turn-expired');
  const opening=classifyNativeTrainerAfterPass(
    owner([VIP],2),new PlayCardAction(0),catalog,PlayCardAction);
  assert.equal(opening.selected,true);
  assert.equal(opening.unresolvedPaperTarget,true);
});
