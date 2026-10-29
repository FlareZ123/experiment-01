'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicSpecialAttackPayable}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
const {energyUnits}=
  require('../simulation/twinleaf/actor-energy-payability.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));

/** @param {string} pokemonPrinting @param {string} energyPrinting */
function staged(pokemonPrinting,energyPrinting){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const {GamePhase}=native('game/store/state/state');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,
    PowerType,SpecialCondition
  });
  let id=83000;
  const card=name=>{
    const item=manager.getCardByName(name);
    assert.ok(item,'Native original printing unavailable: '+name);
    item.id=id++;
    return item;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=103;opponent.id=204;
  const state=store.state;
  state.players=[owner,opponent];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card(pokemonPrinting));
  owner.hand.cards.push(card(energyPrinting));
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,catalog};
}

/** @param {string} pokemon @param {string} energy */
function accepted(pokemon,energy){
  const {store,state,owner,catalog}=staged(pokemon,energy);
  const v=actorObservation(state,0);
  const intent=chooseActorRootIntent(v,catalog,{
    publicContextSpecialEnergy:true
  });
  assert.ok(intent);
  assert.equal(intent.kind,'attach-special-energy');
  assert.equal(intent.printing,energy);
  assert.equal(intent.slot,'active');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const handBefore=owner.hand.cards.length;
  store.dispatch(new PlayCardAction(owner.id,intent.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.hand.cards.length,handBefore-1);
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===energy));
  assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
  return {state,owner,catalog};
}

test('pinned Store accepts actor-selected DDE on a real Dragon',()=>{
  const {state,owner,catalog}=accepted('Regidrago V SIT',
    'Double Dragon Energy ROS');
  assert.ok(catalog.dragonPokemonPrintings.has('Regidrago V SIT'));
  const after=actorObservation(state,0);
  const celestial=after.ownPublic.active.attacks.find(
    a=>a.name==='Celestial Roar');
  assert.ok(celestial);
  assert.equal(publicSpecialAttackPayable(after,catalog,
    after.ownPublic.active,celestial),true);
  assert.equal(owner.active.energies.cards.length,1);
});

test('pinned Store accepts true UPR Unit Energy printing on rank4 Pikachu',()=>{
  const {state,catalog}=accepted('Pikachu LOR',
    'Unit Energy LightningPsychicMetal UPR');
  const after=actorObservation(state,0);
  assert.ok(after.ownPublic.active.energies.includes(
    'Unit Energy LightningPsychicMetal UPR'));
  const context={isBasic:true,isEvolution:false,isDragon:false,
    hasRuleBox:false,behindOnPrizes:false};
  assert.deepEqual(
    energyUnits('Unit Energy LPM UPR',context),
    energyUnits('Unit Energy LightningPsychicMetal UPR',context)
  );
  assert.equal(catalog.specialEnergies.has(
    'Unit Energy LightningPsychicMetal UPR'),true);
});
