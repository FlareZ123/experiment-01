'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

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
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  assert.equal(state.rules.attackFirstTurn,false,
    'The genuine pinned Store must enforce first-player attack restrictions');
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=1;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='first-turn-owner';opponent.name='defender';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=67000;
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Missing pinned print '+printing);
    found.id=id++;
    return found;
  };
  owner.active.cards.push(card('Talonflame V VIV'));
  owner.active.energies.cards.push(card('Fire Energy SVE'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<14;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,catalog,seat};
}

for(const seat of [0,1]){
  test('native Store accepts first-player Talonflame Fast Flight, physical seat '+seat,()=>{
    const {store,state,owner,catalog}=stage(seat);
    const attack=owner.active.getPokemonCard().attacks[0];
    assert.equal(attack.name,'Fast Flight');
    assert.equal(attack.canUseOnFirstTurn,true);
    const view=actorObservation(state,seat);
    assert.equal(view.ownPublic.active.attacks[0].canUseOnFirstTurn,true);
    assert.equal(chooseActorRootIntent(view,catalog,{}).kind,'pass');
    const chosen=chooseActorRootIntent(view,catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.deepEqual(chosen,{kind:'attack',attackName:'Fast Flight'});
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    store.dispatch(new AttackAction(owner.id,chosen.attackName));
    for(let step=0;step<30&&state.turn===1;step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Pinned Store has stalled on first-player Fast Flight');
      assert.equal(pending.playerId,owner.id);
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Unexpected owner prompt in native draw-six opening');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(state.turn,2,'Native exception must complete the first turn');
    assert.equal(owner.deck.cards.length,8);
    assert.equal(owner.hand.cards.length,6);
    assert.equal(state.players[seat],owner);
  });
}
