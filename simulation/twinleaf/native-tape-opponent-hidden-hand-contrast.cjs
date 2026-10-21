'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {digest,replayPolicyRandomTape}=
  require('./native-policy-random-tape.cjs');
const {chooseHiddenHandDeckSwap,hiddenZoneFingerprint}=
  require('./opponent-hidden-live-root-probe.cjs');

const VERSION='native-tape-opponent-hidden-hand-contrast-v1';

/**
 * Re-evaluate exactly one genuine actor decision under a conserved, detached
 * opponent hidden hand/deck exchange. Native same-world RNG/action parity
 * must already have succeeded using this exact callback and physical root.
 *
 * An equal current actor observation is necessary, but insufficient, to
 * certify a complete historical information set: previously revealed cards,
 * future public orders and opponent-selection strategy are not proven here.
 * Keep this a conditional decision diagnostic, never a qualified game.
 *
 * @param {{parity:object,root:object,seat:0|1,tape:number[],
 * cloneState:(root:object)=>object,replayDecision:(world:object)=>unknown,
 * actionSignature:(action:unknown)=>unknown,fingerprint:(state:object)=>unknown,
 * actorView:(state:object,seat:0|1)=>unknown}} args
 * @returns {object}
 */
function compareNativeOpponentHiddenHand(args){
  assert.ok(args&&typeof args==='object');
  const {parity,root,seat,tape,cloneState,replayDecision,
    actionSignature,fingerprint,actorView}=args;
  assert.ok(parity?.sameWorldDecisionParityQualified===true,
    'Native same-world decision parity required');
  assert.ok(root&&typeof root==='object');
  assert.ok(seat===0||seat===1);
  assert.ok(Array.isArray(tape));
  for(const fn of [cloneState,replayDecision,actionSignature,
    fingerprint,actorView])assert.equal(typeof fn,'function');
  const atEntry=structuredClone(fingerprint(root));
  assert.equal(parity.schema,'native-same-world-tape-parity-v1');
  assert.deepStrictEqual(parity.rootAtEntry,atEntry,
    'Parity bound to a different physical root');
  assert.deepStrictEqual(parity.rootAtExit,atEntry,
    'Parity recorded a changed physical root');
  assert.equal(parity.tapeSha256,digest(tape),
    'Parity bound to a different native RNG tape');
  assert.equal(parity.tapeDraws,tape.length);
  assert.equal(parity.consumed,tape.length);
  assert.equal(parity.sourceRootUnchanged,true);
  assert.equal(parity.physicalCloneMatched,true);
  assert.equal(parity.selectedActionMatched,true);
  assert.equal(parity.replayError,null);
  assert.strictEqual(parity.replayDecisionRef,replayDecision,
    'Parity was produced with a different policy replay callback');

  const report={
    schema:VERSION,actorSeat:seat,tapeDraws:tape.length,
    tapeSha256:digest(tape),sourceRootAtEntry:atEntry,
    sourceRootUnchanged:false,actorObservationMatched:false,
    opponentHiddenInventoryConserved:false,
    opponentHandCount:null,opponentDeckCount:null,
    selectedExchangeKinds:null,
    exchangeChangedPrinting:false,
    counterfactualAction:null,
    selectedActionChanged:false,
    consumed:null,contrastExecutable:false,
    opponentRevealHistoryAuthenticated:false,
    ownerK0K1HistoryAuthenticated:false,
    informationSetLeakQualified:false,
    competitiveGameQualified:false,error:null
  };
  try{
    const world=cloneState(root);
    assert.ok(world&&typeof world==='object'&&world!==root);
    assert.deepStrictEqual(structuredClone(fingerprint(world)),atEntry,
      'Detached counterfactual did not reproduce physical source State');
    const owner=world.players?.[seat];
    const opponent=world.players?.[1-seat];
    assert.ok(owner&&opponent&&world.players.length===2);
    assert.ok(Array.isArray(opponent.hand?.cards)&&
      Array.isArray(opponent.deck?.cards));
    report.opponentHandCount=opponent.hand.cards.length;
    report.opponentDeckCount=opponent.deck.cards.length;
    const originalHidden=hiddenZoneFingerprint(opponent);
    const exchange=chooseHiddenHandDeckSwap(
      opponent.hand.cards,opponent.deck.cards);
    if(!exchange)throw new Error(
      'No distinct-printing concealed opponent hand/deck exchange');
    const {handIndex,deckIndex}=exchange;
    const handCard=opponent.hand.cards[handIndex];
    const deckCard=opponent.deck.cards[deckIndex];
    assert.notStrictEqual(handCard,deckCard);
    opponent.hand.cards[handIndex]=deckCard;
    opponent.deck.cards[deckIndex]=handCard;
    report.selectedExchangeKinds=exchange.kindPair;
    report.exchangeChangedPrinting=handCard.fullName!==deckCard.fullName;
    report.opponentHiddenInventoryConserved=isDeepStrictEqual(
      originalHidden,hiddenZoneFingerprint(opponent));
    assert.ok(report.opponentHiddenInventoryConserved,
      'Exchange altered opponent concealed-card inventory');
    assert.equal(opponent.hand.cards.length,report.opponentHandCount);
    assert.equal(opponent.deck.cards.length,report.opponentDeckCount);
    report.actorObservationMatched=isDeepStrictEqual(
      actorView(root,seat),actorView(world,seat));
    if(!report.actorObservationMatched)throw new Error(
      'Opponent exchange changed the actor-visible observation');
    const replay=replayPolicyRandomTape(tape,()=>replayDecision(world));
    report.consumed=replay.consumed;
    report.counterfactualAction=actionSignature(replay.result);
    report.selectedActionChanged=!isDeepStrictEqual(
      parity.actualAction,report.counterfactualAction);
    report.contrastExecutable=true;
  }catch(error){
    report.error=String(error?.message??error);
  }finally{
    report.sourceRootAtExit=structuredClone(fingerprint(root));
    report.sourceRootUnchanged=isDeepStrictEqual(
      atEntry,report.sourceRootAtExit);
    if(!report.sourceRootUnchanged){
      report.error='Opponent hidden contrast mutated genuine Store source State';
      report.contrastExecutable=false;
    }
  }
  return report;
}

module.exports={VERSION,compareNativeOpponentHiddenHand};
