'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {runGroup,inspectSource}=
 require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const VERSION='agent7-rank30-guarded-psychic-stage-fresh-source-v1';
const REG_SHA='b83441f7db3899780aa0d2257b7aee3ee10e25ef';
const PATH=path.join(__dirname,
 '../../results/aichi-2026/agent7-rank30-active-clefairy-guard-prospective-20261101.json');

function registered(){
 const source=fs.readFileSync(PATH);
 assert.equal(gitBlobHash(source),REG_SHA);
 const reg=JSON.parse(source.toString('utf8'));
 assert.equal(reg.registeredBeforeNativeRun,true);
 assert.equal(reg.sourceGroups,8);
 assert.equal(reg.pairedGames,16);
 assert.equal(reg.pinnedTwinleaf,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 const seeds=new Set();
 for(const g of reg.groups){
  assert.equal(g.rank,30);
  assert.ok(!seeds.has(g.seed));seeds.add(g.seed);
  assert.equal(g.candidateSlot,g.sourceSeat===1?'A':'B');
  assert.deepEqual(g.candidateIds,['champion-reference','new-moon-lockbreaker-v1']);
 }
 assert.equal(seeds.size,8);
 for(const seed of reg.priorSourceSeedsExcluded)assert.ok(!seeds.has(seed));
 return reg;
}

function run(){
 const reg=registered(),rows=[],full=[];
 for(const g of reg.groups){
  const trials=g.candidateIds.map(candidateId=>({
   rank:g.rank,repeat:g.repeat,seed:g.seed,candidateSlot:g.candidateSlot,
   candidateId,id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')
  }));
  const control=runGroup(trials,g.sourceSeat,false);
  const guarded=runGroup(trials,g.sourceSeat,true);
  for(let i=0;i<2;i++){
   const a=control.rows[i],b=guarded.rows[i];
   assert.equal(a.trial.id,b.trial.id);
   assert.equal(a.sourceSeat,g.sourceSeat);
   assert.equal(b.sourceSeat,g.sourceSeat);
   for(const key of ['sourceDealFingerprint','fullPhysicalDealFingerprint',
    'sourceDeckFingerprint','candidateDeckFingerprint','actualStarterSeat',
    'firstTurnPlayerId'])
     assert.equal(a[key],b[key],key+' changed');
   rows.push({id:a.trial.id,seed:g.seed,sourceSeat:g.sourceSeat,
    physicalDeal:a.fullPhysicalDealFingerprint,
    original:inspectSource(a,g.sourceSeat),
    guarded:inspectSource(b,g.sourceSeat)});
  }
  full.push({sourceSeed:g.seed,sourceSeat:g.sourceSeat,
   original:control,guarded});
 }
 assert.equal(rows.length,16);
 const summary={sourceGroups:8,pairs:16,physicalPairs:16,
  guardedClefairyPsychic:0,baselineClefairyPsychic:0,
  guardPolicyExposurePairs:0,changedPhysicalTargets:0,
  changedNativeWinnersUnqualified:0,censoredControl:0,censoredGuarded:0,
  controlledSourceRondoAttacks:0,guardedSourceRondoAttacks:0};
 for(const row of rows){
  summary.guardedClefairyPsychic+=row.guarded.attachedBasicPsychicToClefairy;
  summary.baselineClefairyPsychic+=row.original.attachedBasicPsychicToClefairy;
  if(row.guarded.sameRootChangedCount>0)summary.guardPolicyExposurePairs++;
  if(row.original.targetSidecarSha256!==row.guarded.targetSidecarSha256)
    summary.changedPhysicalTargets++;
  if(row.original.nativeWinnerUnqualified!==row.guarded.nativeWinnerUnqualified)
    summary.changedNativeWinnersUnqualified++;
  if(row.original.status==='censored')summary.censoredControl++;
  if(row.guarded.status==='censored')summary.censoredGuarded++;
  summary.controlledSourceRondoAttacks+=row.original.sourceActualAttacks.filter(x=>
    x==='Full Moon Rondo').length;
  summary.guardedSourceRondoAttacks+=row.guarded.sourceActualAttacks.filter(x=>
    x==='Full Moon Rondo').length;
 }
 return {version:VERSION,registrationGitBlob:REG_SHA,registration:reg,rows,
  full,summary,competitiveQualifiedGames:0,
  note:'Fresh source seeds are new to the previous rank30 cohorts; both exact original physical deals matched. Outcomes are untimed developmental Store observations, not paper-qualified win rates.'};
}
if(require.main===module){
 const x=run();
 process.stdout.write(JSON.stringify(x)+'\n');
 process.stderr.write('RANK30_ACTIVE_GUARD_PROSPECTIVE '+
   JSON.stringify({version:VERSION,registrationGitBlob:REG_SHA,
    summary:x.summary,rows:x.rows,competitiveQualifiedGames:0})+'\n');
}
module.exports={VERSION,registered,run};
