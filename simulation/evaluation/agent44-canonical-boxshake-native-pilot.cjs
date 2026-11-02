'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const fs=require('node:fs');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=
  require('../twinleaf/headless.cjs');
const {schedule}=
  require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {withRank8AuthenticK0Observer}=
  require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {withCanonicalAndBoxShake}=
  require('./agent44-canonical-boxshake-composition.cjs');
const {boxShakeOpponentReplyPacket}=
  require('./agent44-boxshake-opponent-reply-packet.cjs');

const ROOT=path.resolve(__dirname,'../..');
const SEED=214648959;
const FRESH_START=304;
const FRESH_COUNT=2;
const FRESH32_START=370;
const FRESH32_COUNT=32;
const FRESH32_REGISTERED_SHA256='89e7579a8bdaace0b172fb50ce0a452b5c37c0629b12e2d5c96b8d52239f2118';
const MAX_ACTIONS=120;
const sha=string=>crypto.createHash('sha256').update(string).digest('hex');
const codeSha=relative=>sha(fs.readFileSync(path.join(ROOT,relative)));
function run({fresh32=false,diagnosticFreshIndex=null}={}){
  assert.ok(diagnosticFreshIndex===null||
    (fresh32&&diagnosticFreshIndex===383),
    'The diagnostic is strictly retrospective on the previously failed original index383');
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===8);
  assert.equal(source?.status,'ready');
  initializeCards();
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const fresh=schedule(diagnosticFreshIndex??
    (fresh32?FRESH32_START:FRESH_START),
    diagnosticFreshIndex===null?(fresh32?FRESH32_COUNT:FRESH_COUNT):1)
    .map(x=>({...x,selection:diagnosticFreshIndex!==null?
      'retrospective-after-registered-failure-383':
      fresh32?'preregistered-v3-canonical-fresh32':
        'precommitted-unselected-independent'}));
  if(fresh32&&diagnosticFreshIndex===null)assert.equal(
    sha(JSON.stringify(fresh)),FRESH32_REGISTERED_SHA256,
    'Fresh32 canonical physical seed schedule changed after registration');
  const registered=[
    {trial:'historical-selected-positive-source',seed:SEED,
      sourceSeat:0,selection:'retrospective-native-positive'},
    ...fresh
  ];
  const scheduleSha256=sha(JSON.stringify(registered));
  const rows=[];
  for(const row of registered){
    const request={
      deckA:row.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:row.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:row.seed,maxActions:MAX_ACTIONS,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true,
      captureDecisionTrace:true,label:'agent44-canonical-box-'+row.trial
    };
    try{
      const baseline=withRank8AuthenticK0Observer(Store,row.sourceSeat,
        ()=>withCanonicalAndBoxShake(()=>runMatch(request)));
      const treatment=withRank8AuthenticK0Observer(Store,row.sourceSeat,
        ()=>withCanonicalAndBoxShake(()=>runMatch(request),{
          enableBoxShake:true,flexible:true
        }));
      const b=baseline.result,t=treatment.result;
      assert.deepEqual(baseline.sourceK0,treatment.sourceK0,
        'Canonical paired first owner root drift');
      assert.deepEqual(b.result.deckHashes,t.result.deckHashes,
        'Canonical paired physical deck fingerprint drift');
      assert.equal(b.result.firstTurnSlot,t.result.firstTurnSlot,
        'Canonical paired actual starter drift');
      const sameNoOffer=t.audit.box.offers.length===0;
      if(sameNoOffer)assert.deepEqual(b.result.decisionTrace,
        t.result.decisionTrace,
        'Canonical no-Box-opportunity trace drift');
      const equipped=t.audit.box.opponentContinuations.some(x=>
        x.sourceSeat===row.sourceSeat&&x.equippedGarbodor);
      const replyPacket=boxShakeOpponentReplyPacket(
        t.result,t.audit.box,row.sourceSeat);
      rows.push({...row,status:equipped&&
        replyPacket.strictPublicContinuationAccepted?
        'NATIVE_OPPONENT_TURN_EQUIPPED_GARBODOR':
        t.audit.box.offers.length?'OFFERED_NO_SETTLED_OPPONENT_REPLY':
          'NOT_ENCOUNTERED',
        sourceK0Parity:true,sourceActualFirst:
          b.result.firstTurnSlot===row.sourceSeat,
        physicalDeckPair:true,
        noOfferFullTraceParity:sameNoOffer?true:null,
        baseline:{actions:b.result.actions,finished:b.result.finished,
          decisionTraceSha256:sha(JSON.stringify(b.result.decisionTrace))},
        treatment:{actions:t.result.actions,finished:t.result.finished,
          decisionTraceSha256:sha(JSON.stringify(t.result.decisionTrace))},
        boxAudit:t.audit.box,
        opponentPublicRootReplyPacket:replyPacket,
        actorVersion:t.audit.actorVersion,
        actorQualification:t.audit.actorQualification,
        error:null});
    }catch(error){
      rows.push({...row,status:'NATIVE_ERROR',
        sourceK0Parity:null,physicalDeckPair:null,
        baseline:null,treatment:null,boxAudit:null,
        opponentPublicRootReplyPacket:null,
        actorVersion:null,actorQualification:null,
        error:{name:error.name??null,message:String(error.message??error)}});
    }
  }
  return {
    schema:diagnosticFreshIndex!==null?
      'agent44-shared-canonical-bothseat-boxshake-diagnostic383-v1':
      fresh32?'agent44-shared-canonical-bothseat-owner-boxshake-fresh32-v2':
      'agent44-shared-canonical-bothseat-owner-boxshake-native-v1',
    historicalSelection:'retrospective-original-source-positive',
    retrospectiveDebugIndex:diagnosticFreshIndex,
    prospectiveIndices:diagnosticFreshIndex!==null?
      null:fresh32?
      [FRESH32_START,FRESH32_START+FRESH32_COUNT-1]:
      [FRESH_START,FRESH_START+FRESH_COUNT-1],
    fresh32RegisteredScheduleSha256:fresh32&&diagnosticFreshIndex===null?
      FRESH32_REGISTERED_SHA256:null,
    preregistration:fresh32&&diagnosticFreshIndex===null?
      'results/aichi-2026/registrations/agent44-rank8-common-actor-boxshake-fresh32-20261102.json':null,
    originalRank8Printed60:true,sourcePrinted60Sha256:
      '6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541',
    seedScheduleSha256:scheduleSha256,actualTrials:rows.length,
    nativeStorePaperCompetenceCertified:false,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    sourcePolicySha256:codeSha('simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs'),
    canonicalCodeSha256:codeSha('simulation/evaluation/agent7-canonical-actor-composition.cjs'),
    integrationCodeSha256:codeSha('simulation/evaluation/agent44-canonical-boxshake-composition.cjs'),
    selectedOptions:{commonCanonicalBothSeats:true,
      ownerBoxShake:true,flexible:true},
    candidateFixed60:true,sourceFixed60:true,
    maxActions:MAX_ACTIONS,rows,
    errorCount:rows.filter(x=>x.status==='NATIVE_ERROR').length,
    completedSourceSetups:rows.filter(x=>
      x.status==='NATIVE_OPPONENT_TURN_EQUIPPED_GARBODOR').length,
    fresh32Summary:fresh32&&diagnosticFreshIndex===null?{
      attempted:rows.length-1,
      completed:rows.slice(1).filter(x=>
        x.status==='NATIVE_OPPONENT_TURN_EQUIPPED_GARBODOR').length,
      noOffer:rows.slice(1).filter(x=>x.status==='NOT_ENCOUNTERED').length,
      offeredIncomplete:rows.slice(1).filter(x=>
        x.status==='OFFERED_NO_SETTLED_OPPONENT_REPLY').length,
      errors:rows.slice(1).filter(x=>x.status==='NATIVE_ERROR').length
    }:null,
    nativeQualifiedGames:0,
    caveat:'The common actor retains generic-bot fallback; one selected retrospective control is excluded from the 2- or 32-deal fresh denominator. Source Box full paper-valid cost custody, meaningful opponent response, paper clock and competitive outcomes remain unqualified.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run({
  fresh32:process.env.AGENT44_RANK8_CANONICAL_FRESH32==='true',
  diagnosticFreshIndex:process.env.AGENT44_RANK8_CANONICAL_DEBUG_383==='true'?383:null
}),null,2)+'\n');
module.exports={SEED,FRESH_START,FRESH_COUNT,FRESH32_START,FRESH32_COUNT,
  FRESH32_REGISTERED_SHA256,MAX_ACTIONS,run};
