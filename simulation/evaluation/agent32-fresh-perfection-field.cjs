'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const registration = require('../../results/aichi-2026/registrations/agent32-fresh-perfection-16groups-20261108.json');
const {runSelectedIssue25V0} = require('./agent36-issue25-selected-v0.cjs');
const {withStewardOwnerPromptFrontier} = require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts} = require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot} = require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches} = require('./agent36-issue25-common-v7.cjs');
const {withTelepathInsideNativeMatches} = require('./agent8-issue25-v5-telepath-development.cjs');
const {withTelepathAndOwnerAbilityPolicy} = require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {firstRootDivergence} = require('./agent24-v8-perfection-paired-native.cjs');

const VERSION = 'agent32-new-physical-original-field-perfection-paired-v1';

/** @param {unknown} value */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @returns {object[]} Registered unique actual games in fixed order. */
function trials() {
  assert.equal(registration.schema, 'agent32-fresh-perfection-16-groups-32games-v1');
  assert.equal(registration.expected_arms, 32);
  assert.equal(registration.effective_native_root_limit, 260);
  assert.equal(registration.groups.length, 16);
  assert.equal(new Set(registration.groups.map(x=>x.id)).size,16);
  assert.equal(new Set(registration.groups.map(x=>x.rank)).size,8);
  for (const row of registration.groups) {
    assert.equal(row.id,
      [row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
    assert.equal(row.candidateId,registration.fixed_candidate);
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    assert.ok(['A','B'].includes(row.candidateSlot));
  }
  return registration.groups.map(row=>({...row}));
}

/**
 * The native v8 common two-player owner policy, plus a SINGLE default-off
 * bilateral root option. All native wrappers and the underlying original
 * source card identities remain identical between control and treatment.
 *
 * @param {boolean} enablePerfection
 * @param {(options:object)=>object} [run]
 * @param {object} [extra] Registered-game or opt-in owner-policy configuration.
 * @returns {{selected:object,wrappers:object}}
 */
function runNativeBatch(enablePerfection,run=runDevelopment,extra={}){
  const frozen=extra.registeredTrials??trials();
  const frameName=extra.registeredFrameName??registration.schema;
  const rootLimit=extra.nativeRootActionLimit??registration.effective_native_root_limit;
  assert.ok(!extra.vipPreferMewtwoDonor||extra.vipAfterPass,
    'VIP Mewtwo donor recipient needs actual first-turn VIP native search');
  assert.ok(!extra.perfectionBenchFunding||enablePerfection,
    'Perfection recipient pre-funding requires paid Perfection selected');
  const expected=frozen.map(x=>x.id);
  let selected=null;
  const core=()=>withCommonOwnerThornsRoot(()=>{
    selected=runSelectedIssue25V0({
      runner:options=>run({
        ...options,
        actorOnlyComposition:true,
        sourceIndependentCommonPolicy:true,
        bilateralSpecialEnergyRoot:true,
        nativeAcceptedTargets:true,
        bilateralPerfectionRoot:enablePerfection,
        bilateralPerfectionBenchFunding:extra.perfectionBenchFunding===true,
        bilateralPerfectionTransitionRoot:extra.perfectionTransition===true,
        bilateralBasicEnergyRecipientFrontier:extra.energyRecipientFrontier===true,
        actorVipAfterPass:extra.vipAfterPass===true,
        ...(extra.vipPreferMewtwoDonor?{
          actorVipAfterPassAdapter:(next,options)=>
            require('../twinleaf/agent9-battle-vip-owner-after-pass.cjs')
              .withActorBattleVipAfterPass(next,{
                ...options,preferMewtwoDonorRecipient:true
              })
        }:{}),
        nativeRootActionLimit:rootLimit,
        registeredTrials:frozen.map(row=>({...row})),
        registeredFrameName:frameName,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true
      }),
      layers:{firstBlockedPromptEnvelope:withStewardOwnerPromptFrontier},
      registeredTrialIds:expected,
      // Existing selected-runner contract supports one explicit preregistered
      // game when invoked through a concrete native runner. Enable solely
      // for targeted, frozen-deal diagnostics; default cohort unchanged.
      allowSingleRegisteredTrial:extra.allowSingleRegisteredTrial===true,
      nativeRootActionLimit:rootLimit
    });
    return selected;
  });
  const owner=()=>withStewardInnermostOwnerPrompts(core);
  const volt=()=>withOwnerVoltAcrossNativeMatches(owner);
  const telepath=withTelepathInsideNativeMatches(volt,{
    telepath:withTelepathAndOwnerAbilityPolicy
  });
  assert.ok(selected?.rawDevelopment,'The complete selected native batch must be returned');
  assert.equal(selected.diagnostic.allRegisteredAttemptsReturned,true,
    'No missing, duplicate or unexpected native trial rows permitted');
  assert.equal(selected.rawDevelopment.rows.length,frozen.length);
  return {
    selected,
    wrappers:{
      nativeTelepathAudit:telepath.audit,
      nativeVoltAudit:telepath.result.audit,
      nativeOwnerPrizeAudit:telepath.result.result.audit
    }
  };
}

/** @param {object} row @param {boolean} enablePerfection */
function summarizeRow(row,enablePerfection){
  const trial=row.trial??{};
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:null;
  const details=row.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  return {
    id:trial.id??row.id,
    rank:trial.rank,
    seed:trial.seed,
    sourceSeat:1-candidateSeat,
    candidateSeat,
    enablingPerfection:enablePerfection,
    status:row.error?'engine-error':row.finished===true?
      'native-terminal':roots?.length===registration.effective_native_root_limit?
      'root-cap':'returned-unqualified',
    finished:row.finished===true,
    winner:row.winner??null,
    nativeActions:row.actionCount??null,
    rootActions:roots?.length??null,
    remainingPrizes:row.finalPrizes??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    acceptedPerfectionRootIntents:details.root?.typedIntentCounts?.perfection??0,
    nativeCopiedAttackPromptAccepted:details.chooseAttack?.accepted??0,
    copiedAttackSelections:details.chooseAttack?.selections??[],
    firstPlayerSeat:row.verifiedFirstTurn?.firstTurnSlot??null,
    error:row.error?String(row.error).slice(0,1300):null,
    nativeLedgerDigest:roots===null?null:digest(roots),
    rootActionLedger:roots
  };
}

/**
 * Fail-closed pairing: all 16 registered deals remain in the denominator.
 * A candidate win requires actual native termination and matching physical
 * candidate seat, never a root cap or a simulator projection.
 *
 * @param {object[]} control
 * @param {object[]} treatment
 */
function comparePairs(control,treatment){
  const byId=new Map(treatment.map(row=>[row.id,row]));
  const pairs=control.map(a=>{
    const b=byId.get(a.id);
    assert.ok(b,'missing registered treatment '+a.id);
    const bothDealsKnown=!!a.fullPhysicalDealFingerprint&&
      !!a.sourceDealFingerprint&&!!b.fullPhysicalDealFingerprint&&
      !!b.sourceDealFingerprint;
    const matchedFull=bothDealsKnown&&
      JSON.stringify(a.fullPhysicalDealFingerprint)===
      JSON.stringify(b.fullPhysicalDealFingerprint);
    const matchedSource=bothDealsKnown&&
      JSON.stringify(a.sourceDealFingerprint)===
      JSON.stringify(b.sourceDealFingerprint);
    const bothLedgers=Array.isArray(a.rootActionLedger)&&
      Array.isArray(b.rootActionLedger);
    const firstDifference=bothLedgers?
      firstRootDivergence(a.rootActionLedger,b.rootActionLedger):null;
    const nativeWinner=arm=>arm.status==='native-terminal'&&
      arm.winner===arm.candidateSeat;
    return {
      id:a.id,rank:a.rank,candidateSeat:a.candidateSeat,
      physicallyMatched:matchedFull&&matchedSource,
      matchedFull,matchedSource,bothLedgers,
      firstDifference,
      control:{status:a.status,finished:a.finished,
        candidateNativeWinner:nativeWinner(a),winner:a.winner,
        rootActions:a.rootActions,remainingPrizes:a.remainingPrizes,
        ledgerSha:a.nativeLedgerDigest},
      paidPerfection:{status:b.status,finished:b.finished,
        candidateNativeWinner:nativeWinner(b),winner:b.winner,
        rootActions:b.rootActions,remainingPrizes:b.remainingPrizes,
        ledgerSha:b.nativeLedgerDigest,
        acceptedPerfectionRootIntents:b.acceptedPerfectionRootIntents,
        copiedAttackPrompts:b.nativeCopiedAttackPromptAccepted,
        copiedAttacks:b.copiedAttackSelections},
      nativeResultReversed:nativeWinner(a)!==nativeWinner(b)&&
        a.status==='native-terminal'&&b.status==='native-terminal'
    };
  });
  assert.equal(pairs.length,registration.groups.length);
  return pairs;
}

/** @param {{runner?:Function}} [deps] */
function run(deps={}){
  const controls=runNativeBatch(false,deps.runner);
  const treated=runNativeBatch(true,deps.runner);
  const control=(controls.selected.rawDevelopment.rows??[])
    .map(row=>summarizeRow(row,false));
  const treatment=(treated.selected.rawDevelopment.rows??[])
    .map(row=>summarizeRow(row,true));
  const pairs=comparePairs(control,treatment);
  const matching=pairs.every(pair=>pair.physicallyMatched);
  return {
    version:VERSION,
    registration:registration.schema,
    nativePin:registration.pinned_twinleaf,
    originalSourceRanks:registration.source_original_ranks,
    fixedCandidate:registration.fixed_candidate,
    rootLimit:registration.effective_native_root_limit,
    expectedGroups:registration.groups.length,
    expectedNativeGames:registration.expected_arms,
    status:matching?'all-deals-physically-paired':
      'INVALID-ONE-OR-MORE-DEALS-UNMATCHED',
    summary:{
      nativeAttempts:control.length+treatment.length,
      physicallyMatchedGroups:pairs.filter(p=>p.physicallyMatched).length,
      nativeTerminalsControl:control.filter(p=>p.status==='native-terminal').length,
      nativeTerminalsTreatment:treatment.filter(p=>p.status==='native-terminal').length,
      nativeErrors:[...control,...treatment].filter(p=>p.status==='engine-error').length,
      rootCaps:[...control,...treatment].filter(p=>p.status==='root-cap').length,
      enabledPerfectionRootIntents:treatment.reduce((n,p)=>
        n+p.acceptedPerfectionRootIntents,0),
      fullyNativeTerminalReversals:pairs.filter(p=>p.nativeResultReversed).length,
      qualifiedPaperGames:0
    },
    pairs,
    controls:control,
    treatments:treatment,
    releaseQualified:false,competitiveGamesQualified:0,
    limitations:[
      'Unseen prospective physical seeds frozen in the checked-in registration before execution.',
      'Original Aichi source printed 60s and the one New Moon fixed candidate are unchanged across policies.',
      'Same native Store two-seat common policy, owner prompts and printed paid Perfection readiness, only one opt-in root difference.',
      'Complete source and full physical deals must match or the panel is invalid.',
      'Actual native bot/engine terminals are not tournament-clock or paper-qualified games.',
      'Absence of late copied attacks at the root cap does not imply impossibility.'
    ]
  };
}

if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(report.status!=='all-deals-physically-paired'||
      report.summary.nativeErrors>0)process.exitCode=1;
}

module.exports={VERSION,trials,digest,runNativeBatch,summarizeRow,comparePairs,run};
