'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,executeOne,writeRegisteredReport}=
 require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');
const {sourceSummary}=
 require('./agent8-rank13-treasure-native-transport.cjs');
const {ownerApexPublicGates}=
 require('./agent8-rank13-apex-public-conjunction.cjs');

const VERSION='agent8-original-rank13-phantom-dive-native-copied-choice-v1';
const FILE=path.resolve(__dirname,
 '../../results/aichi-2026/registrations/agent8-rank13-phantom-dive-copy-counterfactual-20261103.json');

function summarize(arm,seat){
 const base=sourceSummary(arm,seat);
 const roots=arm.sourceOwnerPayloadAccessRoots??[];
 const gates=roots.map(ownerApexPublicGates);
 const allValid=gates.filter(g=>g.allThreeNecessaryPublicGates);
 const paidSourceDde=(arm.publicAcceptedActions??[])
   .filter(x=>x.seat===seat&&x.action==='PlayCardAction'&&
     x.card==='Double Dragon Energy');
 return {...base,
   sourceDdeAccepted:paidSourceDde.length,
   sourceDdeActions:paidSourceDde,
   sourceDdeRootChoices:arm.root?.ddeIntentsSample??[],
   sourceApexRootChoices:arm.root?.apexRootIntentsSample??[],
   sourceApexNativeReceipts:arm.root?.apexNativeAcceptances??[],
   settledPublicAttackTransitions:arm.publicAttackTransitions??[],
   nativeDdeRootReceipts:arm.root?.ddeNativeAcceptanceSample??[],
   allThreePublicNecessaryGatesAny:allValid.length>0,
   allThreePublicNecessaryGateTurns:[...new Set(allValid.map(g=>g.turn))],
   publicGatesAtSourceApexDeclarations:gates.filter(g=>
     (arm.sourceAttackDetails??[]).some(a=>
       a.attack==='Apex Dragon'&&a.turn===g.turn)),
   publicGates:gates,
   noFullPaperAttackCertificate:true};
}

function main(){
 initializeCards();
 const protocol=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert.equal(protocol.schema,
   'agent8-rank13-phantom-dive-native-copy-choice-retrospective-v1');
 const {registered,byRank}=registration();
 assert.deepEqual(protocol.preselectedPreviouslyObservedSeedGroups,registered.trialMatrix);
 assert.equal(protocol.enginePin,registered.enginePin);
 const rows=[];
 for(const trial of protocol.preselectedPreviouslyObservedSeedGroups){
   const control=executeOne(trial,byRank,false,true,true,true,true,true,false);
   const treatment=executeOne(trial,byRank,false,true,true,true,true,true,true);
   const returned=control.status==='native-returned'&&
     treatment.status==='native-returned';
   const paired=returned&&
     control.sourceDealSha256!==null&&
     control.sourceDealSha256===treatment.sourceDealSha256&&
     control.fullPhysicalDealSha256!==null&&
     control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256;
   const ctrl=control.publicAcceptedActions??[],
     trt=treatment.publicAcceptedActions??[];
   const first=Array.from({length:Math.max(ctrl.length,trt.length)},(_,i)=>i)
     .find(i=>JSON.stringify(ctrl[i]??null)!==
       JSON.stringify(trt[i]??null));
   rows.push({trial,returned,paired,
     firstAcceptedPublicDivergence:first===undefined?null:{
       index:first,control:ctrl[first]??null,treatment:trt[first]??null},
     summaries:{control:summarize(control,trial.sourceSeat),
       treatment:summarize(treatment,trial.sourceSeat)},
     nativeArms:{control,treatment},competitiveGames:0});
 }
 return {schema:VERSION,
   frozenRegistration:
     'results/aichi-2026/registrations/agent8-rank13-phantom-dive-copy-counterfactual-20261103.json',
   sourceRank:13,opponentRank:1,enginePin:protocol.enginePin,
   attempts:rows.length*2,returnedPairs:rows.filter(r=>r.returned).length,
   exactPhysicalPairs:rows.filter(r=>r.paired).length,
   intervention:'Source-only genuine native offered Phantom Dive choice versus generic first-offered; both use Treasure, DDE and public-gated Apex',
   rows,competitiveGames:0,
   caveat:'Mechanics-only retrospective, previously seen seeds, 160 action cap, incomplete bot decision policies, no complete paper or competitive match certification.'};
}
if(require.main===module){
 const report=main(),name=process.env.AGENT8_PHANTOM_CHOICE_JSON;
 if(name)writeRegisteredReport(report,name);
 console.log('AGENT8_PHANTOM_CHOICE_NATIVE_SUMMARY',JSON.stringify({
   attempts:report.attempts,returnedPairs:report.returnedPairs,
   exactPhysicalPairs:report.exactPhysicalPairs,
   rows:report.rows.map(x=>({seed:x.trial.seed,seat:x.trial.sourceSeat,
     controlDde:x.summaries.control.sourceDdeAccepted,
     treatmentDde:x.summaries.treatment.sourceDdeAccepted,
     controlApex:x.summaries.control.sourceApexDeclarations,
     treatmentApex:x.summaries.treatment.sourceApexDeclarations,
     treatmentCopiedSelections:x.summaries.treatment.sourceNativeCopiedChoices.length,
     treatmentAllPublicGates:x.summaries.treatment.allThreePublicNecessaryGatesAny
   }))}));
 if(!name)process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,summarize,main};
