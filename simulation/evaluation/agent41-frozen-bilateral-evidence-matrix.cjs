'use strict';

const assert=require('node:assert/strict');

const VERSION='agent41-frozen-bilateral-failure-inclusive-evidence-matrix-v1';

/**
 * Reduce raw game development rows without dropping action caps, aborted
 * native games, physical invalidity, or failing source setup.
 * This is an observational policy-development matrix only.
 * @param {object} result Genuine frozen candidate/source runner output.
 * @returns {object}
 */
function frozenBilateralEvidenceMatrix(result){
  assert.ok(result&&typeof result==='object');
  assert.ok(Array.isArray(result.rows));
  const byArm=[];
  const statuses={};
  const physicalStatuses={};
  const starterStatuses={};
  let sourceAttackDeclarations=0,candidateAttackDeclarations=0;
  let engineTerminals=0;
  let nativeRootChoiceChanges=0;
  let settledPhysicalClaims=0;
  let terminalWithPaperQualification=0;
  const groupMap=new Map();
  for(const row of result.rows){
    const trial=row.trial??{};
    const rank=trial.rank??null;
    const candidateSlot=trial.candidateSlot??null;
    const seed=trial.seed??null;
    const candidateId=trial.candidateId??null;
    const kind=row.status??(row.finished===true?'engine-terminal':'censored');
    const physical=row.physicalZoneQualification?.status??
      'PHYSICAL_INTEGRITY_UNVERIFIED';
    const coin=row.nativeSetupCoinChoiceReceipt?.status??
      'native-receipt-absent';
    const sourceAttacks=row.attackDeclarations?.source??0;
    const candidateAttacks=row.attackDeclarations?.candidate??0;
    const changed=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.sameRootProposalChoice?.changedRoots??0;
    const sourceFirst=[0,1].includes(row.sourceSeat)&&
      [0,1].includes(row.actualStarterSeat)?
      row.sourceSeat===row.actualStarterSeat:null;
    const record={
      id:trial.id??null,rank,candidateSlot,seed,candidateId,
      sourceDeckFingerprint:row.sourceDeckFingerprint??null,
      candidateDeckFingerprint:row.candidateDeckFingerprint??null,
      initialSourceDealFingerprint:row.sourceDealFingerprint??null,
      initialFullPhysicalDealFingerprint:
        row.fullPhysicalDealFingerprint??null,
      sourceFirst,
      coinEvidenceStatus:coin,
      nativeStatus:kind,
      engineFinished:row.finished===true,
      physicalIntegrityStatus:physical,
      sourceAttackDeclarations:sourceAttacks,
      candidateAttackDeclarations:candidateAttacks,
      selectedSameRootChanges:changed,
      genuineRootActions:row.rootActionCount??null,
      sourceTurn2LineCompleted:rank===6?
        row.sourceAudit?.turn2?.completed??null:null,
      sourceTurn3LineCompleted:rank===6?
        row.sourceAudit?.turn3?.completed??null:null,
      sourceRank11LineCompleted:rank===11?
        row.sourceAudit?.completed??null:null,
      nativeAbortEvidence:row.nativeAbortEvidence??null,
      competitiveQualified:false
    };
    byArm.push(record);
    statuses[kind]=(statuses[kind]??0)+1;
    physicalStatuses[physical]=(physicalStatuses[physical]??0)+1;
    starterStatuses[coin]=(starterStatuses[coin]??0)+1;
    sourceAttackDeclarations+=sourceAttacks;
    candidateAttackDeclarations+=candidateAttacks;
    nativeRootChoiceChanges+=changed;
    if(row.finished===true)engineTerminals++;
    if(physical==='SETTLED_PHYSICAL_INTEGRITY_PASSED')settledPhysicalClaims++;
    if(row.qualifiesForCompetitiveInference===true)terminalWithPaperQualification++;
    const key=[rank,candidateSlot,seed].join(':');
    if(!groupMap.has(key))groupMap.set(key,[]);
    groupMap.get(key).push(record);
  }
  const byPhysicalSeedPair=[...groupMap.entries()].map(([id,rows])=>{
    const a=rows.find(r=>r.candidateId==='champion-reference');
    const b=rows.find(r=>r.candidateId==='new-moon-lockbreaker-v1');
    return {
      id,attemptCount:rows.length,
      bothCandidateArmsPresent:Boolean(a&&b),
      sourceDealMatched:Boolean(a?.initialSourceDealFingerprint&&
        b?.initialSourceDealFingerprint&&
        a.initialSourceDealFingerprint===b.initialSourceDealFingerprint),
      actualFirstMatched:Boolean(a&&b&&
        a.sourceFirst!==null&&a.sourceFirst===b.sourceFirst),
      bothNativeCoinReceiptsConsistent:Boolean(a&&b&&
        a.coinEvidenceStatus==='consistent-accepted-native-setup-and-first-draw'&&
        b.coinEvidenceStatus==='consistent-accepted-native-setup-and-first-draw'),
      statuses:rows.map(x=>({candidateId:x.candidateId,
        nativeStatus:x.nativeStatus,
        physicalStatus:x.physicalIntegrityStatus}))
    };
  }).sort((a,b)=>a.id.localeCompare(b.id));
  return {
    version:VERSION,policyName:result.version??null,
    researchHeadCommit:result.researchHeadCommit??null,
    declaredAttempts:result.expectedAttempts??null,
    preservedAttemptRows:result.rows.length,
    allAttemptRowsPresent:result.attemptedComplete===true&&
      result.rows.length===result.expectedAttempts,
    nativeOutcomes:statuses,physicalIntegrityOutcomes:physicalStatuses,
    nativeCoinEvidence:starterStatuses,
    physicalPairs:byPhysicalSeedPair.length,
    completePairs:byPhysicalSeedPair.filter(x=>x.bothCandidateArmsPresent).length,
    matchingInitialSourceDeals:byPhysicalSeedPair.filter(x=>
      x.sourceDealMatched).length,
    matchingActualFirstPlayers:byPhysicalSeedPair.filter(x=>
      x.actualFirstMatched).length,
    engineTerminals,sourceAttackDeclarations,candidateAttackDeclarations,
    observedSameRootChanges:nativeRootChoiceChanges,
    settledPhysicalOnly: settledPhysicalClaims,
    rowsClaimingCompetitiveQualification:terminalWithPaperQualification,
    competitiveQualifiedGames:0,
    winRateCertified:false,
    qualificationGaps:[
      'Neither opponent policy nor candidate policy is competitive-qualified',
      'Store-accepted prompt effects lack universal printed target/cap validation',
      'Native first-setup receipts do not certify the official Aichi game clock',
      'Three of the 32 exact original opponent 60s remain unauthenticated'
    ],
    byPhysicalSeedPair,byArm
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Expected an existing frozen native JSON evidence path');
  const data=JSON.parse(require('node:fs').readFileSync(
    process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(frozenBilateralEvidenceMatrix(data),
    null,2)+'\n');
}

module.exports={VERSION,frozenBilateralEvidenceMatrix};
