'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent50-owner-mandatory-showcards-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Reversible acknowledgement of a mandatory, in-turn ShowCards prompt owned
 * by the acting player. This does not inspect its cards or any concealed zone.
 * Install inside Agent4's outer native hidden-State fallback quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Injectable native modules.
 * @returns {{result:T,audit:object}}
 */
function withOwnerMandatoryShowCards(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ShowCardsPrompt}=engine('game/store/prompts/show-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');
  const prior=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof prior?.value,'function');
  assert.equal(prior.configurable,true);
  let accepted=0;
  const events=[];
  const intercept=function ownerMandatoryShowCards(state){
    const id=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===id)??-1;
    const prompt=state.prompts?.find(p=>
      p.playerId===id&&p.result===undefined);
    if((seat===0||seat===1)&&
      state.turn>=1&&state.phase===GamePhase.PLAYER_TURN&&
      prompt instanceof ShowCardsPrompt&&
      prompt.playerId===id&&
      prompt.options?.allowCancel===false&&
      prompt.message!==GameMessage.SETUP_OPPONENT_NO_BASIC){
      accepted++;
      events.push({seat,turn:state.turn,phase:state.phase,
        promptType:prompt.constructor.name,message:prompt.message,
        resolvedAs:'true',nativeStoreAccepted:'post-dispatch-unverified'});
      return new ResolvePromptAction(prompt.id,true);
    }
    return prior.value.call(this,state);
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...prior,value:intercept});
  try{
    const result=run();
    return {result,audit:{version:VERSION,accepted,events,
      ownerSafeCompletePolicy:false,competitiveGames:0}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercept);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',prior);
  }
}
module.exports={VERSION,withOwnerMandatoryShowCards};
