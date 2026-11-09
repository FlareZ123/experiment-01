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
const OUTPUT=path.join(ROOT,'artifacts/agent21-rank5-fog-energy-counterfactual.json');
const SOURCE_DEAL='65b0ab58d71b58e4125e5a87004fcc0d1a4560ec6962ecfabf683838e0f49922';
const FULL_DEAL='45ff848189119b7fa551dc86f9c6eeefa82db81117c7a7fdae8bc38361b72349';
const sha256=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const FIRST23=process.env.AGENT21_RANK5_FIRST23_SHA256??
  '3a1fca9fc300e5bd8a2b10fd3df8dc6d8b3ca44cfc2a94c6c5e6d3978d157825';

/**
 * A single retrospective, exact-native owner-deck search response fork.
 * Only root23's genuine candidate Fog Crystal ChooseCardsPrompt on global turn2
 * changes; selects a physically available Basic Psychic Energy from the owner's
 * searchable deck. The experimental seat/turn scope is not a general policy.
 *
 * @template T
 * @param {()=>T} run Existing registered full-game runner.
 * @returns {{result:T,audit:object}}
 */
function withFirstCandidateFogEnergy(run){
  assert.equal(typeof run,'function');
  const fog=require('../../twinleaf/agent9-fog-actor-prompt.cjs');
  const original=Object.getOwnPropertyDescriptor(
    fog,'withActorFogCrystalPrompt');
  assert.equal(typeof original?.value,'function');
  const audit={schema:'agent21-first-original-rank5-owner-fog-search-energy-v2',
    selectedCount:0,acceptedCount:0,rejectedCount:0,selection:[],
    originalFogAdapter:fog.VERSION,
    trialSpecific:true,competitivePaperQualified:false};
  function interceptedFog(runFog,deps){
    const after=original.value.call(fog,runFog,{
      ...(deps??{}),
      choosePrinting:(view,offered)=>{
        // A physical owner-deck search is already legally in progress.
        // No opponent hidden zones, Prize contents, or post-search future
        // state are consulted. The seat/turn scope is a one-deal diagnostic.
        const energy=view.actorSeat===1&&view.globalTurn===2&&
          audit.selectedCount===0?
          offered.find(row=>row.permitted&&row.psychicEnergy):null;
        if(energy){
          audit.selectedCount++;
          audit.selection.push({seat:view.actorSeat,turn:view.globalTurn,
            ownerDeckSearch:view.pendingOwnerDeckSearch,
            selectedPrinting:energy.printing,
            otherPermittedOfferCount:offered.filter(row=>row.permitted).length});
          return energy.printing;
        }
        return fog.chooseFogPrinting(view,offered);
      }
    });
    const native=(after.audit?.events??[]).filter(event=>
      event.kind==='fog-search'&&event.seat===1&&event.turn===2&&
      event.chosen==='Psychic Energy MEE');
    audit.acceptedCount+=native.filter(e=>e.nativeStoreAccepted===true).length;
    audit.rejectedCount+=native.filter(e=>e.nativeStoreAccepted===false).length;
    audit.selection.push(...native.map(e=>({
      type:'native-owner-prompt-dispatch',...e
    })));
    return after;
  }
  Object.defineProperty(fog,'withActorFogCrystalPrompt',
    {...original,value:interceptedFog});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(fog.withActorFogCrystalPrompt,interceptedFog);
    Object.defineProperty(fog,'withActorFogCrystalPrompt',original);
  }
}

function replay(){
  const {reg,registrationSha256}=registration();
  const capture=gameCapture();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const scoped=withFirstCandidateFogEnergy(()=>runDevelopment({
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
    registeredTrials:reg.preRegisteredTrials,
    registeredFrameName:'agent21-retro-fog-energy-first-owner-search',
    nativeRootActionLimit:reg.nativeRootCap,
    onRootActionDispatched:capture.onRootActionDispatched
  }));
  assert.equal(scoped.result.rows.length,1);
  const row=scoped.result.rows[0],roots=row.rootActionLedger??[];
  const tape=capture.evidence();
  const before=tape.postAcceptedRoots[22]?.physicalZones?.[1];
  const after=tape.postAcceptedRoots[23]?.physicalZones?.[1];
  const received=after?.hand?.find(c=>
    c.printing==='Psychic Energy MEE'&&
    !before?.hand?.some(old=>old.id===c.id))??null;
  const physicalAttachmentActions=roots.filter(r=>
    r.playerSlot===1&&r.action==='PlayCardAction'&&
    (r.card==='Psychic Energy'||r.card==='Telepathic Psychic Energy'));
  const checks={
    sourceSame:row.sourceDealFingerprint===SOURCE_DEAL,
    fullDealSame:row.fullPhysicalDealFingerprint===FULL_DEAL,
    first23RootActionsSame:sha256(roots.slice(0,23))===FIRST23,
    fogPromptChangedExactlyOnce:scoped.audit.acceptedCount===1&&
      scoped.audit.rejectedCount===0,
    ownerPhysicalPsychicReceived:Boolean(received)
  };
  return {
    schema:'agent21-rank5-first-native-fog-psychic-search-fork-v1',
    posthocOriginalCase:reg.caseId,originalSourceArtifactId:13678516703,
    originalRegistrationSha256:registrationSha256,
    retrospectiveSameSeed:true,samePrintedSixties:true,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullDealFingerprint:row.fullPhysicalDealFingerprint,
    selectedOriginalRootOrdinal:23,
    checks,ownerFogPromptAudit:scoped.audit,
    ownerSearchPhysicalBefore:before?.hand?.map(x=>x.printing)??null,
    ownerSearchPhysicalAfter:after?.hand?.map(x=>x.printing)??null,
    receivedPsychicEnergy:received,
    acceptedPhysicalEnergyAttachments:physicalAttachmentActions,
    nativeFinished:row.finished===true,
    nativeError:row.error??null,
    nativeWinner:row.finished===true?row.winner??null:null,
    nativePrizes:row.finalPrizes??null,
    nativeAcceptedRoots:roots.length,
    sourceAttacks:roots.filter(r=>
      r.playerSlot===0&&r.action==='AttackAction').length,
    candidateAttacks:roots.filter(r=>
      r.playerSlot===1&&r.action==='AttackAction').length,
    nativeOriginalRow:row,fullPostAcceptedPhysicalZoneTape:tape,
    competitivePaperQualifiedGames:0
  };
}

/** Persist complete authentic native evidence atomically, with a lock. */
function save(data){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(tmp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const result=replay();
  save(result);
  console.log('AGENT21_NATIVE_FIRST_FOG_PSYCHIC',JSON.stringify({
    checks:result.checks,prompt:result.ownerFogPromptAudit,
    receivedEnergy:result.receivedPsychicEnergy,
    attachments:result.acceptedPhysicalEnergyAttachments,
    sourceAttacks:result.sourceAttacks,candidateAttacks:result.candidateAttacks,
    finished:result.nativeFinished,winner:result.nativeWinner,
    prizes:result.nativePrizes,roots:result.nativeAcceptedRoots,
    error:result.nativeError,competitiveGames:0}));
  assert.ok(Object.values(result.checks).every(Boolean),
    'The registered owner-Fog physical search fork must reproduce exact case and accepted target');
  return result;
}
if(require.main===module)main();
module.exports={withFirstCandidateFogEnergy,replay,main};
