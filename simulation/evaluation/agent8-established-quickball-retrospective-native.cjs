'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,executeOne,writeRegisteredReport}=
 require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');
const {sourceSummary}=require('./agent8-rank13-treasure-native-transport.cjs');
const FILE=path.resolve(__dirname,
 '../../results/aichi-2026/registrations/agent8-established-quickball-retrospective-20261103.json');
const FLAG='AGENT8_ESTABLISHED_QUICKBALL_DEV',COPY='AGENT8_PUBLIC_FLAT_COPY_DEV';
const VERSION='agent8-established-regidrago-quickball-retrospective-native-v1';
function preflight(){
 const p=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert.equal(p.schema,'agent8-established-quickball-retrospective-native-v1');
 assert.equal(p.expectedNativeAttempts,4);
 assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.deepEqual(p.previouslyObservedSourceSeedGroups,[
   {sourceSeat:1,seed:2686109268},{sourceSeat:0,seed:1481213574}
 ]);
 return p;
}
/** @param {object} trial @param {Map<number,object>} byRank @param {boolean} selected */
function runArm(trial,byRank,selected){
 const old=process.env[FLAG],priorCopy=process.env[COPY];
 process.env[COPY]='true';
 if(selected)process.env[FLAG]='true';else delete process.env[FLAG];
 try{return executeOne(trial,byRank,true,true,true,true,true,true,false);}
 finally{
   if(old===undefined)delete process.env[FLAG];else process.env[FLAG]=old;
   if(priorCopy===undefined)delete process.env[COPY];
   else process.env[COPY]=priorCopy;
 }
}
function main(){
 const p=preflight();
 initializeCards();
 const {byRank}=registration(),rows=[];
 for(const trial of p.previouslyObservedSourceSeedGroups){
   const control=runArm(trial,byRank,false);
   const treatment=runArm(trial,byRank,true);
   const returned=control.status==='native-returned'&&
     treatment.status==='native-returned';
   const exact=returned&&control.sourceDealSha256!==null&&
     control.sourceDealSha256===treatment.sourceDealSha256&&
     control.fullPhysicalDealSha256!==null&&
     control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256;
   rows.push({trial,returned,exactPhysicalPair:exact,
     summaries:{control:sourceSummary(control,trial.sourceSeat),
       treatment:sourceSummary(treatment,trial.sourceSeat)},
     nativeArms:{control,treatment},qualifiedGames:0});
 }
 return {schema:VERSION,pinnedEngine:p.enginePin,sourceRank:13,
   opponentRank:1,attempts:rows.length*2,
   returnedPairs:rows.filter(x=>x.returned).length,
   exactPhysicalPairs:rows.filter(x=>x.exactPhysicalPair).length,
   rows,qualifiedCompetitiveGames:0,
   caveat:'Retrospective previously inspected source deals. Unqualified native bot and action cap; no win-rate inference.'};
}
if(require.main===module){
 const report=main(),file=process.env.AGENT8_ESTABLISHED_QUICKBALL_RESULT_JSON;
 if(file)writeRegisteredReport(report,file);
 console.log('AGENT8_ESTABLISHED_QUICKBALL_NATIVE_SUMMARY',JSON.stringify({
   attempts:report.attempts,returnedPairs:report.returnedPairs,
   matched:report.exactPhysicalPairs,
   rows:report.rows.map(x=>({
     seed:x.trial.seed,seat:x.trial.sourceSeat,
     controlCopied:x.summaries.control.sourceNativeCopiedChoices.length,
     treatmentCopied:x.summaries.treatment.sourceNativeCopiedChoices.length,
     controlWinner:x.summaries.control.winner,
     treatmentWinner:x.summaries.treatment.winner
   }))}));
 if(!file)process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,preflight,runArm,main};
