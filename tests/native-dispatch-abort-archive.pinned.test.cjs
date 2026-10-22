'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {runMatch,upstreamSmokeDeck}=
  require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(output,'game/store/store'));
const {GamePhase}=require(path.join(output,'game/store/state/state'));

/**
 * An intentional original-Store failure tests the transport of prior, real,
 * accepted actions. It is NOT a claim that this card printing or bot action
 * naturally fails under paper rules. The instrumented game is unqualified.
 */
test('a rejected real Store dispatch retains source deal and accepted public roots',()=>{
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let actualStore=null;
  let injected=false;
  const sentinel='AGENT31_INTENTIONAL_NATIVE_STORE_ABORT';
  function rejectOneNativeRoot(action,...args){
    if(actualStore===null&&action.constructor.name==='AddPlayerAction')
      actualStore=this;
    const state=this.state;
    if(this===actualStore&&!injected&&state?.phase===GamePhase.PLAYER_TURN&&
       state.turn>=2&&action.constructor.name!=='ResolvePromptAction'){
      injected=true;
      throw new Error(sentinel);
    }
    return previous.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:rejectOneNativeRoot});
  let failure=null;
  try{
    const cards=upstreamSmokeDeck();
    assert.equal(cards.length,60);
    try{
      runMatch({
        deckA:cards,deckB:cards,
        seed:471144321,maxActions:180,
        captureDecisionTrace:true,captureNativeAbortEvidence:true,
        captureInitialSourceDealFingerprintSeat:0
      });
    }catch(error){failure=error;}
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
  assert.equal(injected,true,'Original Store did not reach the selected live root');
  assert.match(failure?.message??'',/AGENT31_INTENTIONAL_NATIVE_STORE_ABORT/);
  const receipt=failure.nativeAbortEvidence;
  assert.equal(receipt?.schema,'headless-native-abort-public-v1');
  assert.equal(receipt.failureStage,'store-dispatch');
  assert.equal(receipt.errorMessage,sentinel);
  assert.equal(receipt.sourceDealFingerprint.seat,0);
  assert.match(receipt.sourceDealFingerprint.digestSha256,/^[0-9a-f]{64}$/);
  assert.ok(receipt.actionOrdinal>0,'No accepted native Store roots');
  assert.equal(receipt.rootActionLedger.length,receipt.actionOrdinal);
  assert.ok(receipt.preDispatchPublic.turn>=2);
  assert.equal(receipt.preDispatchBoard.length,2);
  assert.equal(receipt.physicalActionParityCertified,false);
  assert.equal(receipt.competitiveGameQualified,false);
  assert.equal(Store.prototype.dispatch,previous.value);
});


test('real bot decoder exception preserves prior roots without leaking its detail',()=>{
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  assert.equal(typeof originalDecode?.value,'function');
  let actualStore=null;
  let injected=false;
  const concealedSentinel='AGENT31_ARTIFICIAL_UNREVEALED_CARD_EXAMPLE';
  function observedDispatch(action,...args){
    if(actualStore===null&&action.constructor.name==='AddPlayerAction')
      actualStore=this;
    return originalDispatch.value.apply(this,[action,...args]);
  }
  function fakeDecodeFailure(state,...args){
    if(!injected&&state===actualStore?.state&&
       state.phase===GamePhase.PLAYER_TURN&&state.turn>=2){
      injected=true;
      throw new Error('Simulated bot failure including '+concealedSentinel);
    }
    return originalDecode.value.apply(this,[state,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:observedDispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...originalDecode,value:fakeDecodeFailure});
  let failure=null;
  try{
    const cards=upstreamSmokeDeck();
    try{
      runMatch({deckA:cards,deckB:cards,seed:471144321,maxActions:180,
        captureDecisionTrace:true,captureNativeAbortEvidence:true,
        captureInitialSourceDealFingerprintSeat:0});
    }catch(error){failure=error;}
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      originalDecode);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
  }
  assert.equal(injected,true);
  assert.match(failure?.message??'',/AGENT31_ARTIFICIAL_UNREVEALED_CARD_EXAMPLE/);
  const receipt=failure.nativeAbortEvidence;
  assert.equal(receipt?.schema,'headless-native-abort-public-v1');
  assert.equal(receipt.failureStage,'bot-decoder');
  assert.equal(receipt.actionName,'BotDecodeFailure');
  assert.match(receipt.redactedMessageDigest,/^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(receipt).includes(concealedSentinel),false);
  assert.match(receipt.sourceDealFingerprint.digestSha256,/^[0-9a-f]{64}$/);
  assert.ok(receipt.actionOrdinal>0);
  assert.equal(receipt.rootActionLedger.length,receipt.actionOrdinal);
  assert.equal(Store.prototype.dispatch,originalDispatch.value);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,originalDecode.value);
});


test('strict validation of a real native prompt retains accepted history',()=>{
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  let liveStore=null, injected=false, failure=null;
  function observe(action,...args){
    if(liveStore===null&&action.constructor.name==='AddPlayerAction') liveStore=this;
    return oldStore.value.apply(this,[action,...args]);
  }
  function invalidPrompt(state,...args){
    const prompt=state.prompts?.find(p=>p.result===undefined);
    if(!injected&&state===liveStore?.state&&
       state.phase===GamePhase.PLAYER_TURN&&state.turn>=1&&prompt&&
       !['ShuffleDeckPrompt','CoinFlipPrompt'].includes(prompt.constructor.name)){
      injected=true;
      return new ResolvePromptAction(prompt.id+1000000,[]);
    }
    return oldDecode.value.apply(this,[state,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...oldStore,value:observe});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...oldDecode,value:invalidPrompt});
  try{
    const cards=upstreamSmokeDeck();
    try{
      runMatch({deckA:cards,deckB:cards,seed:471144321,maxActions:300,
        strictPromptValidation:true,captureDecisionTrace:true,
        captureNativeAbortEvidence:true,captureInitialSourceDealFingerprintSeat:0});
    }catch(error){failure=error;}
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecode);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
  assert.equal(injected,true,'No native prompted action appeared after setup');
  assert.match(failure?.message??'',/unknown or already-resolved prompt ID/);
  const receipt=failure.nativeAbortEvidence;
  assert.equal(receipt?.failureStage,'strict-prompt-validation');
  assert.ok(receipt.pendingPrompt);
  assert.match(receipt.redactedMessageDigest,/^[0-9a-f]{64}$/);
  assert.match(receipt.sourceDealFingerprint.digestSha256,/^[0-9a-f]{64}$/);
  assert.ok(receipt.actionOrdinal>0);
  assert.equal(receipt.rootActionLedger.length,receipt.actionOrdinal);
  assert.equal(Store.prototype.dispatch,oldStore.value);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,oldDecode.value);
});
