'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {makeShadowRiderEvolutionTactic}=
  require('./shadow-rider-evolution-priority.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load=name=>require(path.join(output,name));

/**
 * Synthetic condition with one legal VMAX in hand, two established Vs,
 * and two Basic Psychic Energy on the Benched V. This measures a single
 * pinned-engine choice, then attempts the actual PlayCardAction reducer.
 */
function stagedDoubleV() {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const own=new Player(),opp=new Player();
  own.id=101;opp.id=202;
  state.players=[own,opp];
  state.activePlayer=0;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;

  /** @param {string} id @returns {object} */
  const card=id=>{
    const c=manager.getCardByName(id);
    assert.ok(c,'Missing pinned printing '+id);
    return c;
  };
  const basic='Shadow Rider Calyrex V CRE';
  own.active.cards.push(card(basic));
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  own.bench.push(new PokemonCardList());
  own.bench[0].cards.push(card(basic));
  own.hand.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  opp.active.cards.push(card('Iron Thorns ex TWM'));
  own.active.pokemonPlayedTurn=1;
  own.bench[0].pokemonPlayedTurn=1;

  const psychicSource=manager.getAllCards()
    .find(c=>c.name==='Psychic Energy');
  assert.ok(psychicSource?.fullName,'No implemented basic Psychic Energy');
  const {CardList}=load('game/store/state/card-list');
  for(const player of [own,opp]) {
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card(psychicSource.fullName));
      player.prizes.push(prize);
    }
  }
  for(let i=0;i<2;i++) {
    const energy=card(psychicSource.fullName);
    own.bench[0].cards.push(energy);
    own.bench[0].energies.cards.push(energy);
  }
  return {store,state,own};
}

/** @param {boolean} override */
function runOne(override) {
  const f=stagedDoubleV();
  const definitions=load('simple-bot/simple-bot-definitions');
  const {EvolveTactic}=load('simple-bot/simple-tactics/evolve-tactic');
  const {SlotType}=load('game/store/actions/play-card-action');
  const options={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const Cls=override?makeShadowRiderEvolutionTactic():EvolveTactic;
  const action=new Cls(options).useTactic(f.state,f.own);
  assert.ok(action,'Pinned bot did not propose a legal VMAX evolution');
  const wanted=override?SlotType.BENCH:SlotType.ACTIVE;
  assert.equal(action.target.slot,wanted);
  assert.equal(action.handIndex,0);
  f.store.dispatch(action);
  const active=f.own.active.getPokemonCard()?.name;
  const benched=f.own.bench[0].getPokemonCard()?.name;
  assert.equal(override?benched:active,'Shadow Rider Calyrex VMAX');
  assert.equal(override?active:benched,'Shadow Rider Calyrex V');
  assert.equal(f.own.bench[0].energies.cards.length,2);
  return {decision:override?'energy-aware':'default-pinned',
    playedOn:override?'bench':'active',active,benched,
    psychicOnBench:f.own.bench[0].energies.cards.length};
}

function runFixture() {
  return {
    scope:'conditional pinned-Store evolution reducer/action test, no game-win inference',
    baseline:runOne(false),
    counterfactual:runOne(true),
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(runFixture(),null,2)+'\n');
module.exports={stagedDoubleV,runOne,runFixture};
