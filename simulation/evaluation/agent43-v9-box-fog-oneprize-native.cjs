'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runStewardBilateralProbeV9,writeJsonAtomic}=
  require('./agent36-issue25-common-v9-bilateral-competence.cjs');
const {withOwnerOneEnergyBoxKo,VERSION:BRIDGE_VERSION}=
  require('../twinleaf/agent43-owner-secretbox-fog-ko.cjs');
const {VERSION:PAYMENT_VERSION}=
  require('../twinleaf/agent4-secret-box-paper-payment-hook.cjs');

const VERSION='agent43-original-rank11-v9-owner-box-oneprize-native-exposed-v1';
const ROOT=path.resolve(__dirname,'../..');
const ARTIFACT=path.join(ROOT,
  'artifacts/agent43-v9-root93-secretbox-oneprize/attempt.json');
const DIAGNOSTIC=path.join(ROOT,
  'artifacts/agent43-v9-root93-secretbox-oneprize/diagnostic.json');
const expected='11:1000:B:new-moon-lockbreaker-v1';

/** @param {string} filename @returns {string} */
function sha256File(filename){
  return createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}
/**
 * The one source-exposed registered physical deal remains fixed. The generic
 * public-state actor policy applies to both seats and only replaces a Pass.
 * This is a structural native-move proof experiment, not a deck comparison.
 * @param {{runProbe?:Function,withBridge?:Function}} [deps]
 * @returns {object}
 */
function runNativeOwnerBoxKo(deps={}){
  const withBridge=deps.withBridge??withOwnerOneEnergyBoxKo;
  const runProbe=deps.runProbe??runStewardBilateralProbeV9;
  const hooked=withBridge(()=>runProbe());
  const result=hooked.result,audit=hooked.audit;
  assert.equal(result.manifest.registeredTrialIds[0],expected);
  assert.deepEqual(result.manifest.originalSourceRanks,[11]);
  assert.equal(result.manifest.candidateSlot,'B');
  assert.equal(result.manifest.samePolicyBothSeats,true);
  assert.equal(result.manifest.actorOnlyComposition,true);
  assert.equal(result.manifest.competitiveGamesQualified,0);
  const combined=createHash('sha256').update(JSON.stringify({
    basePolicyHash:result.manifest.policyHash,
    bridgeHash:sha256File(require.resolve(
      '../twinleaf/agent43-owner-secretbox-fog-ko.cjs')),
    paymentHookHash:sha256File(require.resolve(
      '../twinleaf/agent4-secret-box-paper-payment-hook.cjs')),
    wrapperHash:sha256File(__filename)
  })).digest('hex');
  result.manifest.agent43BoxOnePrizeVariant={
    version:VERSION,bridgeVersion:BRIDGE_VERSION,paymentHookVersion:PAYMENT_VERSION,
    originalSourceRank:11,sourceSeat:0,candidateSeat:1,
    originalSourceExposed:true,frozenSeed:626469135,
    noChangesToEitherPrinted60:true,
    bothPhysicalSeats:true,sourceIndependentPublicTrigger:true,
    originalRootPolicyUnchangedUntilOtherwisePass:true,
    attachedOwnerPolicyHash:combined,
    competitiveGamesQualified:0,
    clinicalClaim:false,prospective:false,confirmatory:false
  };
  result.nativeAdapterAudit.agent43OneEnergyBoxKo=audit;
  result.manifest.historicalOnly=true;
  result.manifest.prospective=false;
  result.manifest.confirmatoryTrial=false;
  result.qualification.competitiveAdmission=false;
  result.qualification.bilateralMaterialEpisodeQualified=false;
  result.qualification.reason='Retrospective source-exposed same physical deal; '+
    'native item payment, prompt and attack experiment with weak unqualified '+
    'opponent policy. A live action is not proof of paper-competitive strength.';
  return result;
}
function main(){
  let result;
  try{
    result=runNativeOwnerBoxKo();
  }catch(error){
    const diagnostic={
      version:VERSION,status:'NATIVE_INVOCATION_ERROR_UNQUALIFIED',
      errorType:error?.constructor?.name??'Error',
      errorMessage:String(error?.message??error).slice(0,500),
      ownerAudit:error?.agent43Audit??null,
      sourceExposure:true,competitiveGamesQualified:0
    };
    writeJsonAtomic(DIAGNOSTIC,diagnostic);
    throw error;
  }
  writeJsonAtomic(ARTIFACT,result);
  const a=result.nativeAdapterAudit.agent43OneEnergyBoxKo;
  const roots=result.nativeAttempt.rootActionLedger??[];
  const root93=roots.find(x=>x.actionOrdinal===93);
  const summary={
    schema:VERSION,
    source:expected,
    rootActionCount:result.nativeAttempt.rootActionCount,
    sourceSeat:result.nativeAttempt.sourceSeat,
    candidateSeat:result.nativeAttempt.candidateSeat,
    root93Action:root93?.action??null,
    root93Card:root93?.card??null,
    nativeStatus:result.nativeAttempt.status,
    winner:result.nativeAttempt.winner,
    finalPrizes:result.nativeAttempt.finalPrizes,
    ownerBridge:a,competitivelyQualifiedGames:0,
    artifact:ARTIFACT
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  assert.equal(a.liveRuns,1,'Bridge was not invoked in genuine match');
  assert.ok(a.candidatePlans>0,'One-energy Secret Box payoff was never selected');
  assert.ok(a.paperPaymentsAccepted>0,'Three physical Secret Box costs not settled');
  assert.ok(a.physicalBoxSearches>0,'No Fog Crystal physically searched');
  assert.ok(a.physicalFogSearches>0,'No Basic Psychic physically searched');
  assert.ok(a.physicallyAttachedBasic>0,'No native Energy placed on own Active');
  assert.ok(a.submittedAttacks>0,'No actual native Hidden Power submitted');
}

if(require.main===module)main();
module.exports={VERSION,ARTIFACT,DIAGNOSTIC,runNativeOwnerBoxKo};
