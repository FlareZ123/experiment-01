'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {gitBlobHash}=
  require('./agent42-strict-profile-preflight.cjs');
const {preflight:preflightPinnedSource}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent14-fresh-crossrank-zero-energy-strand-pair-v1';
const REG='results/aichi-2026/registrations/agent14-prospective-zero-energy-strand-crossrank-20261106.json';
const REGISTERED_BLOB='212b9f0756529746e6a1b0e9008b27a914bbb951';

/**
 * Only ever inspect the committed registration with no native result reads.
 * @param {{requireNativePin?:boolean}} [options] Require engine checkout only before native runs.
 * @returns {object} Immutable preregistered experimental frame.
 */
function preflight({requireNativePin=false}={}){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REG));
  assert.equal(gitBlobHash(bytes),REGISTERED_BLOB);
  const reg=JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.schema,'agent14-prospective-zero-energy-strand-crossrank-v1');
  assert.equal(reg.registrationPrecedesAllNativeResultsForTheseSeeds,true);
  assert.equal(reg.noResultsExaminedAtRegistration,true);
  assert.equal(reg.expectedNativeAttempts,64);
  assert.equal(reg.distinctPhysicalSeedGroups,16);
  assert.equal(reg.preregisteredSeedGroups.length,16);
  assert.equal(reg.trials.length,32);
  assert.deepEqual(reg.originalSourceRanks,[1,5,11,30]);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  const groups=new Map(),seenSeeds=new Set();
  for(const group of reg.preregisteredSeedGroups){
    const key=[group.rank,group.repeat,group.candidateSlot].join(':');
    assert.ok(reg.originalSourceRanks.includes(group.rank));
    assert.ok([0,1].includes(group.repeat));
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.ok(Number.isSafeInteger(group.seed));
    assert.ok(group.seed>=0&&group.seed<=0xffffffff);
    assert.ok(!groups.has(key));
    assert.ok(!seenSeeds.has(group.seed));
    groups.set(key,group.seed);
    seenSeeds.add(group.seed);
  }
  for(const trial of reg.trials){
    const key=[trial.rank,trial.repeat,trial.candidateSlot].join(':');
    assert.equal(trial.id,[trial.rank,trial.repeat,
      trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(groups.get(key),trial.seed);
    assert.ok(reg.candidateIds.includes(trial.candidateId));
  }
  assert.equal(new Set(reg.trials.map(x=>x.id)).size,32);
  const parent=requireNativePin?preflightPinnedSource():null;
  if(parent)assert.equal(parent.pin,parent.registration.nativeEnginePin);
  return {reg,enginePin:parent?.pin??null,registeredBlob:REGISTERED_BLOB,
    frozenCommonPolicy:parent?.registration.frozenCommonPolicy??null};
}

/** @param {object} row @returns {object[]} Accepted roots, including native aborts. */
function ledger(row){
  return row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
}
/** @param {object[]} rows @returns {string} SHA-256 over a canonical JSON projection. */
function digest(rows){
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}
/** @param {object} row @returns {object} Native actor-only disclosure. */
function nativeSummary(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  return {
    id:row.trial.id,
    hasNativeError:Boolean(row.error),nativeError:row.error??null,
    finished:row.finished??false,
    endedBy:row.endReason??null,
    rootAcceptedActions:ledger(row).length,
    actionCount:row.actionCount??null,
    sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    initialPhysicalSha256:row.fullPhysicalDealFingerprint??null,
    sourceDeckSha256:row.sourceDeckFingerprint??null,
    candidateDeckSha256:row.candidateDeckFingerprint??null,
    ledgerSha256:row.rootActionLedgerSha256??digest(ledger(row)),
    selectedStrandIntents:root?.zeroEnergyStrandFloatStoneRootSelected??0,
    confirmedToolAttach:root?.nativePhysicalConfirmedByIntent
      ?.[ 'attach-emergency-floatstone' ]??0,
    confirmedFreeRetreat:root?.nativePhysicalConfirmedByIntent
      ?.[ 'retreat-emergency-floatstone' ]??0,
    rejectedActorRoots:root?.rejectedActorRoots??0,
    nativePrizeFinish:row.finalPrizes??null,
    nativeWinner:row.winner??null
  };
}

/**
 * Find a physically accepted Float Stone + Retreat + attack within one
 * actor's same native turn, preserving source/candidate attack provenance.
 * This witness is descriptive; an unrelated card effect may affect damage.
 * @param {object} row Genuine pinned Store row.
 * @returns {object[]} Event chains, without secret hand/deck or Prize cards.
 */
function acceptedStrandChains(row){
  const roots=ledger(row);
  const settlements=[
    ...(row.candidateAttackSettlement?.attacks??[]),
    ...(row.sourceAttackSettlement?.attacks??[])
  ];
  const output=[];
  for(let i=0;i<roots.length;i++){
    const tool=roots[i];
    if(tool.action!=='PlayCardAction'||tool.card!=='Float Stone')continue;
    const seat=tool.playerSlot,turn=tool.turnBefore;
    let retreat=null,attack=null;
    for(let k=i+1;k<roots.length;k++){
      const root=roots[k];
      if(root.turnBefore!==turn)break;
      if(root.playerSlot!==seat)continue;
      if(!retreat&&root.action==='RetreatAction'){
        retreat=root;
      }else if(retreat&&root.action==='AttackAction'){
        attack=root;break;
      }
    }
    if(!retreat||!attack)continue;
    const settlement=settlements.find(a=>
      a.actionOrdinal===attack.actionOrdinal)??null;
    const prizesBefore=settlement?.prizesBefore??null;
    const prizesAfter=settlement?.prizesAfter??null;
    const taken=prizesBefore&&prizesAfter&&
      Number.isSafeInteger(prizesBefore[seat])&&
      Number.isSafeInteger(prizesAfter[seat])?
      prizesBefore[seat]-prizesAfter[seat]:null;
    output.push({
      actorSeat:seat,turn,
      toolOrdinal:tool.actionOrdinal,retreatOrdinal:retreat.actionOrdinal,
      attackOrdinal:attack.actionOrdinal,
      attackName:attack.attack??null,
      hasNativeSettledAttack:settlement?.settledPromptChain===true,
      prizesBefore,prizesAfter,nativePrizeCardsTaken:taken,
      enemyActiveBefore:
        settlement?.publicBoardBefore?.[1-seat]?.active?.printing??null,
      enemyActiveAfter:
        settlement?.publicBoardAfter?.[1-seat]?.active?.printing??null
    });
  }
  return output;
}

/**
 * Compare exactly the same printed 60 and seed under two root policies;
 * equal original physical deal and deck hashes are mandatory for a
 * matched input. Missing receipts stay visible as censored/errored rows.
 * @param {object} before Native baseline row.
 * @param {object} after Native intervention row.
 * @returns {object} Matched-pair evidence, including omissions.
 */
function pairSummary(before,after){
  assert.equal(before.trial.id,after.trial.id);
  const control=nativeSummary(before),treatment=nativeSummary(after);
  const a=ledger(before),b=ledger(after);
  let firstChange=null;
  for(let k=0;k<Math.max(a.length,b.length);k++){
    if(JSON.stringify(a[k])!==JSON.stringify(b[k])){
      firstChange=k;break;
    }
  }
  return {
    trialId:before.trial.id,rank:before.trial.rank,
    candidateSlot:before.trial.candidateSlot,
    seed:before.trial.seed,
    sameOriginalFullPhysicalDeal:
      control.initialPhysicalSha256!==null&&
      control.initialPhysicalSha256===treatment.initialPhysicalSha256,
    sameOriginalSourcePrintedSixty:
      control.sourceDeckSha256!==null&&
      control.sourceDeckSha256===treatment.sourceDeckSha256,
    sameCandidatePrintedSixty:
      control.candidateDeckSha256!==null&&
      control.candidateDeckSha256===treatment.candidateDeckSha256,
    initialNativeRootUnchanged: firstChange===null ||
      firstChange>0,
    firstAcceptedRootDifference:firstChange,
    firstControlAction:firstChange===null?null:a[firstChange]??null,
    firstInterventionAction:firstChange===null?null:b[firstChange]??null,
    control,treatment,
    controlNativeToolRetreatAttack:acceptedStrandChains(before),
    treatmentNativeToolRetreatAttack:acceptedStrandChains(after),
    paperQualified:false
  };
}

/** @returns {object} Two full native arms, never competitive games. */
function run(){
  const p=preflight({requireNativePin:true});
  const common={
    ...p.frozenCommonPolicy,
    registeredTrials:p.reg.trials,
    allowAdditionalOriginalSourceRanks:true,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true,
    actorZeroEnergyStrandFloatStoneTargetTurn:null,
    actorZeroEnergyStrandFloatStoneOwnerSeat:null
  };
  assert.equal(common.actorOnlyComposition,true);
  const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const undo=installUnderworldDoorPsychicRecipientHook();
  let control,treatment;
  try {
    control=runDevelopment({...common,
      actorZeroEnergyStrandFloatStoneRoot:false,
      registeredFrameName:VERSION+'-A0-frozen-control'});
    assert.equal(control.attempted,32);
    treatment=runDevelopment({...common,
      actorZeroEnergyStrandFloatStoneRoot:true,
      registeredFrameName:VERSION+'-B-fresh-intervention'});
    assert.equal(treatment.attempted,32);
  }finally{
    undo();
    if(old===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
  }
  const byTrial=new Map(treatment.rows.map(row=>[row.trial.id,row]));
  const pairs=control.rows.map(row=>{
    const candidate=byTrial.get(row.trial.id);
    assert.ok(candidate,'missing treatment partner');
    return pairSummary(row,candidate);
  });
  assert.equal(pairs.length,32);
  const mismatched=pairs.filter(pair=>
    !pair.sameOriginalFullPhysicalDeal||
    !pair.sameOriginalSourcePrintedSixty||
    !pair.sameCandidatePrintedSixty);
  const selected=pairs.filter(pair=>pair.treatment.selectedStrandIntents>0);
  const chains=pairs.flatMap(pair=>
    pair.treatmentNativeToolRetreatAttack.map(x=>({
      trialId:pair.trialId,rank:pair.rank,...x
    })));
  const rankSummaries=p.reg.originalSourceRanks.map(rank=>{
    const rows=pairs.filter(pair=>pair.rank===rank);
    return {
      rank,registeredPairedTrials:rows.length,
      matchedInitialPhysicalDeals:rows.filter(
        p=>p.sameOriginalFullPhysicalDeal).length,
      selectedTreatmentTrials:rows.filter(
        p=>p.treatment.selectedStrandIntents>0).length,
      controlStrandIntents:rows.reduce(
        (s,p)=>s+p.control.selectedStrandIntents,0),
      treatmentStrandIntents:rows.reduce(
        (s,p)=>s+p.treatment.selectedStrandIntents,0),
      nativeToolRetreatAttacks:rows.reduce(
        (s,p)=>s+p.treatmentNativeToolRetreatAttack.length,0),
      nativePrizeTakingChains:rows.reduce(
        (s,p)=>s+p.treatmentNativeToolRetreatAttack.filter(
          x=>x.nativePrizeCardsTaken>0).length,0),
      nativeControlErrorCount:rows.filter(p=>p.control.hasNativeError).length,
      nativeTreatmentErrorCount:rows.filter(p=>p.treatment.hasNativeError).length
    };
  });
  return {
    version:VERSION,registeredAtUtc:p.reg.registeredUtc,
    originalRegistrationPath:REG,originalRegistrationBlob:p.registeredBlob,
    upstreamTwinleafCommit:p.enginePin,sourceOriginalRanks:p.reg.originalSourceRanks,
    physicalSeedGroups:16,pairedTrials:32,nativeTotalAttempts:64,
    selectedIssue25PolicyChanged:false,
    nativePolicyInterventionScope:'all turns, both physical seats, owner-public-only',
    noPriorResultSelectionForTheseSeeds:true,
    unmatchedPairs:mismatched.map(p=>p.trialId),
    rankSummaries,
    selectedTreatmentPairs:selected.map(p=>p.trialId),
    selectedTreatmentPairCount:selected.length,
    acceptedStrandFollowthrough:chains,
    totalNativePrizeTakingChains:chains.filter(x=>
      x.nativePrizeCardsTaken>0).length,
    finishedNativeGames:{
      control:pairs.filter(p=>p.control.finished).length,
      treatment:pairs.filter(p=>p.treatment.finished).length
    },
    nativeErrorGames:{
      control:pairs.filter(p=>p.control.hasNativeError).length,
      treatment:pairs.filter(p=>p.treatment.hasNativeError).length
    },
    competitivelyQualifiedGames:0,
    caveat:'Incomplete original Top32, post-entry prototype assistant policy, unfinished/errored games and original source bot weaknesses invalidate competitive win-rate inference. Only registered seed groups are independent.',
    pairs,rawControl:control,rawTreatment:treatment
  };
}

if(require.main===module){
  try {
    const result=run();
    if(process.env.AGENT14_FRESH_STRAND_OUTPUT)
      save(process.env.AGENT14_FRESH_STRAND_OUTPUT,result);
    console.log('AGENT14_FRESH_CROSSRANK_STRAND',
      JSON.stringify({
        version:result.version,groups:result.physicalSeedGroups,
        trials:result.pairedTrials,attempts:result.nativeTotalAttempts,
        selectedTreatmentPairs:result.selectedTreatmentPairs,
        unmatchedPairs:result.unmatchedPairs,
        rankSummaries:result.rankSummaries,
        nativeChains:result.acceptedStrandFollowthrough,
        nativePrizeTakingChains:result.totalNativePrizeTakingChains,
        nativeErrors:result.nativeErrorGames,
        competed:result.competitivelyQualifiedGames
      }));
  } catch(error){console.error(error);process.exitCode=1;}
}
module.exports={VERSION,REG,REGISTERED_BLOB,preflight,digest,
  nativeSummary,acceptedStrandChains,pairSummary,run};
