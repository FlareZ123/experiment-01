'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {firstDifference,summary}=
  require('./agent42-rank1-two-psychic-original-aba.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {withTwoPsychicRetreatCustody}=
  require('../twinleaf/agent42-two-psychic-retreat-physical-custody.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-rank1-two-psychic-rebased-v2-20261106.json';
const BLOB='ddc9eb388b69b354040bffc2c79a93f1be07bb28';
const VERSION='agent42-original-rank1-two-psychic-rebased-native-v2';
const OUTPUT='agent42-rank1-two-psychic-rebased-v2-native.json';
const read=relative=>fs.readFileSync(path.join(ROOT,relative));

/** Verify new registration and historical printed cards before native execution. */
function preflight(){
  assert.equal(gitBlobHash(read(REG)),BLOB);
  const reg=JSON.parse(read(REG));
  const pins=[
    [reg.baseRegistrationPath,reg.baseRegistrationBlob],
    [reg.frozenSourceRegistration,reg.frozenSourceBlob],
    [reg.frozenTransport,reg.frozenTransportBlob],
    [reg.frozenSourceSelectedManifest,reg.frozenSourceSelectedManifestBlob],
    ...reg.preexistingCurrentCodeBlobs.map(x=>[x.path,x.blob])
  ];
  for(const [file,sha] of pins)
    assert.equal(gitBlobHash(read(file)),sha,'Runtime input drift '+file);
  const original=JSON.parse(read(reg.baseRegistrationPath));
  const prior=JSON.parse(read(reg.frozenTransport));
  const sources=JSON.parse(read(reg.frozenSourceRegistration));
  const trial=sources.trials.find(t=>t.id===reg.sourceTrialId);
  assert.ok(trial);
  assert.equal(trial.seed,884910343);
  assert.equal(trial.candidateSlot,'A');
  assert.equal(reg.actionCap,240);
  assert.equal(reg.nAttempts,3);
  assert.deepEqual(reg.modeSequence,original.modes.map(x=>x.id));
  assert.equal(original.frozenInput.policyModeId,
    'selected-v3-paper-plus-funded-mobility');
  const selected=prior.modes.find(m=>m.id===original.frozenInput.policyModeId);
  assert.equal(selected?.actorFundedShadowRiderFloatStoneRoot,true);
  assert.deepEqual(original.modes.map(m=>m.actorTwoUnitPaidRetreatRoot),
    [false,true,false]);
  const pin=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(pin,reg.pinnedTwinleaf);
  return {reg,original,prior,trial,selected,pin};
}

/** Three exact original-deal arms, with all aborted outcomes retained. */
function run(){
  const {reg,original,prior,trial,selected,pin}=preflight();
  const modes=[];
  for(const mode of original.modes){
    const options=effectiveOptions({
      commonPolicy:{...prior.selectedV3CommonPolicy,
        nativeRootActionLimit:reg.actionCap},
      nativeActionCap:reg.actionCap,registeredTrials:[trial]
    },selected);
    options.actorTwoUnitPaidRetreatRoot=mode.actorTwoUnitPaidRetreatRoot;
    options.actorTwoUnitPaidRetreatTargetTurn=
      mode.actorTwoUnitPaidRetreatTargetTurn??null;
    options.registeredFrameName=VERSION+':'+mode.id;
    const observed=withTwoPsychicRetreatCustody(()=>
      withSameRuntime(()=>runDevelopment(options)));
    assert.equal(observed.result.attempted,1);
    const row=observed.result.rows[0];
    assert.equal(row.trial.id,trial.id);
    const evidence=summary(row);
    modes.push({id:mode.id,feeCustody:observed.audit,
      summary:evidence,actualSourceAttackSettlement:
        row.sourceAttackSettlement??null,fullNative:observed.result});
  }
  const [a,b,c]=modes;
  const ab=compareSafely(a.fullNative.rows,b.fullNative.rows)[0];
  const ac=compareSafely(a.fullNative.rows,c.fullNative.rows)[0];
  const matched=x=>x.sameSeed&&x.sameSourceDeal&&
    x.sameFullDeal&&x.sameStart;
  const verdict={
    originalSourceRank:1,trial:trial.id,
    exactOpeningInAllArms:matched(ab)&&matched(ac),
    repeatedControlIdentical:a.summary.ledgerHash!==null&&
      a.summary.ledgerHash===c.summary.ledgerHash&&
      a.summary.status===c.summary.status,
    firstAcceptedRootDifference:firstDifference(
      a.fullNative.rows[0],b.fullNative.rows[0]),
    paidRootSelections:b.summary.paidIntents,
    attemptedPhysicalPaidRetreats:b.feeCustody.attempts,
    globallyObservedPaidRetreats:b.feeCustody.exactPhysicalPaidRetreats,
    realStoreRootCorroborationRequired:true,
    sourceSettlements:b.summary.settledMaxGeist.length,
    candidateNextTurnActionObserved:
      b.summary.firstRealOpponentNextTurnDecision!==null,
    allStatuses:modes.map(m=>({
      id:m.id,status:m.summary.status,
      finished:m.summary.nativeFinished,
      prizes:m.summary.nativeFinalPrizes
    })),
    competitivelyQualifiedGames:0,fieldWinRate:null
  };
  return {schema:VERSION,registrationPath:REG,registrationBlob:BLOB,
    pinnedTwinleaf:pin,evidenceClass:'re-registered retrospective',
    originalRegistrationPath:reg.baseRegistrationPath,
    sourceCodeWasRebasedAfterHistoricalPreflightFailure:true,
    verdict,modes};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const v=preflight();
    process.stdout.write('AGENT42_REBASED_PREFLIGHT '+
      JSON.stringify({trial:v.trial.id,pin:v.pin})+'\n');
  }else{
    const result=run();
    require('./agent23-selected-joint-v2-release.cjs')
      .writeAtomicLocked(OUTPUT,result);
    process.stdout.write('AGENT42_REBASED_RETREAT '+
      JSON.stringify(result.verdict)+'\n');
  }
}
module.exports={REG,BLOB,VERSION,OUTPUT,preflight,run};
