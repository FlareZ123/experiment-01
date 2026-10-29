'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require(
  '../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');
const {plannedTrials}=
  require('../simulation/evaluation/agent41-prospective-canonical-scout.cjs');
const {auditSourceOpeningRecipients,SCHEMA}=
  require('../simulation/evaluation/agent8-source-firstturn-physical-recipients.cjs');

const trials=plannedTrials(registration);
const digest=txt=>createHash('sha256').update(txt).digest('hex');
const groupId=trial=>[trial.rank,trial.repeat,trial.candidateSlot].join(':');
const makeSourceEvent=(seat,turn)=>({
  action:'PlayCardAction',playerSlot:seat,turnBefore:turn,
  storeAccepted:true,
  declared:{status:'captured',kind:'play-card',
    handIndex:2,ownerHandPrinting:'Trubbish FST',
    target:{player:2,slot:2,index:0}},
  publicBoardChanges:[{seat,position:'bench',index:0,
    before:{pokemon:null},after:{pokemon:'Trubbish FST'}}]
});

function fixture(){
  const rows=trials.map(trial=>{
    const seat=trial.candidateSlot==='A'?1:0;
    const turn=trial.repeat%2===0?1:2;
    return {trial,sourceSeat:seat,candidateSeat:1-seat,
      sourceActuallyFirst:turn===1,
      actualStarterSeat:turn===1?seat:1-seat,
      verifiedFirstTurn:true,
      sourceDealFingerprint:digest(groupId(trial)),
      qualifiesForCompetitiveInference:false,finished:true,
      rootActionLedger:[{turnBefore:turn,playerSlot:seat,
        pendingPrompt:null,action:'PlayCardAction',card:'Trubbish'}],
      nativeAcceptedTargetSidecar:{
        schema:'actual-store-declared-target-sidecar-v1',
        observedLiveStore:true,rootOrdinalLinked:true,
        events:[makeSourceEvent(seat,turn)]
      },
      nativePromptChoices:{
        schema:'headless-native-prompt-choice-evidence-v3-public-discard-prompt-bounds',
        events:[]}
    };
  });
  const sourcePairs=[...new Set(trials.map(groupId))].map(pairId=>({
    pairId,sameSourcePhysicalDeal:true,sameActualStarter:true
  }));
  return {attempted:32,rows,sourcePairs};
}

test('strict matched source-deal pairs verify physical source recipients and first-turn roots',()=>{
  const summary=auditSourceOpeningRecipients(trials,fixture());
  assert.equal(summary.schema,SCHEMA);
  assert.equal(summary.preregisteredArms,32);
  assert.equal(summary.sourceDealPairsAligned,16);
  assert.equal(summary.sameObservedFirstTurnActions,16);
  assert.equal(summary.observedFirstTurnTargetActions,16);
  assert.equal(summary.qualifiedForCompetitiveInference,false);
});

test('same source deal cannot hide a different accepted source Bench target',()=>{
  const f=fixture();
  f.rows.find(r=>r.trial.id==='11:1:A:new-moon-lockbreaker-v1')
    .nativeAcceptedTargetSidecar.events[0].declared.target.index=1;
  const result=auditSourceOpeningRecipients(trials,f);
  const changed=result.comparisons.find(c=>c.pairId==='11:1:A');
  assert.equal(changed.status,'different-observed-source-firstturn-actions');
  assert.equal(changed.sameAcceptedPhysicalTargets,false);
  assert.equal(changed.sameRootActionLabels,true);
});

test('first-turn prompt choice and immediate board delta remain independent checks',()=>{
  const f=fixture();
  const changed=f.rows.find(r=>r.trial.id==='11:2:B:new-moon-lockbreaker-v1');
  changed.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0]
    .after.pokemon='Different source card';
  const pr=changed.nativePromptChoices.events;
  pr.push({turn:1,actorSeat:changed.sourceSeat,kind:'ChooseCardsPrompt',
    sourceZone:'deck',sourcePlayerSlot:changed.sourceSeat,
    selectedCards:['Garbodor BKP'],nativePromptMin:0,nativePromptMax:1});
  const result=auditSourceOpeningRecipients(trials,f);
  const row=result.comparisons.find(c=>c.pairId==='11:2:B');
  assert.equal(row.sameAcceptedPhysicalTargets,true);
  assert.equal(row.sameImmediatePublicChanges,false);
  assert.equal(row.sameNativeOwnerPromptSelections,false);
});

test('missing native sidecar is explicitly unverified, not falsely identical',()=>{
  const f=fixture();
  f.rows.find(r=>r.trial.id==='6:0:A:new-moon-lockbreaker-v1')
    .nativeAcceptedTargetSidecar.observedLiveStore=false;
  const result=auditSourceOpeningRecipients(trials,f);
  assert.equal(result.missingNativeSourceEvidence,1);
  assert.equal(result.sameObservedFirstTurnActions,15);
});

test('different source deal is unpaired even with matching source recipients',()=>{
  const f=fixture();
  f.rows.find(r=>r.trial.id==='6:3:B:new-moon-lockbreaker-v1')
    .sourceDealFingerprint=digest('changed source hand due to setup mulligans');
  f.sourcePairs.find(p=>p.pairId==='6:3:B').sameSourcePhysicalDeal=false;
  const result=auditSourceOpeningRecipients(trials,f);
  assert.equal(result.unpairedSourceDeals,1);
  assert.equal(result.sameObservedFirstTurnActions,15);
});

test('unaccepted native target record denies a physical target certificate',()=>{
  const f=fixture();
  f.rows.find(r=>r.trial.id==='6:2:A:new-moon-lockbreaker-v1')
    .nativeAcceptedTargetSidecar.events[0].storeAccepted=false;
  const result=auditSourceOpeningRecipients(trials,f);
  assert.equal(result.missingNativeSourceEvidence,1);
});
