'use strict';

const assert=require('node:assert/strict');
const registration=require('../../../results/aichi-2026/registrations/agent3-prospective-all29-celestial-paper-v2-20261109.json');
const {runArm,summarize,compare}=require('./portable-champion-all29-20261109.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook,VERSION:hookVersion}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-prospective-all29-paper-celestial-v2-portable-bothactor-v1';

/** @returns {object[]} Exact frozen unobserved source-rank/seed/seat registration. */
function frozenGroups(){
  assert.equal(registration.schema,
    'agent3-20261109-celestial-paper-v2-prospective-all29-champion-two-owner-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(registration.registeredGroups,58);
  assert.equal(registration.nativeAttempts,116);
  assert.equal(registration.fixedCandidate,'champion-reference');
  assert.equal(registration.maximumNativeRootActions,260);
  const ids=new Set(),seeds=new Set();
  for(const g of registration.groups){
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
    assert.equal(ids.has(g.id),false);
    assert.equal(seeds.has(g.seed),false);
    ids.add(g.id);seeds.add(g.seed);
    assert.equal(g.candidateId,'champion-reference');
  }
  assert.equal(ids.size,58);
  assert.deepEqual([...new Set(registration.groups.map(g=>g.rank))],
    registration.originalExactRanks);
  for(const rank of registration.originalExactRanks){
    assert.deepEqual(registration.groups.filter(g=>g.rank===rank)
      .map(g=>g.candidateSlot),['A','B']);
  }
  return registration.groups.map(x=>({...x}));
}

/**
 * Use the original frozen two-owner actor policy and the same source deck,
 * renaming only the run frame to record the new independent registration.
 * @param {boolean} on Enable portable tactical roots for both actors.
 * @param {object[]} groups Precommitted physical deals.
 */
function compareArm(on,groups){
  return runArm(on,groups,options=>runDevelopment({
    ...options,registeredFrameName:VERSION+(on?'-B-on':'-A-off')
  }));
}

/**
 * Run both arms under identical corrected printed Celestial Roar semantics.
 * The compat hook is installed outside bot policy and applies to both seats.
 */
function run(){
  const groups=frozenGroups();
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control,treatment;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    control=compareArm(false,groups);
    treatment=compareArm(true,groups);
  }finally{
    try{if(restoreRoar)restoreRoar();}finally{
      restoreDoor();
      if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    }
  }
  const pairs=compare(control.rows.map(summarize),
    treatment.rows.map(summarize));
  const matched=pairs.filter(p=>p.physicalMatched);
  const natural=matched.filter(p=>p.bothTerminal);
  const changes=natural.filter(p=>p.nativeWinnerChanged);
  const arms=pairs.flatMap(p=>[p.control,p.treatment]);
  const rankRows=registration.originalExactRanks.map(rank=>{
    const rows=pairs.filter(p=>p.rank===rank);
    const verified=rows.filter(p=>p.physicalMatched);
    const terminal=verified.filter(p=>p.bothTerminal);
    const winners=terminal.filter(p=>p.nativeWinnerChanged);
    return {
      originalRank:rank,
      registered:rows.length,physicallyMatched:verified.length,
      bothNativeTerminal:terminal.length,
      candidateWinGains:winners.filter(p=>p.sourceLossToCandidateWin).length,
      candidateWinLosses:winners.filter(p=>p.candidateWinToSourceLoss).length,
      controlNativeWinner:pairs.filter(p=>p.rank===rank&&
        p.control.nativeTerminalCandidateWinner).length,
      treatmentNativeWinner:pairs.filter(p=>p.rank===rank&&
        p.treatment.nativeTerminalCandidateWinner).length,
      errors:rows.flatMap(p=>[p.control,p.treatment])
        .filter(r=>r.status==='engine-error').length,
      caps:rows.flatMap(p=>[p.control,p.treatment])
        .filter(r=>r.status==='root-cap').length
    };
  });
  const summary={
    registeredOriginalRanks:29,
    fixedSixty:'champion-reference',registeredPhysicalGroups:58,
    nativeAttempts:116,physicalDealPairsMatched:matched.length,
    fullPhysicalPanelValid:matched.length===58,
    naturallyBothTerminalMatched:natural.length,
    winnerReversalsMatched:changes.length,
    candidateWinGainsMatched:changes.filter(p=>p.sourceLossToCandidateWin).length,
    candidateWinLossesMatched:changes.filter(p=>p.candidateWinToSourceLoss).length,
    controlTerminals:pairs.filter(p=>p.control.status==='native-terminal').length,
    treatmentTerminals:pairs.filter(p=>p.treatment.status==='native-terminal').length,
    nativeErrors:arms.filter(r=>r.status==='engine-error').length,
    nativeCaps:arms.filter(r=>r.status==='root-cap').length,
    paperQualifiedGames:0
  };
  return {
    schema:VERSION,registration:registration.schema,
    fixedCandidate60:'champion-reference',
    paperCustodyHook:hookVersion,
    physicalSeedGroupIds:groups.map(g=>g.id),
    githubSha:process.env.GITHUB_SHA??null,
    pinnedTwinleaf:registration.pinnedTwinleafCommit,
    samePaperCustodyCorrectionBothArmsAndOwners:true,
    sameCandidate60BothArms:true,
    sameCommonPolicyExceptPortableRootToggles:true,
    releaseAdmission:summary.fullPhysicalPanelValid?
      'ALL_58_DEALS_MATCHED_NATIVE_DEVELOPMENT_ONLY':
      'INVALID_PHYSICAL_DEAL_COHORT',
    summary,rankRows,changedWinners:changes.map(p=>({
      id:p.id,rank:p.rank,candidateSeat:p.candidateSeat,
      controlWinner:p.control.winner,
      treatmentWinner:p.treatment.winner,
      ownerActionFirstDifference:p.firstRootDifference,
      controlFirstRoot:p.control.rootActionLedger?.[
        p.firstRootDifference]??null,
      treatmentFirstRoot:p.treatment.rootActionLedger?.[
        p.firstRootDifference]??null,
      sourceLossToCandidateWin:p.sourceLossToCandidateWin,
      candidateWinToSourceLoss:p.candidateWinToSourceLoss
    })),
    unmatchedGroups:pairs.filter(p=>!p.physicalMatched)
      .map(p=>({id:p.id,rank:p.rank,
        controlStatus:p.control.status,
        treatmentStatus:p.treatment.status,
        controlError:p.control.error,
        treatmentError:p.treatment.error})),
    pairs,fullNativeControl:control,fullNativeTreatment:treatment,
    competitiveQualified:false
  };
}

if(require.main===module){
  const report=run();
  if(process.env.AGENT3_PORTABLE_CELESTIAL_V2_OUTPUT)
    save(process.env.AGENT3_PORTABLE_CELESTIAL_V2_OUTPUT,report);
  process.stdout.write('AGENT3_CELESTIAL_PROSPECTIVE_ALL29 '+
    JSON.stringify({
      admission:report.releaseAdmission,summary:report.summary,
      changedWinners:report.changedWinners,
      unmatchedGroups:report.unmatchedGroups,
      rankRows:report.rankRows
    })+'\n');
  if(!report.summary.fullPhysicalPanelValid)process.exitCode=1;
}

module.exports={VERSION,frozenGroups,compareArm,run};
