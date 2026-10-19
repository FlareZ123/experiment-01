'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {makeOpeningHorrorHouseTactic,withNewMoonOpeningHorrorHouse}=
  require('../simulation/twinleaf/new-moon-opening-horror-house-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const load=moduleName=>require(path.join(output,moduleName));

/** @param {'native'|'copied'} channel @param {boolean} attachPsychic */
function stagedBoard(channel,attachPsychic){
  const manager=initializeCards();
  let serial=10000;
  /** @param {string} name */
  const card=name=>{
    const chosen=manager.getCardByName(name);
    assert.ok(chosen,'Missing pinned printing '+name);
    chosen.id=serial++;
    return chosen;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const actor=new Player(),opponent=new Player();
  actor.id=101;
  opponent.id=202;
  state.players=[actor,opponent];
  state.activePlayer=0;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const activeName=channel==='native'?
    'Gengar & Mimikyu-GX TEU':'Mewtwo & Mew-GX UNM';
  actor.active.cards.push(card(activeName));
  if(attachPsychic){
    const attached=card('Psychic Energy MEE');
    actor.active.cards.push(attached);
    actor.active.energies.cards.push(attached);
  }
  if(channel==='copied'){
    const donor=new PokemonCardList();
    donor.cards.push(card('Gengar & Mimikyu-GX TEU'));
    actor.bench.push(donor);
  }
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const {allSimpleTactics,allPromptResolvers,defaultStateScores,
    defaultArbiterOptions}=load('simple-bot/simple-bot-definitions');
  const options=withNewMoonOpeningHorrorHouse({
    tactics:allSimpleTactics,promptResolvers:allPromptResolvers,
    scores:defaultStateScores,arbiter:defaultArbiterOptions
  });
  const Tactic=makeOpeningHorrorHouseTactic();
  return {state,actor,tactic:new Tactic(options)};
}

for(const channel of ['native','copied']){
  test(channel+' Horror House preflight rejects zero Psychic Energy',()=>{
    const {state,actor,tactic}=stagedBoard(channel,false);
    const before={turn:state.turn,actorGX:actor.usedGX,
      opponentHand:state.players[1].hand.cards.length,
      actorActiveCards:actor.active.cards.length};
    assert.equal(tactic.useTactic(state,actor),undefined);
    assert.deepEqual({turn:state.turn,actorGX:actor.usedGX,
      opponentHand:state.players[1].hand.cards.length,
      actorActiveCards:actor.active.cards.length},before);
  });
  test(channel+' Horror House preflight accepts one printed Psychic Energy',()=>{
    const {state,actor,tactic}=stagedBoard(channel,true);
    const result=tactic.useTactic(state,actor);
    assert.ok(result,channel+' preflight unexpectedly declined');
    assert.equal(result.type,channel==='native'?
      'ATTACK_ACTION':'USE_ABILITY_ACTION');
    assert.equal(state.turn,2,'Speculation advanced real root state');
    assert.equal(actor.usedGX,false,'Speculation consumed live GX allowance');
  });
}
