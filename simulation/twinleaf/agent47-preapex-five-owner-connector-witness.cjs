'use strict';

const assert=require('node:assert/strict');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {chooseActorHandDiscard,withActorHandDiscard}=
  require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
  require('./agent47-minimum-attach-energy-hook.cjs');
const {inspectFutureApexDiscard,DRAGONS}=
  require('./agent47-preapex-payload-opportunity.cjs');

const CASES=[
 {opponentRank:1,seed:1847000101,sourceSeat:1,expectedOptions:2},
 {opponentRank:1,seed:1847000105,sourceSeat:1,expectedOptions:1},
 {opponentRank:11,seed:1847000101,sourceSeat:1,expectedOptions:1},
 {opponentRank:11,seed:1847000104,sourceSeat:0,expectedOptions:1},
 {opponentRank:11,seed:1847000106,sourceSeat:0,expectedOptions:1}
];

/**
 * Retrospective 5-case provenance follow-up after the 24-cell actor-only
 * census found exactly 6 legal pre-Apex Dragon-discard alternatives.
 * Captures *only actual actor-owned prompt printing menus* and public
 * root initiators; no opponent hidden cards or deck/Prize peeking.
 */
function runOne(c,byRank){
 const source=byRank.get(20).cardIds,other=byRank.get(c.opponentRank).cardIds;
 const observed=[];
 function choose(input){
  const baseline=chooseActorHandDiscard(input),cls=inspectFutureApexDiscard(input);
  if(cls.opportunity&&input.actor.actorSeat===c.sourceSeat){
   const alt=input.prompt.menu.filter(names=>
    names.some(name=>DRAGONS.has(name))&&
    JSON.stringify(names)!==JSON.stringify(baseline.printings));
   observed.push({
    actorSeat:input.actor.actorSeat,turn:input.actor.globalTurn,
    promptId:input.prompt.id,discardCount:input.prompt.requiredCount,
    baseline:[...baseline.printings],
    legalAlternates:alt.map(row=>[...row]),
    active:input.actor.ownPublic.active?.printing??null,
    bench:input.actor.ownPublic.bench.map(p=>p?.printing??null),
    publicDiscard:[...input.actor.ownPublic.discard],
    soleCopyAlternative:cls.soleCopyAlternative
   });
  }
  return baseline;
 }
 const request={
  deckA:c.sourceSeat===0?source:other,
  deckB:c.sourceSeat===1?source:other,
  seed:c.seed,maxActions:160,
  doubleDragonRecovery:true,strictPromptValidation:true,
  isolatePolicyRandomness:true,captureDecisionTrace:true,
  captureInitialSourceDealFingerprintSeat:c.sourceSeat,
  captureInitialFullPhysicalDeal:true,
  label:'agent47-actor-only-preapex-connector-ancestry-'+c.seed+'-'+c.sourceSeat+'-'+c.opponentRank
 };
 const corrected=withMinimumAttachEnergySelection(()=>
  withActorHandDiscard(()=>runMatch(request),{choose},{
   apexPayloadDiscard:false
  }));
 const game=corrected.result.result;
 assert.equal(observed.length,c.expectedOptions,
  'Expected exact six original-source option decisions must reproduce');
 for(const obs of observed){
  const roots=game.rootActionLedger.filter(row=>
   row.action==='ResolvePromptAction'&&
   row.pendingPrompt==='ChooseCardsPrompt'&&
   row.playerSlot===obs.actorSeat&&row.turnBefore===obs.turn);
  const initiators=[...new Map(roots.map(row=>{
   const root=game.rootActionLedger.find(item=>
    item.actionOrdinal===row.initiatingRootActionOrdinal);
   return [row.initiatingRootActionOrdinal,root??null];
  })).values()];
  obs.nativePromptRoots=roots;
  obs.nativeInitiatingRoots=initiators;
  obs.rootAttributionUnambiguous=roots.length===1&&initiators.length===1;
 }
 return {case:c,sourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
  nativeActions:game.actions,
  observedOptions:observed,
  nativeRootAttributionCoverage:observed.filter(o=>o.rootAttributionUnambiguous).length,
  competitiveQualifiedGame:false};
}
function main(){
 initializeCards();
 const {byRank}=registration();
 const results=CASES.map(c=>runOne(c,byRank));
 assert.equal(results.reduce((n,row)=>n+row.observedOptions.length,0),6);
 return{
  schema:'agent47-natural-source20-preapex-five-case-own-discard-connector-witness-v1',
  originalSourceRank:20,pinnedTwinleaf:
   'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  fiveCasesSelectedAfterFull24Census:true,
  originalFull24SampleReport:
   'agent47-source20-preapex-owner-native-24.md',
  cases:results,competitiveQualifiedGames:0,
  caveat:'These five cases were chosen retrospectively because their actor menus offered six legal earlier-than-ready Dragon discard alternatives. Printed sole-copy cards can be critical, and the native resolver provenance is observational. No alternate action was played and no game win effect inferred.'
 };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={CASES,runOne,main};
