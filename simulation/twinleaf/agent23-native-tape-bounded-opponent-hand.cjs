'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {digest,replayPolicyRandomTape}=
  require('./native-policy-random-tape.cjs');
const {selectBoundedHiddenExchanges}=
  require('./agent23-bounded-hidden-world-scan.cjs');
const {hiddenZoneFingerprint}=
  require('./opponent-hidden-live-root-probe.cjs');

const VERSION='agent23-native-tape-bounded-opponent-hand-v1';

/**
 * Require native original-world action, RNG tape and immutable physical-root
 * parity before any hypothetical opponent concealed-card inspection.
 * Failure is a precondition error, not a censored counterfactual outcome.
 * @param {object} args An authenticated same-world tape replay packet.
 * @returns {{initial:unknown,ownerView:unknown,available:object}}
 */
function validateNativeRoot(args){
  assert.ok(args&&typeof args==='object');
  const {parity,root,seat,tape,cloneState,replayDecision,
    actionSignature,fingerprint,actorView}=args;
  assert.ok(parity?.sameWorldDecisionParityQualified===true,
    'Native same-world decision parity required');
  assert.ok(root&&typeof root==='object'&&
    Array.isArray(root.players)&&root.players.length===2);
  assert.ok(seat===0||seat===1);
  assert.ok(Array.isArray(tape));
  for(const fn of [cloneState,replayDecision,actionSignature,
    fingerprint,actorView])assert.equal(typeof fn,'function');
  const initial=structuredClone(fingerprint(root));
  assert.equal(parity.schema,'native-same-world-tape-parity-v1');
  assert.deepStrictEqual(parity.rootAtEntry,initial,
    'Parity bound to a different physical root');
  assert.deepStrictEqual(parity.rootAtExit,initial,
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
  return {initial,ownerView:actorView(root,seat)};
}

/**
 * The SAME authentic root and SAME native RNG tape are reused across a
 * bounded collection of independently detached opponent-hand/deck worlds.
 * All cases, including failures, remain visible. Actor observations are
 * checked against the original pre-exchange state on every iteration.
 *
 * A complete census of single exchanges is still not a complete historical
 * information set, because prior reveals, opponent action choices, and
 * multiple simultaneous hidden differences are unverified.
 *
 * @param {{parity:object,root:object,seat:0|1,tape:number[],
 * cloneState:(root:object)=>object,replayDecision:(world:object)=>unknown,
 * actionSignature:(action:unknown)=>unknown,fingerprint:(state:object)=>unknown,
 * actorView:(state:object,seat:0|1)=>unknown}} args
 * @param {{limit?:number}} [options]
 * @returns {object}
 */
function compareNativeOpponentHiddenHandBounded(args,{limit=16}={}){
  const {initial,ownerView}=validateNativeRoot(args);
  const {parity,root,seat,tape,cloneState,replayDecision,
    actionSignature,fingerprint,actorView}=args;
  const opponent=root.players[1-seat];
  const originalPool=hiddenZoneFingerprint(opponent);
  const selected=selectBoundedHiddenExchanges(
    opponent.hand.cards,opponent.deck.cards,limit);
  const report={
    schema:VERSION,actorSeat:seat,tapeDraws:tape.length,
    tapeSha256:digest(tape),sourceRootAtEntry:initial,
    sourceRootUnchanged:false,actorObservationMatched:false,
    opponentHiddenInventoryConserved:false,
    opponentHandCount:opponent.hand.cards.length,
    opponentDeckCount:opponent.deck.cards.length,
    eligibleSingleExchanges:selected.available,
    attemptedSingleExchanges:0,successfulSingleExchanges:0,
    exhaustiveSingleExchangeCoverage:selected.exhaustive,
    failedSingleExchanges:0,actionReversals:0,
    selectedActionChanged:false,contrastExecutable:false,
    baselineReplayStable:false,firstActionReversal:null,
    cases:[],counterfactualAction:null,
    opponentRevealHistoryAuthenticated:false,
    ownerK0K1HistoryAuthenticated:false,
    informationSetLeakQualified:false,
    competitiveGameQualified:false,error:null
  };

  /** @param {object} world Detached State. */
  function assertSourceEquivalent(world){
    assert.ok(world&&typeof world==='object'&&world!==root);
    assert.deepStrictEqual(structuredClone(fingerprint(world)),initial,
      'Detached world differs from the original physical State');
    assert.deepStrictEqual(actorView(world,seat),ownerView,
      'Detached world changed the owner-visible observation');
    const detachedOther=world.players[1-seat];
    assert.notStrictEqual(detachedOther,opponent,
      'Detached world reused original opponent');
    for(const zone of ['hand','deck']){
      assert.notStrictEqual(detachedOther[zone],opponent[zone],
        'Detached world reused an opponent concealed zone');
      assert.notStrictEqual(detachedOther[zone].cards,opponent[zone].cards,
        'Detached world reused a concealed card array');
      for(let j=0;j<opponent[zone].cards.length;j++){
        assert.notStrictEqual(detachedOther[zone].cards[j],
          opponent[zone].cards[j],
          'Detached world reused a physical concealed card');
      }
    }
    assert.deepStrictEqual(hiddenZoneFingerprint(detachedOther),originalPool,
      'Detached world did not preserve opponent concealed inventory');
  }

  try{
    for(const exchange of selected.exchanges){
      const record={
        exchangeKind:exchange.kindPair,
        actionChanged:null,executable:false,
        consumed:null,actorObservationMatched:false,
        opponentHiddenInventoryConserved:false,error:null
      };
      report.attemptedSingleExchanges++;
      try{
        const world=cloneState(root);
        assertSourceEquivalent(world);
        const other=world.players[1-seat];
        const hi=exchange.handIndex,di=exchange.deckIndex;
        const handCard=other.hand.cards[hi],deckCard=other.deck.cards[di];
        assert.notStrictEqual(handCard,deckCard);
        other.hand.cards[hi]=deckCard;
        other.deck.cards[di]=handCard;
        assert.deepStrictEqual(hiddenZoneFingerprint(other),originalPool,
          'Alternate concealed world changed card-instance multiset');
        record.opponentHiddenInventoryConserved=true;
        assert.deepStrictEqual(actorView(world,seat),ownerView,
          'Alternate hidden world changed the owner-visible observation');
        record.actorObservationMatched=true;
        const playback=replayPolicyRandomTape(tape,()=>replayDecision(world));
        record.consumed=playback.consumed;
        const decision=actionSignature(playback.result);
        record.actionChanged=!isDeepStrictEqual(decision,parity.actualAction);
        record.executable=true;
        report.successfulSingleExchanges++;
        if(record.actionChanged){
          report.actionReversals++;
          if(!report.firstActionReversal){
            report.firstActionReversal={
              exchangeKind:exchange.kindPair,counterfactualAction:decision
            };
          }
        }
      }catch(error){
        record.error=String(error?.message??error);
        report.failedSingleExchanges++;
      }
      report.cases.push(record);
    }
    // A/B/.../A catches persistent policy-global state that survives fresh
    // worlds. A native tape consumed on a different candidate path is a veto.
    const baseline=cloneState(root);
    assertSourceEquivalent(baseline);
    const replay=replayPolicyRandomTape(tape,()=>replayDecision(baseline));
    report.baselineReplayStable=isDeepStrictEqual(
      actionSignature(replay.result),parity.actualAction);
    if(!report.baselineReplayStable){
      report.error='Original-world action drifted after counterfactuals';
    }
    report.actorObservationMatched=report.cases.every(x=>
      x.actorObservationMatched===true);
    report.opponentHiddenInventoryConserved=report.cases.every(x=>
      x.opponentHiddenInventoryConserved===true);
  }catch(error){
    report.error=String(error?.message??error);
  }finally{
    report.sourceRootAtExit=structuredClone(fingerprint(root));
    report.sourceRootUnchanged=isDeepStrictEqual(
      initial,report.sourceRootAtExit);
    if(!report.sourceRootUnchanged){
      report.error='Native hidden-world diagnostic mutated authentic source State';
    }
    report.contrastExecutable=report.sourceRootUnchanged&&
      report.baselineReplayStable&&
      report.successfulSingleExchanges>0&&
      report.failedSingleExchanges===0&&report.error===null;
    report.selectedActionChanged=report.contrastExecutable&&
      report.actionReversals>0;
    report.counterfactualAction=report.contrastExecutable?
      report.firstActionReversal?.counterfactualAction??null:null;
  }
  return report;
}

module.exports={VERSION,validateNativeRoot,
  compareNativeOpponentHiddenHandBounded};
