'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-owner-public-acknowledgements-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow non-strategic native acknowledgement layer. The only decisions are
 * a true acknowledgement of an already provided mulligan disclosure and a
 * void reply to a game-controlled Wait prompt. No concealed cards inspected.
 *
 * Must run inside the Agent4 fail-closed native-decoder guard, never alone
 * as a claim of owner-safe complete policy.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Test module injection.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPublicAcknowledgements(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ShowMulliganPrompt}=engine('game/store/prompts/show-mulligan-prompt');
  const {WaitPrompt}=engine('game/store/prompts/wait-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');

  const earlier=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof earlier?.value,'function');
  assert.equal(earlier.configurable,true);
  const events=[];
  let mulliganAcks=0,waitAcks=0;
  const decoded=function acknowledgePublicPrompt(state){
    const id=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===id)??-1;
    const prompt=state.prompts?.find(p=>
      p.playerId===id&&p.result===undefined);
    if((seat===0||seat===1)&&prompt?.playerId===id){
      const isMulligan=state.turn===0&&
        state.phase===GamePhase.SETUP&&
        prompt instanceof ShowMulliganPrompt&&
        (prompt.message===GameMessage.SETUP_PLAYER_NO_BASIC||
          prompt.message===GameMessage.SETUP_OPPONENT_NO_BASIC);
      const isWait=prompt instanceof WaitPrompt;
      if(isMulligan||isWait){
        const result=isMulligan?true:null;
        const action=new ResolvePromptAction(prompt.id,result);
        if(isMulligan)mulliganAcks++;
        else waitAcks++;
        events.push({seat,turn:state.turn,phase:state.phase,
          kind:isMulligan?'public-mulligan-ack':'void-wait-ack',
          promptType:prompt.constructor.name,
          message:isMulligan?prompt.message:null,
          resultKind:isMulligan?'true':'void-null',
          nativeStoreAccepted:'post-dispatch-unverified'});
        return action;
      }
    }
    return earlier.value.call(this,state);
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...earlier,value:decoded});
  try{
    const result=run();
    return {result,audit:{version:VERSION,
      mulliganAcks,waitAcks,events,
      completePolicyOwnerSafe:false,competitiveGames:0}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoded);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',earlier);
  }
}
module.exports={VERSION,withOwnerPublicAcknowledgements};
