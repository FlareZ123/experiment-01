'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const {run:runAfterSetup,IDS,RNG_PROTOCOL}=
  require('./agent4-mail-postsetup-seat-shuffle-aba-v2.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-mail-postsetup-original-eight-96root-extension-v3-20261105.json');
const ORIGINAL=require('../../results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json');

const VERSION='agent4-mail-postsetup-original-eight-96root-source-payoff-v3';
const ACTION_LIMIT=96;
const SEEDS=new Map(ORIGINAL.trials.map(x=>[x.id,x.seed]));

/** @param {object} root */
function publicAction(root){
  return root && root.pendingPrompt===null &&
    ['AttackAction','PlayCardAction','PassTurnAction',
      'RetreatAction','UseAbilityAction'].includes(root.action);
}

/** @param {object[]} tape @param {number} sourceSeat */
function sourceAndCandidatePaidActions(tape,sourceSeat){
  const roots=tape.filter(publicAction);
  const source=roots.filter(root=>root.seat===sourceSeat);
  const candidate=roots.filter(root=>root.seat===1-sourceSeat);
  const summarize=(rows)=>({
    selectedAttackNames:rows.filter(x=>x.action==='AttackAction')
      .map(x=>({turn:x.turn,ordinal:x.ordinal,attack:x.attack})),
    cardsPlayed:rows.filter(x=>x.action==='PlayCardAction')
      .map(x=>({turn:x.turn,ordinal:x.ordinal,card:x.card})),
    passes:rows.filter(x=>x.action==='PassTurnAction').map(x=>x.turn),
    reachedLastGlobalTurn:rows.reduce((a,x)=>Math.max(a,x.turn),0),
    publicActionCount:rows.length
  });
  const attacks=source.filter(x=>x.action==='AttackAction');
  const reactions=attacks.map(attack=>{
    const answer=candidate.find(action=>
      action.ordinal>attack.ordinal&&
      ['AttackAction','PlayCardAction','UseAbilityAction',
        'RetreatAction','PassTurnAction'].includes(action.action));
    return {
      sourceAttack:{turn:attack.turn,ordinal:attack.ordinal,
        attack:attack.attack},
      firstCandidateSubsequentRoot:answer?{
        turn:answer.turn,ordinal:answer.ordinal,
        action:answer.action,card:answer.card??null,
        attack:answer.attack??null}:null,
      censoredIfNoCandidateReply:!answer
    };
  });
  return {source:summarize(source),candidate:summarize(candidate),
    sourceAttackCandidateFirstReplies:reactions,
    lastReachedGlobalTurn:tape.reduce((a,x)=>Math.max(a,x.turn),0)};
}

/**
 * Verify all 32 exact registered original native request IDs, source deck,
 * original source integer seed, and actual maxRootActions=96 before submission.
 * This only observes/rejects requests; no card or policy is modified.
 *
 * @template T
 * @param {()=>T} next
 * @param {{runMatch:Function}} headless
 * @returns {{result:T,requestAudit:object}}
 */
function withVerifiedNinetySixRootNativeCap(next,headless){
  const original=headless.runMatch,received=[];
  function verified(request){
    const id=IDS.find(x=>
      typeof request?.label==='string'&&request.label.endsWith(x));
    assert.ok(id,'Unexpected native request outside registered original eight');
    assert.equal(request.seed,SEEDS.get(id));
    assert.equal(request.maxActions,ACTION_LIMIT);
    received.push({
      ordinal:received.length,id,
      phase:['legacy','A-control','B-Mail','A-repeat'][
        Math.floor(received.length/8)]??'extra',
      cap:request.maxActions,seed:request.seed,
      physicalAfterSetup:request.isolatePhysicalShuffleRandomnessAfterSetup===true,
      isolatePolicyRandomness:request.isolatePolicyRandomness===true
    });
    return original(request);
  }
  headless.runMatch=verified;
  try{
    const result=next();
    const registered=received.length===32&&received.every((row,i)=>
      row.id===IDS[i%8]&&row.phase===
      ['legacy','A-control','B-Mail','A-repeat'][Math.floor(i/8)]);
    const validLegacy=received.slice(0,8).every(x=>!x.physicalAfterSetup);
    const validTreatment=received.slice(8).every(x=>x.physicalAfterSetup);
    return {result,requestAudit:{
      registeredNative32:registered,
      all32Actual96RootCap:received.length===32&&
        received.every(x=>x.cap===ACTION_LIMIT),
      legacyNoPostsetupIsolation:validLegacy,
      all24AfterSetupPhysicalIsolation:validTreatment,
      all32PolicyRandomIsolation:received.every(x=>x.isolatePolicyRandomness),
      rows:received
    }};
  }finally{
    assert.strictEqual(headless.runMatch,verified);
    headless.runMatch=original;
  }
}

/**
 * Native 96-root developmental extension of original registered eight. All
 * source+candidate printed 60, seeds and physical seats remain unchanged.
 * @param {{headless?:object,incumbent?:Function,afterSetup?:Function}} [deps]
 */
function run(deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const incumbent=deps.incumbent??(()=>{
    return runStewardInnermostPrizeV5({
      runner:options=>runDevelopment({
        ...options,nativeRootActionLimit:ACTION_LIMIT
      })
    });
  });
  const verified=withVerifiedNinetySixRootNativeCap(()=>
    (deps.afterSetup??runAfterSetup)({headless,legacyRunner:incumbent}),
    headless);
  const trial=verified.result;
  const paired=trial.mailAba.panel.map(row=>{
    const sourceSeat=row.sourceSeat;
    assert.ok(sourceSeat===0||sourceSeat===1);
    const base=row.changeAudit?.baselinePublicRootTape??[];
    const treated=row.changeAudit?.treatedPublicRootTape??[];
    return {id:row.id,sourceSeat,candidateSeat:1-sourceSeat,
      baseline:sourceAndCandidatePaidActions(base,sourceSeat),
      sourceMailTreatment:sourceAndCandidatePaidActions(treated,sourceSeat),
      changedAtNativeRoot:row.firstTreatedRootDivergence??null,
      statusBaseline:trial.allRegisteredIdInitialDealParity
        .find(x=>x.id===row.id)?.afterSetupControlStatus??null,
      statusTreatment:trial.allRegisteredIdInitialDealParity
        .find(x=>x.id===row.id)?.afterSetupMailStatus??null
    };
  });
  assert.equal(paired.length,8);
  const rank6=paired.filter(row=>row.id.startsWith('6:'));
  const summary={
    sourceSelectedAttackDeclarationsBaseline:paired.reduce((x,y)=>
      x+y.baseline.source.selectedAttackNames.length,0),
    sourceSelectedAttackDeclarationsTreatment:paired.reduce((x,y)=>
      x+y.sourceMailTreatment.source.selectedAttackNames.length,0),
    candidateSelectedAttackDeclarationsBaseline:paired.reduce((x,y)=>
      x+y.baseline.candidate.selectedAttackNames.length,0),
    candidateSelectedAttackDeclarationsTreatment:paired.reduce((x,y)=>
      x+y.sourceMailTreatment.candidate.selectedAttackNames.length,0),
    originalRank6SourceSelectedAttackDeclarations:
      rank6.map(row=>[row.id,
        row.baseline.source.selectedAttackNames,
        row.sourceMailTreatment.source.selectedAttackNames]),
    sourceMailAcceptedCountByPhysicalSeat:
      trial.mailAba.bilateralMailAudit.actualMailItemRootsBySeat,
    sourceMailNativeTopFourSettlementsByPhysicalSeat:
      trial.mailAba.bilateralMailAudit.nativeStoreResolvedBySeat,
    nativeEngineErrors:trial.allRegisteredIdInitialDealParity.filter(
      x=>x.afterSetupControlStatus==='engine-error'||
        x.afterSetupMailStatus==='engine-error')
      .map(x=>x.id)
  };
  const gates={
    ...trial.gates,
    ...verified.requestAudit,
    allEightOpportunityRows:paired.length===8,
    allSourceSeatsKnown:paired.every(x=>x.sourceSeat===0||x.sourceSeat===1)
  };
  delete gates.rows;
  return {schema:VERSION,registry:REG.schema,
    nativeEnginePin:trial.observedPinnedNative,
    nativeRootCap:ACTION_LIMIT,
    commonProtocol:RNG_PROTOCOL,
    gates,originalEightLegacyAndAba:
      trial.allRegisteredIdInitialDealParity,
    sourceAndCandidateOpportunityRows:paired,
    sourceAndCandidateOpportunitySummary:summary,
    fullAfterSetupNativeComparison:trial,
    requestAudit:verified.requestAudit,
    competitiveGamesQualified:0,winRate:null,
    status:'FAIL-development-only'};
}
if(require.main===module){
  const file=process.env.AGENT4_POSTSETUP_96ROOT_OUTPUT;
  assert.ok(file,'Require atomic output filename');
  const value=run(),body=JSON.stringify(value,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,body);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(body).digest('hex')+'  '+
    path.basename(file)+'\n');
  process.stdout.write('AGENT4_POSTSETUP_96ROOT '+JSON.stringify({
    gates:value.gates,
    summary:value.sourceAndCandidateOpportunitySummary,
    byArm:value.sourceAndCandidateOpportunityRows.map(x=>({
      id:x.id,
      sourceBaseline:x.baseline.source.selectedAttackNames,
      sourceTreatment:x.sourceMailTreatment.source.selectedAttackNames,
      originalSourceEndTurn:x.baseline.source.reachedLastGlobalTurn,
      mailSourceEndTurn:x.sourceMailTreatment.source.reachedLastGlobalTurn,
      originalCandidateEndTurn:x.baseline.candidate.reachedLastGlobalTurn,
      mailCandidateEndTurn:x.sourceMailTreatment.candidate.reachedLastGlobalTurn,
      candidateBaselineAttacks:x.baseline.candidate.selectedAttackNames,
      candidateTreatmentAttacks:x.sourceMailTreatment.candidate.selectedAttackNames,
      sourceMailCards:x.sourceMailTreatment.source.cardsPlayed
        .filter(y=>y.card==="Trainers' Mail"),
      baselineStatus:x.statusBaseline,treatmentStatus:x.statusTreatment
    })),
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,ACTION_LIMIT,sourceAndCandidatePaidActions,
  withVerifiedNinetySixRootNativeCap,run};
