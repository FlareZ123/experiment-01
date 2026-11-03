'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {writeAtomicLocked}=require('./agent13-rank5-joint-transport-20261103.cjs');
const {withSelectedVipMode}=require('./agent13-rank5-vip-after-pass-20261103.cjs');
const {withSelectedQuickBallMode}=
  require('./agent13-rank5-vip-quickball-20261103.cjs');

const VERSION='agent13-rank5-t46-guzma-retro-twoarm-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent13-rank5-t46-guzma-retro-20261103.json';
const PROFILE='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const OUTPUT='agent13-rank5-guzma-t46-twoarm.json';
const FLAG='AGENT13_DCE_FUSION_GUZMA_RETRO_DEV';
const frozen={
  [PROFILE]:'f6ba98e6a259daa835397689799dc35550a1c14d',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs':
    '15171b5112492d20f0de5b3fdf5f3a6423fee1a4',
  'simulation/evaluation/agent7-canonical-actor-composition.cjs':
    'd8ea957e2c7dc74bb23974863db6a7a51d39366f',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs':
    'e451a8901c688e54e8946a4f24c4d3cf632346c2',
  'simulation/twinleaf/agent43-guzma-prompt-continuation.cjs':
    '512c27524eaf4bc1413a31cb33fdbcf74d2fb32b',
  'simulation/twinleaf/agent13-dce-fusion-copy-guzma-frontier.cjs':
    '3b1ccdc5ebb72f639c071fa41d4ad807a80322a5'
};

/** Pre-outcome immutable registered deck/seed/policy and code verification. */
function preflight(){
  for(const [file,sha] of Object.entries(frozen)){
    const actual=gitBlobHash(fs.readFileSync(path.join(ROOT,file)));
    assert.equal(actual,sha,'Frozen source changed: '+file);
  }
  const registration=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const base=JSON.parse(fs.readFileSync(path.join(ROOT,PROFILE),'utf8'));
  assert.equal(registration.schema,
    'agent13-rank5-newmoon-t46-guzma-retrospective-selected-native-twoarm-v1');
  assert.equal(registration.existingFrozenBaselineProfileBlobSha,
    frozen[PROFILE]);
  assert.equal(registration.unchangedOriginalRunnerBlobSha,
    frozen['simulation/evaluation/agent41-bilateral-v2-development.cjs']);
  assert.equal(registration.pinnedVendor,base.pinnedVendor);
  assert.equal(registration.expectedNativeAttempts,2);
  assert.equal(registration.commonSettings.rootActionCap,340);
  const branchedCeilingPath=
    'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json';
  const branchCeiling=fs.readFileSync(path.join(ROOT,branchedCeilingPath));
  assert.equal(gitBlobHash(branchCeiling),
    registration.branchOnlyRootCeilingFork.branchForkBlobSha,
    'Only the disclosed branch-local native root cap fork is permitted');
  assert.equal(JSON.parse(branchCeiling.toString('utf8')).maxRootActions,340);
  assert.deepEqual(registration.modes.map(x=>[x.id,x.retroGuzma]),[
    ['control_full_owner_quickball',false],
    ['retrospective_dce_copy_guzma',true]
  ]);
  const trials=base.registeredTrials.filter(row=>
    row.id===registration.sourceTrial.id);
  assert.equal(trials.length,1);
  assert.deepEqual(trials[0],registration.sourceTrial);
  assert.equal(base.policyOptions.nativeRootActionLimit,260);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
  assert.equal(base.policyOptions.actorGuzmaPromptContinuation,true);
  assert.equal(base.policyOptions.actorVipBeforeAttack,true);
  assert.equal(base.policyOptions.actorHandDiscard,false);
  assert.equal(base.policyOptions.actorOnlySingleSearch,false);
  return {registration,base,trials};
}

/**
 * Synchronous opt-in scope: no cross-run or cross-seat environment leak.
 * The ancestor Quick Ball and VIP modules independently restore their flags.
 * @template T
 * @param {boolean} enabled
 * @param {()=>T} run
 * @returns {T}
 */
function withRegisteredGuzma(enabled,run){
  assert.equal(typeof run,'function');
  const before=process.env[FLAG];
  assert.ok(before===undefined||before==='false',
    'Unexpected ambient DCE-Guzma module before frozen run');
  if(enabled)process.env[FLAG]='true';
  else delete process.env[FLAG];
  try{return run();}finally{
    if(before===undefined)delete process.env[FLAG];
    else process.env[FLAG]=before;
  }
}

/** @param {object} row @returns {object} */
function compactNativeWitness(row){
  const seat=row.trial.candidateSlot==='B'?0:1;
  const roots=row.rootActionLedger??[];
  const sourceRoots=roots.filter(x=>x.playerSlot===seat);
  const decisions=row.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
  const guzma=decisions.guzmaPrompt??decisions.guzma??null;
  const policy=decisions.root??null;
  return {
    sourceSeat:seat,
    nativeStatus:row.status??null,
    nativeEndReason:row.endReason??null,
    nativeActionCount:row.actionCount??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    rootLedgerSha256:row.rootActionLedgerSha256??null,
    sourceAttackRoots:sourceRoots.filter(x=>x.action==='AttackAction'),
    sourceGuzmaRoots:sourceRoots.filter(x=>x.action==='PlayCardAction'&&
      x.card==='Guzma'),
    sourceDceRootAttachments:sourceRoots.filter(x=>
      x.action==='PlayCardAction'&&x.card==='Double Colorless Energy'),
    rootGuzmaProposalOptIn:policy?.dceFusionCopyGuzmaOptIn??null,
    nativeGuzmaPromptContinuation:guzma?.receipts??[],
    nativeSourceSettledAttacks:row.sourceAttackSettlement??null,
    sourcePublicEndState:row.finalPublicState??null,
    competitiveGameQualified:false
  };
}

/** Compare unchanged control and opted-in treatment root prefixes. */
function firstDivergence(control,treatment){
  const roots=a=>a.rootActionLedger??[];
  const a=roots(control),b=roots(treatment);
  const identity=x=>JSON.stringify([
    x?.actionOrdinal,x?.turnBefore,x?.playerSlot,x?.action,
    x?.card??null,x?.attack??null
  ]);
  let prefix=0;
  while(prefix<Math.min(a.length,b.length)&&
    identity(a[prefix])===identity(b[prefix]))prefix++;
  return {
    exactMatchingPublicRootPrefixEvents:prefix,
    controlFirstDifferentRoot:a[prefix]??null,
    treatmentFirstDifferentRoot:b[prefix]??null,
    entirePublicRootLedgerIdentical:prefix===a.length&&prefix===b.length
  };
}

/**
 * Genuine pinned Twinleaf game from original immutable source+candidates.
 * One deliberately retrospective same-source-trial A/B. Retains all failed
 * or capped rows without filtering for a desired outcome.
 * @param {Function} [run] Native runner (test injection).
 */
function runRelease(run=require('./agent41-bilateral-v2-development.cjs')
  .runDevelopment){
  const {registration,base,trials}=preflight();
  assert.equal(typeof run,'function');
  const modes=registration.modes.map(mode=>{
    const opts={
      ...base.policyOptions,
      nativeRootActionLimit:registration.commonSettings.rootActionCap,
      actorOnlySingleSearch:true,
      actorHandDiscard:true,
      registeredTrials:trials,
      registeredFrameName:VERSION+'-'+mode.id
    };
    const native=withSelectedVipMode(true,()=>
      withSelectedQuickBallMode(true,()=>
        withRegisteredGuzma(mode.retroGuzma,()=>run(opts))));
    assert.equal(native.attempted,1);
    assert.equal(native.rows?.length,1);
    assert.equal(native.rows[0].trial.id,trials[0].id);
    return {id:mode.id,retroGuzma:mode.retroGuzma,
      witness:compactNativeWitness(native.rows[0]),native};
  });
  const a=modes[0].native.rows[0],b=modes[1].native.rows[0];
  const sameSource=typeof a.sourceDealFingerprint==='string'&&
    a.sourceDealFingerprint===b.sourceDealFingerprint;
  const sameBoth=typeof a.fullPhysicalDealFingerprint==='string'&&
    a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint;
  return {
    schema:VERSION,registeredTrial:trials[0],registeredAttempts:2,
    unchangedRunnerBlob:frozen[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs'],
    pinnedVendor:registration.pinnedVendor,
    firstDifference:firstDivergence(a,b),
    sourcePhysicalMatched:sameSource,
    completeBothPlayersPhysicalMatched:sameBoth,
    modes,
    qualifiedCompetitiveGames:0,target995Demonstrated:false
  };
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {registration,trials}=preflight();
    process.stdout.write(JSON.stringify({
      mode:'NO_NATIVE_EXECUTION',version:VERSION,
      registeredTrials:trials,modes:registration.modes,
      newCap:registration.commonSettings.rootActionCap,
      pinnedFrozenBlobs:frozen,competitiveGameQualified:false
    },null,2)+'\n');
  }else{
    const result=runRelease();
    writeAtomicLocked(OUTPUT,result);
    process.stdout.write(JSON.stringify({
      version:VERSION,registeredAttempts:result.registeredAttempts,
      sourcePhysicalMatched:result.sourcePhysicalMatched,
      completeBothPlayersPhysicalMatched:
        result.completeBothPlayersPhysicalMatched,
      rootDivergence:result.firstDifference,
      arms:result.modes.map(x=>({
        id:x.id,attacks:x.witness.sourceAttackRoots.length,
        guzma:x.witness.sourceGuzmaRoots.length,
        end:x.witness.nativeEndReason,
        actions:x.witness.nativeActionCount
      })),
      qualifiedCompetitiveGames:0
    },null,2)+'\n');
  }
}
module.exports={VERSION,frozen,preflight,withRegisteredGuzma,
  firstDivergence,compactNativeWitness,runRelease};
