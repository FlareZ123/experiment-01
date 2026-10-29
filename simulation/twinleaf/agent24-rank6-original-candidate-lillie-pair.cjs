'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {plannedTrials}=require('../evaluation/agent41-prospective-canonical-scout.cjs');
const {withCanonicalActorOnlyPolicy}=require('../evaluation/agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=require('./agent34-actor-only-root-policy.cjs');
const {withActorOnlyLillieAfterPass}=require('./agent12-actor-only-lillie-after-pass.cjs');
const {withNativeLillieDrawSettlementAudit}=require('./agent24-native-lillie-settlement-audit.cjs');
const {withActorOnlyChoosePokemon}=require('./agent8-actor-only-choose-pokemon.cjs');
const {chooseChargedOwnPromotion}=require('./agent1-charged-promotion-choice.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const REG='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const ORIGINAL={'6:2:A:champion-reference':'646d18531504d91435f4c743bd2460c2659a6cee4a7203b286996683d1985e8b',
 '6:2:A:new-moon-lockbreaker-v1':'d265f791ba8a6e352238bb02f9a48e23a7ab16af0549f2684689b2da31971f1c'};
function main(){
 const plan=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../..',REG),'utf8'));
 const trials=plannedTrials(plan).filter(t=>t.rank===6&&t.repeat===2&&t.candidateSlot==='A');
 assert.equal(trials.length,2);
 const options={...plan.frozenRunOptions,registeredTrials:trials,registeredFrameName:REG};
 const base=runDevelopment(options);
 for(const r of base.rows)assert.equal(r.rootActionLedgerSha256,ORIGINAL[r.trial.id]);
 let lillie=null;
 const native=withNativeLillieDrawSettlementAudit(()=>withCanonicalActorOnlyPolicy(
   ()=>runDevelopment({...options,actorOnlyComposition:false,actorChargedPromotion:false}),
   {root:work=>withActorOnlyRootPolicy(()=>{
      const selected=withActorOnlyLillieAfterPass(work,{observe:(state,seat)=>{
        const view=actorObservation(state,seat);
        return seat===0?view:{...view,ownHand:[]};
      }});
      lillie=selected.audit;return selected.result;
    }),pokemon:work=>withActorOnlyChoosePokemon(work,{choose:chooseChargedOwnPromotion})},
   {ownerSingleSearch:true,genericFallbackAttribution:true,actorHandDiscard:true,actorChoosePokemon:true}
 ));
 const treated=native.result.result;
 const slim=r=>({id:r.trial.id,seat:r.candidateSeat,starter:r.actualStarterSeat,
   sourceDeal:r.sourceDealFingerprint,actions:r.actionCount,finished:r.finished,
   winner:r.winner,endReason:r.endReason,rootSha:r.rootActionLedgerSha256,
   supporterRoots:r.rootActionLedger.filter(e=>e.action==='PlayCardAction'&&
     String(e.card).startsWith("Lillie's Determination")).map(e=>({ordinal:e.actionOrdinal,seat:e.playerSlot,turn:e.turnBefore}))});
 const before=base.rows.map(slim),after=treated.rows.map(slim);
 const report={schema:'agent24-posthoc-rank6-original-sourcefirst-candidate-lillie-v1',
   inputRegistration:REG,originalSixtiesPreserved:true,originalSeed:trials[0].seed,
   baselineOriginalRootHashesVerified:true,knownHeldLillieHandWasSelectedPosthoc:true,
   before,after,lillie,nativeSettlement:native.audit,
   actorAudit:native.result.audit.version,competitiveQualifiedGames:0,
   caveat:'Posthoc selected exact historical deal. Source-side Lillie disabled only for this controlled candidate intervention. No independent win-rate inference.'};
 console.log(JSON.stringify(report,null,2));
 for(const r of treated.rows)assert.equal(r.sourceDealFingerprint,base.rows.find(b=>b.trial.id===r.trial.id).sourceDealFingerprint);
 assert.ok(lillie?.rootEvents?.some(e=>e.seat===0&&e.StoreAccepted),
   'At least one genuine candidate Lillie must be Store accepted');
 assert.equal(native.audit.printedDrawConfirmed,native.audit.supportRoots);
 return report;
}
if(require.main===module)main();
module.exports={main};
