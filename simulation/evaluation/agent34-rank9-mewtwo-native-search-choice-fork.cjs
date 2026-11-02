'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {run}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {withOwnerLastBenchReadOnlyAudit,ownerZoneCounts,CORE,TARGET}=
  require('./agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

const VERSION='agent34-original-rank9-mewtwo-native-search-choice-retro-v1';
const TARGET_TURNS=new Set([1,23]);

/**
 * An explicit developer-only alternative prompt choice. It changes a single
 * original native Store prompt after the ordinary owner bot has proposed its
 * Duskull selection; it must not be represented as autonomous policy play.
 * The alternative card is always taken from the *acting owner's* deck during
 * their existing legal search prompt and validated by the pinned Prompt.
 *
 * @template T
 * @param {()=>T} execute Identical frozen original-source native runner.
 * @param {{targetTurn:1|23,Store?:Function}} config
 * @returns {{result:T,audit:object}}
 */
function withOwnerSearchAlternative(execute,config){
  assert.equal(typeof execute,'function');
  assert.ok(TARGET_TURNS.has(config.targetTurn));
  const NativeStore=config.Store??Store;
  const descriptor=Object.getOwnPropertyDescriptor(NativeStore.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const genuine=new WeakMap();
  let rootStores=0;
  const events=[];
  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!genuine.has(this)){
      genuine.set(this,{run:++rootStores,dispatches:0});
    }
    const live=genuine.get(this);
    if(!live)return descriptor.value.apply(this,[action,...args]);
    const ordinal=++live.dispatches;
    const state=this.state;
    const prompt=action?.constructor?.name==='ResolvePromptAction'?
      state?.prompts?.find(p=>p.result===undefined&&p.id===action.id):null;
    const seat=prompt?state.players.findIndex(p=>p.id===prompt.playerId):-1;
    const owner=state.players?.[seat];
    const chosen=Array.isArray(action?.result)?
      action.result.map(c=>c?.fullName??null):[];
    const potential=seat===0&&state.turn===config.targetTurn&&
      chosen.length===1&&chosen[0]===TARGET&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.cards===owner?.deck;
    if(!potential)return descriptor.value.apply(this,[action,...args]);

    const candidate=owner.deck.cards.find(c=>c.fullName===CORE);
    const before=ownerZoneCounts(owner);
    const allowed=!!candidate&&prompt.validate([candidate]);
    const event={
      storeRunIndex:live.run,originalDispatchOrdinal:ordinal,
      globalTurn:state.turn,ownerSeat:seat,
      pendingPromptId:prompt.id,pendingPromptClass:prompt.constructor.name,
      pendingPromptMessage:prompt.message,
      selectedByUnmodifiedBot:chosen,
      physicallyDispatched:allowed?[CORE]:chosen,
      alternativeNativeValidated:allowed,
      originalOwnerCoreLocations:before,
      ownerDeckSearch:true,
      exactOriginalSourceListUnmodified:true,
      exactFrozenCandidateSixtyUnmodified:true,
      developerCounterfactualNotOwnerAutonomous:true
    };
    if(!allowed){
      event.nativeApplied=false;
      events.push(event);
      return descriptor.value.apply(this,[action,...args]);
    }
    const replacement=new action.constructor(action.id,[candidate],action.log);
    try{
      const result=descriptor.value.apply(this,[replacement,...args]);
      const after=ownerZoneCounts(this.state.players[seat]);
      event.nativeApplied=true;
      event.ownerAfterNativePrompt=after;
      event.confirmedDeckToHand=after.deck===before.deck-1&&
        after.hand===before.hand+1&&after.total===before.total;
      event.confirmedDeckToBench=after.deck===before.deck-1&&
        after.bench===before.bench+1&&after.total===before.total;
      event.confirmedDeckToOwnerZone=event.confirmedDeckToHand||
        event.confirmedDeckToBench;
      events.push(event);
      return result;
    }catch(error){
      event.nativeApplied=false;
      event.nativeDispatchError=String(error?.message??error);
      events.push(event);
      throw error;
    }
  }
  Object.defineProperty(NativeStore.prototype,'dispatch',
    {...descriptor,value:dispatched});
  try{
    const result=execute();
    return {result,audit:{
      schema:VERSION,targetTurn:config.targetTurn,
      genuineRootStores:rootStores,events,
      opportunityCount:events.length,
      nativeReplacementCount:events.filter(e=>e.nativeApplied).length,
      legalPhysicalTransfers:events.filter(e=>e.confirmedDeckToOwnerZone).length,
      competitiveQualifiedGames:0,
      cannotInterpretAsAutonomousPolicy:true
    }};
  }finally{
    assert.strictEqual(NativeStore.prototype.dispatch,dispatched);
    Object.defineProperty(NativeStore.prototype,'dispatch',descriptor);
  }
}

/** @param {object} row Real matched native trial row. */
function conciseRow(row){
  return {
    id:row.trial?.id??null,
    candidateId:row.trial?.candidateId??null,
    originalRank:row.trial?.rank??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    actions:row.actionCount??null,
    finished:row.finished??null,
    endReason:row.endReason??null,
    nativeWinner:row.winner??null,
    nativeFinalPrizes:row.finalPrizes??null,
    status:row.status??null,
    engineError:row.error??null
  };
}

/**
 * Actual same-source four-arm retrospective A/B with distinct intervention
 * turn, no changed deck, random seed, policy profile, or original card pool.
 * Original bot decisions after the alteration can change organically.
 */
function main(){
  const baseline=withOwnerLastBenchReadOnlyAudit(run);
  const bRows=(baseline.result.rows??[]).map(conciseRow);
  const treatments=[];
  for(const targetTurn of [1,23]){
    const treated=withOwnerLastBenchReadOnlyAudit(()=>
      withOwnerSearchAlternative(run,{targetTurn}));
    const wrapped=treated.result;
    const rows=(wrapped.result.rows??[]).map(conciseRow);
    const paired=bRows.map((row,index)=>{
      const counterpart=rows.find(r=>r.id===row.id);
      return {
        trialId:row.id,index,
        found:Boolean(counterpart),
        exactSourceDeal:!!row.sourceDealFingerprint&&
          row.sourceDealFingerprint===counterpart?.sourceDealFingerprint,
        exactFullPhysicalDeal:!!row.fullPhysicalDealFingerprint&&
          row.fullPhysicalDealFingerprint===
            counterpart?.fullPhysicalDealFingerprint,
        baseStatus:row.status,treatmentStatus:counterpart?.status??null,
        baselineNativeWinner:row.nativeWinner,
        treatmentNativeWinner:counterpart?.nativeWinner??null,
        baselinePrizes:row.nativeFinalPrizes,
        treatmentPrizes:counterpart?.nativeFinalPrizes??null,
        baselineRootLedger:row.rootActionLedgerSha256,
        treatmentRootLedger:counterpart?.rootActionLedgerSha256??null
      };
    });
    treatments.push({targetTurn,choiceAudit:wrapped.audit,
      ownerAfterActionAudit:treated.audit,rows,paired,
      allFourOriginalDealsMatched:paired.length===4&&
        paired.every(row=>row.exactSourceDeal&&row.exactFullPhysicalDeal)});
  }
  return {
    schema:VERSION,originalSourceRank:9,
    pinnedEngine:baseline.result.enginePin,
    originalReference:baseline.result.version,
    researchRevision:process.env.GITHUB_SHA??null,
    baseline:{rows:bRows,ownerAudit:baseline.audit},
    treatments,unchangedRegisteredTrials:4,
    developerRetrospective:true,actorPolicyAutonomyCertified:false,
    paperEffectsCertified:false,officialClockCertified:false,
    competitiveQualifiedGames:0,
    scope:'Replace one actual owner ChooseCardsPrompt response with a native-prompt-validated alternative, replay each original fixed 60 and physical seed, retain matching source-deal and failed-attempt diagnostics. This is a developer-only causal fork, not a claimed bot decision or competitive win.'
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,TARGET_TURNS,withOwnerSearchAlternative,conciseRow,main};
