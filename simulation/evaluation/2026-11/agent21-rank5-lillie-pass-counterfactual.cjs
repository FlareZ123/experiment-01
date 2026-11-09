'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {registration,gameCapture}=
  require('./agent44-first-original-rank5-newmoon-case.cjs');
const sourceFunding=require('./agent8-source-mew-funding-v6.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'artifacts/agent21-rank5-lillie-pass-counterfactual.json');
const ORIGINAL_NATIVE_ARTIFACT=13678516703;
const ORIGINAL_CASE='agent44-20261109-original-rank5-newmoon-fresh-4410B';
const SOURCE_DEAL='65b0ab58d71b58e4125e5a87004fcc0d1a4560ec6962ecfabf683838e0f49922';
const FULL_DEAL='45ff848189119b7fa551dc86f9c6eeefa82db81117c7a7fdae8bc38361b72349';
const FIRST32='bf9829b8e6a44d5bf042ecdcd50fe364a3c8d75412948d0ab55a1924e3777427';
const sha256=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/**
 * One posthoc native policy diagnostic using the immutable original physical
 * seed and fixed sixties. Owner-visible Lillie-after-Pass applies symmetrically
 * to both seats. Preserve the original source case unchanged.
 */
function replay(){
  const {reg,registrationSha256}=registration();
  assert.equal(reg.caseId,ORIGINAL_CASE);
  const capture=gameCapture();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const result=runDevelopment({
    ...frozen.policyOptions,...sourceFunding.options(true),
    sourceIndependentCommonPolicy:true,
    bilateralPerfectionRoot:true,
    actorVipAfterPass:true,
    actorMewMaxMiracleOverSelfCopy:true,
    sourceScopedQuickBallRoot:true,
    actorMewQuickBallPaymentGuard:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    nativeAcceptedTargets:true,
    nativeSetupCoinChoiceReceipt:true,
    nativeSetupCompensationAudit:true,
    nativePublicMulliganRevealsAudit:true,
    physicalZoneGate:true,
    losslessNativeRootJoin:true,
    paperSupporterQuota:true,
    paperSameTargetAttachEnergy:true,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true,
    allowExtendedRegisteredNativeRootCap:true,
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    actorBilateralLillieAfterPass:true,
    registeredTrials:reg.preRegisteredTrials,
    registeredFrameName:'agent21-retrospective-Lillie-fork-of-'+ORIGINAL_CASE,
    nativeRootActionLimit:reg.nativeRootCap,
    onRootActionDispatched:capture.onRootActionDispatched
  });
  assert.equal(result.rows.length,1);
  const row=result.rows[0], roots=row.rootActionLedger??[];
  const tape=capture.evidence();
  const before=tape.postAcceptedRoots[31]?.physicalZones?.[1];
  const after=tape.postAcceptedRoots[32]?.physicalZones?.[1];
  const firstTreatmentRoot=roots[32]??null;
  const qualifying={
    originalSourceDealSame:row.sourceDealFingerprint===SOURCE_DEAL,
    originalFullDealSame:row.fullPhysicalDealFingerprint===FULL_DEAL,
    referenceFirst32ActionsSame:sha256(roots.slice(0,32))===FIRST32,
    originalLillieHeldAtOwnerTurn2:
      before?.hand?.filter(x=>x.printing==="Lillie's Determination M1L").length===2,
    selectedFirstDifferentOwnerAction:roots[32]?.playerSlot===1&&
      roots[32]?.turnBefore===2&&
      roots[32]?.action==='PlayCardAction'&&
      roots[32]?.card==="Lillie's Determination",
    physicallyPaidSupporter:after?.hand?.filter(
      x=>x.printing==="Lillie's Determination M1L").length<2
  };
  const reply={
    schema:'agent21-retrospective-first-native-rank5-lillie-fork-v1',
    originalCase:ORIGINAL_CASE,
    originalArtifactId:ORIGINAL_NATIVE_ARTIFACT,
    originalRegistrationSha256:registrationSha256,
    originalSeedReused:true,
    originalSourceAndCandidateSixtiesUnchanged:true,
    firstPaperOpportunityRoot:32,
    baselineAtRoot32:'Candidate PassTurnAction with two Lillie Determination cards held',
    actualFirstTurnSeat:row.actualStarterSeat??null,
    originalSourceDealFingerprint:row.sourceDealFingerprint??null,
    originalFullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    qualifying,
    firstTreatmentRoot,
    heldCandidateBeforeRoot32:before?.hand?.map(x=>x.printing)??null,
    candidateAfterRoot32:after?.hand?.map(x=>x.printing)??null,
    lillieNativeAudit:row.ownerBilateralLillieAfterPassAudit??null,
    sourceAttacks:roots.filter(x=>x.playerSlot===0&&x.action==='AttackAction').length,
    candidateAttacks:roots.filter(x=>x.playerSlot===1&&x.action==='AttackAction').length,
    nativeFinished:row.finished===true,
    nativeError:row.error??null,
    nativeWinner:row.finished===true?row.winner??null:null,
    nativePrizes:row.finalPrizes??null,
    roots:roots.length,
    fullNativeRow:row,
    fullPostAcceptedPhysicalZoneTape:tape,
    competitivePaperQualifiedGames:0,
    causalScope:'Same archived seed, new policy fork; posthoc development only, not independent registered matchup or paper/clock certification'
  };
  return reply;
}
/** Save once, exclusively, with durable atomic rename. */
function save(data){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main(){
  const result=replay();
  save(result);
  const {qualifying,lillieNativeAudit,sourceAttacks,candidateAttacks,
    nativeFinished,nativeWinner,roots,nativeError}=result;
  console.log('AGENT21_RANK5_LILLIE_FORK',JSON.stringify({
    qualifying,acceptedLillieRoots:lillieNativeAudit?.acceptedLillieRoots??null,
    sourceAttacks,candidateAttacks,nativeFinished,nativeWinner,roots,nativeError,
    competitivePaperQualifiedGames:0
  }));
  assert.ok(Object.values(qualifying).every(Boolean),
    'Exact original-source deal and native physical Supporter fork not all witnessed');
  assert.ok((lillieNativeAudit?.acceptedLillieRoots??0)>0,
    'Registered both-seat Lillie policy did not settle a native Supporter');
  return result;
}
if(require.main===module)main();
module.exports={ORIGINAL_CASE,replay,main};
