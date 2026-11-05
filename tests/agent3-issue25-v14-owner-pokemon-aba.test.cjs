'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  VERSION,PLANS,compareOwnerPokemonAba,withOwnerPokemonOverModalPrize
}=require('../simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs');

const hash=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
const IDS=Array.from({length:8},(_,n)=>'frozen-try-'+n);
function fixture(){
  return PLANS.map((p,arm)=>({
    ...p,
    selectedPromptAudit:{
      ownerModalPromptBaseline:{selected:2,accepted:2,settled:2},
      ownerFirstOccupiedPrizeBaseline:{ownerPrizeChoiceSubmitted:1},
      ...(arm===1?{ownerChoosePokemonPromptBaseline:{
        accepted:1,postconditionsConfirmed:1,
        boundedSelections:[{seat:1,offered:2,choiceIndex:0}]
      }}:{})
    },
    witness:{
      registeredNativeTrialLabelWitnessSelected:true,
      exactNativeStoreRootsRecorded:8,
      firstOwnerSetupInputsObserved:16,
      exactPhysicalSixtyPrintedCountMatches:16,
      privateFingerprintSessionId:'a'.repeat(32),
      events:IDS.flatMap((id,n)=>[0,1].map(seat=>({
        registeredNativeTrialId:id,physicalOwnerSeat:seat,
        nativeStoreOrdinal:n+1,nativeFirstPlayerSeat:n%2,
        firstBeforeAnyOwnerSetupChoice:true,
        noPolicyChoiceOrHiddenNamesPublished:true,
        globalTurnAtCapture:0,physicalSixtyCardCount:60,
        exactPhysicalSixtyPrintedCountMatched:true,
        opaquePhysicalPrechoiceInputHmacSha256:hash([id,seat,'physical']),
        opaquePreRunRequestHmacSha256:hash([id,'request'])
      })))
    },
    receipt:{
      registration:{expectedIds:IDS,exactJoinedByTrialId:true},
      provenance:{
        observedRepositoryCommit:'b'.repeat(40),
        observedTwinleafCommit:'c'.repeat(40)
      },
      actuallyExecutingManifest:{
        nightWatchPrivateSeedCommitmentSha256:'d'.repeat(64)
      },
      attempts:IDS.map((id,n)=>{
        const action=arm===1&&n===0?
          'ResolvePromptAction':'AttackAction';
        const publicRootActions=[{
          action,actionOrdinal:0,turnBefore:5,playerSlot:1,
          ...(action==='ResolvePromptAction'?
            {pendingPrompt:'ChoosePokemonPrompt'}:{attack:'Eon Blade'})
        }];
        return {
          id,actualRawTrialId:id,
          status:arm===1&&n===0?'returned-unqualified':'engine-error',
          publicRootActions,publicRootActionCount:1,
          publicRootActionsTruncated:false,
          publicRootLedgerSha256Computed:hash(publicRootActions),
          publicRootLedgerDigestConsistent:true,
          sourceDealFingerprint:hash('source'+id)
        };
      })
    }
  }));
}
test('A/B/A modal-Prize policy unchanged; only owner Pokemon selector differs',()=>{
  const o=compareOwnerPokemonAba(fixture());
  assert.equal(o.schema,VERSION);
  assert.equal(o.baselineReplayVerdict,'PASS-bounded-protected-opening-A-A-control');
  assert.equal(o.matchingNativeRequests,32);
  assert.equal(o.matchingNativeOwnerPrechoice,32);
  assert.equal(o.equalControlPublicRootAndStatusRows,8);
  assert.equal(o.equalAllThreePhysicalSourceDealRows,8);
  assert.equal(o.rows[0].newPokemonChoiceChangesDisposition,true);
  assert.equal(o.rows[0].firstNewPublicRoot.protected.publicPromptKind,
    'ChoosePokemonPrompt');
  assert.equal(o.treatmentSelectedPromptAudit
    .ownerChoosePokemonPromptBaseline.accepted,1);
  assert.equal(o.certifiedPaperGames,0);
  assert.equal(o.ownerPokemonDecisionCompetenceCertified,false);
});
test('physical source mismatch and lost root action custody invalidate inference',()=>{
  const mismatch=fixture();
  mismatch[1].receipt.attempts[0].sourceDealFingerprint=hash('wrong');
  assert.equal(compareOwnerPokemonAba(mismatch).baselineReplayVerdict,
    'UNRESOLVED-treatment-physical-source-deal-mismatch');
  const hidden=fixture();
  hidden[0].receipt.attempts[0].publicRootActionsTruncated=true;
  assert.equal(compareOwnerPokemonAba(hidden).baselineReplayVerdict,
    'FAIL-control-replay-not-identical');
});
test('decomposed owner menu adapter executes in correct nested order',()=>{
  const calls=[];
  const wrapper=name=>next=>{
    calls.push('enter '+name);
    const result=next();
    calls.push('exit '+name);
    return {result,audit:{name}};
  };
  const out=withOwnerPokemonOverModalPrize(()=>42,{
    choosePokemonLayer:wrapper('pokemon'),
    ownerPromptLayer:wrapper('modal-prize')
  });
  assert.equal(out.result,42);
  assert.deepEqual(calls,['enter pokemon','enter modal-prize',
    'exit modal-prize','exit pokemon']);
  assert.equal(out.audit.ownerChoosePokemonPromptBaseline.name,'pokemon');
  assert.equal(out.audit.competitiveGamesQualified,0);
});
