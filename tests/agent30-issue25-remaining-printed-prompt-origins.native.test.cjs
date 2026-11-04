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
const {withPrintedAttackChoiceProvenance}=
  require('../simulation/twinleaf/agent30-attack-printed-choice-provenance.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

test('original registered ATTACK prompts bind to exact printed source mechanics',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,observer=null,future=null,guard=null,blocked=null;
  try{
    const out=quarantine(()=>withGoFirstChoice([false,false],()=>
      withOwnerStartingBasicChoice(()=>withOwnerPublicAcknowledgements(()=>
        withOwnerMandatoryShowCards(()=>{
          const seen=withPrintedAttackChoiceProvenance(()=>{
            const afterFuture=withOwnerFutureSightNeutralOrder(()=>{
              developed=runDevelopment({
                actorOnlyComposition:true,nativeRootActionLimit:48});
              return developed;
            });
            future=afterFuture.audit;
            return afterFuture.result;
          });
          observer=seen.audit;
          return seen.result;
        }).result).result).result).result,{maxRecords:16});
    guard=out.audit;
  }catch(error){
    blocked=error;
    guard=error.nativeRawStateFallbackQuarantine??null;
  }
  const rows=developed?.rows??[];
  console.log('AGENT30_ISSUE25_TWO_CHOICE_PRINTED_ORIGINS',
    JSON.stringify({
      originalArms:registered.map(x=>x.id),
      returnedArms:rows.map(x=>({
        id:x.trial?.id??x.id??null,status:x.status??'returned',
        cap:x.rootActionCount??null,turn:x.turns??null
      })),
      source:observer,
      futureSight:future?{
        marked:future.markedOrderPrompts,
        accepted:future.ownerPromptSelections}:null,
      quarantine:guard?{
        blocked:guard.rawStateFallbackCalls,
        attemptedNativeRawDecoder:guard.originalNativeDecoderExecuted,
        records:guard.records}:null,
      blockedCode:blocked?.code??null,
      competitivelyQualifiedGames:0
    }));
  assert.equal(rows.length,4);
  assert.ok(observer);
  assert.ok(guard);
  assert.equal(guard.originalNativeDecoderExecuted,false);
  assert.equal(observer.cardIdentitiesInspected,false);
  assert.equal(observer.decisionActionsIssuedByObserver,0);
  const observed=observer.blockedPromptOriginEvents;
  assert.ok(Array.isArray(observed));
  // This positive source-origin hypothesis is deliberately falsifiable:
  // if copied attacks do not enter the same native exact-print reducer,
  // source marks will be absent even with a matching prompt envelope.
  assert.ok(observed.some(e=>
    e.source==='Trevenant & Dusknoir-GX SMP'&&
    e.attack==='Night Watch'&&
    e.zone==='opponent-private-hand'&&
    e.actualActorSeat===0&&e.actualPromptTurn===5));
  assert.ok(observed.some(e=>
    e.source==='Girafarig LOT'&&e.attack==='Get Lost'&&
    e.zone==='opponent-public-discard'&&
    e.actualActorSeat===1&&e.actualPromptTurn===3));
  assert.ok(future?.ownerPromptSelections>=1);
  if(guard.rawStateFallbackCalls>0)
    assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
