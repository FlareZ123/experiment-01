'use strict';

const {runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withOwnerTreasurePromptContinuation}=
  require('../twinleaf/agent49-mysterious-treasure-prompt-continuation.cjs');

const VERSION='agent49-original-source10-vs1-treasure-two-seat-compare-v1';

/**
 * Observe only a bounded native match summary. The experiment uses source
 * rank10 Regidrago and source rank1 Shadow Rider Calyrex, each unchanged
 * except separately logged existing native print proxy mappings. Neither
 * outcome is interpreted as a competitive-qualified matchup.
 * @param {string[]} regidrago
 * @param {string[]} calyrex
 * @param {0|1} sourceSeat
 * @param {boolean} treasureEnabled
 * @returns {object}
 */
function runOne(regidrago,calyrex,sourceSeat,treasureEnabled){
  const opts={
    deckA:sourceSeat===0?regidrago:calyrex,
    deckB:sourceSeat===0?calyrex:regidrago,
    seed:20261030,
    label:'agent49-source10-regidrago-vs-source1-calyrex',
    maxActions:160,
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    captureRootActionLedger:true
  };
  const wrapped=withActorOnlyRootPolicy(()=>
    withOwnerTreasurePromptContinuation(()=>{
      try{
        const result=runMatch(opts);
        return {status:'returned',metadata:{
          actions:result.actions,turns:result.turns,
          finished:result.finished,endReason:result.endReason,
          winner:result.winner,
          attacks:result.attackTrace?.length??0,
          perSeatActions:result.actionsBySeat,
          actionLedgerEntries:result.rootActionLedger?.length??0
        }};
      }catch(error){
        return {status:'aborted',error:String(error?.message??error)};
      }
    }),
    {mysteriousTreasureRoot:treasureEnabled});
  return {sourceSeat,treasureEnabled,
    game:wrapped.result.result,
    actorRoot:{
      selected:wrapped.audit.selectedRootDecisions,
      accepted:wrapped.audit.acceptedActorRoots,
      rejected:wrapped.audit.rejectedActorRoots,
      intents:wrapped.audit.typedIntentCounts,
      firstDecisions:wrapped.audit.ownerRootIntents?.slice(0,12)
    },
    treasure:{
      acceptedNativeItemRoots:wrapped.result.audit.observedAcceptedItemRoots,
      plannedPublicOwnerRoots:wrapped.result.audit.plannedSourceSafeRoots,
      ownerCosts:wrapped.result.audit.costPromptAccepted,
      ownerDeckSearches:wrapped.result.audit.searchPromptAccepted,
      physicalCostDiscards:wrapped.result.audit.physicalCostDiscards,
      physicalTargets:wrapped.result.audit.physicalTargetRetrievals,
      completedPhysicalChains:wrapped.result.audit.completedPhysicalChains,
      nativeItemsFullySettled:wrapped.result.audit.nativeItemFinalized,
      displayPromptsPending:wrapped.result.audit.postSearchDisplayPending,
      errors:wrapped.result.audit.failedOrRejectedReplies,
      receipts:wrapped.result.audit.receipts
    }};
}

function main(){
  const plan=planAichi(1,{
    requireFrozenSourceBaseline:true,
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const drago=plan.opponents.find(x=>x.rank===10);
  const shadow=plan.opponents.find(x=>x.rank===1);
  if(drago.status!=='ready'||shadow.status!=='ready')
    throw Error('Original source deck unresolved');
  const rows=[];
  for(const sourceSeat of [0,1]){
    for(const treasureEnabled of [false,true]){
      rows.push(runOne(drago.cards,shadow.cards,sourceSeat,treasureEnabled));
    }
  }
  const report={schema:VERSION,enginePin:plan.engineRevision,
    originalDecks:[{rank:10,archetype:'Regidrago',
      substitutions:drago.substitutions},
      {rank:1,archetype:'Shadow Rider Calyrex',
        substitutions:shadow.substitutions}],
    seed:20261030,policyPerSeat:'one identical actor-only root + prompt adapter',
    policyDevelopmentOnly:true,
    originalSource60s:true,
    admittedPrintingProxies:true,
    qualifiedCompetitiveGames:0,
    rows,
    caveat:'Four same-seed bounded feasibility games, only 2 source ranks, no reliable deck strength, no opponent-policy competence, no paper-clock or entire-field coverage.'};
  process.stdout.write('AGENT49_ORIGINAL_TREASURE_MATCHES '+
    JSON.stringify(report)+'\n');
  return report;
}

if(require.main===module)main();
module.exports={VERSION,runOne,main};
