'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {shouldConsentBunnelbyBarrage}=
  require('./agent40-bunnelby-barrage-consent.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=x=>require(path.join(OUTPUT,x));
const VERSION='agent40-original-rank15-owned-barrage-confirm-fork-v1';

/**
 * Reversible, genuine Store-only owner prompt intervention.
 * The previously selected authentic rank15 Poffin double-Oddish fork gets a
 * second Omega Barrage attack decision, but all other actions remain
 * unchanged. Genuine source owner can know the 60-card registration.
 *
 * @template T
 * @param {()=>T} run Actual pinned native source game.
 * @param {0|1} sourceSeat Authentic rank15 physical seat.
 * @param {object[]} ownRegisteredCards Exactly 60 physical source templates.
 * @returns {{result:T,audit:object}}
 */
function withNativeRank15BarrageConsent(run,sourceSeat,ownRegisteredCards){
  assert.equal(typeof run,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(ownRegisteredCards?.length,60);
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {ConfirmPrompt}=native('game/store/prompts/confirm-prompt');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {GamePhase}=native('game/store/state/state');
  const {GameMessage}=native('game/game-message');
  const botOld=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const storeOld=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof botOld?.value,'function');
  assert.equal(typeof storeOld?.value,'function');
  let liveStore=null;
  const choices=new WeakMap();
  const audit={schema:VERSION,seat:sourceSeat,eligible:0,
    proposed:0,accepted:0,sourcePrintedSixtyCount:60,
    ownerOnly:true,liveStoreOnly:true,policyScope:'retrospective development T16',
    examples:[],competitiveQualifiedGames:0};
  function decode(state){
    const player=state.players?.[sourceSeat];
    const prompt=state.prompts?.find(p=>p.result===undefined);
    if(liveStore?.state!==state||
       state.activePlayer!==sourceSeat||
       state.turn!==16||
       state.phase!==GamePhase.ATTACK||
       this.client?.id!==player?.id||
       !(prompt instanceof ConfirmPrompt)||
       prompt.playerId!==player.id||
       prompt.message!==GameMessage.WANT_TO_USE_ABILITY||
       !shouldConsentBunnelbyBarrage(player,ownRegisteredCards)||
       !prompt.validate(true))return botOld.value.call(this,state);
    audit.eligible++;
    assert.equal(audit.proposed,0,
      'One registered owner prompt intervention allowed');
    const chosen=new ResolvePromptAction(prompt.id,true);
    choices.set(chosen,{promptId:String(prompt.id),turn:state.turn});
    audit.proposed++;
    return chosen;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore)
      liveStore=this;
    const receipt=this===liveStore?choices.get(action):null;
    const result=storeOld.value.apply(this,[action,...args]);
    if(receipt){
      audit.accepted++;
      audit.examples.push({...receipt,realStoreReceipt:true});
    }
    return result;
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...botOld,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...storeOld,value:dispatch});
  try{return {result:run(),audit};}
  catch(e){e.agent40BarrageAudit=audit;throw e;}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',storeOld);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',botOld);
  }
}
module.exports={VERSION,withNativeRank15BarrageConsent};
