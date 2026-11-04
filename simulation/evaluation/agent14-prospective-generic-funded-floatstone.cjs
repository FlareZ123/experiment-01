'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const registration=require(
  '../../results/aichi-2026/registrations/agent14-prospective-generic-funded-floatstone-20261104.json');
const {treatmentOptions}=require(
  './agent10-rank9-known-dead-attack-counterfactual.cjs');

const VERSION='agent14-prospective-source-independent-funded-floatstone-v1';
const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'agent14-prospective-generic-funded-floatstone.json');
const CHECKSUM=OUTPUT+'.sha256';

/**
 * Exact deterministic realization of a committed pre-execution registration.
 * @returns {object[]} Twelve registered unchanged-original matches.
 */
function registeredTrials(){
  assert.equal(registration.schema,
    'agent14-prospective-bilateral-generic-funded-floatstone-v1');
  const trials=registration.seedGroups.flatMap(group=>
    registration.candidateIds.map(candidateId=>({
      id:[group.rank,0,group.candidateSlot,candidateId].join(':'),
      rank:group.rank,repeat:0,candidateSlot:group.candidateSlot,
      candidateId,seed:group.seed
    })));
  assert.deepEqual(trials.map(t=>t.id),registration.trialIds);
  assert.equal(trials.length,12);
  assert.ok(registration.seedGroups.every(x=>
    Number.isSafeInteger(x.seed)&&x.seed>=0&&x.seed<=0xffffffff));
  return trials;
}

/**
 * Small, content-stable source closure identifier for the opt-in selector.
 * This digest does not certify the entire JavaScript runtime or vendor.
 * @returns {string}
 */
function specificSourceDigest(){
  const names=[
    'simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs',
    'simulation/twinleaf/agent17-printed-scaling-basic-ko.cjs',
    'simulation/twinleaf/agent17-public-context-special-energy.cjs',
    'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
    'simulation/evaluation/agent41-bilateral-v2-development.cjs',
    'simulation/evaluation/agent14-prospective-generic-funded-floatstone.cjs',
    'results/aichi-2026/registrations/agent14-prospective-generic-funded-floatstone-20261104.json'
  ];
  const h=createHash('sha256');
  for(const name of names)h.update(name).update('\0')
    .update(fs.readFileSync(path.join(ROOT,name))).update('\0');
  return h.digest('hex');
}

/**
 * Save complete real-run output using an exclusive lock, deterministic
 * checksum, and same-directory atomic rename. Failure leaves a prior complete
 * checkpoint untouched; a crash cannot manufacture a PASS label.
 * @param {object} report Reproducibility envelope or partial progress.
 */
function persist(report){
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=OUTPUT+'.tmp.'+process.pid;
  const hashTemp=CHECKSUM+'.tmp.'+process.pid;
  try{
    const json=JSON.stringify(report,null,2)+'\n';
    const digest=createHash('sha256').update(json).digest('hex');
    fs.writeFileSync(temp,json);
    fs.renameSync(temp,OUTPUT);
    fs.writeFileSync(hashTemp,digest+'  '+path.basename(OUTPUT)+'\n');
    fs.renameSync(hashTemp,CHECKSUM);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(hashTemp))fs.unlinkSync(hashTemp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/**
 * Native-root ledger summary: visible physical decisions and settlement only.
 * Do not infer a helper was selected merely because the same action was
 * independently available to another policy.
 * @param {object} row Actual native attempt.
 * @param {number} seat 0/1 owner slot.
 * @returns {object}
 */
function actionSummary(row,seat){
  const roots=(row.rootActionLedger??[]).filter(x=>x.playerSlot===seat);
  const attacks=roots.filter(x=>x.action==='AttackAction');
  const retreats=roots.filter(x=>x.action==='RetreatAction');
  const toolPlays=roots.filter(x=>
    x.action==='PlayCardAction'&&
    JSON.stringify(x).includes('Float Stone'));
  return {
    roots:roots.length,attacks:attacks.length,
    firstAttack:attacks.length?{
      turn:attacks[0].turnBefore,name:attacks[0].attack,
      ordinal:attacks[0].actionOrdinal}:null,
    retreatRoots:retreats.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,detail:x.detail??null
    })),
    visibleFloatStoneRoots:toolPlays.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,card:x.card??null
    }))
  };
}

/**
 * Registered on-policy A/B comparison across identical genuine source
 * initial deals. Results are deliberately permanently paper-unqualified.
 * @returns {object} Complete native artifact.
 */
function run(){
  const trials=registeredTrials();
  const previous={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    previous[key]=process.env[key];process.env[key]=value;
  }
  try{
    require('./agent41-frozen-bilateral-development-v1.cjs')
      .assertPinnedNativeStore(ROOT,profile);
    const evaluate=require('./agent41-bilateral-v2-development.cjs')
      .runDevelopment;
    const options={
      ...treatmentOptions(),
      ...registration.flagsFrozenBothArms,
      registeredTrials:trials,
      allowAdditionalOriginalSourceRanks:true
    };
    assert.equal(options.actorOnlyComposition,true);
    assert.equal(options.actorUnderworldDoorPromptOwner,true);
    assert.equal(options.actorRank9MegaAbsolFundingRoot,true);
    const base=evaluate({...options,
      actorGenericFundedFloatStoneRoot:false,
      registeredFrameName:VERSION+'-control'});
    assert.equal(base.attempted,trials.length);
    const envelope={
      version:VERSION,registrationSchema:registration.schema,
      registeredTrialIds:registration.trialIds,
      exactResearchHead:process.env.GITHUB_SHA??null,
      pinnedVendorRevision:profile.pinnedVendorRevision,
      helperSourceVersion:require(
        '../twinleaf/agent14-generic-funded-floatstone-frontier.cjs').VERSION,
      scopedSourceDigestSha256:specificSourceDigest(),
      candidatesUnchanged:true,actualOriginalDecksUnchanged:true,
      policyEnabledBothPhysicalSeats:true,
      currentPhase:'control-completed-treatment-pending',
      originalSourceRanks:[1,11,30],
      nativeAttemptCountSoFar:base.rows?.length??0,
      rawControl:base,competitiveQualifiedGames:0,
      allFieldWinRatesCertified:false
    };
    persist(envelope);
    const intervention=evaluate({...options,
      actorGenericFundedFloatStoneRoot:true,
      registeredFrameName:VERSION+'-treatment'});
    assert.equal(intervention.attempted,trials.length);
    const comparisons=trials.map((trial,i)=>{
      const b=base.rows[i],t=intervention.rows[i];
      assert.equal(b.trial?.id,trial.id);
      assert.equal(t.trial?.id,trial.id);
      const controls=b.rootActionLedger??[],
        treatments=t.rootActionLedger??[];
      let firstDifferent=null;
      for(let k=0;k<Math.max(controls.length,treatments.length);k++){
        if(JSON.stringify(controls[k])!==JSON.stringify(treatments[k])){
          firstDifferent=k;break;
        }
      }
      const candidateSeat=trial.candidateSlot==='A'?0:1,
        sourceSeat=1-candidateSeat;
      return {
        id:trial.id,seed:trial.seed,rank:trial.rank,
        sourceSeat,candidateSeat,
        originalSourceSame:b.sourceDeckFingerprint===
          t.sourceDeckFingerprint,
        candidateSixtySame:b.candidateDeckFingerprint===
          t.candidateDeckFingerprint,
        sourceDealSame:b.sourceDealFingerprint===
          t.sourceDealFingerprint,
        fullDealSame:b.fullPhysicalDealFingerprint===
          t.fullPhysicalDealFingerprint,
        actualStarterSame:b.actualStarterSeat===t.actualStarterSeat,
        rootFirstDifferenceOrdinal:firstDifferent,
        control:{finished:b.finished,winner:b.winner,
          endReason:b.endReason,actionCount:b.actionCount,
          source:actionSummary(b,sourceSeat),
          candidate:actionSummary(b,candidateSeat)},
        treatment:{finished:t.finished,winner:t.winner,
          endReason:t.endReason,actionCount:t.actionCount,
          source:actionSummary(t,sourceSeat),
          candidate:actionSummary(t,candidateSeat)},
        competitiveQualified:false
      };
    });
    const sameOpening=comparisons.every(x=>
      x.originalSourceSame&&x.candidateSixtySame&&x.sourceDealSame&&
      x.fullDealSame&&x.actualStarterSame);
    const output={...envelope,
      currentPhase:'both-arms-completed',
      trialPairs:trials.length,totalNativeAttempts:trials.length*2,
      allRegisteredInitialPhysicalDealsMatch:sameOpening,
      changedRootPairCount:comparisons.filter(x=>
        x.rootFirstDifferenceOrdinal!==null).length,
      comparisons,rawTreatment:intervention,
      nativeAttemptCountSoFar:trials.length*2,
      caveat:'Prospectively registered physical original-source 29-list subset. No paper-match timing, complete source fidelity, full 32 field or independently competent opponents. No valid aggregate competitive win-rate inference.'
    };
    persist(output);
    return output;
  }finally{
    for(const [key,value] of Object.entries(previous)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  try{
    const result=run();
    console.log('AGENT14_PROSPECTIVE_GENERIC_FUNDED_SUMMARY',JSON.stringify({
      version:result.version,
      originalRanks:result.originalSourceRanks,
      pairs:result.trialPairs,
      physicalDealsMatch:result.allRegisteredInitialPhysicalDealsMatch,
      changedRootPairs:result.changedRootPairCount,
      byTrial:result.comparisons.map(x=>({
        id:x.id,firstDifferent:x.rootFirstDifferenceOrdinal,
        sameDeal:x.fullDealSame,
        controlEnd:x.control.endReason,
        treatmentEnd:x.treatment.endReason
      })),
      competitiveQualifiedGames:0
    }));
    if(!result.allRegisteredInitialPhysicalDealsMatch)process.exitCode=1;
  }catch(error){
    const status={
      version:VERSION,status:'aborted',
      error:{name:error.name,message:error.message,
        stack:error.stack??null},
      researchHead:process.env.GITHUB_SHA??null,
      registeredTrialIds:registration.trialIds,
      competitiveQualifiedGames:0
    };
    // If a partial control checkpoint exists, retain that artifact rather
    // than overwriting it with a less informative exception-only record.
    if(!fs.existsSync(OUTPUT))persist(status);
    console.error(error);
    process.exitCode=1;
  }
}

module.exports={VERSION,registeredTrials,specificSourceDigest,
  actionSummary,persist,run};
