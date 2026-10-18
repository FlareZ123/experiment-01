'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Override only a real own-deck Star Alchemy prompt's selected card. The bot
 * sees deck contents solely inside its legitimate owner search prompt. No
 * external seed, hidden opposing zone, or outcome enters its decisions.
 * @template T
 * @param {0|1} ownerSeat
 * @param {string} targetName
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withOwnerStarSearchAnswer(ownerSeat,targetName,execute) {
  const load=name=>require(path.join(output,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GameMessage}=load('game/game-message');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let pendingStar=false;
  const audit={ownerSeat,targetName,starProposed:0,searchPrompts:0,
    changed:0,available:null,realOptions:[],reason:null};
  /** @param {object} state */
  function decode(state) {
    const own=state.players[ownerSeat];
    if(this.client?.id!==own.id)return original.call(this,state);
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(pendingStar&&prompt) {
      pendingStar=false;
      if(prompt.constructor.name!=='ChooseCardsPrompt'||
          prompt.playerId!==own.id||prompt.cards!==own.deck||
          prompt.message!==GameMessage.CHOOSE_CARD_TO_HAND) {
        audit.reason='Star prompt did not match live owner deck search';
        return original.call(this,state);
      }
      audit.searchPrompts+=1;
      audit.realOptions=prompt.cards.cards.map(card=>card.fullName);
      const card=prompt.cards.cards.find(c=>c.name===targetName);
      audit.available=Boolean(card);
      if(!card||prompt.validate([card],state)!==true) {
        audit.reason='Requested card was unavailable or invalid at owner prompt';
        return original.call(this,state);
      }
      audit.changed+=1;
      return new ResolvePromptAction(prompt.id,[card]);
    }
    const action=original.call(this,state);
    if(!prompt&&action?.constructor.name==='UseAbilityAction'&&
        action.name==='Star Alchemy') {
      pendingStar=true;
      audit.starProposed+=1;
    }
    return action;
  }
  SimpleTacticsAi.prototype.decodeNextAction=decode;
  try{return {result:execute(),audit};}
  finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decode,
      'Star search override did not retain temporary bot dispatch ownership');
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={withOwnerStarSearchAnswer};
