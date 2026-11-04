'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withInnermostOwnerPrize,VERSION}=
  require('../simulation/evaluation/agent20-issue25-inner-prize-recovery-v12.cjs');

test('innermost owner Prize wrapper executes once and restores native runMatch',()=>{
  const original=(request)=>({
    label:request.label,
    rootActionLedger:[{action:'ResolvePromptAction',
      pendingPrompt:'ChoosePrizePrompt'}]
  });
  const headless={runMatch:original};
  let wrapped=0;
  const observed=withInnermostOwnerPrize(()=>{
    assert.notStrictEqual(headless.runMatch,original);
    return headless.runMatch({label:'fixture'});
  },{headless,ownerPrizeChoice:next=>{
    wrapped++;
    return {result:next(),audit:{ownerPrizeChoiceSubmitted:1,bySeat:[1,0]}};
  }});
  assert.strictEqual(headless.runMatch,original);
  assert.equal(observed.result.label,'fixture');
  assert.equal(wrapped,1);
  assert.equal(observed.audit.version,VERSION);
  assert.equal(observed.audit.actualNativeAttempts,1);
  assert.equal(observed.audit.nativePrizePrompts[0].actualStoreAcceptedPrizePromptRoots,1);
  assert.equal(observed.audit.nativePrizePrompts[0].ownerPrizeAudit.ownerPrizeChoiceSubmitted,1);
  assert.equal(observed.audit.competitiveGamesQualified,0);
});

test('native decoder abort preserves only owner-safe Prize audit and restores module',()=>{
  const original=()=>{throw Error('fixture-private-exception-content')};
  const headless={runMatch:original};
  let failure;
  try{
    withInnermostOwnerPrize(()=>headless.runMatch({label:'failure'}),
      {headless,ownerPrizeChoice:next=>{
        try{return {result:next(),audit:null}}
        catch(error){
          error.agent21OwnerPrizeAudit={
            delegated:1,
            delegatedPromptMetadata:[{promptKind:'ChoosePrizePrompt',
              allowCancel:false,blockedCount:0}],
            readConcealedPrizeFaces:false
          };
          throw error;
        }
      }});
  }catch(error){failure=error;}
  assert.ok(failure);
  assert.strictEqual(headless.runMatch,original);
  assert.match(failure.message,/fixture-private-exception/);
  assert.equal(failure.agent21OwnerPrizeAudit.readConcealedPrizeFaces,false);
});

test('no native match leaves a restored export and zero attempts',()=>{
  const original=()=>null;
  const headless={runMatch:original};
  const result=withInnermostOwnerPrize(()=>42,{headless,
    ownerPrizeChoice:next=>({result:next(),audit:{}})});
  assert.strictEqual(headless.runMatch,original);
  assert.equal(result.result,42);
  assert.equal(result.audit.actualNativeAttempts,0);
});
