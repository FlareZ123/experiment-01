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
