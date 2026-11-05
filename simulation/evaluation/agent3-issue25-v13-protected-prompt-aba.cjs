'use strict';

const assert=require('node:assert/strict');
const {randomBytes,createHash}=require('node:crypto');
const {
  PLANS:ORIGINAL_PLANS
}=require('./agent3-issue25-v8-four-campaign-root-replay.cjs');
const {
  firstPublicDifference,publicFailure
}=require('./agent3-issue25-v12-public-first-difference.cjs');

const VERSION='agent3-issue25-v13-protected-modal-prize-aba-native-v1';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const hex32=value=>typeof value==='string'&&/^[0-9a-f]{32}$/.test(value);
const hex64=value=>typeof value==='string'&&/^[0-9a-f]{64}$/.test(value);
const hex40=value=>typeof value==='string'&&/^[0-9a-f]{40}$/.test(value);
const PLANS=Object.freeze([
  {label:'protected-control-initial',mode:'protected',promptBaseline:false},
  {label:'protected-owner-modal-prize',mode:'protected',promptBaseline:true},
  {label:'protected-control-repeated',mode:'protected',promptBaseline:false}
]);

/**
 * Deliberately conservative, already separately tested owner prompt adapters.
 * A ConfirmPrompt declines its effect; ordinary own knockout Prize choice
 * selects the first occupied visible slot only. The response policy is a
 * mechanism experiment and not a competitive player.
 *
 * @template T
 * @param {()=>T} next
 * @param {{joinedAttackLayer?:Function,modalLayer?:Function,
 *   prizeLayer?:Function,threeAttackLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPromptBaselines(next,deps={}){
  assert.equal(typeof next,'function');
  const {withOwnerModalAcknowledgements}=
    require('../twinleaf/agent4-owner-modal-acknowledgements.cjs');
  const {withOwnerFirstPrizeReveal}=
    require('../twinleaf/agent21-owner-first-prize-reveal.cjs');
  const {withThreePrintedOwnerAttackFrontiers}=
    require('./agent1-issue25-joined-three-attacks-v5.cjs');
  const modal=deps.modalLayer??withOwnerModalAcknowledgements;
  const prize=deps.prizeLayer??withOwnerFirstPrizeReveal;
  const three=deps.threeAttackLayer??withThreePrintedOwnerAttackFrontiers;
  let prizeAudit=null,printedAudit=null;
  const result=modal(()=>{
    const selected=prize(()=>{
      const printed=three(next,{
        joinedAttackLayer:deps.joinedAttackLayer
      });
      printedAudit=printed.audit;
      return printed.result;
    });
    prizeAudit=selected.audit;
    return selected.result;
  });
  return {result:result.result,audit:{
    ...printedAudit,
    ownerModalPromptBaseline:result.audit,
    ownerFirstOccupiedPrizeBaseline:prizeAudit,
    ownerPromptDecisionCompetenceCertified:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Pair identical physically observed protected-opening setups under original
 * trial IDs and common private effect entropy. Never use matching post-turn
 * hands or select cases based on a treatment outcome.
 * @param {Array<{label:string,mode:string,promptBaseline:boolean,
 *  receipt:object,witness:object,selectedPromptAudit:object|null}>} campaigns
 * @returns {object}
 */
function comparePromptBaselineAba(campaigns){
  assert.deepEqual(campaigns.map(c=>({
    label:c.label,mode:c.mode,promptBaseline:c.promptBaseline
  })),PLANS);
  const ids=campaigns[0].receipt.registration.expectedIds;
  assert.ok(Array.isArray(ids)&&ids.length===8);
  assert.equal(new Set(ids).size,8);
  const prepared=campaigns.map(c=>{
    const {receipt,witness}=c;
    assert.deepEqual(receipt.registration.expectedIds,ids);
    assert.equal(receipt.registration.exactJoinedByTrialId,true);
    assert.equal(witness.registeredNativeTrialLabelWitnessSelected,true);
    assert.equal(witness.exactNativeStoreRootsRecorded,8);
    assert.equal(witness.firstOwnerSetupInputsObserved,16);
    assert.equal(witness.exactPhysicalSixtyPrintedCountMatches,16);
    assert.ok(hex32(witness.privateFingerprintSessionId));
    assert.ok(Array.isArray(witness.events)&&witness.events.length===16);
    const owners=new Map(),ordinals=new Map();
    for(const e of witness.events){
      const key=e.registeredNativeTrialId+':'+e.physicalOwnerSeat;
      assert.ok(ids.includes(e.registeredNativeTrialId));
      assert.ok(e.physicalOwnerSeat===0||e.physicalOwnerSeat===1);
      assert.equal(e.firstBeforeAnyOwnerSetupChoice,true);
      assert.equal(e.noPolicyChoiceOrHiddenNamesPublished,true);
      assert.equal(e.globalTurnAtCapture,0);
      assert.equal(e.physicalSixtyCardCount,60);
      assert.equal(e.exactPhysicalSixtyPrintedCountMatched,true);
      assert.ok(e.nativeFirstPlayerSeat===0||e.nativeFirstPlayerSeat===1);
      assert.ok(hex64(e.opaquePhysicalPrechoiceInputHmacSha256));
      assert.ok(hex64(e.opaquePreRunRequestHmacSha256));
      assert.ok(Number.isSafeInteger(e.nativeStoreOrdinal)&&
        e.nativeStoreOrdinal>=1&&e.nativeStoreOrdinal<=8);
      assert.ok(!owners.has(key));
      owners.set(key,e);
      const previous=ordinals.get(e.registeredNativeTrialId);
      if(previous===undefined)
        ordinals.set(e.registeredNativeTrialId,e.nativeStoreOrdinal);
      else assert.equal(previous,e.nativeStoreOrdinal);
    }
    assert.equal(owners.size,16);
    assert.equal(ordinals.size,8);
    assert.equal(new Set(ordinals.values()).size,8);
    const attempts=new Map();
    for(const row of receipt.attempts){
      assert.ok(ids.includes(row.id));
      assert.ok(!attempts.has(row.id));
      assert.equal(row.actualRawTrialId,row.id);
      attempts.set(row.id,row);
    }
    assert.equal(attempts.size,8);
    return {owners,attempts,receipt,witness,
      vendor:receipt.provenance.observedTwinleafCommit,
      research:receipt.provenance.observedRepositoryCommit,
      entropy:receipt.actuallyExecutingManifest.nightWatchPrivateSeedCommitmentSha256};
  });
  const [a,b,a2]=prepared;
  let prechoiceMatches=0,requestMatches=0,starterMatches=0;
  const inputProblems=[];
  for(const id of ids)for(const seat of [0,1]){
    const key=id+':'+seat;
    const first=a.owners.get(key);
    const others=[b.owners.get(key),a2.owners.get(key)];
    for(const e of others){
      if(first.opaquePhysicalPrechoiceInputHmacSha256===
        e.opaquePhysicalPrechoiceInputHmacSha256)prechoiceMatches++;
      else inputProblems.push({id,seat,kind:'native-prechoice'});
      if(first.opaquePreRunRequestHmacSha256===
        e.opaquePreRunRequestHmacSha256)requestMatches++;
      else inputProblems.push({id,seat,kind:'native-request'});
      if(first.nativeFirstPlayerSeat===e.nativeFirstPlayerSeat)starterMatches++;
      else inputProblems.push({id,seat,kind:'native-first-player'});
    }
  }
  const keySessionEqual=a.witness.privateFingerprintSessionId===
    b.witness.privateFingerprintSessionId&&
    a.witness.privateFingerprintSessionId===
    a2.witness.privateFingerprintSessionId;
  const sourceEpochEqual=hex40(a.vendor)&&hex40(a.research)&&
    hex64(a.entropy)&&
    [b,a2].every(c=>c.vendor===a.vendor&&c.research===a.research&&
      c.entropy===a.entropy);
  const rows=[];
  let sameControlLedger=0,sameControlDeal=0;
  for(const id of ids){
    const first=a.attempts.get(id);
    const middle=b.attempts.get(id);
    const last=a2.attempts.get(id);
    const complete=row=>
      Array.isArray(row.publicRootActions)&&
      row.publicRootActionsTruncated===false&&
      row.publicRootActionCount===row.publicRootActions.length&&
      hex64(row.publicRootLedgerSha256Computed)&&
      row.publicRootLedgerSha256Computed===sha(row.publicRootActions)&&
      row.publicRootLedgerDigestConsistent!==false;
    const allComplete=[first,middle,last].every(complete);
    const sameControls=allComplete&&first.status===last.status&&
      first.publicRootLedgerSha256Computed===
        last.publicRootLedgerSha256Computed;
    const sameSource=hex64(first.sourceDealFingerprint)&&
      first.sourceDealFingerprint===last.sourceDealFingerprint;
    if(sameControls)sameControlLedger++;
    if(sameSource)sameControlDeal++;
    rows.push({
      id,sourceRank:Number(id.split(':')[0]),
      completePublicRootLedgerAllThree:allComplete,
      identicalControlRootLedgerAndStatus:sameControls,
      identicalControlSourcePhysicalDeal:sameSource,
      baseline:publicFailure(first),
      promptBaseline:publicFailure(middle),
      repeatedBaseline:publicFailure(last),
      firstPromptBaselinePublicRootDifference:allComplete?
        firstPublicDifference(first.publicRootActions,
          middle.publicRootActions):null,
      promptBaselineChangesDisposition:first.status!==middle.status,
      nativePaperQualified:false
    });
  }
  const allInputs=keySessionEqual&&sourceEpochEqual&&
    inputProblems.length===0&&prechoiceMatches===32&&
    requestMatches===32&&starterMatches===32;
  const baselineVerdict=!allInputs?
    'UNRESOLVED-input-or-private-entropy-mismatch':
    sameControlLedger!==8||sameControlDeal!==8?
      'FAIL-control-replay-not-identical':
      'PASS-bounded-protected-opening-A-A-control';
  const audit=campaigns[1].selectedPromptAudit;
  return {
    schema:VERSION,
    design:PLANS,
    sourceTrialIds:ids,
    totalRegisteredNativeAttempts:24,
    observedNativeOwnerInputComparisons:32,
    matchingNativeOwnerPrechoice:prechoiceMatches,
    matchingNativeRequests:requestMatches,
    matchingNativeFirstPlayer:starterMatches,
    samePrivateOwnerHmacSession:keySessionEqual,
    sameObservedResearchEngineAndNightWatchSource:!!sourceEpochEqual,
    inputProblems,
    equalControlPublicRootAndStatusRows:sameControlLedger,
    equalControlPhysicalSourceDealRows:sameControlDeal,
    baselineReplayVerdict:baselineVerdict,
    treatmentSelectedPromptAudit:audit?{
      ownerModalPromptBaseline:audit.ownerModalPromptBaseline??null,
      ownerFirstOccupiedPrizeBaseline:
        audit.ownerFirstOccupiedPrizeBaseline??null
    }:null,
    rows,
    promptInterventionStrategicPreferenceCertified:false,
    causalDeckStrengthEstablished:false,
    certifiedPaperGames:0,
    establishedFieldWinRate:null
  };
}

/**
 * Execute three physically replayed protected-opening cohorts with identical
 * Night Watch entropy, original printed 60s and native trial registration.
 * @returns {object}
 */
function runProtectedPromptBaselineAba(){
  const {runPrechoiceCustodyV8}=
    require('./agent1-issue25-prechoice-input-custody-v8.cjs');
  const {buildReceipt}=
    require('./agent1-issue25-v4-public-receipt.cjs');
  const {withJoinedOwnerAttackFrontier}=
    require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
  const {withThreePrintedOwnerAttackFrontiers}=
    require('./agent1-issue25-joined-three-attacks-v5.cjs');
  const secret=randomBytes(32);
  const joinedAttackLayer=next=>
    withJoinedOwnerAttackFrontier(next,{
      randomBytes:n=>{
        assert.equal(n,32);
        return Buffer.from(secret);
      }
    });
  const campaigns=PLANS.map(plan=>{
    const attackLayer=plan.promptBaseline?
      next=>withOwnerPromptBaselines(next,{joinedAttackLayer}):
      next=>withThreePrintedOwnerAttackFrontiers(next,{
        joinedAttackLayer
      });
    const execution=runPrechoiceCustodyV8('protected',{attackLayer});
    const receipt=buildReceipt(execution,{
      policyEntryPoint:
        'simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs'
    });
    const rawById=new Map(execution.rawDevelopment.rows.map(raw=>
      [raw.trial.id,raw]));
    assert.equal(rawById.size,8);
    for(const row of receipt.attempts)
      row.sourceDealFingerprint=
        rawById.get(row.id)?.sourceDealFingerprint??null;
    return {...plan,receipt,
      witness:execution.diagnostic.actualNativePrechoicePhysicalInputs,
      selectedPromptAudit:
        execution.diagnostic.audit?.firstBlockedPromptEnvelope??null};
  });
  return comparePromptBaselineAba(campaigns);
}

module.exports={VERSION,PLANS,withOwnerPromptBaselines,
  comparePromptBaselineAba,runProtectedPromptBaselineAba};
