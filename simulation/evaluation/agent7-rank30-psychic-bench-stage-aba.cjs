'use strict';
const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const VERSION='agent7-rank30-source-psychic-bench-staging-aba-v1';
const BASE={...profile.policyOptions,
  allowAdditionalOriginalSourceRanks:true,
  actorOnlyComposition:true,nativeAcceptedTargets:true,
  mandatoryOptionFallback:true,
  // Same common chooser for A, B and A-repeat, with other action-selection
  // dependencies disabled identically in each branch.
  sameRootProposalChoice:true,sameRootChoiceApply:true,sameRootProbeAll:false,
  losslessNativeRootJoin:false,nativeToolAttachRoot:false,
  registeredToolEnergyCeiling:false,nativePlumeriaChoice:false,
  nativeZeroCostDenialChoice:false,teamFlareGruntDenialRoot:false,
  actorPlumeriaAfterPass:false
};

/**
 * Run a two-candidate original rank30 A/B/C group from exactly one already
 * preregistered source physical seed. The stage intervention is confined to
 * the authenticated original source seat, with no revealed opponent state.
 * @param {Array<object>} trials Two fixed candidate arms of same rank/seed/seat.
 * @param {0|1} sourceSeat Physical original source seat.
 * @param {boolean} stage Whether to select Rondo's Bench Psychic recipient.
 * @returns {object} Original full Store report.
 */
function runGroup(trials,sourceSeat,stage){
 const prior=process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV;
 const priorSeat=process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT;
 try{
  process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV=stage?'true':'false';
  process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT=String(sourceSeat);
  const report=runDevelopment({...BASE,registeredTrials:trials,
   registeredFrameName:VERSION+'-'+trials[0].candidateSlot});
  assert.equal(report.attempted,2);
  assert.deepEqual(report.rows.map(x=>x.trial.id),trials.map(x=>x.id));
  return report;
 }finally{
  if(prior===undefined)delete process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV;
  else process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV=prior;
  if(priorSeat===undefined)
   delete process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT;
  else process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT=priorSeat;
 }
}

/** @param {object} row @param {0|1} seat @returns {object} */
function inspectSource(row,seat){
 const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
  ?.sameRootProposalChoice;
 const actionRows=(row.rootActionLedger??[]).filter(x=>
  x.playerSlot===seat&&x.action==='AttackAction');
 const allSourceAttached=(row.nativeAcceptedTargetSidecar?.events??[])
  .filter(e=>e.playerSlot===seat&&e.action==='PlayCardAction'&&
   e.declared?.ownerHandPrinting?.startsWith('Psychic Energy ')&&
   e.storeAccepted===true);
 const toClefairy=allSourceAttached.filter(e=>
  e.publicBoardChanges?.some(change=>
   change.seat===seat&&change.position==='bench'&&
   change.after?.pokemon==="Lillie's Clefairy ex JTG"));
 return {status:row.status??(row.finished?'untimed-engine-terminal':'censored'),
  nativeWinnerUnqualified:row.winner??null,
  sourceActualAttacks:actionRows.map(x=>x.attack??x.attackName??null),
  attachedBasicPsychicSource:allSourceAttached.length,
  attachedBasicPsychicToClefairy:toClefairy.length,
  sameRootChangedCount:audit?.changedRoots??null,
  stageSelectionReasonCount:audit?.selectionReasons?.[
   'experimental-benched-clefairy-basic-psychic-recipient']??0,
  stageSelectedOwnerRoots:audit?.changedSamples?.filter(x=>
    x.seat===seat&&x.reason===
     'experimental-benched-clefairy-basic-psychic-recipient')
   .map(x=>({root:x.rootOrdinal,turn:x.globalTurn,
    selectedKind:x.selectedKind}))??[],
  rootActionLedgerSha256:row.rootActionLedgerSha256,
  targetSidecarSha256:row.nativeAcceptedTargetSidecar?.sha256??null};
}

/** Retrospective causal-development A/B/A with strict physical setup parity. */
function run(){
 const source=scheduledArms().filter(x=>x.rank===30);
 assert.equal(source.length,4);
 const groups=[];
 for(const slot of ['A','B']){
  const trials=source.filter(x=>x.candidateSlot===slot);
  assert.equal(trials.length,2);
  const sourceSeat=slot==='A'?1:0;
  const control=runGroup(trials,sourceSeat,false);
  const treatment=runGroup(trials,sourceSeat,true);
  const repeat=runGroup(trials,sourceSeat,false);
  const summaries=[];
  for(let i=0;i<2;i++){
   const [a,b,c]=[control.rows[i],treatment.rows[i],repeat.rows[i]];
   assert.equal(a.trial.id,b.trial.id);
   assert.equal(a.trial.id,c.trial.id);
   for(const other of [b,c]){
    assert.equal(other.sourceSeat,sourceSeat);
    assert.equal(a.sourceDealFingerprint,other.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,other.fullPhysicalDealFingerprint);
    assert.equal(a.sourceDeckFingerprint,other.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,other.candidateDeckFingerprint);
    assert.equal(a.actualStarterSeat,other.actualStarterSeat);
   }
   assert.equal(a.rootActionLedgerSha256,c.rootActionLedgerSha256,
    'A-repeat root action ledger is not deterministic');
   assert.deepEqual(a.nativeAcceptedTargetSidecar.events,
    c.nativeAcceptedTargetSidecar.events,
    'A-repeat native accepted targets are not deterministic');
   summaries.push({id:a.trial.id,sourceSeat,
    originalSourceDeal:a.sourceDealFingerprint,
    control:inspectSource(a,sourceSeat),
    staged:inspectSource(b,sourceSeat),
    repeat:inspectSource(c,sourceSeat)});
  }
  groups.push({sourceSeat,slot,control,treatment,repeat,summaries});
 }
 const summary=groups.flatMap(x=>x.summaries);
 return {version:VERSION,enginePin:profile.pinnedVendorRevision,
  candidateFixedSixties:profile.candidateIds,
  sourceRank:30,originalSourceSeedsAlreadyInspected:true,
  sourceOriginalSixtyUnmodified:true,groups,summary,
  totalStagedSourceClefairyPsychicAttachments:summary.reduce((n,x)=>
   n+x.staged.attachedBasicPsychicToClefairy,0),
  competitiveQualifiedGames:0,
  caveat:'Retrospective original-Store source-only Energy-target development, not new independent match evidence or paper-qualified strength'};
}
if(require.main===module){
 const report=run();
 process.stdout.write(JSON.stringify(report)+'\n');
 process.stderr.write('RANK30_RONDO_PSYCHIC_ABA '+
  JSON.stringify({version:VERSION,summary:report.summary,
   totalStagedSourceClefairyPsychicAttachments:
    report.totalStagedSourceClefairyPsychicAttachments,
   competitiveQualifiedGames:0})+'\n');
}
module.exports={VERSION,BASE,runGroup,inspectSource,run};
