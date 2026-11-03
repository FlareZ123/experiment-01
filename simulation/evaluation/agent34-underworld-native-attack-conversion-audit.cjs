'use strict';

const assert=require('node:assert/strict');

const VERSION='agent34-underworld-native-attack-conversion-audit-v1';
const SOURCE='agent34-rank1-owner-typed-underworld-posthoc-development-v1';

/**
 * Native terminal means only that the pinned engine supplied a terminal
 * winner, NOT that a paper-competitive game was qualified.
 * @param {object} row Authentic native trial result.
 * @param {0|1} sourceSeat Physically registered original source seat.
 * @returns {string}
 */
function nativeOutcomeClass(row,sourceSeat){
  if(row.status==='engine-error'||row.status==='engine-physical-invalid')
    return 'engine-error';
  if(row.finished!==true)return 'censored';
  if(row.winner===sourceSeat)return 'source-native-terminal';
  if(row.winner===1-sourceSeat)return 'candidate-native-terminal';
  return 'other-native-terminal';
}

/**
 * Inspect only printed action/turn summaries in original native root ledger.
 * @param {object} row Archived native trial outcome.
 * @param {0|1} sourceSeat Registered opponent seat.
 * @returns {{attacks:number,rootActionCount:number}}
 */
function sourceRootAttackCount(row,sourceSeat){
  assert.ok(Array.isArray(row.rootActionLedger));
  assert.ok(row.rootActionLedger.every(root=>[0,1].includes(root.playerSlot)));
  return {
    attacks:row.rootActionLedger.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='AttackAction').length,
    rootActionCount:row.rootActionLedger.length
  };
}

/**
 * Read-only independent numerical conversion audit of the previously
 * registered-seed RETROSPECTIVE development archive. The initial native
 * physical-deal checks must be genuine and complete. No statistical
 * inference or comparative win-rate claim is authorized.
 *
 * @param {object} archive Complete source-stamped native raw archive.
 * @returns {object} Trial-by-trial attack and termination transition summary.
 */
function auditNativeUnderworldConversion(archive){
  assert.equal(archive.schema,SOURCE);
  assert.equal(archive.originalRank,1);
  assert.equal(archive.retrospective,true);
  assert.equal(archive.prospectivelyRegistered,false);
  assert.equal(archive.actorTypedEnergyPromptBothArms,true);
  assert.equal(archive.competitivelyQualifiedGames,0);
  assert.equal(archive.summary?.attempted,32);
  assert.equal(archive.summary?.qualifiedPaperGames,0);
  const controls=archive.control?.rows,treatments=archive.treatment?.rows;
  const paper=archive.rows,matching=archive.retrospectiveMatching;
  for(const arr of [controls,treatments,paper,matching])
    assert.equal(arr?.length,16);
  const seen=new Set(),rows=[];
  for(let i=0;i<16;i++){
    const a=controls[i],b=treatments[i],r=paper[i],m=matching[i];
    const trial=a.trial;
    assert.ok(typeof trial?.id==='string'&&trial.id.length>0);
    assert.ok(!seen.has(trial.id));seen.add(trial.id);
    assert.equal(trial.id,b.trial?.id);
    assert.equal(trial.id,r.trialId);
    assert.equal(trial.id,m.id);
    assert.equal(trial.rank,1);
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.equal(trial.candidateSlot,b.trial.candidateSlot);
    assert.equal(trial.candidateId,b.trial.candidateId);
    assert.equal(trial.seed,b.trial.seed);
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    assert.equal(r.sourceSeat,sourceSeat);
    const strict=m.sameSeed&&m.sameSourceDeal&&m.sameFullDeal&&m.sameStart;
    assert.equal(r.fullPhysicalAndStartMatched,strict);
    assert.equal(strict,true,
      'Conversion audit only compares actually verified complete physical pairs');
    const before=sourceRootAttackCount(a,sourceSeat);
    const after=sourceRootAttackCount(b,sourceSeat);
    const from=nativeOutcomeClass(a,sourceSeat);
    const to=nativeOutcomeClass(b,sourceSeat);
    const rootCount=b.rootActionLedger.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='UseAbilityAction'&&
      root.ability==='Underworld Door').length;
    assert.equal(rootCount,r.authenticatedUnderworldRoots);
    assert.ok(Number.isSafeInteger(r.physicallyCompletedUnderworldEffects)&&
      r.physicallyCompletedUnderworldEffects>=0&&
      r.physicallyCompletedUnderworldEffects<=rootCount);
    rows.push({trialId:trial.id,sourceSeat,
      controlOutcome:from,treatmentOutcome:to,
      controlSourceAttackRoots:before.attacks,
      treatmentSourceAttackRoots:after.attacks,
      sourceAttackRootDelta:after.attacks-before.attacks,
      controlTotalNativeRoots:before.rootActionCount,
      treatmentTotalNativeRoots:after.rootActionCount,
      originalSourceUnderworldRoots:rootCount,
      originalSourcePhysicallySettledDoorEffects:
        r.physicallyCompletedUnderworldEffects,
      nativeErrorAfter:b.status==='engine-error',
      competitiveGameQualified:false
    });
  }
  const count=fn=>rows.filter(fn).length;
  const sum=key=>rows.reduce((n,r)=>n+r[key],0);
  const outcomeSummary=key=>{
    const classes=['source-native-terminal','candidate-native-terminal',
      'censored','engine-error','other-native-terminal'];
    return Object.fromEntries(classes.map(status=>
      [status,count(row=>row[key]===status)]));
  };
  const summary={
    registeredReusedTrials:16,actualNativeAttempts:32,
    sourceOnlyMatched:archive.summary.sourceParity,
    fullBilateralInitialDealAndStarterMatched:count(r=>
      r.controlOutcome!==undefined),
    controlOutcomes:outcomeSummary('controlOutcome'),
    treatmentOutcomes:outcomeSummary('treatmentOutcome'),
    sourceNativeTerminalToCensored:count(row=>
      row.controlOutcome==='source-native-terminal'&&
      row.treatmentOutcome==='censored'),
    candidateNativeTerminalToSourceNativeTerminal:count(row=>
      row.controlOutcome==='candidate-native-terminal'&&
      row.treatmentOutcome==='source-native-terminal'),
    bothArmsCensored:count(row=>row.controlOutcome==='censored'&&
      row.treatmentOutcome==='censored'),
    controlSourceAttackRoots:sum('controlSourceAttackRoots'),
    treatmentSourceAttackRoots:sum('treatmentSourceAttackRoots'),
    pairsWithFewerSourceAttackRoots:count(row=>row.sourceAttackRootDelta<0),
    pairsWithMoreSourceAttackRoots:count(row=>row.sourceAttackRootDelta>0),
    pairsWithEqualSourceAttackRoots:count(row=>row.sourceAttackRootDelta===0),
    sourceUnderworldRoots:sum('originalSourceUnderworldRoots'),
    fullySettledSourceDoorEffects:
      sum('originalSourcePhysicallySettledDoorEffects'),
    bothSeatsOwnerEnergyPromptNativeAccepted:
      archive.summary.typedOwnerPromptNativeAccepted,
    nativeTreatmentErrors:count(row=>row.nativeErrorAfter),
    competitivePaperGames:0
  };
  assert.equal(summary.sourceUnderworldRoots,
    archive.summary.sourceNativeUnderworldRoots);
  assert.equal(summary.fullySettledSourceDoorEffects,
    archive.summary.physicalUnderworldEffects);
  assert.equal(summary.nativeTreatmentErrors,archive.summary.nativeTreatmentErrors);
  return {version:VERSION,reusedPreviouslyObservedSeeds:true,
    outputDoesNotEstimateStrength:true,
    nativeTerminationIsNotCompetitivePaperVictory:true,
    effectiveTurnOrClockLimitUnverified:true,
    summary,rows};
}

module.exports={VERSION,nativeOutcomeClass,
  sourceRootAttackCount,auditNativeUnderworldConversion};
