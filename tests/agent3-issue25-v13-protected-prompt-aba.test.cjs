'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {
  VERSION,PLANS,comparePromptBaselineAba,withOwnerPromptBaselines
}=require('../simulation/evaluation/agent3-issue25-v13-protected-prompt-aba.cjs');

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const IDS=Array.from({length:8},(_,i)=>'fixture-rank-'+i);

function fixture(){
  return PLANS.map((plan,campaign)=>({
    ...plan,
    selectedPromptAudit:campaign===1?{
      ownerModalPromptBaseline:{selected:2,accepted:2,settled:2,
        byKind:{ConfirmPrompt:2,ShowCardsPrompt:0},events:[]},
      ownerFirstOccupiedPrizeBaseline:{
        ownerPrizeChoiceSubmitted:1,nativePrizeValidationPassed:1,
        records:[],readConcealedPrizeFaces:false}
    }:null,
    witness:{
      registeredNativeTrialLabelWitnessSelected:true,
      exactNativeStoreRootsRecorded:8,
      firstOwnerSetupInputsObserved:16,
      exactPhysicalSixtyPrintedCountMatches:16,
      privateFingerprintSessionId:'0'.repeat(32),
      events:IDS.flatMap((id,n)=>[0,1].map(seat=>({
        registeredNativeTrialId:id,physicalOwnerSeat:seat,
        nativeFirstPlayerSeat:n%2,nativeStoreOrdinal:n+1,
        firstBeforeAnyOwnerSetupChoice:true,
        noPolicyChoiceOrHiddenNamesPublished:true,globalTurnAtCapture:0,
        physicalSixtyCardCount:60,
        exactPhysicalSixtyPrintedCountMatched:true,
        opaquePhysicalPrechoiceInputHmacSha256:
          hash('actual-prechoice-'+id+'-'+seat),
        opaquePreRunRequestHmacSha256:hash('run-input-'+id)
      })))
    },
    receipt:{
      registration:{expectedIds:IDS,exactJoinedByTrialId:true},
      provenance:{observedTwinleafCommit:'a'.repeat(40),
        observedRepositoryCommit:'b'.repeat(40)},
      actuallyExecutingManifest:{
        nightWatchPrivateSeedCommitmentSha256:'c'.repeat(64)
      },
      attempts:IDS.map((id,n)=>{
        const changed=campaign===1&&n===0;
        const actions=[{
          actionOrdinal:0,action:'PlayCardAction',turnBefore:2,
          playerSlot:0,card:changed?'Tapu Lele-GX':'Darkness Energy'
        }];
        return {
          id,actualRawTrialId:id,
          status:changed?'engine-error':'returned-unqualified',
          nativeFailure:{message:'secret'},
          publicRootActions:actions,
          publicRootActionCount:actions.length,
          publicRootActionsTruncated:false,
          publicRootLedgerDigestConsistent:true,
          publicRootLedgerSha256Computed:hash(actions),
          sourceDealFingerprint:hash('source-deal-'+id),
          actualFirstPlayer:n%2,
          abortFailureStage:changed?'bot-decoder':null,
          abortPendingPrompt:changed?'ConfirmPrompt':null
        };
      })
    }
  }));
}
test('three protected campaigns maintain native prechoice and repeat control parity',()=>{
  const out=comparePromptBaselineAba(fixture());
  assert.equal(out.schema,VERSION);
  assert.equal(out.baselineReplayVerdict,'PASS-bounded-protected-opening-A-A-control');
  assert.equal(out.matchingNativeOwnerPrechoice,32);
  assert.equal(out.matchingNativeRequests,32);
  assert.equal(out.matchingNativeFirstPlayer,32);
  assert.equal(out.equalControlPublicRootAndStatusRows,8);
  assert.equal(out.equalControlPhysicalSourceDealRows,8);
  assert.equal(out.equalAllThreePhysicalSourceDealRows,8);
  assert.equal(out.rows[0].promptBaselineChangesDisposition,true);
  assert.equal(out.rows[0].firstPromptBaselinePublicRootDifference
    .protected.publicPlayedCard,'Tapu Lele-GX');
  assert.equal(out.certifiedPaperGames,0);
  assert.equal(out.causalDeckStrengthEstablished,false);
  assert.equal(JSON.stringify(out).includes('secret'),false);
});
test('unmatched input HMAC or Night Watch entropy fails closed',()=>{
  const first=fixture();
  first[1].witness.events[0]
    .opaquePreRunRequestHmacSha256=hash('different');
  const out=comparePromptBaselineAba(first);
  assert.equal(out.baselineReplayVerdict,'UNRESOLVED-input-or-private-entropy-mismatch');
  const other=fixture();
  other[2].receipt.actuallyExecutingManifest
    .nightWatchPrivateSeedCommitmentSha256='d'.repeat(64);
  assert.equal(comparePromptBaselineAba(other).baselineReplayVerdict,
    'UNRESOLVED-input-or-private-entropy-mismatch');
});
test('identical private prechoice cannot hide changed baseline Store decisions',()=>{
  const group=fixture();
  group[2].receipt.attempts[3].status='engine-error';
  assert.equal(comparePromptBaselineAba(group).baselineReplayVerdict,
    'FAIL-control-replay-not-identical');
  const lost=fixture();
  lost[2].receipt.attempts[1].sourceDealFingerprint=null;
  assert.equal(comparePromptBaselineAba(lost).baselineReplayVerdict,
    'FAIL-control-replay-not-identical');
});
test('duplicate owner physical witness or missing native attempt is fatal',()=>{
  const f=fixture();
  f[1].witness.events[4]={...f[1].witness.events[0]};
  assert.throws(()=>comparePromptBaselineAba(f));
  const next=fixture();
  next[2].receipt.attempts.pop();
  assert.throws(()=>comparePromptBaselineAba(next));
});
test('prompt layer composes real source adapters, never copies generic State',()=>{
  const calls=[];
  const layer=name=>next=>{
    calls.push('enter '+name);
    const result=next();
    calls.push('exit '+name);
    return {result,audit:{name}};
  };
  const output=withOwnerPromptBaselines(()=>42,{
    modalLayer:layer('modal'),
    prizeLayer:layer('prize'),
    threeAttackLayer:layer('printed')
  });
  assert.equal(output.result,42);
  assert.deepEqual(calls,['enter modal','enter prize','enter printed',
    'exit printed','exit prize','exit modal']);
  assert.equal(output.audit.ownerModalPromptBaseline.name,'modal');
  assert.equal(output.audit.ownerFirstOccupiedPrizeBaseline.name,'prize');
  assert.equal(output.audit.competitiveGamesQualified,0);
});
test('both absent source fingerprints or stale ledger hash fail closed',()=>{
  const both=fixture();
  both[0].receipt.attempts[4].sourceDealFingerprint=null;
  both[2].receipt.attempts[4].sourceDealFingerprint=null;
  assert.equal(comparePromptBaselineAba(both).baselineReplayVerdict,
    'FAIL-control-replay-not-identical');
  const stale=fixture();
  stale[2].receipt.attempts[0].publicRootLedgerSha256Computed=
    hash('forged');
  assert.equal(comparePromptBaselineAba(stale).baselineReplayVerdict,
    'FAIL-control-replay-not-identical');
});
test('undefined starter or fake physical sixty rejects native input custody',()=>{
  const noSeat=fixture();
  noSeat[1].witness.events[0].nativeFirstPlayerSeat=undefined;
  assert.throws(()=>comparePromptBaselineAba(noSeat));
  const badSixty=fixture();
  badSixty[1].witness.events[7].physicalSixtyCardCount=59;
  assert.throws(()=>comparePromptBaselineAba(badSixty));
});
test('treated physical source-deal digest must match the verified baseline',()=>{
  const f=fixture();
  f[1].receipt.attempts[2].sourceDealFingerprint=hash('different-physical-source');
  const out=comparePromptBaselineAba(f);
  assert.equal(out.equalControlPhysicalSourceDealRows,8);
  assert.equal(out.equalAllThreePhysicalSourceDealRows,7);
  assert.equal(out.baselineReplayVerdict,
    'UNRESOLVED-treatment-physical-source-deal-mismatch');
});
