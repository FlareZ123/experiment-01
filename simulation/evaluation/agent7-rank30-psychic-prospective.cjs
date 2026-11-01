'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {runGroup,inspectSource}=
  require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const VERSION='agent7-rank30-prospective-8source-seed-psychic-recipient-v1';
const ROOT=path.resolve(__dirname,'../..');
const REG_PATH=path.join(ROOT,
  'results/aichi-2026/agent7-rank30-psychic-prospective-20261101.json');
const REG_SHA='176fe648125e50d15e32179b908244871a27506d';

function registeredPairs(){
 const data=fs.readFileSync(REG_PATH);
 assert.equal(gitBlobHash(data),REG_SHA,
   'Exact preregistration JSON changed after protocol lock');
 const reg=JSON.parse(data);
 assert.equal(reg.registeredBeforeNativeRun,true);
 assert.equal(reg.sourceGroups,8);
 assert.equal(reg.pairs,16);
 assert.equal(reg.pinnedTwinleaf,
   'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.deepEqual(reg.sourcePreviousPhysicalSeedGroupsExcluded,
   [3407938073,233633536]);
 const unique=new Set();
 const groups=reg.groups.map(g=>{
  assert.equal(g.rank,30);
  assert.equal(g.candidateSlot,g.sourceSeat===1?'A':'B');
  assert.deepEqual(g.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
  assert.ok(!unique.has(g.seed));unique.add(g.seed);
  return {...g,trials:g.candidateIds.map(candidateId=>({
   rank:g.rank,repeat:g.repeat,seed:g.seed,candidateSlot:g.candidateSlot,
   candidateId,id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')
  }))};
 });
 assert.equal(unique.size,8);
 return {registration:reg,groups};
}

/**
 * Directly compare exact native 60s/deals and all first-root identities. Keep
 * native winners as unqualified descriptive data, never a game-win estimate.
 */
function runProspective(){
 const {registration,groups}=registeredPairs();
 const rows=[],evidence=[];
 for(const group of groups){
  const control=runGroup(group.trials,group.sourceSeat,false);
  const staged=runGroup(group.trials,group.sourceSeat,true);
  assert.equal(control.attempted,2);assert.equal(staged.attempted,2);
  for(let index=0;index<2;index++){
   const a=control.rows[index],b=staged.rows[index];
   assert.equal(a.trial.id,b.trial.id);
   assert.equal(a.sourceSeat,group.sourceSeat);
   assert.equal(b.sourceSeat,group.sourceSeat);
   for(const key of ['sourceDealFingerprint','fullPhysicalDealFingerprint',
     'sourceDeckFingerprint','candidateDeckFingerprint','actualStarterSeat',
     'firstTurnPlayerId']){
    assert.equal(a[key],b[key],key+' changed for '+a.trial.id);
   }
   const controlSource=inspectSource(a,group.sourceSeat);
   const stagedSource=inspectSource(b,group.sourceSeat);
   rows.push({id:a.trial.id,sourceSeat:group.sourceSeat,
    seed:group.seed,initialDeal:a.fullPhysicalDealFingerprint,
    control:controlSource,staged:stagedSource});
  }
  evidence.push({sourceRank:30,seed:group.seed,slot:group.candidateSlot,
    control,staged});
 }
 assert.equal(rows.length,16);
 const sums=rows.reduce((out,row)=>{
  out.selectedNativeClefairyPsychic+=row.staged.attachedBasicPsychicToClefairy;
  out.controlNativeClefairyPsychic+=row.control.attachedBasicPsychicToClefairy;
  if(row.staged.sameRootChangedCount>0)out.policyExposureGames++;
  if(row.staged.rootActionLedgerSha256!==row.control.rootActionLedgerSha256)
   out.rootActionChangedGames++;
  if(row.staged.targetSidecarSha256!==row.control.targetSidecarSha256)
   out.acceptedPhysicalTargetChangedGames++;
  if(row.staged.nativeWinnerUnqualified!==row.control.nativeWinnerUnqualified)
   out.unqualifiedNativeWinnerChangedGames++;
  const a=row.control.status,b=row.staged.status;
  out.controlStatus[a]=(out.controlStatus[a]??0)+1;
  out.stagedStatus[b]=(out.stagedStatus[b]??0)+1;
  return out;
 },{sourceGroups:8,pairedNativeGames:16,selectedNativeClefairyPsychic:0,
  controlNativeClefairyPsychic:0,policyExposureGames:0,
  rootActionChangedGames:0,acceptedPhysicalTargetChangedGames:0,
  unqualifiedNativeWinnerChangedGames:0,controlStatus:{},stagedStatus:{}});
 return {version:VERSION,registration,registrationGitBlob:REG_SHA,
  fixedOriginalOpponentRank:30,pinnedEngine:registration.pinnedTwinleaf,
  rows,evidence,sums,qualifiedCompetitiveGames:0,
  caveat:'Prospectively registered 8 original source shuffles, 2 fixed candidate 60s per seed; complete native attempts retained; no paper-clock qualification or full-field win-rate inference'};
}
if(require.main===module){
 const report=runProspective();
 process.stdout.write(JSON.stringify(report)+'\n');
 process.stderr.write('RANK30_PSYCHIC_PROSPECTIVE '+
   JSON.stringify({version:VERSION,registrationGitBlob:REG_SHA,
     sums:report.sums,rows:report.rows,qualifiedCompetitiveGames:0})+'\n');
}
module.exports={VERSION,registeredPairs,runProspective};
