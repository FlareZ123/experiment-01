'use strict';
const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,executeOne,writeRegisteredReport}=
 require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');
const {sourceSummary}=require('./agent8-rank13-treasure-native-transport.cjs');
const {preflight}=require('./agent8-rank13-public-copy-preflight.cjs');
const FLAG='AGENT8_PUBLIC_FLAT_COPY_DEV';
const VERSION='agent8-rank13-prospective-public-flat-copy-v1';

/** @param {object} trial @param {Map<number,object>} byRank @param {boolean} selected */
function runArm(trial,byRank,selected){
 const old=process.env[FLAG];
 if(selected)process.env[FLAG]='true';else delete process.env[FLAG];
 try{return executeOne(trial,byRank,false,true,true,true,true,true,false);}
 finally{if(old===undefined)delete process.env[FLAG];else process.env[FLAG]=old;}
}
function main(){
 const p=preflight();
 initializeCards();
 const {byRank}=registration(),rows=[];
 for(const trial of p.trialMatrix){
   const control=runArm(trial,byRank,false),selected=runArm(trial,byRank,true);
   const returned=control.status==='native-returned'&&
     selected.status==='native-returned';
   const paired=returned&&control.sourceDealSha256!==null&&
     control.sourceDealSha256===selected.sourceDealSha256&&
     control.fullPhysicalDealSha256!==null&&
     control.fullPhysicalDealSha256===selected.fullPhysicalDealSha256;
   rows.push({trial,returned,paired,
     control:sourceSummary(control,trial.sourceSeat),
     selected:sourceSummary(selected,trial.sourceSeat),
     fullNativeArms:{control,selected},qualifiedGames:0});
 }
 assert.equal(rows.length*2,p.expectedNativeAttempts);
 return {schema:VERSION,registeredSeeds:p.trialMatrix,
   registration:'results/aichi-2026/registrations/agent8-rank13-public-flat-copy-prospective-native-20261103.json',
   pinnedEngine:p.enginePin,sourceRank:13,opponentRank:1,
   attempts:rows.length*2,returnedPairs:rows.filter(x=>x.returned).length,
   exactPhysicalPairs:rows.filter(x=>x.paired).length,rows,
   qualifiedCompetitiveGames:0,
   caveat:'Independent preregistered seeds. Native 160-action-capped untimed generic opponent; no qualified paper games or win-rate inference.'};
}
if(require.main===module){
 const result=main(),out=process.env.AGENT8_PUBLIC_COPY_RESULT_JSON;
 if(out)writeRegisteredReport(result,out);
 console.log('AGENT8_PUBLIC_COPY_PROSPECTIVE_SUMMARY',JSON.stringify({
   attempts:result.attempts,returnedPairs:result.returnedPairs,
   exactPhysicalPairs:result.exactPhysicalPairs,
   rows:result.rows.map(x=>({seed:x.trial.seed,seat:x.trial.sourceSeat,
     status:[x.control.status,x.selected.status],
     copied:[x.control.sourceNativeCopiedChoices.length,
       x.selected.sourceNativeCopiedChoices.length],
     winner:[x.control.winner,x.selected.winner]}))
 }));
 if(!out)process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,runArm,main};
