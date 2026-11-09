'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent3-portable-champion-all29-ab-20261109.json');
const {preflight:preflightPinnedPolicy}=
  require('../agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-prospective-all29-champion-portable-bothowner-v1';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Validate an immutable preregistered, distinct physical deal for each seat
 * across every authenticated original Aichi source rank.
 * @returns {object[]} Frozen groups, never generated during execution.
 */
function registered(){
  assert.equal(registration.schema,
    'agent3-20261109-prospective-all29-champion-portable-two-owner-v1');
  assert.equal(registration.fixedUnchangedContender,'champion-reference');
  assert.equal(registration.sourceGroups,58);
  assert.equal(registration.expectedNativeAttempts,116);
  assert.equal(registration.nativeRootLimit,260);
  assert.equal(registration.groups.length,58);
  assert.equal(new Set(registration.groups.map(x=>x.id)).size,58);
  assert.equal(new Set(registration.groups.map(x=>x.seed)).size,58);
  assert.equal(new Set(registration.groups.map(x=>x.rank)).size,29);
  for(const rank of registration.authenticatedSourceRanks){
    const group=registration.groups.filter(x=>x.rank===rank);
    assert.deepEqual(group.map(x=>x.candidateSlot),['A','B']);
  }
  for(const g of registration.groups){
    assert.equal(g.candidateId,'champion-reference');
    assert.equal(g.id,
      [g.rank,g.repeat,g.candidateSlot,g.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&
      g.seed<=0xffffffff);
  }
  return registration.groups.map(x=>({...x}));
}

/**
 * Run the proven portable two-owner policy against a genuinely fresh field.
 * Both arms retain the same frozen original/source physical prints.
 * @param {boolean} enabled Only two portable tactical roots change.
 * @param {object[]} groups Verified preregistration.
 * @param {Function} runner Real Store runner; injected only by pure tests.
 * @returns {object} Full failure-inclusive native result.
 */
function runArm(enabled,groups,runner=runDevelopment){
  const frozen=preflightPinnedPolicy().registration.frozenCommonPolicy;
  const common={
    ...frozen,
    registeredTrials:groups,
    registeredFrameName:VERSION+(enabled?'-B-portable-on':'-A-portable-off'),
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:registration.nativeRootLimit,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true,
    actorGuzmaPromptContinuation:true,
    actorZeroEnergyStrandFloatStoneTargetTurn:null,
    actorZeroEnergyStrandFloatStoneOwnerSeat:null,
    actorSeekerGuzmaOwnerSeat:null,
    actorSeekerGuzmaGlobalTurn:null,
    actorZeroEnergyStrandFloatStoneRoot:enabled,
    actorSeekerGuzmaNominalKo:enabled
  };
  assert.equal(common.actorOnlyComposition,true);
  const result=runner(common);
  assert.equal(result.attempted,groups.length);
  assert.equal(result.rows.length,groups.length);
  assert.deepEqual(result.rows.map(x=>x.trial.id),groups.map(x=>x.id));
  return result;
}

/** @param {object} row @returns {object} Native status plus exact replay inputs. */
function summarize(row){
  const trial=row.trial;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??null;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const status=row.error?'engine-error':row.finished===true?
    'native-terminal':roots?.length===registration.nativeRootLimit?
    'root-cap':'returned-censored';
  return {
    id:trial.id,rank:trial.rank,seed:trial.seed,candidateSeat,
    status,winner:row.winner??null,
    nativeTerminalCandidateWinner:status==='native-terminal'&&
      row.winner===candidateSeat,
    nativeTerminalOriginalWinner:status==='native-terminal'&&
      row.winner===1-candidateSeat,
    finalPrizes:row.finalPrizes??null,
    rootCount:roots?.length??null,
    rootLedgerSha256:roots?hash(roots):null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    error:row.error?String(row.error).slice(0,1500):null,
    rootActionLedger:roots
  };
}

/**
 * Require the entire physical dealing of each source and candidate to agree.
 * Zero physical fingerprints is a nonmatch, never a demonstrated match.
 * @param {object[]} a Control summaries.
 * @param {object[]} b Treatment summaries.
 * @returns {object[]} All preregistered pairs and terminal-only differences.
 */
function compare(a,b){
  assert.equal(a.length,58);
  assert.equal(b.length,58);
  const byId=new Map(b.map(row=>[row.id,row]));
  assert.equal(byId.size,58);
  return a.map(control=>{
    const treatment=byId.get(control.id);
    assert.ok(treatment,'Missing registered treatment '+control.id);
    const physicalMatched=Boolean(
      control.sourceDealFingerprint&&treatment.sourceDealFingerprint&&
      control.fullPhysicalDealFingerprint&&treatment.fullPhysicalDealFingerprint&&
      JSON.stringify(control.sourceDealFingerprint)===
        JSON.stringify(treatment.sourceDealFingerprint)&&
      JSON.stringify(control.fullPhysicalDealFingerprint)===
        JSON.stringify(treatment.fullPhysicalDealFingerprint));
    const bothTerminal=control.status==='native-terminal'&&
      treatment.status==='native-terminal';
    const firstRootDifference=control.rootActionLedger&&
      treatment.rootActionLedger?
      Array.from({length:Math.max(control.rootActionLedger.length,
        treatment.rootActionLedger.length)},(_,i)=>i)
        .find(i=>JSON.stringify(control.rootActionLedger[i]??null)!==
          JSON.stringify(treatment.rootActionLedger[i]??null))??null:null;
    return {
      id:control.id,rank:control.rank,candidateSeat:control.candidateSeat,
      physicalMatched,firstRootDifference,
      bothTerminal,
      nativeWinnerChanged:bothTerminal&&control.winner!==treatment.winner,
      sourceLossToCandidateWin:bothTerminal&&
        control.nativeTerminalOriginalWinner&&
        treatment.nativeTerminalCandidateWinner,
      candidateWinToSourceLoss:bothTerminal&&
        control.nativeTerminalCandidateWinner&&
        treatment.nativeTerminalOriginalWinner,
      control,treatment
    };
  });
}

/**
 * Execute all source ranks, both seats and both frozen policy arms exactly once.
 * @param {{runner?:Function}} [deps] Only for independent pure fixtures.
 */
function run(deps={}){
  const groups=registered();
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let a,b;
  try{
    a=runArm(false,groups,deps.runner);
    b=runArm(true,groups,deps.runner);
  }finally{
    restore();
    if(previous===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else
      process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const pairs=compare(a.rows.map(summarize),b.rows.map(summarize));
  const matched=pairs.filter(p=>p.physicalMatched).length;
  const natural=pairs.filter(p=>p.bothTerminal);
  const summary={
    registeredPhysicalGroups:58,attempts:116,
    matchedPhysicalDeals:matched,
    nativeTerminalsControl:pairs.filter(p=>
      p.control.status==='native-terminal').length,
    nativeTerminalsTreatment:pairs.filter(p=>
      p.treatment.status==='native-terminal').length,
    naturalTerminalBoth:natural.length,
    nativeTerminalWinnerChanges:natural.filter(p=>p.nativeWinnerChanged).length,
    sourceLossToCandidateWin:natural.filter(p=>
      p.sourceLossToCandidateWin).length,
    candidateWinToSourceLoss:natural.filter(p=>
      p.candidateWinToSourceLoss).length,
    caps:[...pairs.flatMap(p=>[p.control,p.treatment])]
      .filter(p=>p.status==='root-cap').length,
    errors:[...pairs.flatMap(p=>[p.control,p.treatment])]
      .filter(p=>p.status==='engine-error').length,
    otherCensored:[...pairs.flatMap(p=>[p.control,p.treatment])]
      .filter(p=>p.status==='returned-censored').length,
    paperCompetitiveQualifiedGames:0
  };
  return {
    schema:VERSION,registration:registration.schema,
    githubSha:process.env.GITHUB_SHA??null,
    pinnedNativeEngine:registration.twinleafPinnedCommit,
    exactOriginalRanks:registration.authenticatedSourceRanks,
    missingExactRanks:registration.missingSourceRanks,
    fixed60:'champion-reference',
    sourceAndCandidatePolicyIdenticalExceptTwoPortableRootOptions:true,
    bothRealActorSeats:true,noTargetedTurnOrSeat:true,
    status:matched===58?'ALL_REGISTERED_PHYSICAL_DEALS_MATCH':
      'INVALID_UNMATCHED_PHYSICAL_DEALS',
    summary,pairs,fullNativeControl:a,fullNativeTreatment:b,
    qualifiedPaperGames:0
  };
}

if(require.main===module){
  const report=run();
  if(process.env.AGENT3_PORTABLE_ALL29_OUTPUT)
    save(process.env.AGENT3_PORTABLE_ALL29_OUTPUT,report);
  process.stdout.write('AGENT3_PROSPECTIVE_ALL29_PORTABLE '+
    JSON.stringify({status:report.status,summary:report.summary})+'\n');
  if(report.status!=='ALL_REGISTERED_PHYSICAL_DEALS_MATCH'||
    report.summary.errors>0)process.exitCode=1;
}

module.exports={VERSION,registered,runArm,summarize,compare,run};
