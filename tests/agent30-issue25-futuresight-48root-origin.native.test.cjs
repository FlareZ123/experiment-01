'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {developmentTrials,runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerMandatoryShowCards}=
  require('../simulation/twinleaf/agent50-owner-mandatory-showcards.cjs');
const {withOwnerFutureSightNeutralOrder}=
  require('../simulation/twinleaf/agent30-owner-futuresight-neutral-order.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/**
 * Re-run exactly the four published historical Issue25 source/deal arms,
 * one additional opt-in exact Duskull VIV Future Sight prompt handler.
 * The outer quarantine remains active, so new and unrelated unsupported
 * root/prompt choices cannot execute the raw generic bot.
 */
test('source-stamped Future Sight owner ordering reaches actual Store root',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,coin=null,basic=null,acks=null,show=null;
  let future=null,guard=null,blocked=null;
  try{
    const result=quarantine(()=>{
      const g=withGoFirstChoice([false,false],()=>{
        const b=withOwnerStartingBasicChoice(()=>{
          const a=withOwnerPublicAcknowledgements(()=>{
            const s=withOwnerMandatoryShowCards(()=>{
              const f=withOwnerFutureSightNeutralOrder(()=>{
                developed=runDevelopment({
                  actorOnlyComposition:true,
                  nativeRootActionLimit:48
                });
                return developed;
              });
              future=f.audit;
              return f.result;
            });
            show=s.audit;
            return s.result;
          });
          acks=a.audit;
          return a.result;
        });
        basic=b.audit;
        return b.result;
      });
      coin=g.audit;
      return g.result;
    },{maxRecords:16});
    guard=result.audit;
  }catch(error){
    blocked=error;
    guard=error.nativeRawStateFallbackQuarantine??null;
  }

  const rows=developed?.rows??[];
  const diagnostic={
    schema:'agent30-issue25-futuresight-actual-native-source-origin-v1',
    originalRegistered:registered.map(t=>t.id),
    originalAttempts:rows.map(r=>({
      id:r.trial?.id??r.id??null,
      status:r.status??'returned',
      sourceSeat:r.sourceSeat??null,
      candidateSeat:r.candidateSeat??null,
      sourceDealFingerprint:r.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:r.fullPhysicalDealFingerprint??null,
      finished:r.finished??null,
      rootActionCount:r.rootActionCount??null,
      turnCount:r.turns??null,
      competitiveEligible:false
    })),
    futureSight:future,
    quarantine:guard?{
      nativeRawFallbackCalls:guard.rawStateFallbackCalls,
      originalNativeDecoderExecuted:guard.originalNativeDecoderExecuted,
      nextBlockedPrompts:guard.records
    }:null,
    outerCode:blocked?.code??null,
    coinChoices:coin?.choices?.length??null,
    basicProposals:basic?.proposals??null,
    publicWaitAcks:acks?.waitAcks??null,
    ownerShowAcks:show?.accepted??null,
    competitivelyQualifiedGames:0
  };
  console.log('AGENT30_ISSUE25_FUTURE_SIGHT_REAL_ROOT',
    JSON.stringify(diagnostic));

  assert.equal(rows.length,4,'must keep all original registered attempts');
  assert.ok(guard);
  assert.equal(guard.originalNativeDecoderExecuted,false);
  assert.ok(future);
  assert.ok(future.printedReducerInvocations>=1);
  assert.ok(future.markedOrderPrompts>=1);
  assert.ok(future.ownerPromptSelections>=1,
    'source-printed Future Sight real prompt must be owner-resolved');
  assert.ok(future.observedPositions.some(e=>
    e.sourcePrinting==='Duskull VIV'&&e.attack==='Future Sight'));
  assert.ok(future.observedPositions.every(e=>
    [0,1].includes(e.ownerSeat)&&e.revealedCount>=0&&
    e.revealedCount<=4&&e.selectedPermutation.every(
      (x,i)=>x===i)));
  assert.equal(future.cardIdentitiesInspected,false);
  assert.equal(future.ownerVisibleFullStateInspected,false);
  assert.equal(future.competitivelyQualifiedGames,0);
  if(guard.rawStateFallbackCalls>0)assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
