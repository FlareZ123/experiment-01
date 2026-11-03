'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {gitBlobHash}=
  require('./agent36-profile-provenance-gate.cjs');
const {compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');

const ROOT=path.resolve(__dirname,'../..');
const MANIFEST='simulation/evaluation/agent4-selected-v3-paper-funded-manifest.json';
const MANIFEST_BLOB='5a6c877ceee571f2f48bfbba83d50c913d7da9b2';
const OUTPUT='agent4-selected-v3-paper-funded-native-48.json';
const VERSION='agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1';
const sha=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');
const source=relative=>fs.readFileSync(path.join(ROOT,relative));

/** Validate immutable registered input bytes before any native match. */
function preflight(){
  assert.equal(gitBlobHash(source(MANIFEST)),MANIFEST_BLOB,
    'Selected v3 preregistration bytes changed');
  const m=JSON.parse(source(MANIFEST).toString('utf8'));
  assert.equal(m.schema,
    'agent4-v3-selected-bilateral-paper-frontier-funded-floatstone-prospective-v1');
  assert.equal(m.pinnedTwinleafRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const [file,digest] of [
    ['sourceRunner','sourceRunnerBlobSha'],
    ['sourceRoster','sourceRosterBlobSha'],
    ['baselineProfile','baselineProfileBlobSha'],
    ['fundedFloatStoneSource','fundedFloatStoneBlobSha'],
    ['paperOwnerNecessary','paperOwnerNecessaryBlobSha'],
    ['canonicalActorComposition','canonicalActorCompositionBlobSha']
  ])assert.equal(gitBlobHash(source(m.frozenInputs[file])),
    m.frozenInputs[digest],'Frozen source drift: '+file);
  assert.equal(m.expectedGroups,8);
  assert.equal(m.expectedContexts,16);
  assert.equal(m.expectedNativeAttempts,48);
  assert.equal(m.nativeActionCap,180);
  assert.equal(m.commonPolicy.nativeRootActionLimit,180);
  assert.equal(m.commonPolicy.actorOnlyComposition,true);
  assert.equal(m.commonPolicy.actorUnderworldDoorPromptOwner,true);
  assert.equal(m.commonPolicy.ownerGenericTrainerFrontier,false);
  assert.equal(m.commonPolicy.actorFundedShadowRiderFloatStoneRoot,false);
  assert.equal(m.commonPolicy.allowAdditionalOriginalSourceRanks,true);
  assert.deepEqual(m.modes.map(row=>[
    row.id,row.ownerVipAfterPass,row.ownerGenericTrainerFrontier,
    row.actorFundedShadowRiderFloatStoneRoot
  ]),[
    ['corrected-bilateral-control-a',true,false,false],
    ['selected-v3-paper-plus-funded-mobility',true,true,true],
    ['corrected-bilateral-control-b',true,false,false]
  ]);
  assert.deepEqual(m.groups.map(x=>[x.rank,x.candidateSlot]),[
    [1,'A'],[1,'B'],[5,'A'],[5,'B'],
    [6,'A'],[6,'B'],[11,'A'],[11,'B']
  ]);
  assert.equal(m.registeredTrials.length,16);
  const ids=new Set();
  for(let i=0;i<m.groups.length;i++){
    const g=m.groups[i];
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
    const contexts=m.registeredTrials.slice(i*2,i*2+2);
    assert.deepEqual(contexts.map(x=>x.candidateId),[
      'champion-reference','new-moon-lockbreaker-v1']);
    for(const row of contexts){
      assert.equal(row.rank,g.rank);
      assert.equal(row.repeat,g.repeat);
      assert.equal(row.candidateSlot,g.candidateSlot);
      assert.equal(row.seed,g.seed);
      assert.equal(row.id,[g.rank,g.repeat,g.candidateSlot,row.candidateId]
        .join(':'));
      assert.ok(!ids.has(row.id));
      ids.add(row.id);
    }
  }
  return m;
}

/**
 * Run the same published original owner VIP and native typed paper Psychic
 * recipient hook on every arm. Never offer the owner-only observation to the
 * opposing policy, and always restore process-wide hooks and environment.
 * @template T
 * @param {()=>T} work
 * @returns {T}
 */
function withSameRuntime(work){
  const names=[
    'AGENT9_BATTLE_VIP_AFTER_PASS_DEV',
    'AGENT4_NATIVE_PAYMENT_RECEIPT_DEV',
    'AGENT2_HELD_GUZMA_MOBILITY_DEV'
  ];
  const before=Object.fromEntries(names.map(n=>[n,process.env[n]]));
  for(const n of names)process.env[n]='true';
  let undo=null;
  try{
    undo=require('../twinleaf/underworld-door-psychic-recipient-hook.cjs')
      .installUnderworldDoorPsychicRecipientHook();
    return work();
  }finally{
    if(undo)undo();
    for(const n of names){
      if(before[n]===undefined)delete process.env[n];
      else process.env[n]=before[n];
    }
  }
}

/** @param {object} m @param {object} mode @returns {object} */
function effectiveOptions(m,mode){
  const options={
    ...m.commonPolicy,
    ownerGenericTrainerFrontier:mode.ownerGenericTrainerFrontier,
    actorFundedShadowRiderFloatStoneRoot:
      mode.actorFundedShadowRiderFloatStoneRoot,
    registeredTrials:m.registeredTrials,
    registeredFrameName:VERSION+':'+mode.id
  };
  assert.equal(options.actorOnlyComposition,true);
  assert.equal(options.nativeRootActionLimit,m.nativeActionCap);
  return options;
}

/** @param {object} row @returns {object} */
function concise(row){
  const slot=row.trial?.candidateSlot;
  const sourceSeat=slot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger:[];
  const sourceRoots=roots.filter(x=>x.playerSlot===sourceSeat);
  const paper=row.actorOnlyDecisionCoverage?.ownerTrainerFrontierAudit??null;
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
  const counts=()=>({
    roots:0,held:0,proven:0,unresolved:0,prizeProven:0,removalProven:0
  });
  const c=counts();
  if(paper?.ownerPaperNecessityOptIn===true){
    for(const item of paper.roots??[]){
      c.roots++;
      c.held+=item.ownerPaperNecessity?.heldTrainerCopies??0;
      c.proven+=item.ownerPaperNecessity?.provenNecessaryConditionFailures??0;
      c.unresolved+=item.ownerPaperNecessity?.remainingUnresolvedCopies??0;
      for(const printed of item.ownerPaperNecessity?.rows??[]){
        if(printed.necessaryBlockers?.some(x=>x.startsWith('printed-prize:')))
          c.prizeProven++;
        if(printed.necessaryBlockers?.some(x=>
          x.startsWith('printed-removal-target:')))c.removalProven++;
      }
    }
  }
  return {
    trialId:row.trial?.id,sourceSeat,
    status:row.status??null,error:row.error??null,
    initialSourceDeal:row.sourceDealFingerprint??null,
    initialFullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    rootLedgerHash:row.rootActionLedgerSha256??null,
    sourceAttackRoots:sourceRoots.filter(x=>x.action==='AttackAction').length,
    sourceMaxGeistRoots:sourceRoots.filter(x=>
      x.action==='AttackAction'&&x.attack==='Max Geist').length,
    sourceFloatStonePlays:sourceRoots.filter(x=>
      x.action==='PlayCardAction'&&x.card?.startsWith('Float Stone')).length,
    selectedFundedFloatStoneIntents:
      root?.fundedVmaxFloatStoneRootSelected??0,
    nativeFinished:row.finished===true,finalPrizes:row.finalPrizes??null,
    actualOwnerPaperAudit:paper?.ownerPaperNecessityOptIn===true,
    ownerPaperCounts:c,competitiveQualified:false
  };
}

/**
 * Compare three immutable profiles with identical physical initial deals;
 * preserve the full native rows even on failure. A/B/A controls must replay
 * identically while selected v3 may take different funded Tool actions.
 *
 * @param {{runner?:(opts:object)=>object,withRuntime?:(fn:Function)=>object}} [deps]
 * @returns {object}
 */
function runRelease(deps={}){
  const manifest=preflight();
  const runner=deps.runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  const withRuntime=deps.withRuntime??withSameRuntime;
  assert.equal(typeof runner,'function');
  assert.equal(typeof withRuntime,'function');
  const modes=[];
  for(const mode of manifest.modes){
    const options=effectiveOptions(manifest,mode);
    const run=withRuntime(()=>runner(options));
    assert.equal(run.attempted,16);
    assert.deepEqual(run.rows.map(r=>r.trial?.id),
      manifest.registeredTrials.map(t=>t.id));
    const rows=run.rows.map(concise);
    const observedRows=run.rows.filter(r=>r.actorOnlyDecisionCoverage);
    const incorrectlyWired=mode.ownerGenericTrainerFrontier?
      observedRows.filter(r=>r.actorOnlyDecisionCoverage
        .ownerTrainerFrontierAudit?.ownerPaperNecessityOptIn!==true).length:
      observedRows.filter(r=>r.actorOnlyDecisionCoverage
        .ownerTrainerFrontierAudit?.ownerPaperNecessityOptIn===true).length;
    const decisionPolicy={...options};
    delete decisionPolicy.registeredFrameName;
    delete decisionPolicy.registeredTrials;
    modes.push({
      id:mode.id,
      effectiveOptionSha256:sha(options),
      decisionPolicySha256:sha(decisionPolicy),
      selectedObserver:mode.ownerGenericTrainerFrontier,
      fundedFloatStone:mode.actorFundedShadowRiderFloatStoneRoot,
      inspectedActorRows:observedRows.length,
      mismatchedOwnerPaperAuditRows:incorrectlyWired,
      rows,fullNative:run
    });
  }
  const a=modes[0],b=modes[1],c=modes[2];
  const ab=compareSafely(a.fullNative.rows,b.fullNative.rows);
  const ac=compareSafely(a.fullNative.rows,c.fullNative.rows);
  const bc=compareSafely(b.fullNative.rows,c.fullNative.rows);
  const allPhysical= [...ab,...ac,...bc].every(x=>
    x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart);
  const controlsIdentical=a.rows.every((r,i)=>
    r.rootLedgerHash!==null&&r.rootLedgerHash===c.rows[i].rootLedgerHash&&
    r.status===c.rows[i].status);
  const selectedPaperAudited=b.inspectedActorRows>0&&
    b.mismatchedOwnerPaperAuditRows===0;
  const noUnexpectedControlPaper=a.mismatchedOwnerPaperAuditRows===0&&
    c.mismatchedOwnerPaperAuditRows===0;
  const actualQualifiedGames=0;
  const verdict={
    preregisteredContexts:16,attempts:48,
    matchingPhysicalContextPairs:ab.filter(x=>
      x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart).length,
    matchingControlReplays:ac.filter(x=>
      x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart).length,
    allPhysical,controlsIdentical,selectedPaperAudited,
    noUnexpectedControlPaper,
    sourceCensoredOrErroredRows:modes.map(mode=>({
      id:mode.id,
      errors:mode.rows.filter(r=>r.status==='engine-error').length,
      actionCaps:mode.rows.filter(r=>r.status==='action-capped').length,
      sourceAttacks:mode.rows.reduce((n,r)=>n+r.sourceAttackRoots,0),
      sourceMaxGeist:mode.rows.reduce((n,r)=>n+r.sourceMaxGeistRoots,0),
      sourceFloatStonePlays:mode.rows.reduce(
        (n,r)=>n+r.sourceFloatStonePlays,0),
      paperNecessaryFailures:mode.rows.reduce(
        (n,r)=>n+r.ownerPaperCounts.proven,0),
      paperUnresolved:mode.rows.reduce(
        (n,r)=>n+r.ownerPaperCounts.unresolved,0),
      selectedFloatStoneIntents:mode.rows.reduce(
        (n,r)=>n+r.selectedFundedFloatStoneIntents,0)
    })),
    competitivelyQualifiedGames:actualQualifiedGames,
    acceptedDevelopmentRelease:allPhysical&&controlsIdentical&&
      selectedPaperAudited&&noUnexpectedControlPaper
  };
  return {
    schema:VERSION,manifestBlobSha:MANIFEST_BLOB,
    pinnedEngineRevision:manifest.pinnedTwinleafRevision,
    originalSourceRanks:[1,5,6,11],originalDecksUnchanged:true,
    bothCandidatePrintedSixtiesUnchanged:true,
    paperClockVerified:false,competentOpposingFullPolicy:false,
    finalSingleSixtySelected:false,fieldGameWinRate:null,
    verdict,threeArmPhysicalComparisons:{controlVsSelected:ab,
      controlVsRepeat:ac,selectedVsRepeat:bc},
    modes
  };
}

if(require.main===module){
  const {writeAtomicLocked}=
    require('./agent23-selected-joint-v2-release.cjs');
  const result=runRelease();
  writeAtomicLocked(OUTPUT,result);
  process.stdout.write('AGENT4_SELECTED_V3 '+JSON.stringify({
    verdict:result.verdict,
    modeHash:result.modes.map(m=>({id:m.id,sha:m.decisionPolicySha256,
      inspected:m.inspectedActorRows,incorrectlyWired:m.mismatchedOwnerPaperAuditRows}))
  })+'\n');
  if(!result.verdict.acceptedDevelopmentRelease)process.exitCode=1;
}

module.exports={VERSION,MANIFEST,MANIFEST_BLOB,preflight,withSameRuntime,
  effectiveOptions,concise,runRelease};
