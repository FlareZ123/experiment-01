'use strict';

const assert=require('node:assert/strict');
const registration=require('../../../results/aichi-2026/registrations/agent3-source-mew-funding-full29-v2-20261109.json');
const {runArm,summarize,compare}=require('./portable-champion-all29-20261109.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook,VERSION:celestialHookVersion}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-prospective-29-source-mew-funding-v2';

/**
 * Prospective, entire authenticated original field. Both seats per rank.
 * @returns {object[]} Validated new physical deals.
 */
function frozenGroups(){
  assert.equal(registration.schema,
    'agent3-20261109-fresh-full29-source-mew-funding-v2');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(registration.fixedCandidate,'champion-reference');
  assert.equal(registration.registeredGroups,58);
  assert.equal(registration.nativeAttempts,116);
  assert.equal(registration.maximumNativeRootActions,260);
  assert.equal(registration.groups.length,58);
  assert.equal(new Set(registration.groups.map(g=>g.id)).size,58);
  assert.equal(new Set(registration.groups.map(g=>g.seed)).size,58);
  assert.equal(new Set(registration.groups.map(g=>g.rank)).size,29);
  for(const rank of registration.originalExactRanks){
    const seats=registration.groups.filter(g=>g.rank===rank);
    assert.deepEqual(seats.map(g=>g.candidateSlot),['A','B']);
  }
  for(const g of registration.groups){
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
    assert.equal(g.candidateId,'champion-reference');
    assert.equal(g.id,
      [g.rank,g.repeat,g.candidateSlot,g.candidateId].join(':'));
  }
  return registration.groups.map(g=>({...g}));
}

/**
 * The shared native baseline already evolves both actors. Only the original
 * Mew-source owner receives the additional Energy/attack decisions.
 * The opponent/champion actor is unchanged; gameplay uses native Store roots.
 * @param {boolean} enabled
 * @returns {object} Runnable source-only actor flags.
 */
function sourceCompetenceOptions(enabled){
  assert.equal(typeof enabled,'boolean');
  return enabled?{
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorMewGenesectTechnoBlast:true,
    actorMewGenesectTechnoBlastSourceOnly:true
  }:{};
}

/**
 * Use the identical inherited portable both-owner policy in A and B.
 * A/B changes only source-owned Mew DCE funding and Techno Blast choice.
 * @param {boolean} enabled
 * @param {object[]} groups
 * @param {Function} [runner] Injectable pure fixture.
 * @returns {object}
 */
function runCompetenceArm(enabled,groups,runner=runDevelopment){
  return runArm(true,groups,options=>runner({
    ...options,
    ...sourceCompetenceOptions(enabled),
    registeredFrameName:VERSION+(enabled?'-B-source-ready':'-A-source-base')
  }));
}

/**
 * Run a locked paired physical cohort and preserve all root/action failures.
 * Same research-side source semantics corrections apply to both actors/arms.
 * @param {{runner?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const groups=frozenGroups();
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreCelestial=null,a,b;
  try{
    restoreCelestial=installRegidragoCelestialRoarPaperCustodyHook();
    a=runCompetenceArm(false,groups,deps.runner);
    b=runCompetenceArm(true,groups,deps.runner);
  }finally{
    try{if(restoreCelestial)restoreCelestial();}
    finally{
      restoreDoor();
      if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    }
  }
  const pairs=compare(a.rows.map(summarize),b.rows.map(summarize));
  const matched=pairs.filter(p=>p.physicalMatched);
  const bothTerminal=matched.filter(p=>p.bothTerminal);
  const changed=bothTerminal.filter(p=>p.nativeWinnerChanged);
  const attempts=pairs.flatMap(p=>[p.control,p.treatment]);
  const perRank=registration.originalExactRanks.map(rank=>{
    const rp=pairs.filter(p=>p.rank===rank);
    const m=rp.filter(p=>p.physicalMatched);
    const terminal=m.filter(p=>p.bothTerminal);
    return {
      rank,sourceRegistered:rp.length,matchedPhysicalDeals:m.length,
      bothNativeTerminal:terminal.length,
      baselineCandidateNativeWins:rp.filter(p=>
        p.control.nativeTerminalCandidateWinner).length,
      sourceReadyCandidateNativeWins:rp.filter(p=>
        p.treatment.nativeTerminalCandidateWinner).length,
      sourceReadyCandidateNativeLosses:rp.filter(p=>
        p.treatment.nativeTerminalOriginalWinner).length,
      sourceReadyEngineErrors:rp.filter(p=>
        p.treatment.status==='engine-error').length,
      sourceReadyCaps:rp.filter(p=>
        p.treatment.status==='root-cap').length
    };
  });
  const changes=changed.map(p=>{
    const i=p.firstRootDifference;
    const controlFirst=i===null?null:p.control.rootActionLedger?.[i]??null;
    const enhancedFirst=i===null?null:p.treatment.rootActionLedger?.[i]??null;
    return {
      id:p.id,rank:p.rank,candidateSeat:p.candidateSeat,
      baselineWinner:p.control.winner,enhancedWinner:p.treatment.winner,
      firstRootDifferenceIndex:i,controlFirst,enhancedFirst,
      firstEnhancedActionBelongsToOriginalSource:enhancedFirst?.playerSlot===
        1-p.candidateSeat,
      sourceLossToCandidateWin:p.sourceLossToCandidateWin,
      candidateWinToSourceLoss:p.candidateWinToSourceLoss
    };
  });
  const summary={
    originalRanks:29,registeredPairs:58,executedNativeAttempts:116,
    physicalDealMatches:matched.length,
    physicallyComparable:matched.length===58,
    bothNaturallyTerminal:bothTerminal.length,
    baselineNativeTerminals:attempts.filter((r,i)=>
      i%2===0&&r.status==='native-terminal').length,
    sourceReadyNativeTerminals:attempts.filter((r,i)=>
      i%2===1&&r.status==='native-terminal').length,
    nativeWinnerChanges:changed.length,
    championWinGains:changed.filter(p=>p.sourceLossToCandidateWin).length,
    championWinLosses:changed.filter(p=>p.candidateWinToSourceLoss).length,
    allNativeErrors:attempts.filter(r=>r.status==='engine-error').length,
    allRootCaps:attempts.filter(r=>r.status==='root-cap').length,
    allOtherCensored:attempts.filter(r=>r.status==='returned-censored').length,
    competitivelyQualifiedPaperGames:0
  };
  return {
    schema:VERSION,registrationSchema:registration.schema,
    originalRanks:registration.originalExactRanks,
    missingOriginalRanks:registration.missingOriginalRanks,
    pinnedTwinleaf:registration.pinnedTwinleafCommit,
    researchCodeRevision:process.env.GITHUB_SHA??null,
    candidate:'original rank1 champion-reference, identical printed sixty both arms',
    samePaperSemanticsBothArms:true,celestialHookVersion,
    candidateDecisionPolicyUnchanged:true,sourceOnlyNewPolicy:true,
    sourceOnlyFlags:sourceCompetenceOptions(true),summary,perRank,changes,
    pairs,nativeBaseline:a,nativeSourceReady:b,
    status:summary.physicallyComparable?'PHYSICAL_MATCHED_DEVELOPMENT_ONLY':
      'INVALID_UNMATCHED_PHYSICAL_DEALS',
    competitiveAdmission:false
  };
}

if(require.main===module){
  const report=run();
  if(process.env.AGENT3_SOURCE_COMPETENCE_OUTPUT)
    save(process.env.AGENT3_SOURCE_COMPETENCE_OUTPUT,report);
  process.stdout.write('AGENT3_FRESH_SOURCE_EVOLUTION_MEW_ALL29 '+
    JSON.stringify({status:report.status,summary:report.summary,
      changes:report.changes,perRank:report.perRank})+'\n');
  if(!report.summary.physicallyComparable)process.exitCode=1;
}

module.exports={VERSION,frozenGroups,sourceCompetenceOptions,runCompetenceArm,run};
