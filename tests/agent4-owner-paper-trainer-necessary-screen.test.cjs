'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VIP,VERSION,FIRST_OWNER_TURN_ONLY,
  printedTrainerTurnScreen,screenOwnerTrainerPaperNecessity
}=require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');
const {classifyNativeTrainerAfterPass}=
  require('../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs');
const {createOwnerTurnLedger}=
  require('../simulation/twinleaf/agent4-owner-turn-ledger.cjs');

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

test('witnessed second owner turn rules out exact FST VIP despite native offers',()=>{
  assert.match(VERSION,/agent4/);
  for(const turn of [2,3,4,7,13]){
    const ledger=createOwnerTurnLedger();
    ledger.observe(owner([VIP],1));
    const v=owner([VIP],turn);
    const proof=ledger.observe(v);
    if(turn===2)assert.equal(proof.distinctObservedOwnerTurns,2);
    const gate=printedTrainerTurnScreen(v,VIP,proof);
    assert.equal(gate.blocker,'battle-vip-pass-first-owner-turn-expired');
    assert.equal(gate.ineligibilityProven,true);
    const result=screenOwnerTrainerPaperNecessity(
      v,[row(v,0,true)],proof);
    assert.equal(result.enumeratorOfferedCopies,1);
    assert.equal(result.provenNecessaryConditionFailures,1);
    assert.equal(result.rows[0].paperPlayable,false);
    assert.deepEqual(result.rows[0].necessaryBlockers,
      ['printed-temporal:battle-vip-pass-first-owner-turn-expired']);
  }
});

test('global turn alone never proves a skipped owner has had a first turn',()=>{
  const ledger=createOwnerTurnLedger();
  const seat0First={...owner([VIP],1),actorSeat:0};
  const seat0Second={...owner([VIP],2),actorSeat:0};
  const seat1First=owner([VIP],3);
  const first=ledger.observe(seat0First);
  const second=ledger.observe(seat0Second);
  const delayed=ledger.observe(seat1First);
  assert.equal(first.provenPastFirstOwnerTurn,false);
  assert.equal(second.provenPastFirstOwnerTurn,true);
  assert.equal(delayed.provenPastFirstOwnerTurn,false);
  assert.equal(printedTrainerTurnScreen(
    seat0Second,VIP,second).ineligibilityProven,true);
  const unresolved=screenOwnerTrainerPaperNecessity(
    seat1First,[row(seat1First,0)],delayed);
  assert.equal(unresolved.rows[0].paperPlayable,null);
  assert.equal(unresolved.rows[0].printedTemporalConservativeDecline,true);
  assert.equal(unresolved.conservativeTemporalDeclines,1);
  assert.equal(unresolved.provenNecessaryConditionFailures,0);
  assert.equal(unresolved.rows[0].printedTemporalBlocker,null);
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
    'generic-public:public-item-lock'
  ]);
  assert.equal(r.rows[0].printedTemporalConservativeDecline,true);
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
    [{...row(a,0),printing:'Wrong'}]),/Wrong|Expected values/);
  assert.throws(()=>printedTrainerTurnScreen(
    {...a,decisionKind:'owner-prompt'},VIP),/owner-root/);
});

test('generic fallback distinguishes unknown late VIP from proven expiry',()=>{
  const catalog=new Map([[VIP,{name:'Battle VIP Pass',type:'Item'}]]);
  const late=owner([VIP],5);
  const unknown=classifyNativeTrainerAfterPass(
    late,new PlayCardAction(0),catalog,PlayCardAction);
  assert.equal(unknown.selected,false);
  assert.equal(unknown.reason,'unverified-first-turn-order-decline');
  assert.equal(unknown.paperPlayable,null);
  const ledger=createOwnerTurnLedger();
  ledger.observe(owner([VIP],2));
  const proof=ledger.observe(late);
  const denied=classifyNativeTrainerAfterPass(
    late,new PlayCardAction(0),catalog,PlayCardAction,proof);
  assert.equal(denied.selected,false);
  assert.equal(denied.reason,'printed-temporal-rule-block');
  assert.equal(denied.printedTemporalBlocker,
    'battle-vip-pass-first-owner-turn-expired');
  assert.equal(denied.paperPlayable,false);
  const opening=classifyNativeTrainerAfterPass(
    owner([VIP],2),new PlayCardAction(0),catalog,PlayCardAction);
  assert.equal(opening.selected,true);
  assert.equal(opening.unresolvedPaperTarget,true);
});

test('owner turn ledger ignores repeats and prevents dishonest receipt cross-seat',()=>{
  const ledger=createOwnerTurnLedger();
  const at4=owner([VIP],4);
  const first=ledger.observe(at4);
  const repeat=ledger.observe(at4);
  assert.equal(first.provenPastFirstOwnerTurn,false);
  assert.equal(repeat.distinctObservedOwnerTurns,1);
  assert.equal(ledger.snapshot().distinctObservedTurns[1],1);
  const second=ledger.observe(owner([VIP],6));
  assert.equal(second.distinctObservedOwnerTurns,2);
  const wrongSeat={...second,actorSeat:0};
  assert.throws(()=>printedTrainerTurnScreen(
    owner([VIP],6),VIP,wrongSeat),/Expected values/);
  assert.throws(()=>ledger.observe(owner([VIP],2)),/moved backward/);
});

test('source-exact five first-owner-turn-only Trainer printings are covered',()=>{
  const sources={
    'Battle VIP Pass FST':'swsh8-225',
    'Wait and See Hammer LOT':'sm8-192',
    'Wait and See Turbo ASR':'swsh10-158',
    'Call Bell SSP':'sv8-165',
    'Chill Teaser Toy SSP':'sv8-166'
  };
  assert.deepEqual(Object.keys(FIRST_OWNER_TURN_ONLY).sort(),
    Object.keys(sources).sort());
  for(const [printing,source] of Object.entries(sources)){
    const ledger=createOwnerTurnLedger();
    ledger.observe(owner([printing],1));
    const secondTurn=owner([printing],3);
    const proof=ledger.observe(secondTurn);
    const screened=printedTrainerTurnScreen(secondTurn,printing,proof);
    assert.equal(screened.sourceCardId,source);
    assert.equal(screened.status,'blocked');
    assert.equal(screened.ineligibilityProven,true);
    assert.match(screened.blocker,/first-owner-turn-expired$/);
    if(printing!==VIP){
      assert.equal(screened.additionallyRequiresGoingSecond,true);
      assert.equal(screened.goingSecondEligibility,
        'proven-going-first-ineligible');
    }
    const noHistory=printedTrainerTurnScreen(secondTurn,printing);
    assert.equal(noHistory.blocker,null);
    assert.equal(noHistory.conservativeDecline,true);
  }
  for(const printing of ['Boost Shake EVS','Energy Spinner UNB',
    "Grimsley's Move PFL",'Rare Candy SVI']){
    assert.equal(printedTrainerTurnScreen(
      owner([printing],5),printing).printedRuleKnown,false);
  }
});

test('native fallback declines another source-printed first-turn-only Item',()=>{
  const printing='Wait and See Hammer LOT';
  const catalog=new Map([[printing,{name:'Wait and See Hammer',
    type:'Item'}]]);
  const v=owner([printing],5);
  const ledger=createOwnerTurnLedger();
  ledger.observe(owner([printing],1));
  const proof=ledger.observe(v);
  const denied=classifyNativeTrainerAfterPass(
    v,new PlayCardAction(0),catalog,PlayCardAction,proof);
  assert.equal(denied.selected,false);
  assert.equal(denied.reason,'printed-temporal-rule-block');
  assert.equal(denied.printedTemporalBlocker,
    'wait-and-see-hammer-first-owner-turn-expired');
});

test('owner-authenticated opening order rules out going-second-only Item for first seat',()=>{
  const printing='Call Bell SSP',ledger=createOwnerTurnLedger();
  const first={...owner([printing],1),actorSeat:0};
  const receipt=ledger.observe(first);
  assert.equal(receipt.openingFirstSeat,0);
  assert.equal(receipt.openingSeatProof,
    'observed-real-owner-root-global-turn-one');
  const disqualified=printedTrainerTurnScreen(first,printing,receipt);
  assert.equal(disqualified.expiryIneligibilityProven,false);
  assert.equal(disqualified.goingSecondEligibility,
    'proven-going-first-ineligible');
  assert.equal(disqualified.blocker,'call-bell-requires-going-second');
  assert.equal(disqualified.ineligibilityProven,true);
  const proven=screenOwnerTrainerPaperNecessity(first,[row(first,0)],receipt);
  assert.equal(proven.rows[0].paperPlayable,false);
  assert.deepEqual(proven.rows[0].necessaryBlockers,
    ['printed-temporal:call-bell-requires-going-second']);

  const secondSeatFirst=owner([printing],2);
  const otherProof=ledger.observe(secondSeatFirst);
  assert.equal(otherProof.openingFirstSeat,0);
  assert.equal(otherProof.provenPastFirstOwnerTurn,false);
  const conditional=printedTrainerTurnScreen(
    secondSeatFirst,printing,otherProof);
  assert.equal(conditional.goingSecondEligibility,'proven-going-second');
  assert.equal(conditional.blocker,null);
  assert.equal(conditional.ineligibilityProven,false);
  assert.equal(screenOwnerTrainerPaperNecessity(
    secondSeatFirst,[row(secondSeatFirst,0)],otherProof)
    .rows[0].paperPlayable,null);
});

test('unobserved opening order never gives a false first-seat certificate',()=>{
  const printing='Chill Teaser Toy SSP';
  const ledger=createOwnerTurnLedger(),delayed=owner([printing],5);
  const observation=ledger.observe(delayed);
  assert.equal(observation.openingFirstSeat,null);
  const r=printedTrainerTurnScreen(delayed,printing,observation);
  assert.equal(r.goingSecondEligibility,'unverified');
  assert.equal(r.blocker,null);
  assert.equal(r.conservativeDecline,true);
  assert.equal(r.ineligibilityProven,false);
});
