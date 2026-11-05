'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');

const VERSION='agent35-rank11-source-professor-letter-pass37-fork-v1';
const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const SHA=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Verify an original-source Item decision using the actual card in hand,
 * real pre-policy actor-visible board and global turn quotas.
 *
 * @param {object} view Detached actor-only observation, no opponent hand.
 * @param {object} registration Frozen selected original Pass root.
 * @returns {number|null} Real hand index or a negative/unknown outcome.
 */
function selectLetter(view,registration){
  if(view?.actorSeat!==registration.originalSourceSeat||
     view?.globalTurn!==registration.sourceTurn||
     view?.decisionKind!=='owner-root'||
     !Array.isArray(view.ownHand)||
     view.ownTurnResources?.itemPlayLocked!==false||
     view.ownPublic?.publicTurnRestrictions?.itemPlayLocked===true)
    return null;
  const idx=view.ownHand.indexOf(registration.sourceCardToPlay);
  return idx>=0?idx:null;
}

/**
 * Change exactly one source owner's baseline Pass, using only information
 * visible before the default policy chooses. Keep all other native actions.
 * Headless trial label controls which of the eight original deals is targeted.
 *
 * @template T
 * @param {()=>T} next Reproducible original eight-arm selected v5 runner.
 * @param {object} deps Native classes, headless boundary and registration.
 * @returns {{result:T,audit:object}} Native result plus attempted custodies.
 */
function withLetterFork(next,deps){
  assert.equal(typeof next,'function');
  const {headless,SimpleTacticsAi,PlayCardAction,registration}=deps;
  const observe=deps.observe??actorObservation;
  assert.equal(typeof headless?.runMatch,'function');
  assert.equal(typeof SimpleTacticsAi?.prototype.decodeNextAction,'function');
  const originalMatch=headless.runMatch;
  const audit={schema:VERSION,selectedOriginalId:registration.selectedOriginalId,
    sourceSeat:registration.originalSourceSeat,turn:registration.sourceTurn,
    selectedCount:0,sourceCallCount:0,actorSnapshot:null,
    defaultAction:null,proposedAction:null,
    opponentHiddenInformationInspected:false,
    candidatePolicyMutated:false,competitiveGamesQualified:0};
  function observedRunMatch(request){
    const target=typeof request?.label==='string'&&
      request.label.endsWith(registration.selectedOriginalId);
    if(!target)return originalMatch(request);
    audit.sourceCallCount++;
    const prior=Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction');
    assert.equal(typeof prior?.value,'function');
    function ownerDecode(state,...args){
      const seat=registration.originalSourceSeat;
      const owner=state?.players?.[seat];
      const eligible=state?.activePlayer===seat&&
        state?.turn===registration.sourceTurn&&
        owner?.id===this.client?.id&&
        !(state?.prompts??[]).some(p=>p.result===undefined)&&
        audit.selectedCount===0;
      const before=eligible?observe(state,seat):null;
      const baseline=prior.value.call(this,state,...args);
      if(!before||baseline?.constructor?.name!=='PassTurnAction')return baseline;
      const handIndex=selectLetter(before,registration);
      if(handIndex===null)return baseline;
      assert.equal(owner.hand.cards[handIndex]?.fullName,
        registration.sourceCardToPlay,
        'Native default decoder mutated the held source card');
      const action=new PlayCardAction(owner.id,handIndex);
      audit.selectedCount++;
      audit.defaultAction=baseline.constructor.name;
      audit.proposedAction=action.constructor.name;
      audit.actorSnapshot=before;
      return action;
    }
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
      ...prior,value:ownerDecode});
    try{
      if(typeof deps.withOwnerSearchHook==='function'){
        try{
          const selected=deps.withOwnerSearchHook(
            ()=>originalMatch(request),{registration});
          audit.ownerSearchAudit=selected.audit;
          return selected.result;
        }catch(error){
          audit.ownerSearchAudit=error?.agent35OwnerLetterSearchAudit??null;
          throw error;
        }
      }
      return originalMatch(request);
    }finally{Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',prior);}
  }
  headless.runMatch=observedRunMatch;
  try{return {result:next(),audit};}
  finally{headless.runMatch=originalMatch;}
}

/**
 * Run selected v5 once with a single frozen source Pass replacement.
 * All physical deal and accepted pre-fork roots must match original v5.
 * @param {object} [deps] Optional dependency injection for exact unit tests.
 * @returns {object} Failure-inclusive native Store result, not game wins.
 */
function run(deps={}){
  const reg=deps.registration??require('../../results/aichi-2026/registrations/agent35-rank11-letter-source-pass37-fork-20261105.json');
  const wrap=deps.withLetterFork??withLetterFork;
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(OUT,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const PlayCardAction=deps.PlayCardAction??
    require(path.join(OUT,'game/store/actions/play-card-action')).PlayCardAction;
  const runner=deps.runner??require('./agent36-issue25-steward-innermost-prize-v5.cjs')
    .runStewardInnermostPrizeV5;
  const observed=wrap(()=>runner(),{headless,SimpleTacticsAi,PlayCardAction,
    registration:reg});
  const rows=observed.result?.rawDevelopment?.rows;
  assert.ok(Array.isArray(rows)&&rows.length===8,
    'Native selected v5 did not return all eight original arms');
  const selected=rows.filter(row=>
    (row.trial?.id??row.id)===reg.selectedOriginalId);
  assert.equal(selected.length,1);
  const trial=selected[0];
  const custodyGateEvidence={
    trialStatus:trial.status??null,
    trialErrorClass:trial.error?.name??null,
    archivedPublicError:typeof trial.error==='string'?
      trial.error.slice(0,160):
      (typeof trial.error?.message==='string'?
        trial.error.message.slice(0,160):null),
    nativeAcceptedRoots:trial.rootActionLedger?.length??
      trial.nativeAbortEvidence?.rootActionLedger?.length??null,
    nativeAbortStage:trial.nativeAbortEvidence?.failureStage??null,
    nativePendingPrompt:trial.nativeAbortEvidence?.pendingPrompt??null,
    sourceFingerprintPresent:trial.sourceDealFingerprint!==null&&
      trial.sourceDealFingerprint!==undefined,
    wholeDealFingerprintPresent:trial.fullPhysicalDealFingerprint!==null&&
      trial.fullPhysicalDealFingerprint!==undefined
  };
  assert.equal(trial.sourceDealFingerprint,reg.originalSourceDealSha256,
    'Frozen source physical custody gate: '+JSON.stringify(custodyGateEvidence));
  assert.equal(trial.fullPhysicalDealFingerprint,
    reg.originalWholePhysicalDealSha256,
    'Frozen whole physical custody gate: '+JSON.stringify(custodyGateEvidence));
  const roots=trial.rootActionLedger??
    trial.nativeAbortEvidence?.rootActionLedger;
  assert.ok(Array.isArray(roots),'Missing native accepted source action tape');
  const prefix=roots.slice(0,reg.sourcePassRootOrdinal);
  const beforeForkParity=prefix.length===reg.sourcePassRootOrdinal&&
    SHA(prefix)===reg.beforePassRootPrefixLedgerSha256;
  const action=roots[reg.sourcePassRootOrdinal]??null;
  const originalSourceActionAccepted=action?.action==='PlayCardAction'&&
    action.playerSlot===reg.originalSourceSeat&&
    action.turnBefore===reg.sourceTurn&&
    /Letter/i.test(action.card??'');
  const promptRoots=roots.filter(root=>root.actionOrdinal>
    reg.sourcePassRootOrdinal&&
    root.turnBefore===reg.sourceTurn&&
    root.playerSlot===reg.originalSourceSeat&&
    root.action==='ResolvePromptAction');
  const sourceEnergyPlays=roots.filter(root=>root.actionOrdinal>
    reg.sourcePassRootOrdinal&&
    root.turnBefore===reg.sourceTurn&&
    root.playerSlot===reg.originalSourceSeat&&
    root.action==='PlayCardAction'&&/Darkness Energy/i.test(root.card??''));
  return {schema:VERSION,registrationId:reg.selectedOriginalId,
    observedPinnedTwinleaf:observed.result?.manifest?.observedTwinleafGitCommit,
    actualRunnerPolicy:observed.result?.manifest?.version??null,
    attemptedNativeOriginalRows:rows.length,
    sourceDealMatched:true,entirePhysicalDealMatched:true,
    originalPreForkSourceRootTapeMatched:beforeForkParity,
    sourceOwnerPass37Reached:observed.audit.selectedCount===1,
    proposedItemFromOwnerHand:observed.audit.proposedAction,
    sourceOwnerCardAcceptedByNativeStore:originalSourceActionAccepted,
    nativeRootAtSelectedOrdinal:action,
    sourceOwnerPreDecisionSnapshot:observed.audit.actorSnapshot,
    ...(observed.audit.ownerSearchAudit?{
      sourceOwnerSearchAudit:observed.audit.ownerSearchAudit}:{}),
    sourceFollowthroughPrompts:promptRoots,
    sameTurnRealOwnerDarknessEnergyPlayRoots:sourceEnergyPlays,
    originalSourceRowDisposition:trial.status??null,
    originalSourceArchivedNativeError:trial.error??null,
    originalSourceNativeStoreCauseStack:trial.nativeStoreCauseStack??null,
    originalSourceNativeAbortProvenance:trial.nativeAbortProvenance??null,
    // Redacted native decoder evidence preserves prompt type and safe frames.
    // Never copy exception text or owner-deck identities into the receipt.
    sourceDecoderFailure:trial.nativeAbortEvidence?{
      failureStage:trial.nativeAbortEvidence.failureStage??null,
      pendingPrompt:trial.nativeAbortEvidence.pendingPrompt??null,
      actionOrdinal:trial.nativeAbortEvidence.actionOrdinal??null,
      actingSeat:trial.nativeAbortEvidence.actingSeat??null,
      redactedMessageDigest:trial.nativeAbortEvidence.redactedMessageDigest??null,
      decoderFrameAttribution:
        trial.nativeAbortEvidence.decoderFrameAttribution??null
    }:null,
    originalSourceAcceptedRoots:roots.length,
    allNativeArmDispositions:rows.map(row=>({
      id:row.trial?.id??row.id,
      status:row.status??null,acceptedRoots:
        row.rootActionLedger?.length??
        row.nativeAbortEvidence?.rootActionLedger?.length??null
    })),
    zeroAutomaticPaperGameQualification:true,
    competitiveGamesQualified:0};
}

/**
 * Persist experiment receipt without half-written files or competing writers.
 * @param {string} filename Absolute file path.
 * @param {object} data Completed native result.
 */
function write(filename,data){
  assert.equal(typeof filename,'string');
  assert.equal(data?.schema,VERSION);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,filename);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const filename=process.env.AGENT35_RANK11_LETTER_FORK_OUTPUT;
  assert.ok(filename,'Set AGENT35_RANK11_LETTER_FORK_OUTPUT');
  const result=run();
  write(filename,result);
  process.stdout.write(JSON.stringify({
    schema:VERSION,preForkParity:result.originalPreForkSourceRootTapeMatched,
    actionReached:result.sourceOwnerPass37Reached,
    itemStoreAccepted:result.sourceOwnerCardAcceptedByNativeStore,
    prompts:result.sourceFollowthroughPrompts.length,
    sameTurnEnergyPlays:result.sameTurnRealOwnerDarknessEnergyPlayRoots.length,
    acceptedRoots:result.originalSourceAcceptedRoots,
    disposition:result.originalSourceRowDisposition,
    // Agent3: postmortem only. Raw receipt already stores these fields.
    // Report bounded error strings without card-zone objects.
    errorSummary:typeof result.originalSourceArchivedNativeError==='string'
      ?result.originalSourceArchivedNativeError.slice(0,360):
      result.originalSourceArchivedNativeError?.message?.slice(0,360)??null,
    causeFirstLine:typeof result.originalSourceNativeStoreCauseStack==='string'
      ?result.originalSourceNativeStoreCauseStack.split('\n')[0].slice(0,360):null,
    causeType:typeof result.originalSourceNativeStoreCauseStack,
    abortKeys:Object.keys(result.originalSourceNativeAbortProvenance??{}).sort(),
    qualifiedGames:0
  })+'\n');
}

module.exports={VERSION,selectLetter,withLetterFork,run,write};
