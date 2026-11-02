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
const MAX_ACTIONS=120;
const sha=string=>crypto.createHash('sha256').update(string).digest('hex');
const codeSha=relative=>sha(fs.readFileSync(path.join(ROOT,relative)));
function run(){
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
  const registered=[
    {trial:'historical-selected-positive-source',seed:SEED,
      sourceSeat:0,selection:'retrospective-native-positive'},
    ...schedule(FRESH_START,FRESH_COUNT).map(x=>({
      ...x,selection:'precommitted-unselected-independent'
    }))
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
    schema:'agent44-shared-canonical-bothseat-owner-boxshake-native-v1',
    historicalSelection:'retrospective-original-source-positive',
    prospectiveIndices:[FRESH_START,FRESH_START+FRESH_COUNT-1],
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
    nativeQualifiedGames:0,
    caveat:'The common actor still has unqualified generic-bot fallbacks. One retrospective plus two prospective original physical deals, development-only. No paper clock or competitive match outcome.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={SEED,FRESH_START,FRESH_COUNT,MAX_ACTIONS,run};
