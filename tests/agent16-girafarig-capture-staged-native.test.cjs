'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseSpecialEnergyIntent}=
  require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');
const {collectOwnerContention}=
  require('../simulation/twinleaf/agent16-owner-priority-contention.cjs');
const {installGirafarigGetLostPaperHook}=
  require('../simulation/twinleaf/agent29-girafarig-getlost-paper-hook.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/**
 * Two physical cards of exact published rank3 Capture Energy, a single
 * printed Girafarig LOT and public opponent discard cards. This is an
 * artificially staged genuine Store, NEVER a natural seven-card start.
 * @param {0|1} seat
 * @returns {object} Unmutated native root and separate source-pool metadata.
 */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format,Stage,EnergyType,CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,
    PowerType,SpecialCondition
  });
  let id=89000;
  const card=printing=>{
    const physical=manager.getCardByName(printing);
    assert.ok(physical,'Missing native exact printing: '+printing);
    physical.id=id++;
    return physical;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=500+seat;opponent.id=600+seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  const girafarig=card('Girafarig LOT');
  const first=card('Capture Energy RCL');
  const held=card('Capture Energy RCL');
  owner.active.cards.push(girafarig,first);
  owner.active.energies.cards.push(first);
  owner.hand.cards.push(held);
  opponent.active.cards.push(card('Bunnelby PRC'));
  opponent.discard.cards.push(card('Psychic Energy SVE'),
    card('Darkness Energy SVE'));
  for(const player of state.players){
    for(let j=0;j<5;j++)player.bench.push(new PokemonCardList());
    for(let j=0;j<10;j++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  // A genuine Basic Pokémon target for Capture's optional deck search.
  owner.deck.cards.push(card('Shadow Rider Calyrex V CRE'));
  const view=actorObservation(state,seat);
  assert.equal(view.ownHand.length,1);
  assert.deepEqual(view.ownPublic.active.energies,['Capture Energy RCL']);
  assert.equal(view.opponentPublic.discard.length,2);
  return {store,state,owner,opponent,held,first,girafarig,
    catalog,seat,view,card};
}

for(const seat of [0,1]){
  test('published rank3 dual-owner-choice intent is native-present at seat '+seat,()=>{
    const fixture=stage(seat),{view,catalog}=fixture;
    const options={specialEnergyRoot:true};
    const chosen=chooseActorRootIntent(view,catalog,options);
    assert.deepEqual(chosen,{kind:'attack',attackName:'Get Lost'});
    const special=chooseSpecialEnergyIntent(view,catalog);
    assert.equal(special.kind,'attach-special-energy');
    assert.equal(special.printing,'Capture Energy RCL');
    const receipt=collectOwnerContention(view,catalog,options,chosen);
    assert.equal(receipt.alternatives.length,1);
    assert.equal(receipt.alternatives[0].kind,'attach-special-energy');
    assert.equal(receipt.alternatives[0].reason,'turn-ending-selection');
    assert.equal(receipt.alternatives[0].nativePlayability,'unverified');
  });

  test('published rank3 owner Capture physically attaches instead of attacking at seat '+seat,()=>{
    const {store,state,owner,held,first}=stage(seat);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const before=owner.hand.cards.length;
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(owner.hand.cards.length,before-1);
    assert.equal(owner.active.energies.cards.includes(first),true);
    assert.equal(owner.active.energies.cards.includes(held),true);
    assert.equal(owner.active.energies.cards.length,2);
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.ok(pending,'Capture should reveal its printed Basic-search action');
    assert.equal(state.turn,4);
  });

  test('rank3 owner Get Lost creates actual opponent discard target prompt at seat '+seat,()=>{
    const restore=installGirafarigGetLostPaperHook();
    try{
      const {store,state,owner,opponent,first,held}=stage(seat);
      const {AttackAction}=native('game/store/actions/game-actions');
      store.dispatch(new AttackAction(owner.id,'Get Lost'));
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Printed Get Lost must open a mandatory public discard prompt');
      assert.equal(pending.options.min,2);
      assert.equal(pending.options.max,2);
      assert.equal(pending.options.allowCancel,false);
      assert.equal(pending.validate(opponent.discard.cards.slice()),true);
      // Announcement itself has not attached a second Energy, so the
      // attack-first policy consumes the alternate funding opportunity.
      assert.equal(owner.active.energies.cards.length,1);
      assert.ok(owner.active.energies.cards.includes(first));
      assert.ok(owner.hand.cards.includes(held));
    }finally{restore();}
  });
}
