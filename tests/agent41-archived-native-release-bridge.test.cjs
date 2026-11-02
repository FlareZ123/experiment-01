'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {resolveArchive,sourcePairReceipts,firstSourceTurnReceipt,
  correctNativeArchive}=
  require('../simulation/evaluation/agent41-archived-native-release-bridge.cjs');
const rank16=require('../results/aichi-2026/agent41-rank16-native-row-schema-v1.json');
const rank6=require('../results/aichi-2026/agent41-rank6-native-row-schema-v1.json');

/** Turn minimal actual artifact projections into canonical row shapes. */
const asNative=rows=>rows.map(r=>({
  ...r,trial:{id:r.trialId,rank:Number(r.trialId.split(':')[0]),
    repeat:Number(r.trialId.split(':')[1]),
    candidateSlot:r.trialId.split(':')[2],
    candidateId:r.candidateId,seed:17}
}));

test('rank16 authentic row statuses recover nine terminals and seven caps',()=>{
  const rows=asNative(rank16.rows);
  const seeds=Array.from({length:8},(_,repeat)=>({rank:16,repeat,
    candidateSlot:repeat%2===0?'A':'B'}));
  const archived={allNativeDevelopmentRows:rows,registration:{seeds,
    candidateIds:['champion-reference','new-moon-lockbreaker-v1']}};
  const result=correctNativeArchive(archived);
  assert.equal(result.registrySource,'ORIGINAL_PRECOMMITTED_SEEDS');
  assert.deepEqual(result.nativeDispositionCounts,{ENGINE_TERMINAL:9,ACTION_CAP:7});
  assert.equal(result.registrationIdentityFullyVerified,true);
  assert.equal(result.competitivelyQualifiedPaperGames,0);
  assert.ok(result.perAttempt.every(r=>
    r.firstMissingPaperPhase==='OWNER_OPPORTUNITY_OBSERVED'));
});

test('distinct frozen rank6 historical attempt envelope preserves truth',()=>{
  const rows=asNative(rank6.rows);
  const attempts=rows.map(r=>({trialId:r.trial.id}));
  const result=correctNativeArchive({rawNativeResult:{rows},
    releaseDisposition:{attempts}});
  assert.equal(result.registrySource,'HISTORICAL_REPORTER_ATTEMPT_LEDGER');
  assert.equal(result.registrationIdentityFullyVerified,false);
  assert.deepEqual(result.nativeDispositionCounts,{ENGINE_TERMINAL:4});
  assert.equal(result.observedAttempts,4);
});

test('registration rejects missing, additional and duplicated native trials',()=>{
  const rows=asNative(rank6.rows);
  const d={rawNativeResult:{rows:[rows[0],rows[0],rows[2]]},
    releaseDisposition:{attempts:rows.map(r=>({trialId:r.trial.id}))}};
  const r=correctNativeArchive(d);
  assert.equal(r.duplicates.length,1);
  assert.equal(r.missing.length,2);
  assert.equal(r.unexpected.length,0);
  assert.equal(r.observedAttempts,3);
});

test('physical source pair comparison requires actual source fingerprint',()=>{
  const make=(candidateId,hash,starter=true)=>({
    trial:{id:'16:1:B:'+candidateId,rank:16,repeat:1,candidateSlot:'B',
      candidateId,seed:42},
    sourceSeat:0,candidateSeat:1,verifiedFirstTurn:true,
    sourceActuallyFirst:starter,sourceDealFingerprint:hash
  });
  const first=make('champion-reference','a'.repeat(64));
  const second=make('new-moon-lockbreaker-v1','a'.repeat(64));
  const pair=rows=>sourcePairReceipts(rows)[0].status;
  assert.equal(pair([first,second]),'EXACT_SOURCE_PHYSICAL_MATCH');
  assert.equal(pair([first,{...second,sourceDealFingerprint:'b'.repeat(64)}]),
    'SOURCE_PHYSICAL_DEAL_DIFFERENT');
  assert.equal(pair([first,{...second,sourceActuallyFirst:false}]),
    'STARTER_STRATUM_DIFFERENT');
  assert.equal(pair([first,{...second,verifiedFirstTurn:false}]),'UNVERIFIED');
  assert.equal(pair([first]),'UNVERIFIED');
});

test('first-turn chronological reply does not certify playable lock',()=>{
  const row={trial:{rank:16},sourceSeat:0,sourceActuallyFirst:false,
    sourceFirstOwnedAffordances:{status:'observed',
      firstOwnHand:{resources:{'Boost Shake':1}}},rootActionLedger:[
      {actionOrdinal:8,playerSlot:0,turnBefore:2,action:'AttackAction',
        attack:'Acid Spray',pendingPrompt:null},
      {actionOrdinal:9,playerSlot:1,turnBefore:3,action:'PassTurnAction',
        pendingPrompt:null}
    ]};
  const r=firstSourceTurnReceipt(row);
  assert.equal(r.heldBoostShake,1);
  assert.equal(r.characteristicRootSelected,false);
  assert.equal(r.legalOpportunityQualified,false);
  assert.equal(r.consequentOpponentReplyQualified,false);
});

test('source-only physical chosen characteristic still needs paper checks',()=>{
  const row={trial:{rank:16},sourceSeat:1,sourceActuallyFirst:true,
    sourceFirstOwnedAffordances:{status:'observed',firstOwnHand:{resources:{
      'Boost Shake':1}}},rootActionLedger:[
      {playerSlot:1,turnBefore:1,action:'PlayCardAction',
        card:'Boost Shake',pendingPrompt:null},
      {playerSlot:1,turnBefore:1,action:'ResolvePromptAction',
        card:'Garbodor',pendingPrompt:'ChooseCardsPrompt'}
    ]};
  const r=firstSourceTurnReceipt(row);
  assert.equal(r.characteristicRootSelected,true);
  assert.equal(r.legalOpportunityQualified,false);
  assert.equal(r.paperEffectQualified,false);
});

test('rank6 source characteristic remains unassessed, not assumed absent',()=>{
  const row={trial:{rank:6},sourceSeat:0,sourceActuallyFirst:true,
    sourceFirstOwnedAffordances:{status:'observed',
      firstOwnHand:{resources:{'Boost Shake':0}}},rootActionLedger:[]};
  const r=firstSourceTurnReceipt(row);
  assert.equal(r.characteristicAssessment,'NOT_ASSESSED');
  assert.equal(r.characteristicRootSelected,null);
  assert.equal(r.heldBoostShake,null);
});

test('malformed envelopes fail loudly instead of fabricating no attempts',()=>{
  assert.throws(()=>resolveArchive({}),TypeError);
  assert.throws(()=>resolveArchive(null),TypeError);
});
