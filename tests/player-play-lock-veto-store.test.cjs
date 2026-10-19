'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {playerPlayLockVeto}=
  require('../simulation/twinleaf/player-play-lock-veto.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

const {State}=engine('game/store/state/state');
const {Player}=engine('game/store/state/player');
const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
const {PlayPokemonEffect}=engine('game/store/effects/play-card-effects');
const {playPokemonReducer}=
  engine('game/store/effect-reducers/play-pokemon-effect');
const {GameMessage}=engine('game/game-message');
const {SuperType,TrainerType,EnergyType,Stage}=
  engine('game/store/card/card-types');
const {PowerType}=engine('game/store/card/pokemon-types');
const {Wobbuffet}=engine('sets/07-x-and-y/set-phantom-forces/wobbuffet');
const {Gloom}=engine('sets/07-x-and-y/set-ancient-origins/gloom');
const {Vileplume}=engine('sets/07-x-and-y/set-ancient-origins/vileplume');

const enums={
  superPokemon:SuperType.POKEMON,
  superTrainer:SuperType.TRAINER,
  superEnergy:SuperType.ENERGY,
  item:TrainerType.ITEM,supporter:TrainerType.SUPPORTER,
  stadium:TrainerType.STADIUM,tool:TrainerType.TOOL,
  specialEnergy:EnergyType.SPECIAL,
  abilityPowerType:PowerType.ABILITY,
  evolvedStages:[Stage.STAGE_1,Stage.STAGE_2,
    Stage.VMAX,Stage.VSTAR,Stage.MEGA,Stage.BREAK,Stage.LV_X]
};

/** @param {object} card */
function scenario(card) {
  const state=new State();
  const opponent=new Player();
  const owner=new Player();
  opponent.id=101;owner.id=202;
  state.players=[opponent,owner];
  owner.hand.cards.push(card);
  const target=new PokemonCardList();
  const proposed={type:'PLAY_CARD_ACTION',id:202,handIndex:0};
  return {state,owner,card,target,proposed};
}

/** @param {object} scene */
function reduce(scene) {
  return playPokemonReducer({log(){}},scene.state,
    new PlayPokemonEffect(scene.owner,scene.card,scene.target));
}

const blocked=error=>error?.message===GameMessage.BLOCKED_BY_EFFECT;

test('actual native Player Pokémon lock agrees with final Store action veto',()=>{
  const scene=scenario(new Wobbuffet());
  scene.owner.applyPlayLocks({pokemon:true});
  assert.equal(playerPlayLockVeto(scene.owner,scene.proposed,enums),
    'pokemon-lock');
  assert.throws(()=>reduce(scene),blocked);
  scene.owner.clearPlayLocks();
  assert.equal(playerPlayLockVeto(scene.owner,scene.proposed,enums),null);
  assert.strictEqual(reduce(scene),scene.state);
  assert.strictEqual(scene.target.getPokemonCard(),scene.card);
});

test('native Ability-bearing Basic hand lock rejects printed Wobbuffet',()=>{
  const scene=scenario(new Wobbuffet());
  assert.ok(scene.card.powers.some(p=>p.powerType===PowerType.ABILITY));
  scene.owner.applyPlayLocks({pokemonWithAbilities:true});
  assert.equal(playerPlayLockVeto(scene.owner,scene.proposed,enums),
    'ability-pokemon-lock');
  assert.throws(()=>reduce(scene),blocked);
});

test('native evolution lock rejects Gloom to Vileplume while preserving Basic option',()=>{
  const scene=scenario(new Vileplume());
  scene.target.cards.push(new Gloom());
  scene.owner.applyPlayLocks({evolve:true});
  assert.equal(playerPlayLockVeto(scene.owner,scene.proposed,enums),
    'evolution-lock');
  assert.throws(()=>reduce(scene),blocked);
  const basic=scenario(new Wobbuffet());
  basic.owner.applyPlayLocks({evolve:true});
  assert.equal(playerPlayLockVeto(basic.owner,basic.proposed,enums),null);
  assert.strictEqual(reduce(basic),basic.state);
  assert.strictEqual(basic.target.getPokemonCard(),basic.card);
});
