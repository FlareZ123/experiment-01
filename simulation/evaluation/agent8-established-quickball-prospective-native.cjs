'use strict';
const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,writeRegisteredReport}=
  require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');
const {sourceSummary}=require('./agent8-rank13-treasure-native-transport.cjs');
const {runArm}=require('./agent8-established-quickball-retrospective-native.cjs');
const {preflightEstablishedProspective}=
  require('./agent8-established-quickball-prospective-preflight.cjs');
const VERSION='agent8-established-quickball-prospective-24-native-v1';
function main(){
 const p=preflightEstablishedProspective();initializeCards();
 const {byRank}=registration(),rows=[];
 for(const trial of p.sourceSeedGroups){
  const control=runArm(trial,byRank,false);
  const treatment=runArm(trial,byRank,true);
  const returned=control.status==='native-returned'&&
    treatment.status==='native-returned';
  const paired=returned&&control.sourceDealSha256!==null&&
    control.sourceDealSha256===treatment.sourceDealSha256&&
    control.fullPhysicalDealSha256!==null&&
    control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256;
  rows.push({trial,returned,paired,
    summaries:{control:sourceSummary(control,trial.sourceSeat),
      treatment:sourceSummary(treatment,trial.sourceSeat)},
    arms:{control,treatment},qualifiedGames:0});
 }
 assert.equal(rows.length*2,p.expectedNativeAttempts);
 return {schema:VERSION,pinnedEngine:p.enginePin,sourceRank:13,opponentRank:1,
   sourceDealCount:rows.length,attempts:rows.length*2,
   returnedPairs:rows.filter(x=>x.returned).length,
   matchedPhysicalPairs:rows.filter(x=>x.paired).length,
   nativeSourceCopies:{control:rows.reduce((n,x)=>n+x.summaries.control.sourceNativeCopiedChoices.length,0),
     treatment:rows.reduce((n,x)=>n+x.summaries.treatment.sourceNativeCopiedChoices.length,0)},
   rows,qualifiedCompetitiveGames:0,
   caveat:'Fresh prospectively registered physical source deals; owner-specific developmental policy and generic unqualified opponent. No official clock, no paper-game or competitive win inference.'};
}
if(require.main===module){
 const report=main();
 const file=process.env.AGENT8_ESTABLISHED_PROSPECTIVE_JSON;
 if(file)writeRegisteredReport(report,file);
 console.log('AGENT8_ESTABLISHED_PROSPECTIVE_SUMMARY',JSON.stringify({
   sourceDeals:report.sourceDealCount,attempts:report.attempts,
   returnedPairs:report.returnedPairs,matchedPairs:report.matchedPhysicalPairs,
   copyCounts:report.nativeSourceCopies,
   rows:report.rows.map(x=>({seed:x.trial.seed,seat:x.trial.sourceSeat,
     returned:x.returned,paired:x.paired,
     copied:[x.summaries.control.sourceNativeCopiedChoices.length,
       x.summaries.treatment.sourceNativeCopiedChoices.length],
     winner:[x.summaries.control.winner,x.summaries.treatment.winner],
     statuses:[x.summaries.control.status,x.summaries.treatment.status]}))
 }));
 if(!file)process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,main};
