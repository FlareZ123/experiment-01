'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const registration = require('../../../results/aichi-2026/registrations/agent22-temple-paid-denial-rank13-20261109.json');
const temple = require('../../../results/aichi-2026/candidate-temple-shadow-rider.json');
const originalProfile = require('../../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const { runDevelopment, validateRegisteredTrialGroups } =
  require('../agent41-bilateral-v2-development.cjs');
const { classifyNativeAttempt } = require('../agent41-native-attempt-disposition.cjs');
const { withPaperSemanticsProfileV1, PINNED_TWINLEAF } =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const VERSION = 'agent22-temple-paid-ddedenial-rank13-paired-v1';
const OUTPUT = path.resolve(__dirname, '../../../agent22-temple-ddedenial-rank13-native.json');

/** Preregistration must be checked before any native outcomes are generated. */
function inspect() {
  assert.equal(registration.schema, VERSION);
  assert.equal(registration.enginePin, PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision, PINNED_TWINLEAF);
  assert.equal(registration.sourceGroups.length, 16);
  assert.equal(registration.registeredTrials.length, 16);
  assert.deepEqual(registration.arms,
    ['control-no-dde-owner-priority','treatment-owner-public-temple-dde-priority']);
  assert.equal(registration.rootCap, 260);
  assert.equal(temple.cards.reduce((n,card)=>n+card.count,0),60);
  assert.equal(new Set(registration.sourceGroups.map(g=>g.seed)).size,16);
  const { authenticatedSourceRanks } =
    require('../agent25-authenticated-source-admission.cjs');
  const roster = require('../../../results/aichi-2026/full-decklists.json');
  const admitted = authenticatedSourceRanks(roster,true);
  assert.ok(admitted.includes(13));
  validateRegisteredTrialGroups(registration.registeredTrials,admitted,false,true);
  return {enginePin:PINNED_TWINLEAF,registeredGroups:16,
    expectedNativeAttempts:32,paperQualifiedGames:0};
}

/** @param {object} row @returns {object} */
function disposition(row) {
  const native = classifyNativeAttempt(row);
  const seat = row.trial.candidateSlot === 'A'?0:1;
  const result = native.kind==='ENGINE_TERMINAL' &&
    (row.winner===0||row.winner===1) ?
    (row.winner===seat?'W':'L'):'C';
  const roots = row.rootActionLedger??[];
  const templeActions = roots.filter(x=>x.playerSlot===seat &&
    x.action==='PlayCardAction' &&
    JSON.stringify(x).includes('Temple of Sinnoh'));
  return {status:native.kind,result,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeRootCount:roots.length,
    actualCandidateTemplePlayRoots:templeActions.map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,action:x.action,
      payload:x
    })),
    error:row.error?String(row.error).slice(0,1400):null};
}

/**
 * Side-by-side outcomes are causally comparable only under a matching actual
 * 60-card source physical opening and the same actual starting player.
 * @param {object[]} control
 * @param {object[]} treatment
 */
function compare(control,treatment) {
  assert.equal(control.length,16);
  assert.equal(treatment.length,16);
  const rows=registration.registeredTrials.map((trial,i)=>{
    const a=control[i],b=treatment[i];
    assert.equal(a.trial.id,trial.id);
    assert.equal(b.trial.id,trial.id);
    const left=disposition(a),right=disposition(b);
    const samePhysical=Boolean(left.fullPhysicalDealFingerprint&&
      left.fullPhysicalDealFingerprint===right.fullPhysicalDealFingerprint);
    const sourceMatch=Boolean(left.sourceDealFingerprint&&
      left.sourceDealFingerprint===right.sourceDealFingerprint);
    const sameStarter=left.actualStarterSeat!==null &&
      left.actualStarterSeat===right.actualStarterSeat;
    const aRoots=a.rootActionLedger??[];
    const bRoots=b.rootActionLedger??[];
    let first=0;
    while(first<Math.min(aRoots.length,bRoots.length) &&
      JSON.stringify(aRoots[first])===JSON.stringify(bRoots[first]))first++;
    if(first===aRoots.length&&first===bRoots.length)first=-1;
    return {id:trial.id,seed:trial.seed,seat:trial.candidateSlot,
      samePhysical,sameSourceOpening:sourceMatch,sameStarter,
      comparable:samePhysical&&sourceMatch&&sameStarter,
      firstDifferentAcceptedRoot:first,
      firstControlAction:first>=0?aRoots[first]??null:null,
      firstTreatmentAction:first>=0?bRoots[first]??null:null,
      control:left,treatment:right,
      paperCompetitiveQualified:false};
  });
  const summarize=rs=>({
    groups:rs.length,matchedPhysical:rs.filter(x=>x.comparable).length,
    controlWins:rs.filter(x=>x.control.result==='W').length,
    treatmentWins:rs.filter(x=>x.treatment.result==='W').length,
    controlCensored:rs.filter(x=>x.control.result==='C').length,
    treatmentCensored:rs.filter(x=>x.treatment.result==='C').length,
    treatmentTemplePaidActions:rs.reduce((n,x)=>
      n+x.treatment.actualCandidateTemplePlayRoots.length,0),
    controlTemplePaidActions:rs.reduce((n,x)=>
      n+x.control.actualCandidateTemplePlayRoots.length,0),
    firstRootDivergences:rs.filter(x=>x.firstDifferentAcceptedRoot>=0).length,
    nonCensoredBoth:rs.filter(x=>x.control.result!=='C'&&
      x.treatment.result!=='C').length,
    treatmentMinusControlWinBounds:[
      rs.reduce((n,x)=>n+Number(x.treatment.result==='W')-
        Number(x.control.result!=='L'),0),
      rs.reduce((n,x)=>n+Number(x.treatment.result!=='L')-
        Number(x.control.result==='W'),0)
    ]
  });
  return {rows,all:summarize(rows),
    matched:summarize(rows.filter(x=>x.comparable)),
    excluded:rows.filter(x=>!x.comparable).map(x=>x.id),
    paperQualifiedGames:0};
}

/** Exclusive lock plus atomic rename: no truncated JSON can be read. */
function save(result) {
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try {
    fs.writeFileSync(temp,JSON.stringify(result)+'\n',{flag:'wx'});
    const synced=fs.openSync(temp,'r');
    try{fs.fsyncSync(synced);}finally{fs.closeSync(synced);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

function run() {
  const preflight=inspect();
  assert.equal(process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV,undefined);
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const groups={};
  try {
    for(const [label,enabled] of [
      ['control',false],['treatment',true]
    ]){
      const batch=withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,
        ...originalProfile.commonActorOptions,
        registeredTrials:registration.registeredTrials,
        registeredFrameName:VERSION,
        registeredCandidateDecks:{'temple-shadow-rider-v1':temple},
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:registration.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true,
        actorTempleDdeDenialRoot:enabled
      }),originalProfile.profileEnabled);
      assert.equal(batch.result.rows.length,16);
      groups[label]={rows:batch.result.rows,profileAudit:batch.audit};
    }
  }finally{delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;}
  const comparison=compare(groups.control.rows,groups.treatment.rows);
  const result={schema:VERSION,preflight,registration,comparison,
    originalNativeRows:groups,codeRevision:process.env.GITHUB_SHA??null,
    nativeDevelopmentOnly:true,competitiveQualifiedGames:0};
  save(result);
  const failures=Object.entries(groups).flatMap(([arm,batch])=>
    batch.rows.filter(row=>row.error||!row.rootActionLedger?.length)
      .map(row=>({arm,id:row.trial?.id,
        nativeStatus:classifyNativeAttempt(row).kind,
        error:row.error?String(row.error).slice(0,850):null,
        firstRoot:row.rootActionLedger?.[0]??null}))); 
  process.stdout.write('AGENT22_TEMPLE_DDE_NATIVE '+
    JSON.stringify({all:comparison.all,matched:comparison.matched,
      failures,
      excluded:comparison.excluded,
      changed:comparison.rows.filter(x=>x.firstDifferentAcceptedRoot>=0)
        .map(x=>({id:x.id,first:x.firstDifferentAcceptedRoot,
          control:x.firstControlAction,treatment:x.firstTreatmentAction}))
        .slice(0,10),
      output:path.basename(OUTPUT)})+'\n');
  return result;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect())+'\n');
  else run();
}

module.exports={VERSION,inspect,disposition,compare,run};
