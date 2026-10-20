'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const DRAGON='Dragapult ex TWM';
const SEARCH_ITEMS=new Set(['Quick Ball FST','Mysterious Treasure FLI']);
const POLICY_VERSION='regidrago-ball-singleton-dragon-cost-v1';

/**
 * Decide a one-card Item discard from actual owner-visible locations.
 * Ignore the opponent completely. The source game must already have chosen
 * and legally played its Item; no hidden search or new action is generated.
 * @param {object} state Live source Store state, before prompt resolution.
 * @param {object} prompt Current pending one-card discard ChooseCardsPrompt.
 * @param {number} actorId Actual Item owner.
 * @param {unknown} discardMessage Pinned GameMessage value.
 * @returns {object|null} Original physical Card reference or null.
 */
function ownedDragonCost(state,prompt,actorId,discardMessage){
  const owner=state.players.find(player=>player.id===actorId);
  if(!owner || !prompt ||
      prompt.constructor?.name!=='ChooseCardsPrompt' ||
      prompt.playerId!==actorId ||
      prompt.cards!==owner.hand ||
      prompt.message!==discardMessage ||
      prompt.options?.min!==1 ||
      prompt.options?.max!==1) return null;
  const regidragoOwned=[owner.active,...owner.bench].some(slot=>
    ['Regidrago V SIT','Regidrago VSTAR SIT']
      .includes(slot.getPokemonCard()?.fullName)) ||
    owner.hand.cards.some(card=>['Regidrago V SIT','Regidrago VSTAR SIT']
      .includes(card.fullName));
  if(!regidragoOwned || owner.discard.cards.some(card=>
    card.fullName===DRAGON))return null;
  const dragon=owner.hand.cards.find(card=>card.fullName===DRAGON);
  return dragon&&prompt.validate([dragon],state)===true?dragon:null;
}

/**
 * Bounded, reversible actual-root Item-discard selection policy.
 * The existing bot chooses every Item play, search target, Energy attachment,
 * Supporter, and attack. This wrapper changes only an already chosen valid
 * discard-cost prompt immediately following an owned Ball/Treasure Item.
 *
 * @template T
 * @param {Function} Store Pinned Twinleaf Store constructor.
 * @param {number} actorId Target Regidrago player's true ID.
 * @param {()=>T} execute Synchronous real-source match, never a clone.
 * @returns {{result:T,observed:object[],changed:number}}
 */
function withRegidragoBallDragonCost(Store,actorId,execute){
  assert.equal(typeof execute,'function');
  assert.ok(Number.isSafeInteger(actorId));
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const {GameMessage}=require(path.join(output,'game/game-message'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  let root=null,rootStep=-1,pendingItem=null;
  const observed=[];
  Store.prototype.dispatch=function ownedDragonPrompt(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this!==root)return descriptor.value.apply(this,[action,...args]);
    rootStep++;
    const state=this.state;
    const kind=action?.constructor?.name;
    if(pendingItem&&state.turn!==pendingItem.turn)pendingItem=null;
    const owner=state.players.find(player=>player.id===actorId);
    if(kind==='PlayCardAction'&&action.id===actorId) {
      const item=owner?.hand.cards[action.handIndex]?.fullName;
      pendingItem=SEARCH_ITEMS.has(item)?{printing:item,turn:state.turn}:null;
    }
    let selected=null,submitted=action;
    if(kind==='ResolvePromptAction'&&pendingItem){
      const prompt=state.prompts.find(x=>x.id===action.id);
      if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
          prompt.playerId===actorId&&prompt.cards===owner?.hand &&
          prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD) {
        const dragon=ownedDragonCost(state,prompt,actorId,
          GameMessage.CHOOSE_CARD_TO_DISCARD);
        const proposed=Array.isArray(action.result)?
          action.result.map(card=>card?.fullName??null):[];
        const record={rootStep,turn:state.turn,actorId,
          item:pendingItem.printing,proposed,
          eligibleDragon:dragon!==null,changed:false,
          handBefore:owner.hand.cards.map(card=>card.fullName),
          dragonAlreadyInDiscard:owner.discard.cards.some(c=>
            c.fullName===DRAGON)};
        if(dragon&&!Array.isArray(action.result)&&action.result!==dragon ||
            dragon&&Array.isArray(action.result)&&
              !(action.result.length===1&&action.result[0]===dragon)){
          submitted=new ResolvePromptAction(action.id,[dragon]);
          record.changed=true;
          selected=dragon;
        }
        observed.push(record);
        pendingItem=null;
      }
    }
    const result=descriptor.value.apply(this,[submitted,...args]);
    if(selected) {
      const last=observed[observed.length-1];
      last.physicalDragonInDiscard=owner.discard.cards.includes(selected);
      assert.equal(last.physicalDragonInDiscard,true,
        'Selected source Dragon did not physically enter owner discard');
    }
    return result;
  };
  try{
    const result=execute();
    return {result,observed,changed:observed.filter(x=>x.changed).length};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={DRAGON,SEARCH_ITEMS,POLICY_VERSION,ownedDragonCost,
  withRegidragoBallDragonCost};
