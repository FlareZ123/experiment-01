'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent41-rank21-retrospective-original-tool-target-native-v1';
const REGISTRATION='results/aichi-2026/registrations/agent41-rank21-native-tool-target-20261031.json';
const REGISTRATION_BLOB='83ad7b4cc02fbda01a7cee3c5ba83cb61491e3bd';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Read a previously committed, complete two-candidate physical test schedule. */
function readRegistration(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REGISTRATION));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes)
    .digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,'Registered source schedule changed');
  const plan=JSON.parse(bytes.toString('utf8'));
  assert.equal(plan.schema,'agent41-rank21-native-tool-target-retrospective-v1');
  assert.equal(plan.enginePin,ENGINE_PIN);
  assert.equal(plan.originalSourceRank,21);
  assert.equal(plan.sourceSeed,4246551499);
  assert.equal(plan.sourcePhysicalSeat,1);
  assert.deepEqual(plan.conditions,['native-bot','common-hold','common-tool']);
  assert.deepEqual(plan.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(plan.trials.length,2);
  for(const [i,trial] of plan.trials.entries()){
    assert.equal(trial.id,'21:0:A:'+plan.candidateIds[i]);
    assert.equal(trial.rank,21);
    assert.equal(trial.repeat,0);
    assert.equal(trial.seed,plan.sourceSeed);
    assert.equal(trial.candidateSlot,'A');
    assert.equal(trial.candidateId,plan.candidateIds[i]);
  }
  return plan;
}

/** Locate the genuine, fully qualified physical source role in a result. */
function sourceRootAudit(row){
  return row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
}

/**
 * Join the two genuinely distinct action clocks through the same native typed
 * action identity. This requires the opt-in full actor receipt plus headless
 * action ledger; the historical 64-entry sampled nativeRootAcceptances is
 * explicitly insufficient. Aborts, absent output and missing ordinals fail
 * closed rather than being interpreted as untested alternatives or losses.
 */
function nativeActorJoinCoverage(row){
  const root=sourceRootAudit(row);
  const receipts=root?.nativeRootJoinReceipts;
  const ledger=row.rootActionLedger;
  if(!Array.isArray(receipts)||!Array.isArray(ledger))
    return {status:'JOIN_EVIDENCE_NOT_PRESENT',complete:false,
      selected:root?.selectedRootDecisions??null,joined:0};
  const selected=root.selectedRootDecisions;
  const dispatched=root.acceptedActorRoots+root.rejectedActorRoots;
  const accepted=receipts.filter(x=>x.accepted===true);
  const policySeen=new Set(),storeSeen=new Set();
  let invalid=0;
  for(const item of receipts){
    if(!Number.isSafeInteger(item.policyDecisionOrdinal)||
       item.policyDecisionOrdinal<1||item.policyDecisionOrdinal>selected||
       policySeen.has(item.policyDecisionOrdinal)){
      invalid++;continue;
    }
    policySeen.add(item.policyDecisionOrdinal);
    if(!Number.isSafeInteger(item.nativeStoreActionOrdinal)||
       item.nativeStoreActionOrdinal<0){
      invalid++;continue;
    }
    const storeId=item.nativeStoreActionOrdinal;
    if(storeSeen.has(storeId)){invalid++;continue;}
    storeSeen.add(storeId);
    const matching=ledger.filter(x=>x.actionOrdinal===storeId&&
      x.actorPolicyDecisionOrdinal===item.policyDecisionOrdinal&&
      x.playerSlot===item.seat);
    if(item.accepted===true&&matching.length!==1)invalid++;
    if(item.accepted===false&&matching.length!==0)invalid++;
  }
  const taggedLedger=ledger.filter(x=>
    Number.isSafeInteger(x.actorPolicyDecisionOrdinal));
  if(taggedLedger.length!==accepted.length)invalid++;
  const complete=invalid===0&&Number.isSafeInteger(selected)&&
    Number.isSafeInteger(dispatched)&&receipts.length===dispatched&&
    selected===dispatched;
  return {
    status:complete?'COMPLETE_ACTION_IDENTITY_JOIN':
      'INCOMPLETE_OR_INVALID_ACTION_IDENTITY_JOIN',
    complete,selected,dispatched,retainedReceipts:receipts.length,
    accepted:accepted.length,ledgerTaggedActions:taggedLedger.length,
    mismatches:invalid,physicalToolConfirmations:receipts.filter(x=>
      x.accepted===true&&x.kind==='attach-tool-candidate'&&
      x.nativePhysicalEffect==='confirmed-public-effect').length,
    sourceToolConfirmations:receipts.filter(x=>
      x.seat===1&&x.accepted===true&&
      x.kind==='attach-tool-candidate'&&
      x.nativePhysicalEffect==='confirmed-public-effect').length
  };
}

/** Summarize every physical arm without deleting its underlying raw record. */
function compactArm(row,condition){
  const root=sourceRootAudit(row);
  const chosen=root?.sameRootProposalChoice??null;
  const nativeActionJoin=nativeActorJoinCoverage(row);
  const actions=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const initialSourceActions=actions.filter(a=>a.playerSlot===1).slice(0,12);
  const originalMuscleBand=actions.filter(a=>a.playerSlot===1&&
    a.action==='PlayCardAction'&&
    (a.card==='Muscle Band'||String(a.card).startsWith('Muscle Band ')));
  const nativeToolActions=(root?.nativeRootAcceptances??[]).filter(a=>
    a.seat===1&&a.kind==='attach-tool-candidate');
  const firstSourceActorRoot=(root?.nativeRootAcceptances??[])
    .find(a=>a.seat===1)??null;
  const firstActualSourceRoot=actions.find(a=>
    a.playerSlot===1&&a.action!=='ResolvePromptAction')??null;
  const followingOpponentRoot=firstActualSourceRoot?actions.find(a=>
    a.playerSlot===0&&a.actionOrdinal>firstActualSourceRoot.actionOrdinal&&
    a.action!=='ResolvePromptAction')??null:null;
  return {
    trial:row.trial?.id??null,condition,sourceSeat:1,candidateSeat:0,
    nativeActionJoin,
    status:row.status??(row.finished===true?'engine-terminal':
      row.finished===false?'censored':'unknown'),
    sourceDeckFingerprint:row.sourceDeckFingerprint??null,
    candidateDeckFingerprint:row.candidateDeckFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualFirstPlayer:row.actualStarterSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    originalSourceRoot:firstActualSourceRoot,
    originalSourceActionsBeforeTurnChange:initialSourceActions,
    originalMuscleBandDispatches:originalMuscleBand,
    ownerProposalRoots:chosen?.ownerRoots??null,
    changedRoots:chosen?.changedRoots??null,
    firstChangedDecision:chosen?.changedSamples?.[0]??null,
    nativeToolSelectedDispatches:nativeToolActions,
    nativeToolAcceptedCount:nativeToolActions.filter(a=>a.accepted===true).length,
    nativeToolPhysicalConfirmedCount:nativeToolActions.filter(a=>
      a.accepted===true&&
      a.nativePhysicalEffect==='confirmed-public-effect').length,
    sourceFirstActorPublicRootDigest:
      firstSourceActorRoot?.before?.publicZonesSha256??null,
    sourceFirstActorHandCount:
      firstSourceActorRoot?.before?.handCounts?.[1]??null,
    immediateOpponentContinuation:followingOpponentRoot,
    opponentRootObserved:followingOpponentRoot!==null,
    error:row.error??null,
    terminalWinner:row.finished===true?row.winner??null:null,
    competitivelyQualified:false
  };
}

/**
 * The seed was retrospectively identified from Agent18's original rank21
 * opening control. This is a mechanism experiment, never a win-rate sample.
 * Identical initial deal hashes across conditions are required before any
 * target divergence can be interpreted as a same-deal treatment.
 */
function summarize(results,plan){
  const arms=[];
  for(const condition of plan.conditions){
    const output=results[condition];
    assert.equal(output.attempted,2);
    assert.equal(output.rows.length,2);
    assert.equal(output.enginePin,ENGINE_PIN);
    const map=new Map(output.rows.map(row=>[row.trial?.id,row]));
    assert.equal(map.size,2);
    for(const trial of plan.trials){
      const row=map.get(trial.id);
      assert.ok(row,'Missing planned physical arm '+trial.id);
      arms.push(compactArm(row,condition));
    }
  }
  const byCandidate=Object.fromEntries(plan.candidateIds.map(id=>{
    const cohort=arms.filter(arm=>arm.trial==='21:0:A:'+id);
    const digests=cohort.map(x=>x.fullPhysicalDealFingerprint);
    return [id,{
      fullPhysicalDealConfirmed:digests.every(x=>typeof x==='string'&&x.length===64),
      samePhysicalDeal:digests.every(x=>typeof x==='string'&&x===digests[0]),
      sameSourceDeal:cohort.every(x=>
        typeof x.sourceDealFingerprint==='string'&&
        x.sourceDealFingerprint===cohort[0].sourceDealFingerprint),
      conditions:cohort.map(x=>x.condition),
      toolAccepted:cohort.map(x=>x.nativeToolAcceptedCount),
      toolPhysicallyConfirmed:cohort.map(x=>x.nativeToolPhysicalConfirmedCount),
      sameFirstActorSourcePublicRoot:(()=>{
        const both=cohort.filter(x=>x.condition!=='native-bot');
        const hashes=both.map(x=>x.sourceFirstActorPublicRootDigest);
        const hands=both.map(x=>x.sourceFirstActorHandCount);
        return hashes.length===2&&hashes.every(x=>
          typeof x==='string'&&x.length===64&&x===hashes[0])&&
          hands.every(x=>Number.isSafeInteger(x)&&x===hands[0]);
      })(),
      realOpponentContinuations:cohort.map(x=>x.opponentRootObserved)
    }];
  }));
  return {
    schema:VERSION,registration:REGISTRATION,
    registrationBlob:REGISTRATION_BLOB,pinnedTwinleafRevision:ENGINE_PIN,
    predeclaredConditions:plan.conditions,sourceRank:21,sourceSeed:plan.sourceSeed,
    sourceRoleSeat:1,independentPhysicalSeeds:1,pairedCandidateArms:2,
    measuredArms:arms.length,byCandidate,arms,
    nativeToolAcceptedTotal:arms.reduce((n,r)=>n+r.nativeToolAcceptedCount,0),
    nativeToolPhysicalConfirmedTotal:arms.reduce((n,r)=>
      n+r.nativeToolPhysicalConfirmedCount,0),
    competitiveQualifiedGames:0,
    caveat:'Post-observed seed and two repeated candidate comparisons, not independent field samples. Unqualified bot, effects and paper clock. A physical tool offer, selected intent and native Store accepted action have different evidence strengths.'
  };
}

/** Execute original pinned Store comparison with both-player actor policy. */
function runNativeComparison(){
  const plan=readRegistration();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const results={};
  for(const condition of plan.conditions){
    const observed=condition!=='native-bot';
    const selected=condition==='common-tool';
    results[condition]=runDevelopment({
      actorOnlyComposition:observed,mandatoryOptionFallback:true,
      paperSupporterQuota:true,nativeAcceptedTargets:true,
      sameRootProposalChoice:observed,sameRootChoiceApply:selected,
      sameRootProbeAll:false,nativeToolAttachRoot:selected,
      losslessNativeRootJoin:observed,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:plan.trials,
      registeredFrameName:VERSION+'-'+condition
    });
  }
  return {schema:VERSION,summary:summarize(results,plan),rawResults:results};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runNativeComparison(),null,2)+'\n');

module.exports={VERSION,readRegistration,sourceRootAudit,compactArm,
  nativeActorJoinCoverage,summarize,runNativeComparison};
