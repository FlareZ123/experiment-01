'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {digest,replayPolicyRandomTape}=
  require('./native-policy-random-tape.cjs');
const {selectBoundedHiddenExchanges}=
  require('./agent23-bounded-hidden-world-scan.cjs');
const {selectBoundedDoubleExchanges}=
  require('./agent23-bounded-double-exchanges.cjs');
const {hiddenZoneFingerprint}=
  require('./opponent-hidden-live-root-probe.cjs');

const VERSION='agent23-native-tape-bounded-opponent-hand-v1';
const DOUBLE_VERSION='agent23-native-tape-bounded-double-exchange-v1';

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
 * @param {{limit?:number,swapSize?:1|2}} [options]
 * @returns {object}
 */
function compareNativeOpponentHiddenHandBounded(args,{limit=16,swapSize=1}={}){
  assert.ok(swapSize===1||swapSize===2);
  const {initial,ownerView}=validateNativeRoot(args);
  const {parity,root,seat,tape,cloneState,replayDecision,
    actionSignature,fingerprint,actorView}=args;
  const opponent=root.players[1-seat];
  const originalPool=hiddenZoneFingerprint(opponent);
  const selected=(swapSize===2?selectBoundedDoubleExchanges:
    selectBoundedHiddenExchanges)(opponent.hand.cards,opponent.deck.cards,limit);
  const report={
    schema:swapSize===2?DOUBLE_VERSION:VERSION,
    swapSize,actorSeat:seat,tapeDraws:tape.length,
    tapeSha256:digest(tape),sourceRootAtEntry:initial,
    sourceRootUnchanged:false,actorObservationMatched:false,
    opponentHiddenInventoryConserved:false,
    opponentHandCount:opponent.hand.cards.length,
    opponentDeckCount:opponent.deck.cards.length,
    eligibleExchangePaths:selected.available,
    attemptedExchangePaths:0,successfulExchangePaths:0,
    failedExchangePaths:0,
    exhaustiveExchangePathCoverage:selected.exhaustive,
    eligibleDistinctOpponentHandCompositions:swapSize===1?
      selected.eligibleDistinctHandCompositions:null,
    testedDistinctOpponentHandCompositions:swapSize===1?
      selected.testedDistinctHandCompositions:null,
    eligibleSingleExchanges:swapSize===1?selected.available:null,
    attemptedSingleExchanges:swapSize===1?0:null,
    successfulSingleExchanges:swapSize===1?0:null,
    failedSingleExchanges:swapSize===1?0:null,
    exhaustiveSingleExchangeCoverage:swapSize===1?selected.exhaustive:null,
    eligibleDisjointDoubleExchangePaths:swapSize===2?selected.available:null,
    attemptedDisjointDoubleExchangePaths:swapSize===2?0:null,
    successfulDisjointDoubleExchangePaths:swapSize===2?0:null,
    failedDisjointDoubleExchangePaths:swapSize===2?0:null,
    exhaustiveDisjointDoubleExchangePathCoverage:
      swapSize===2?selected.exhaustive:null,
    actionReversals:0,
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
      const kind=swapSize===2?exchange.exchangeKind:exchange.kindPair;
      const record={
        exchangeKind:kind,
        actionChanged:null,executable:false,
        consumed:null,actorObservationMatched:false,
        opponentHiddenInventoryConserved:false,error:null
      };
      report.attemptedExchangePaths++;
      if(swapSize===1)report.attemptedSingleExchanges++;
      else report.attemptedDisjointDoubleExchangePaths++;
      try{
        const world=cloneState(root);
        assertSourceEquivalent(world);
        const other=world.players[1-seat];
        const swaps=swapSize===2?exchange.swaps:[exchange];
        assert.equal(swaps.length,swapSize);
        assert.equal(new Set(swaps.map(x=>x.handIndex)).size,swapSize);
        assert.equal(new Set(swaps.map(x=>x.deckIndex)).size,swapSize);
        for(const swap of swaps){
          const hi=swap.handIndex,di=swap.deckIndex;
          const handCard=other.hand.cards[hi],deckCard=other.deck.cards[di];
          assert.notStrictEqual(handCard,deckCard);
          other.hand.cards[hi]=deckCard;
          other.deck.cards[di]=handCard;
        }
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
        report.successfulExchangePaths++;
        if(swapSize===1)report.successfulSingleExchanges++;
        else report.successfulDisjointDoubleExchangePaths++;
        if(record.actionChanged){
          report.actionReversals++;
          if(!report.firstActionReversal){
            report.firstActionReversal={
              exchangeKind:kind,counterfactualAction:decision
            };
          }
        }
      }catch(error){
        record.error=String(error?.message??error);
        report.failedExchangePaths++;
        if(swapSize===1)report.failedSingleExchanges++;
        else report.failedDisjointDoubleExchangePaths++;
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
      report.successfulExchangePaths>0&&
      report.failedExchangePaths===0&&report.error===null;
    report.selectedActionChanged=report.contrastExecutable&&
      report.actionReversals>0;
    report.counterfactualAction=report.contrastExecutable?
      report.firstActionReversal?.counterfactualAction??null:null;
  }
  return report;
}

module.exports={VERSION,validateNativeRoot,
  compareNativeOpponentHiddenHandBounded};
