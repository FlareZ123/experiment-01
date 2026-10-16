'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {decodeRecordedAction,approvedActionClasses}=
  require('./source-replay-action-decoder.cjs');
const {captureAction}=require('./source-action-value-codec.cjs');
const {capturePromptAction}=require('./source-prompt-action-codec.cjs');
const {observedCounts}=require('./store-dispatch-transcript.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(output,relative));

/**
 * Replace only bot choice-making with previously archived actual actions.
 * The Store continues to apply actions and built-in stochastic effects. The
 * caller supplies the same source game seed, decks, hooks and action limit.
 * Exact dispatch parameters and state counts are verified at every step.
 *
 * Deliberately fails on the first action without a safe reconstruction path.
 * A complete run is a replay instrumentation milestone; it cannot certify
 * paper rules or competitive player decisions on its own.
 *
 * @template T
 * @param {object[]} sourceTrace Source's live-only Store dispatch events
 * @param {()=>T} work Callback that calls headless.runMatch
 * @returns {{result:T,verifiedDispatches:number,completedSourceTrace:boolean}}
 */
function withRecordedSourceActions(sourceTrace,work) {
  if(!Array.isArray(sourceTrace)||sourceTrace.length<3 ||
      sourceTrace[0]?.action!=='AddPlayerAction' ||
      sourceTrace[1]?.action!=='AddPlayerAction') {
    throw new TypeError('Missing source game starting action records');
  }
  const {Store}=engine('game/store/store');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const registry=approvedActionClasses(engine);
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  if(typeof storeDesc?.value!=='function'||typeof botDesc?.value!=='function') {
    throw new Error('Pinned engine interfaces changed');
  }
  let sourceStore=null;
  let ordinal=0;
  const verify= (event,action,pending,state) => {
    if(event?.step!==ordinal||event?.action!==action.constructor.name) {
      throw new Error('Source dispatch identity drift at step '+ordinal);
    }
    assert.deepEqual(observedCounts(state),event.before,
      'Before-action Store summary differs at source step '+ordinal);
    if(typeof event.zoneDigestBefore!=='string' ||
        typeof event.zoneDigestAfter!=='string') {
      throw new Error('Source zone evidence missing at step '+ordinal);
    }
    assert.equal(zoneSnapshotDigest(sourceZoneSnapshot(state)),event.zoneDigestBefore,
      'Before-action hidden-zone digest differs at source step '+ordinal);
    if(event.typedAction) {
      assert.deepEqual(captureAction(action),event.typedAction,
        'Typed action fields differ at source step '+ordinal);
    } else if(event.promptReplayAction) {
      assert.deepEqual(capturePromptAction(pending,action,state),
        event.promptReplayAction,
        'Prompt source references differ at source step '+ordinal);
    } else {
      throw new Error('Nonportable source action at step '+ordinal);
    }
  };
  const patchedDispatch=function(action) {
    if(sourceStore===null&&action?.constructor?.name==='AddPlayerAction') {
      sourceStore=this;
    }
    if(this!==sourceStore) return storeDesc.value.call(this,action);
    const event=sourceTrace[ordinal];
    const pending=this.state.prompts.find(p=>p.result===undefined)||null;
    verify(event,action,pending,this.state);
    const result=storeDesc.value.call(this,action);
    assert.deepEqual(observedCounts(this.state),event.after,
      'After-action Store summary differs at source step '+ordinal);
    ordinal+=1;
    return result;
  };
  const patchedBot=function(state) {
    const expected=sourceTrace[ordinal];
    if(!expected) throw new Error('Archived trace exhausted at bot choice '+ordinal);
    const pending=state.prompts.find(p=>p.result===undefined)||null;
    return decodeRecordedAction(expected,pending,state,registry);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:patchedDispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...botDesc,value:patchedBot});
  let result;
  try {
    result=work();
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  if(ordinal!==sourceTrace.length) {
    throw new Error('Fresh replay stopped at '+ordinal+' of '+sourceTrace.length+' source dispatches');
  }
  return {result,verifiedDispatches:ordinal,completedSourceTrace:true};
}
module.exports={withRecordedSourceActions};
