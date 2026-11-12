'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-owner-public-acknowledgements-v2';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow non-strategic native acknowledgement layer. Decisions are limited
 * to a true acknowledgement of an already provided mulligan disclosure, a
 * void reply to a game-controlled Wait prompt, and a false ConfirmPrompt
 * response matching Twinleaf's default ConfirmPromptResolver. No concealed
 * cards are inspected and no beneficial ability is proactively selected.
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
  const {ConfirmPrompt}=engine('game/store/prompts/confirm-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');

  const earlier=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof earlier?.value,'function');
  assert.equal(earlier.configurable,true);
  const events=[];
  let mulliganAcks=0,waitAcks=0,confirmAcks=0;
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
      const isConfirm=prompt instanceof ConfirmPrompt;
      if(isMulligan||isWait||isConfirm){
        const result=isMulligan?true:isWait?null:false;
        const action=new ResolvePromptAction(prompt.id,result);
        if(isMulligan)mulliganAcks++;
        else if(isWait)waitAcks++;
        else confirmAcks++;
        events.push({seat,turn:state.turn,phase:state.phase,
          kind:isMulligan?'public-mulligan-ack':
            isWait?'void-wait-ack':'default-confirm-decline',
          promptType:prompt.constructor.name,
          message:isMulligan?prompt.message:prompt.message??null,
          resultKind:isMulligan?'true':
            isWait?'void-null':'false-native-default-equivalent',
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
      mulliganAcks,waitAcks,confirmAcks,events,
      confirmPromptDefaultEquivalent:true,
      beneficialAbilityUseQualified:false,
      completePolicyOwnerSafe:false,competitiveGames:0}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoded);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',earlier);
  }
}
module.exports={VERSION,withOwnerPublicAcknowledgements};
