'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {runGroup,inspectSource}=
  require('./agent7-rank30-psychic-bench-stage-aba.cjs');
const VERSION='agent7-original-rank30-latias-preservation-eight-new-seeds-v1';
const REG_PATH=path.join(__dirname,
  '../../results/aichi-2026/agent7-rank30-latias-preservation-prospective-20261101.json');
const REG_SHA='78d76b8dd22027323004cd36f498e71cadffb8ba';

function registered(){
 const bytes=fs.readFileSync(REG_PATH);
 assert.equal(gitBlobHash(bytes),REG_SHA,'Prospective registration drift');
 const reg=JSON.parse(bytes);
 assert.equal(reg.registeredBeforeNativeRun,true);
 assert.equal(reg.originalRosterGitBlobSha,
   'ae773f6201d7aa69d31914dbfee66f3fba692200');
 assert.equal(reg.sourceGroups,8);
 assert.equal(reg.pairedGames,16);
 assert.equal(reg.pinnedTwinleaf,
   'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 const seeds=new Set();
 for(const g of reg.groups){
  assert.equal(g.rank,30);
  assert.equal(g.candidateSlot,g.sourceSeat===1?'A':'B');
  assert.deepEqual(g.candidateIds,[
    'champion-reference','new-moon-lockbreaker-v1']);
  assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
  assert.ok(!seeds.has(g.seed));seeds.add(g.seed);
 }
 assert.equal(seeds.size,8);
 for(const seed of reg.priorSourceSeedsExcluded)
  assert.ok(!seeds.has(seed));
 return reg;
}

/**
 * Same original source physical deal and source-only recipient chooser.
 * Only the Active Latias printed attack preservation flag varies.
 * @param {object[]} trials Two locked physical original-source arms.
 * @param {0|1} sourceSeat Original source player.
 * @param {boolean} protect Opt-in strict Latias baseline safeguard.
 * @returns {object} Full native Store report.
 */
function runGuardedGroup(trials,sourceSeat,protect){
 const previous=process.env.AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV;
 try{
  process.env.AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV=
    protect?'true':'false';
  return runGroup(trials,sourceSeat,true);
 }finally{
  if(previous===undefined)
   delete process.env.AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV;
  else process.env.AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV=previous;
 }
}

function run(){
 const registration=registered(),rows=[],complete=[];
 for(const group of registration.groups){
  const trials=group.candidateIds.map(candidateId=>({
   rank:30,repeat:group.repeat,seed:group.seed,
   candidateSlot:group.candidateSlot,candidateId,
   id:[30,group.repeat,group.candidateSlot,candidateId].join(':')
  }));
  const control=runGuardedGroup(trials,group.sourceSeat,false);
  const guarded=runGuardedGroup(trials,group.sourceSeat,true);
  assert.equal(control.attempted,2);
  assert.equal(guarded.attempted,2);
  for(let i=0;i<2;i++){
   const a=control.rows[i],b=guarded.rows[i];
   assert.equal(a.trial.id,b.trial.id);
   assert.equal(a.sourceSeat,group.sourceSeat);
   assert.equal(b.sourceSeat,group.sourceSeat);
   for(const key of ['sourceDealFingerprint','fullPhysicalDealFingerprint',
    'sourceDeckFingerprint','candidateDeckFingerprint',
    'actualStarterSeat','firstTurnPlayerId'])
     assert.equal(a[key],b[key],key+' changed on '+a.trial.id);
   rows.push({id:a.trial.id,seed:group.seed,sourceSeat:group.sourceSeat,
    candidateId:a.trial.candidateId,physicalDeal:a.fullPhysicalDealFingerprint,
    control:inspectSource(a,group.sourceSeat),
    guarded:inspectSource(b,group.sourceSeat)});
  }
  complete.push({seed:group.seed,sourceSeat:group.sourceSeat,
   control,guarded});
 }
 assert.equal(rows.length,16);
 const summary={
  sourceGroups:8,matchedNativePairs:16,
  controlNativeClefairyAttachments:0,guardedNativeClefairyAttachments:0,
  controlEonBlade:0,guardedEonBlade:0,
  controlRondo:0,guardedRondo:0,
  changedActionLedgerPairs:0,changedNativePhysicalTargetPairs:0,
  nativeWinnerChangedIncludingCensor:0,controlStatuses:{},guardedStatuses:{},
  changedSourceSeedGroups:[]
 };
 const changedSeeds=new Set();
 for(const row of rows){
  const a=row.control,b=row.guarded;
  summary.controlNativeClefairyAttachments+=a.attachedBasicPsychicToClefairy;
  summary.guardedNativeClefairyAttachments+=b.attachedBasicPsychicToClefairy;
  summary.controlEonBlade+=a.sourceActualAttacks.filter(x=>x==='Eon Blade').length;
  summary.guardedEonBlade+=b.sourceActualAttacks.filter(x=>x==='Eon Blade').length;
  summary.controlRondo+=a.sourceActualAttacks.filter(x=>x==='Full Moon Rondo').length;
  summary.guardedRondo+=b.sourceActualAttacks.filter(x=>x==='Full Moon Rondo').length;
  if(a.rootActionLedgerSha256!==b.rootActionLedgerSha256){
   summary.changedActionLedgerPairs++;changedSeeds.add(row.seed);
  }
  if(a.targetSidecarSha256!==b.targetSidecarSha256)
   summary.changedNativePhysicalTargetPairs++;
  if(a.nativeWinnerUnqualified!==b.nativeWinnerUnqualified)
   summary.nativeWinnerChangedIncludingCensor++;
  summary.controlStatuses[a.status]=(summary.controlStatuses[a.status]??0)+1;
  summary.guardedStatuses[b.status]=(summary.guardedStatuses[b.status]??0)+1;
 }
 summary.changedSourceSeedGroups=[...changedSeeds].sort((a,b)=>a-b);
 return {version:VERSION,registrationGitBlob:REG_SHA,
  originalRank:30,registration,summary,rows,complete,
  competitivelyQualifiedGames:0,
  scope:'Matched 8 genuinely fresh source-deal seeds, 16 fixed opponent pairs. Native originals with all censors. Untimed and unqualified.'};
}
if(require.main===module){
 const result=run();
 process.stdout.write(JSON.stringify(result)+'\n');
 process.stderr.write('RANK30_LATIAS_PROSPECTIVE '+
  JSON.stringify({version:VERSION,registrationGitBlob:REG_SHA,
   summary:result.summary,rows:result.rows,competitivelyQualifiedGames:0})+'\n');
}
module.exports={VERSION,registered,runGuardedGroup,run};
