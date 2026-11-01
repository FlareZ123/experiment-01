'use strict';
const assert=require('node:assert/strict');
const sourceRegistration=require('../../results/aichi-2026/agent7-rank30-active-clefairy-guard-prospective-20261101.json');
const {runGroup,inspectSource}=
  require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const {runGuardedGroup}=
  require('./agent7-rank30-latias-preservation-prospective.cjs');
const VERSION='agent7-original-rank30-prior-adverse-latias-deal-three-arm-retrospective-v1';
const ORIGINAL_SEED=2723809904;

function run(){
 const group=sourceRegistration.groups.find(x=>x.seed===ORIGINAL_SEED);
 assert.ok(group);
 assert.equal(group.rank,30);
 assert.equal(group.sourceSeat,1);
 const trials=group.candidateIds.map(candidateId=>({
  rank:group.rank,repeat:group.repeat,seed:group.seed,
  candidateSlot:group.candidateSlot,candidateId,
  id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')
 }));
 const baseline=runGroup(trials,group.sourceSeat,false);
 const stageV2=runGuardedGroup(trials,group.sourceSeat,false);
 const protectedV3=runGuardedGroup(trials,group.sourceSeat,true);
 const rows=[];
 for(let i=0;i<2;i++){
  const x=baseline.rows[i],y=stageV2.rows[i],z=protectedV3.rows[i];
  assert.equal(x.trial.id,y.trial.id);
  assert.equal(x.trial.id,z.trial.id);
  for(const key of ['sourceDealFingerprint','fullPhysicalDealFingerprint',
    'sourceDeckFingerprint','candidateDeckFingerprint',
    'actualStarterSeat','firstTurnPlayerId']){
   assert.equal(x[key],y[key],key+' differed original to v2');
   assert.equal(x[key],z[key],key+' differed original to v3');
  }
  rows.push({id:x.trial.id,sourceSeat:group.sourceSeat,
   sourceDeal:x.fullPhysicalDealFingerprint,
   original:inspectSource(x,group.sourceSeat),
   stageV2:inspectSource(y,group.sourceSeat),
   protectedV3:inspectSource(z,group.sourceSeat)});
 }
 return {version:VERSION,priorKnownHarmDeal:true,
  originalSeed:ORIGINAL_SEED,rows,
  baseline,stageV2,protectedV3,competitivelyQualifiedGames:0,
  note:'Retrospective previously exposed source-dealt negative control, not fresh probability evidence.'};
}
if(require.main===module){
 const result=run();
 process.stdout.write(JSON.stringify(result)+'\n');
 process.stderr.write('AGENT7_LATIAS_PRIOR_ADVERSE '+JSON.stringify({
  version:VERSION,seed:ORIGINAL_SEED,rows:result.rows,
  competitivelyQualifiedGames:0})+'\n');
}
module.exports={VERSION,ORIGINAL_SEED,run};
