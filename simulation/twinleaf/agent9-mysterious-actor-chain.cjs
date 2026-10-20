'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const VERSION='agent9-mysterious-owner-discard-k1-v1';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * K0 owner-hand discard-cost gate. A spare second Mysterious Treasure
 * or one of at least two Psychic Energy cards pays the single discard.
 * No cards in the physical deck or Prize zone are consulted.
 * @param {object} view Deeply detached actor-only root observation.
 * @returns {{item:number,payment:number}|null}
 */
function chooseTreasurePayment(view){
  assert.equal(view.decisionKind,'owner-root');
  if(view.ownTurnResources.itemPlayLocked ||
      view.ownPublic.deckCount===0)return null;
  const h=view.ownHand;
  const item=h.findIndex(x=>x.startsWith('Mysterious Treasure '));
  if(item<0)return null;
  const spare=h.findIndex((x,i)=>i!==item &&
    x.startsWith('Mysterious Treasure '));
  if(spare>=0)return {item,payment:spare};
  const energy=h.map((x,i)=>({x,i})).filter(row=>
    row.x.startsWith('Psychic Energy '));
  return energy.length>=2?{item,payment:energy[1].i}:null;
}

/** One authentic owner-only Item, hand discard and own-deck choice chain. */
function withActorMysteriousTreasure(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(n=>require(path.join(BASE,n)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {SuperType,TrainerType,Stage,CardType}=
    engine('game/store/card/card-types');
  const observe=deps.observe??actorObservation;
  const oldBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldBot?.value,'function');
  assert.equal(typeof oldStore?.value,'function');
  const history=new Map(),marked=new WeakMap();
  let live=null;
  const audit={version:VERSION,itemProposals:0,discardProposals:0,
    searchProposals:0,itemAccepted:0,discardAccepted:0,searchAccepted:0,
    nativeRejected:0,events:[],unsupportedPromptFallbacks:0,
    competitiveGameQualified:false};
  function intercept(state){
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const prompt=state.prompts?.find(x=>x.result===undefined)??null;
    if(seat<0 || (prompt&&prompt.playerId!==this.client?.id))
      return oldBot.value.call(this,state);
    const p=state.players[seat];
    let h=history.get(p.id);
    if(!h||h.turn!==state.turn){
      h={turn:state.turn,used:false,phase:'idle',payment:null};
      history.set(p.id,h);
    }
    if(prompt){
      if(prompt.constructor.name==='ChooseCardsPrompt' &&
         prompt.playerId===p.id && h.phase==='discard' &&
         prompt.cards===p.hand &&
         prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD){
        const selected=[h.payment];
        assert.ok(p.hand.cards.includes(h.payment));
        assert.ok(prompt.validate(selected),'Native discard payment invalid');
        h.phase='search';
        const action=new ResolvePromptAction(prompt.id,selected);
        marked.set(action,{kind:'discard',seat,turn:state.turn,
          printing:h.payment.fullName});
        audit.discardProposals++;
        return action;
      }
      if(prompt.constructor.name==='ChooseCardsPrompt' &&
         prompt.playerId===p.id && h.phase==='search' &&
         prompt.cards===p.deck &&
         prompt.message===GameMessage.CHOOSE_CARD_TO_HAND){
        const view=observe(state,seat);
        assert.equal(view.pendingOwnerDeckSearch,true);
        const cards=prompt.cards.cards;
        const eligible=cards.map(card=>({
          card,valid:prompt.validate([card]),
          basic:card.superType===SuperType.POKEMON &&
            card.stage===Stage.BASIC &&
            (card.cardType?.includes(CardType.PSYCHIC)||
             card.cardType?.includes(CardType.DRAGON))
        }));
        const possible=eligible.filter(c=>c.valid);
        const chosen=(view.ownPublic.bench.some(x=>x===null)?
          possible.find(c=>c.basic):null)??possible[0];
        const selected=chosen?[chosen.card]:[];
        assert.ok(prompt.validate(selected),'Native deck search invalid');
        h.phase='done';
        const action=new ResolvePromptAction(prompt.id,selected);
        marked.set(action,{kind:'search',seat,turn:state.turn,
          printing:chosen?.card.fullName??null});
        audit.searchProposals++;
        return action;
      }
      audit.unsupportedPromptFallbacks++;
      return oldBot.value.call(this,state);
    }
    if(state.activePlayer!==seat||h.used)
      return oldBot.value.call(this,state);
    const view=observe(state,seat);
    const decision=chooseTreasurePayment(view);
    if(!decision)return oldBot.value.call(this,state);
    const item=p.hand.cards[decision.item];
    const payment=p.hand.cards[decision.payment];
    assert.equal(item.fullName,view.ownHand[decision.item]);
    assert.equal(payment.fullName,view.ownHand[decision.payment]);
    assert.equal(item.trainerType,TrainerType.ITEM);
    assert.notStrictEqual(item,payment);
    h.used=true;h.phase='discard';h.payment=payment;
    const action=new PlayCardAction(p.id,decision.item,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    marked.set(action,{kind:'item',seat,turn:state.turn,
      printing:item.fullName});
    audit.itemProposals++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')live=this;
    const own=this===live?marked.get(action):null;
    if(!own)return oldStore.value.apply(this,[action,...args]);
    try{
      const out=oldStore.value.apply(this,[action,...args]);
      audit[own.kind+'Accepted']++;
      audit.events.push({...own,accepted:true});
      return out;
    }catch(e){
      audit.nativeRejected++;
      audit.events.push({...own,accepted:false,error:String(e?.message??e)});
      throw e;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...oldBot,value:intercept});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldStore,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercept);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldBot);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
}
module.exports={VERSION,chooseTreasurePayment,withActorMysteriousTreasure};
