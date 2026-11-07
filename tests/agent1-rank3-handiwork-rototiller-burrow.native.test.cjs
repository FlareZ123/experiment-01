'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorAttackRecoveryInput}=require(
  '../simulation/twinleaf/agent37-attack-recovery-owner-prompt.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(ROOT,name));

/** @param {0|1} seat */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;
  opponent.id=202;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=3000;
  const card=printing=>{
    const value=manager.getCardByName(printing);
    assert.ok(value,'Native card missing '+printing);
    value.id=id++;
    return value;
  };
  owner.active.cards.push(card('Bunnelby PRC'));
  owner.active.energies.cards.push(card('Psychic Energy SVE'));
  const recovery=card("Team Rocket's Handiwork FCO");
  owner.discard.cards.push(recovery);
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<14;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,recovery,seat};
}

/**
 * Resolve only the genuine native Rototiller recovery, Omega Barrage
 * confirmation, and printed second Burrow prompts.
 * @param {object} context
 * @returns {{recovery:boolean,omega:boolean,burrow:boolean}}
 */
function resolveRototillerThenBurrow(context){
  const {store,state,owner,opponent,recovery,seat}=context;
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {GameMessage}=native('game/game-message');
  const flags={recovery:false,omega:false,burrow:false,shown:false,shuffled:false,
    burrowDeckBefore:null,burrowDeckAfter:null};
  let confirmCount=0,chooseAttackCount=0;
  for(let i=0;i<30;i++){
    const prompt=state.prompts.find(value=>
      value&&value.result===undefined);
    if(!prompt)break;
    if(prompt.constructor.name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(prompt.constructor.name==='ChooseCardsPrompt'&&
        prompt.message==='CHOOSE_CARD_TO_DECK'){
      assert.equal(prompt.playerId,owner.id);
      assert.strictEqual(prompt.cards,owner.discard);
      assert.equal(prompt.validate([recovery]),true);
      const projected=actorAttackRecoveryInput(state,seat);
      assert.equal(projected.prompt.source,'own-discard-to-deck');
      assert.deepEqual(projected.prompt.offered.map(value=>value.printing),
        ["Team Rocket's Handiwork FCO"]);
      assert.equal(projected.prompt.offered[0].selectableAlone,true);
      store.dispatch(new ResolvePromptAction(prompt.id,[recovery]));
      flags.recovery=true;
      continue;
    }
    if(prompt.constructor.name==='ShowCardsPrompt'&&
        prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      assert.equal(prompt.playerId,opponent.id);
      const shown=prompt.cards?.cards??prompt.cards;
      assert.deepEqual(shown.map(value=>value.fullName),
        ["Team Rocket's Handiwork FCO"]);
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      flags.shown=true;
      continue;
    }
    if(prompt.constructor.name==='ShuffleDeckPrompt'){
      assert.equal(prompt.playerId,owner.id,
        "Rototiller must shuffle the owner's deck");
      const order=Array.from({length:owner.deck.cards.length},
        (_,index)=>index);
      store.dispatch(new ResolvePromptAction(prompt.id,order));
      flags.shuffled=true;
      continue;
    }
    if(prompt.constructor.name==='ConfirmPrompt'&&
        prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      confirmCount++;
      assert.equal(prompt.playerId,owner.id);
      assert.equal(prompt.validate(true),true);
      store.dispatch(new ResolvePromptAction(prompt.id,true));
      flags.omega=true;
      continue;
    }
    if(prompt.constructor.name==='ChooseAttackPrompt'&&
        prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
      chooseAttackCount++;
      assert.equal(prompt.playerId,owner.id);
      assert.equal(prompt.cards[0]?.fullName,'Bunnelby PRC');
      const burrow=prompt.cards[0].attacks.find(attack=>
        attack.name==='Burrow');
      assert.ok(burrow,'Omega Barrage must offer printed Burrow');
      // Native Store.reducePrompt passes the Attack directly to the callback.
      assert.equal(prompt.validate(burrow),true);
      flags.burrowDeckBefore=opponent.deck.cards.length;
      store.dispatch(new ResolvePromptAction(prompt.id,burrow));
      flags.burrowDeckAfter=opponent.deck.cards.length;
      assert.equal(flags.burrowDeckAfter,flags.burrowDeckBefore-1,
        'Burrow must discard exactly one card before the next turn draw');
      assert.equal(opponent.discard.cards.length,1);
      flags.burrow=true;
      continue;
    }
    throw new Error('Unexpected pending prompt '+
      prompt.constructor.name+' '+String(prompt.message));
  }
  assert.equal(state.prompts.some(prompt=>prompt.result===undefined),false,
    'all native Rototiller and Omega Barrage prompts must resolve');
  assert.equal(flags.recovery,true,'Rototiller must select Handiwork');
  assert.equal(flags.omega,true,'Omega Barrage must be accepted');
  assert.equal(flags.burrow,true,'the second attack must be printed Burrow');
  assert.equal(confirmCount,1,'Omega Barrage must offer exactly one follow-up');
  assert.equal(chooseAttackCount,1,'exactly one second attack must be selected');
  assert.equal(flags.shown,true,'Rototiller must reveal its selected discard card');
  assert.equal(flags.shuffled,true,'Rototiller must resolve the deck shuffle');
  assert.equal(owner.discard.cards.includes(recovery),false);
  assert.equal(owner.deck.cards.includes(recovery),true);
  assert.equal(owner.deck.cards.length,15);
  assert.equal(flags.burrowDeckBefore,14);
  assert.equal(flags.burrowDeckAfter,13);
  assert.equal(opponent.discard.cards.length,1);
  assert.equal(state.turn,4,'the resolved attack must advance to the opponent turn');
  assert.equal(state.activePlayer,1-seat);
  assert.equal(opponent.deck.cards.length,12,
    'the opponent draws once for the new turn after the one-card Burrow mill');
  return flags;
}

for(const seat of [0,1]){
  test('Bunnelby recycles Team Rocket Handiwork with Rototiller then uses second Burrow, seat '+seat,()=>{
    const context=stage(seat);
    const {AttackAction}=native('game/store/actions/game-actions');
    context.store.dispatch(new AttackAction(context.owner.id,'Rototiller'));
    const flags=resolveRototillerThenBurrow(context);
    assert.deepEqual(flags,{recovery:true,omega:true,burrow:true,shown:true,
      shuffled:true,burrowDeckBefore:14,burrowDeckAfter:13});
  });
}
