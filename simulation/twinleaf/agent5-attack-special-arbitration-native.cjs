'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {choosePublicContextSpecialEnergy}=require('./agent17-public-context-special-energy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=require('./agent5-owner-root-slice.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));
const ENERGY='Double Dragon Energy ROS',ATTACK='Gnaw';

/** @param {0|1} seat @returns {object} Genuine pinned Store in fixed staged position. */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=1;
  const card=name=>{const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);c.id=id++;return c;};
  const owner=new Player(),opponent=new Player();
  owner.id=111;opponent.id=222;
  owner.active.cards.push(card('Venonat MEW'));
  const psychic=card('Psychic Energy SVE');
  owner.active.cards.push(psychic);
  owner.active.energies.cards.push(psychic);
  for(let i=0;i<5;i++)owner.bench.push(new PokemonCardList());
  owner.bench[1].cards.push(card('Regidrago V SIT'));
  owner.hand.cards.push(card(ENERGY));
  opponent.active.cards.push(card('Pidgey MEW'));
  for(let i=0;i<5;i++)opponent.bench.push(new PokemonCardList());
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));p.prizes.push(prize);}
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=2;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const t={PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType};
  const catalog=buildActorCardCatalog(manager.getAllCards(),t);
  return {store,state,owner,opponent,seat,catalog,GamePhase};
}
