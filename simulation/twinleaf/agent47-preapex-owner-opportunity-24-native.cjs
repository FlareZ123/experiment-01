'use strict';

const assert=require('node:assert/strict');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {chooseActorHandDiscard,withActorHandDiscard}=
 require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
 require('./agent47-minimum-attach-energy-hook.cjs');
const {inspectFutureApexDiscard}=
 require('./agent47-preapex-payload-opportunity.cjs');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * All original 24 source-fixed normal bot deals, one arm each, no policy
 * action changed. Read-only actor-owned, public-state-limited classifier
 * observes legal Dragon payload discard alternatives *before* Apex is paid.
 * Reuses symmetric narrow prompt correction to avoid known native aborts.
 */
function execute(trial,byRank){
 const source=byRank.get(20).cardIds,other=byRank.get(trial.opponentRank).cardIds;
 const observations=[];
 const choose=input=>{
  const p=inspectFutureApexDiscard(input);
  observations.push({
   seat:input.actor.actorSeat,globalTurn:input.actor.globalTurn,
   reason:p.reason,opportunity:p.opportunity,
   activeVstar:p.activeVstar,regidragoOnBoard:p.regidragoOnBoard,
   directlyReady:p.directlyReady,priorPayload:p.priorPayloadInPublicDiscard,
   alternativeMenus:p.alternativeMenus,soleCopyAlternative:p.soleCopyAlternative,
   baselineAlreadyDiscards:p.baselineAlreadyDiscards,
   discardCount:p.requiredDiscardCount
  });
  return chooseActorHandDiscard(input);
 };
 const req={
  deckA:trial.sourceSeat===0?source:other,
  deckB:trial.sourceSeat===1?source:other,
  seed:trial.seed,maxActions:160,
  doubleDragonRecovery:true,strictPromptValidation:true,
  isolatePolicyRandomness:true,
  captureInitialSourceDealFingerprintSeat:trial.sourceSeat,
  captureInitialFullPhysicalDeal:true,
  label:'agent47-pure-future-apex-alternatives-'+trial.id
 };
 try{
  const x=withMinimumAttachEnergySelection(()=>
   withActorHandDiscard(()=>runMatch(req),{choose},{
    apexPayloadDiscard:false
   }));
  const game=x.result.result;
  return{
   status:'native-returned',actions:game.actions,
   gameFinished:game.finished,
   sourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
   fullPhysicalDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
   ownerHandDecisions:x.result.audit.selected,
   minimumRepairProposals:x.audit.proposedCorrections,
   sourceOpportunityCount:observations.filter(o=>
    o.opportunity&&o.seat===trial.sourceSeat).length,
   adversaryOpportunityCount:observations.filter(o=>
    o.opportunity&&o.seat!==trial.sourceSeat).length,
   observations
  };
 }catch(error){
  return {status:'native-aborted',censored:true,
   error:String(error?.stack??error).slice(0,900),
   observations,correctionAudit:error.nativeMinimumAttachEvidence??null};
 }
}
function main(){
 initializeCards();
 const {byRank,trials}=registration();
 assert.equal(trials.length,24);
 const rows=trials.map(trial=>({trial,result:execute(trial,byRank)}));
 const accepted=rows.filter(row=>row.result.status==='native-returned');
 const opportunities=rows.flatMap(row=>
  row.result.observations.filter(o=>o.opportunity).map(o=>({
   sourceTrial:row.trial.id,sourceSeat:row.trial.sourceSeat,...o
  })));
 const reasons={};
 for(const row of rows)for(const obs of row.result.observations)
  reasons[obs.reason]=(reasons[obs.reason]??0)+1;
 return{
  schema:'agent47-original-source20-24-native-early-payload-option-census-v1',
  enginePin:PIN,
  registeredOriginalSourceTrials:24,allTrialRowsRetained:true,
  opponentRanks:[1,11],sourceRank:20,
  registeredSeeds:[1847000101,1847000102,1847000103,
   1847000104,1847000105,1847000106],
  physicalSourceSeats:[0,1],maxActions:160,
  actionsChangedByObserver:false,
  counts:{
   nativeReturned:accepted.length,nativeAborted:rows.length-accepted.length,
   ownerHandDecisions:accepted.reduce((a,row)=>a+row.result.ownerHandDecisions,0),
   originalSourceLegalEarlyPayloadAlternatives:opportunities.filter(o=>
    o.seat===o.sourceSeat).length,
   opponentLegalEarlyPayloadAlternatives:opportunities.filter(o=>
    o.seat!==o.sourceSeat).length,
   gamesWithSourceEarlyPayloadAlternatives:rows.filter(row=>
    row.result.sourceOpportunityCount>0).length,
   reasons
  },opportunities,rows,
  competitiveQualifiedGames:0,
  caveat:'Read-only owner-only legal discard menu observation on retrospective natural-source inputs. Presence of an alternate Dragon discard says nothing about a better future line, card discard desirability, or actual win rate. Engine/policy paper fidelity remains unqualified.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={execute,main};
