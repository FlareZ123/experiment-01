'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Reversible, owner-specific opening-turn choice. No opponent-private reads.
 * @template T
 * @param {[boolean,boolean]} goFirstBySeat Physical A/B choice on winning toss.
 * @param {()=>T} run Synchronous original Store run.
 * @param {object} [deps] Pinned classes; injection for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withGoFirstChoice(goFirstBySeat,run,deps={}){
  assert.ok(Array.isArray(goFirstBySeat)&&goFirstBySeat.length===2&&
    goFirstBySeat.every(x=>typeof x==='boolean'));
  assert.equal(typeof run,'function');
  const load=p=>require(path.join(output,p));
  const Bot=deps.Bot??load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Confirm=deps.Confirm??load('game/store/prompts/confirm-prompt').ConfirmPrompt;
  const Resolve=deps.Resolve??load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const Message=deps.Message??load('game/game-message').GameMessage;
  const old=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof old?.value,'function');
  const choices=[];
  Object.defineProperty(Bot.prototype,'decodeNextAction',{
    ...old,value:function(state){
      const id=this.client?.id;
      const seat=id===101?0:id===202?1:-1;
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(seat>=0&&prompt instanceof Confirm&&prompt.playerId===id&&
         prompt.message===Message.GO_FIRST){
        const chooseFirst=goFirstBySeat[seat];
        choices.push({seat,turn:state.turn,chooseFirst});
        return new Resolve(prompt.id,chooseFirst);
      }
      return old.value.call(this,state);
    }
  });
  try{return {result:run(),audit:{schema:'agent6-go-first-choice-v1',
    goFirstBySeat:[...goFirstBySeat],choices,competitiveQualified:false}};}
  finally{Object.defineProperty(Bot.prototype,'decodeNextAction',old);}
}

module.exports={withGoFirstChoice};
