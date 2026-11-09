'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent6-path-pressure-counter-14-original-20261109.json');
const {runArm,summarize}=require('./agent3/portable-champion-all29-20261109.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook,VERSION:roarHook}=
  require('../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent6-path-pressure-stadium-counter-original14-native-ab-v1';
const RANKS=[5,9,12,15,20,21,27];

/** Original preregistered, independently seeded seven-rank both-seat field. */
function groups(){
  assert.equal(registration.schema,
    'agent6-owner-path-pressure-and-counter-prospective-original14-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(registration.groups.length,14);
  assert.equal(registration.ceilingRootsPerAttempt,260);
  assert.deepEqual(registration.originalRanksWithPrintedPath,RANKS);
  const ids=new Set(),seeds=new Set();
  for(const item of registration.groups){
    assert.ok(Number.isSafeInteger(item.seed)&&item.seed>=0&&item.seed<=0xffffffff);
    assert.ok(!seeds.has(item.seed));seeds.add(item.seed);
    assert.ok(!ids.has(item.id));ids.add(item.id);
    assert.equal(item.candidateId,'champion-reference');
    assert.equal(item.id,
      [item.rank,item.repeat,item.candidateSlot,item.candidateId].join(':'));
  }
  for(const rank of RANKS){
    assert.deepEqual(registration.groups.filter(x=>x.rank===rank)
      .map(x=>x.candidateSlot),['A','B']);
  }
  return registration.groups.map(x=>({...x}));
}

/**
 * Only new actor-owned opt-in varies. The existing twin-seat common policy,
 * source-dealt 60-card inventories, compatible native rules hooks, and
 * random physical deal seeds remain the same.
 * @param {boolean} optIn
 * @param {object[]} panel
 */
function runOneArm(optIn,panel){
  return runArm(false,panel,options=>runDevelopment({
    ...options,
    registeredFrameName:VERSION+(optIn?'-B-path-counter':'-A-pressure-control'),
    actorPathToPeakOpposingAbility:true,
    actorPathUnderworldStadiumCounter:optIn
  }));
}

function publicAudit(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
  return {
    sourceSeat:row.trial.candidateSlot==='A'?1:0,
    sourcePathRecoverySelected:root?.pathUnderworldStadiumCounterSelected??null,
    sourcePathPressureProposed:root?.typedIntentCounts?.['play-path-to-peak']??null,
    actorSelectedRoots:root?.selectedRootDecisions??null,
    actorNativeAccepted:root?.acceptedActorRoots??null,
    actualStoreFinished:row.finished===true
  };
}

function run(){
  const panel=groups();
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control,treatment;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    control=runOneArm(false,panel);
    treatment=runOneArm(true,panel);
  }finally{
    try{if(restoreRoar)restoreRoar();}
    finally{
      restoreDoor();
      if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    }
  }

  const pairs=[];
  for(let i=0;i<panel.length;i++){
    const before=control.rows[i],after=treatment.rows[i];
    const a=summarize(before),b=summarize(after);
    assert.equal(a.id,panel[i].id);
    assert.equal(b.id,panel[i].id);
    const physicallyMatched=Boolean(a.sourceDealFingerprint&&
      a.fullPhysicalDealFingerprint&&b.sourceDealFingerprint&&
      b.fullPhysicalDealFingerprint&&
      JSON.stringify(a.sourceDealFingerprint)===
        JSON.stringify(b.sourceDealFingerprint)&&
      JSON.stringify(a.fullPhysicalDealFingerprint)===
        JSON.stringify(b.fullPhysicalDealFingerprint));
    const aAudit=publicAudit(before),bAudit=publicAudit(after);
    pairs.push({
      id:a.id,rank:a.rank,seed:a.seed,candidateSeat:a.candidateSeat,
      physicalDealMatched:physicallyMatched,
      bothNativeTerminal:a.status==='native-terminal'&&
        b.status==='native-terminal',
      nativeWinnerChanged:a.status==='native-terminal'&&
        b.status==='native-terminal'&&a.winner!==b.winner,
      pathReplacementSelectedControl:aAudit.sourcePathRecoverySelected,
      pathReplacementSelectedTreatment:bAudit.sourcePathRecoverySelected,
      control:a,treatment:b,
      actorRootControl:aAudit,actorRootTreatment:bAudit
    });
  }
  const all=pairs.flatMap(p=>[p.control,p.treatment]);
  const natural=pairs.filter(p=>p.bothNativeTerminal);
  const summary={
    sourceRanks:RANKS.length,registeredDeals:pairs.length,
    nativeAttempts:all.length,
    physicallyIdenticalABDeals:pairs.filter(p=>p.physicalDealMatched).length,
    nativeTerminals:all.filter(p=>p.status==='native-terminal').length,
    matchedNaturalTerminals:natural.length,
    matchedNativeWinnerChanges:natural.filter(p=>p.nativeWinnerChanged).length,
    developerErrors:all.filter(p=>p.status==='engine-error').length,
    rootCaps:all.filter(p=>p.status==='root-cap').length,
    pathPressureSourceRootsProposed:pairs.reduce((sum,p)=>sum+
      (p.actorRootTreatment.sourcePathPressureProposed??0),0),
    newRecoveryRootsSelected:pairs.reduce((s,p)=>
      s+(p.pathReplacementSelectedTreatment??0),0),
    unchangedControlRecoveryRootsSelected:pairs.reduce((s,p)=>
      s+(p.pathReplacementSelectedControl??0),0),
    competitivelyQualifiedPaperGames:0
  };
  return {
    schema:VERSION,registration:registration.schema,
    sourceManifest:'results/aichi-2026/full-decklists.json',
    selectedCandidate60:'champion-reference',
    proposedRoot:'owner-visible replacement of Path with Sky Field or Dimension Valley',
    bothNativeRuleHooksSame:true,paperCelestialRoarHook:roarHook,
    twinleafPin:registration.pinnedTwinleafCommit??null,
    githubSha:process.env.GITHUB_SHA??null,
    competitiveQualification:false,summary,pairs,
    controlFullNative:control,treatmentFullNative:treatment
  };
}

if(require.main===module){
  const report=run();
  if(process.env.AGENT6_PATH_PRESSURE_NATIVE14_OUTPUT)
    save(process.env.AGENT6_PATH_PRESSURE_NATIVE14_OUTPUT,report);
  process.stdout.write('AGENT6_PATH_PRESSURE_COUNTER_NATIVE14 '+
    JSON.stringify({schema:report.schema,summary:report.summary,
      pairs:report.pairs.map(p=>({
        id:p.id,rank:p.rank,
        dealMatched:p.physicalDealMatched,
        newRoots:p.pathReplacementSelectedTreatment,
        controlStatus:p.control.status,treatmentStatus:p.treatment.status,
        controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
        controlError:p.control.error,treatmentError:p.treatment.error
      }))})+'\n');
  if(report.summary.physicallyIdenticalABDeals!==14)
    process.exitCode=1;
}

module.exports={VERSION,groups,runOneArm,publicAudit,run};
