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
  '89cecd40bcf4b066a05625d29812a6a8c5f95f90fc48d4f086892f60572c84';

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
  const base=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(base,'simple-bot/simple-tactics-ai'));
  const {Store}=require(path.join(base,'game/store/store'));
  const {ResolvePromptAction}=require(path.join(base,
    'game/store/actions/resolve-prompt-action'));
  const originalDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalDecode?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const selected=new WeakMap();
  let liveStore=null,accepted=false;
  const audit={schema:'agent21-first-original-rank5-owner-fog-search-energy-v1',
    selectedCount:0,acceptedCount:0,rejectedCount:0,selection:[],
    trialSpecific:true,competitivePaperQualified:false};

  function decode(state){
    if(state!==liveStore?.state)return originalDecode.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id);
    const prompt=state.prompts?.find(p=>p.result===undefined);
    if(!accepted&&seat===1&&state.turn===2&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.playerId===this.client?.id&&
      prompt.sourceCard?.fullName==='Fog Crystal CRE'&&
      prompt.cards===state.players[seat].deck){
      const energy=prompt.cards.cards.find(c=>
        c.name==='Psychic Energy'&&c.energyType!==undefined&&
        c.fullName==='Psychic Energy MEE'&&
        prompt.validate([c],state)===true);
      if(energy){
        const action=new ResolvePromptAction(prompt.id,[energy]);
        selected.set(action,{seat,turn:state.turn,promptId:prompt.id,
          sourceCard:prompt.sourceCard.fullName,
          selectedPrinting:energy.fullName,selectedPhysicalId:energy.id});
        audit.selectedCount++;
        return action;
      }
    }
    return originalDecode.value.call(this,state);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const receipt=this===liveStore?selected.get(action):null;
    try{
      const result=originalDispatch.value.call(this,action,...args);
      if(receipt){
        accepted=true;
        audit.acceptedCount++;
        audit.selection.push({...receipt,StoreAccepted:true});
      }
      return result;
    }catch(error){
      if(receipt){
        audit.rejectedCount++;
        audit.selection.push({...receipt,StoreAccepted:false,
          error:String(error?.message??error)});
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...originalDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalDecode);
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
