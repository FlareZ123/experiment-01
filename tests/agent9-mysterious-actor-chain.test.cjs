'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseTreasurePayment,withActorMysteriousTreasure}=
  require('../simulation/twinleaf/agent9-mysterious-actor-chain.cjs');
const base=(hand)=>({decisionKind:'owner-root',ownHand:hand,
  ownPublic:{deckCount:40},ownTurnResources:{itemPlayLocked:false}});
test('K0 chooses only a genuinely payable spare Item or second Energy',()=>{
  assert.deepEqual(chooseTreasurePayment(base([
    'Mysterious Treasure FLI','Mysterious Treasure FLI'])),
    {item:0,payment:1});
  assert.deepEqual(chooseTreasurePayment(base([
    'Mysterious Treasure FLI','Psychic Energy MEE','Psychic Energy MEE'])),
    {item:0,payment:2});
  assert.equal(chooseTreasurePayment(base([
    'Mysterious Treasure FLI','Psychic Energy MEE'])),null);
  assert.equal(chooseTreasurePayment({...base([
    'Mysterious Treasure FLI','Psychic Energy MEE','Psychic Energy MEE']),
    ownTurnResources:{itemPlayLocked:true}}),null);
});
test('actual typed root, hand discard and owner deck choice share native Store',()=>{
  class AddPlayerAction{}
  class PlayCardAction{constructor(id,handIndex,target){
    Object.assign(this,{id,handIndex,target});}}
  class ResolvePromptAction{constructor(id,result){
    Object.assign(this,{id,result});}}
  class Store{dispatch(){return true;}}
  class Bot{constructor(id){this.client={id};}
    decodeNextAction(){return {type:'NATIVE_FALLBACK'};}}
  class ChooseCardsPrompt{
    constructor(id,cards,message){Object.assign(this,{
      id:57,playerId:id,cards,message,result:undefined});}
    validate(picked){return Array.isArray(picked)&&picked.length<=1&&
      picked.every(card=>this.cards.cards.includes(card));}
  }
  const item={fullName:'Mysterious Treasure FLI',trainerType:3};
  const energies=[0,1].map(i=>({fullName:'Psychic Energy MEE',i}));
  const wanted={fullName:'Psychic Basic CRE',superType:1,stage:0,
    cardType:[5]};
  const hand={cards:[item,...energies]};
  const deck={cards:[wanted]};
  const player={id:101,hand,deck};
  const state={players:[player,{id:202}],activePlayer:0,
    turn:2,prompts:[]};
  const observe=(s,seat)=>({
    actorSeat:seat,globalTurn:s.turn,
    decisionKind:s.prompts.length?'owner-prompt':'owner-root',
    pendingOwnerDeckSearch:s.prompts.length>0 &&
      s.prompts[0].cards===s.players[seat].deck,
    ownHand:s.players[seat].hand.cards.map(c=>c.fullName),
    ownPublic:{deckCount:deck.cards.length,
      bench:[null,null,null,null,null]},
    ownTurnResources:{itemPlayLocked:false}
  });
  const engine=key=>{
    const modules={
      'simple-bot/simple-tactics-ai':{SimpleTacticsAi:Bot},
      'game/store/store':{Store},
      'game/store/actions/play-card-action':{PlayCardAction,
        PlayerType:{ANY:0},SlotType:{BOARD:0}},
      'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
      'game/game-message':{GameMessage:{
        CHOOSE_CARD_TO_HAND:'hand',CHOOSE_CARD_TO_DISCARD:'discard'}},
      'game/store/card/card-types':{SuperType:{POKEMON:1},
        TrainerType:{ITEM:3},Stage:{BASIC:0},
        CardType:{PSYCHIC:5,DRAGON:6}}
    };
    assert.ok(modules[key],key);return modules[key];
  };
  const oldBot=Bot.prototype.decodeNextAction;
  const oldStore=Store.prototype.dispatch;
  const got=withActorMysteriousTreasure(()=>{
    const store=new Store(),bot=new Bot(101);
    store.dispatch(new AddPlayerAction());
    const root=bot.decodeNextAction(state);
    assert.ok(root instanceof PlayCardAction);
    store.dispatch(root);
    hand.cards.shift();
    state.prompts=[new ChooseCardsPrompt(101,hand,'discard')];
    const discard=bot.decodeNextAction(state);
    assert.ok(discard instanceof ResolvePromptAction);
    assert.strictEqual(discard.result[0],energies[1]);
    store.dispatch(discard);
    hand.cards.splice(hand.cards.indexOf(energies[1]),1);
    state.prompts=[new ChooseCardsPrompt(101,deck,'hand')];
    const selection=bot.decodeNextAction(state);
    assert.ok(selection instanceof ResolvePromptAction);
    assert.strictEqual(selection.result[0],wanted);
    store.dispatch(selection);
    return 'accepted';
  },{engine,observe});
  assert.equal(got.result,'accepted');
  assert.equal(got.audit.itemAccepted,1);
  assert.equal(got.audit.discardAccepted,1);
  assert.equal(got.audit.searchAccepted,1);
  assert.equal(got.audit.nativeRejected,0);
  assert.strictEqual(Bot.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldStore);
});
