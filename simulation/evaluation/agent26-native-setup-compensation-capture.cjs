'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createSetupCompensationObserver}=
  require('./setup-compensation-observer.cjs');
const base=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Wrap a synchronous pinned-Store setup capture with the existing read-only
 * mulligan-compensation observer. The direct Store hook sees actual resolved
 * setup actions before the outer setup-only stop sentinel interrupts play.
 * Original dispatch is restored even when the run throws.
 *
 * @param {Function} Store Pinned Store constructor.
 * @param {() => unknown} work Synchronous setup-only runner.
 * @returns {{result:unknown,compensation:object}}
 */
function withNativeSetupCompensation(Store,work){
  assert.equal(typeof Store?.prototype?.dispatch,'function');
  assert.equal(typeof work,'function');
  const {GamePhase}=require(path.join(base,
    'game/store/state/state'));
  const {ShuffleDeckPrompt}=require(path.join(base,
    'game/store/prompts/shuffle-prompt'));
  const {SelectPrompt}=require(path.join(base,
    'game/store/prompts/select-prompt'));
  const {GameMessage}=require(path.join(base,
    'game/game-message'));
  const observer=createSetupCompensationObserver({
    GamePhase,ShuffleDeckPrompt,SelectPrompt,GameMessage
  });
  const previous=Store.prototype.dispatch;
  Store.prototype.dispatch=function observeNativeSetup(action){
    const pre=this.state;
    const setup=pre?.phase===GamePhase.SETUP||
      pre?.phase===GamePhase.DRAW;
    const pending=setup?pre.prompts?.find(prompt=>
      prompt?.id===action?.id&&prompt.result===undefined):null;
    if(setup && pending)observer.before(pre,pending,action);
    const out=previous.call(this,action);
    if(setup && pending)observer.after(this.state);
    if(observer.result()===null&&
      this.state?.phase===GamePhase.PLAYER_TURN){
      observer.before(this.state,null,action);
    }
    return out;
  };
  try{
    const result=work();
    const compensation=observer.result();
    assert.ok(compensation,'Real setup compensation did not settle');
    return {result,compensation};
  }finally{
    Store.prototype.dispatch=previous;
  }
}
module.exports={withNativeSetupCompensation};
