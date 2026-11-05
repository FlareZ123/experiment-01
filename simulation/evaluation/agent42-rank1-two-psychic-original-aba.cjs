'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:historicPreflight}=
  require('./agent42-selected-v3-rank1-independent-heldout.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {withTwoPsychicRetreatCustody}=
  require('../twinleaf/agent42-two-psychic-retreat-physical-custody.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-rank1-two-psychic-paid-retreat-original-deal-aba-20261105.json';
const BLOB='337aec2fc79536a104296c29e8f5fc1b6b0eb177';
const VERSION='agent42-original-rank1-native-two-psychic-aba-v1';
const OUTPUT='agent42-rank1-two-psychic-paid-retreat-original-aba-native.json';

/** Verify exact historical printed lists, policy and preregistered fork. */
function preflight(){
  assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,REG))),BLOB);
  const spec=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  assert.equal(spec.historicalSourceWitness.seed,884910343);
  assert.deepEqual(spec.modes.map(x=>x.actorTwoUnitPaidRetreatRoot),
    [false,true,false]);
  const {r,old}=historicPreflight();
  assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,
    spec.frozenInput.registrationPath))),
    spec.frozenInput.registrationGitBlob);
  assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,
    spec.frozenInput.selectedV3ManifestPath))),
    spec.frozenInput.selectedV3ManifestGitBlob);
  const trial=r.trials.find(x=>
    x.id===spec.historicalSourceWitness.originalTrialId);
  assert.ok(trial);
  assert.equal(trial.seed,spec.historicalSourceWitness.seed);
  assert.equal(trial.candidateSlot,'A');
  const selected=old.modes.find(x=>x.id===spec.frozenInput.policyModeId);
  assert.equal(selected?.actorFundedShadowRiderFloatStoneRoot,true);
  const pin=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(pin,spec.frozenInput.pinnedTwinleafRevision);
  return {spec,old,trial,selected,pin};
}

/** First real accepted-root difference rather than a paper move guess. */
function firstDifference(a,b){
  const x=a.rootActionLedger??[],y=b.rootActionLedger??[];
  for(let i=0;i<Math.max(x.length,y.length);i++)
    if(JSON.stringify(x[i]??null)!==JSON.stringify(y[i]??null))
      return {index:i,control:x[i]??null,treatment:y[i]??null};
  return null;
}

/** Owner-visible position and native attack/response receipts. */
function summary(row){
  const roots=row.rootActionLedger??[];
  const owner=roots.filter(x=>x.playerSlot===1&&x.turnBefore===34);
  const settlements=(row.sourceAttackSettlement?.attacks??[])
    .filter(x=>x.attackName==='Max Geist'&&
      x.actionOrdinal>=(owner[0]?.actionOrdinal??Infinity));
  const first=settlements[0];
  const opponentReply=roots.find(x=>first&&
    x.actionOrdinal>(first.completionRootOrdinal??first.actionOrdinal)&&
    x.turnBefore===35&&x.playerSlot===0&&
    x.action!=='ResolvePromptAction')??null;
  return {
    trial:row.trial?.id,status:row.status??null,error:row.error??null,
    sourcePhysical:row.sourceDealFingerprint??null,
    fullPhysical:row.fullPhysicalDealFingerprint??null,
    startingSeat:row.actualStarterSeat??null,
    ledgerHash:row.rootActionLedgerSha256??null,
    turn34SourceRoots:owner,
    paidIntents:row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.twoUnitPaidRetreatRootSelected??0,
    settledMaxGeist: settlements.map(x=>({
      actionOrdinal:x.actionOrdinal,
      completionRootOrdinal:x.completionRootOrdinal,
      prizeBefore:x.prizeBefore??null,
      prizeAfter:x.prizeAfter??null,
      settledPromptChain:x.settledPromptChain??null
    })),
    firstRealOpponentNextTurnDecision:opponentReply,
    nativeFinished:row.finished??false,
    nativeWinner:row.winner??null,
    nativeFinalPrizes:row.finalPrizes??null,
    competitiveQualified:false
  };
}

/** Historical exact physical deal, three arms, native Store payment only. */
function run(){
  const {spec,old,trial,selected,pin}=preflight();
  const modes=[];
  for(const mode of spec.modes){
    const options=effectiveOptions({
      commonPolicy:{...old.selectedV3CommonPolicy,
        nativeRootActionLimit:spec.actionCap},
      nativeActionCap:spec.actionCap,registeredTrials:[trial]
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
    modes.push({id:mode.id,feeCustody:observed.audit,
      summary:summary(row),fullNative:observed.result});
  }
  const [a,b,c]=modes;
  const compare=compareSafely(a.fullNative.rows,b.fullNative.rows)[0];
  const repeat=compareSafely(a.fullNative.rows,c.fullNative.rows)[0];
  const matched=x=>x.sameSeed&&x.sameSourceDeal&&
    x.sameFullDeal&&x.sameStart;
  const verdict={
    originalSourceRank:1,trial:trial.id,
    exactOpeningInAllArms:matched(compare)&&matched(repeat),
    repeatedControlIdentical:
      a.summary.ledgerHash!==null&&
      a.summary.ledgerHash===c.summary.ledgerHash&&
      a.summary.status===c.summary.status,
    firstAcceptedRootDifference:firstDifference(
      a.fullNative.rows[0],b.fullNative.rows[0]),
    paidRootSelections:b.summary.paidIntents,
    attemptedPhysicalPaidRetreats:b.feeCustody.attempts,
    exactlyPaidNativeRetreats:b.feeCustody.exactPhysicalPaidRetreats,
    maxGeistSettlementCount:b.summary.settledMaxGeist.length,
    realOpposingNextTurnAction:
      b.summary.firstRealOpponentNextTurnDecision!==null,
    statuses:modes.map(m=>({id:m.id,status:m.summary.status,
      finished:m.summary.nativeFinished,
      prizes:m.summary.nativeFinalPrizes})),
    competitivelyQualifiedGames:0,fieldWinRate:null
  };
  return {schema:VERSION,registrationPath:REG,registrationBlob:BLOB,
    pinnedTwinleaf:pin,evidenceClass:'retrospective source seed',
    verdict,modes};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const p=preflight();
    process.stdout.write('AGENT42_TWO_PSYCHIC_PREFLIGHT '+
      JSON.stringify({trial:p.trial.id,pin:p.pin})+'\n');
  }else{
    const x=run();
    require('./agent23-selected-joint-v2-release.cjs')
      .writeAtomicLocked(OUTPUT,x);
    process.stdout.write('AGENT42_TWO_PSYCHIC_ORIGINAL_ABA '+
      JSON.stringify(x.verdict)+'\n');
  }
}
module.exports={REG,BLOB,VERSION,OUTPUT,preflight,firstDifference,summary,run};
