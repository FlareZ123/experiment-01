'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const load = modulePath => require(path.join(OUTPUT, modulePath));
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

function abilityState(store, state, player, card, name) {
  const {IS_ABILITY_BLOCKED} = load('game/store/prefabs/prefabs');
  const {CheckPokemonPowersEffect} = load('game/store/effects/check-effects');
  const power = card.powers.find(row => row.name === name);
  assert.ok(power, 'Missing printed Ability ' + card.fullName + '/' + name);
  const check = new CheckPokemonPowersEffect(player, card);
  store.reduceEffect(state, check);
  return {
    blocked: Boolean(IS_ABILITY_BLOCKED(store, state, player, card, power)),
    visible: check.powers.some(row => row.name === name)
  };
}

function runCase(withStealthyHood) {
  const fixture = stagedRaichu([], null);
  const {store, state, a, b, card} = fixture;
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {AttackAction} = load('game/store/actions/game-actions');

  const ekans = card('Ekans XY');
  const arbok = card('Arbok XY');
  const psychic = card('Psychic Energy MEE');
  const lillipup = card('Lillipup CEC');
  const herdier = card('Herdier CEC');
  const stoutland = card('Stoutland BCR');
  const oddish = card('Oddish AOR');
  const gloom = card('Gloom AOR');
  const vileplume = card('Vileplume AOR');
  const hood = withStealthyHood ? card('Stealthy Hood UNB') : null;

  const ids = [ekans,arbok,psychic,lillipup,herdier,stoutland,
    oddish,gloom,vileplume,hood].filter(Boolean);
  ids.forEach((row,index) => { row.id = 48001 + index; });

  const printedAttack = arbok.attacks.find(row => row.name === 'Gastro Acid');
  assert.ok(printedAttack, 'Pinned Twinleaf is missing Arbok Gastro Acid');
  assert.equal(printedAttack.damage, 20, 'Gastro Acid printed damage changed');

  a.active.cards.splice(0, a.active.cards.length, ekans, arbok);
  a.active.cards.push(psychic);
  a.active.energies.cards.push(psychic);

  b.active.cards.splice(0, b.active.cards.length, lillipup, herdier, stoutland);
  if (withStealthyHood) b.active.tools.push(hood);

  const vileplumeSlot = new PokemonCardList();
  vileplumeSlot.cards.push(oddish, gloom, vileplume);
  b.bench.push(vileplumeSlot);

  const before = {
    sentinel: abilityState(store,state,b,stoutland,'Sentinel'),
    irritatingPollen: abilityState(store,state,b,vileplume,'Irritating Pollen')
  };
  assert.deepEqual(before.sentinel,{blocked:false,visible:true});
  assert.deepEqual(before.irritatingPollen,{blocked:false,visible:true});

  store.dispatch(new AttackAction(a.id,'Gastro Acid'));

  const after = {
    sentinel: abilityState(store,state,b,stoutland,'Sentinel'),
    irritatingPollen: abilityState(store,state,b,vileplume,'Irritating Pollen')
  };
  const unresolvedPrompts = state.prompts
    .filter(prompt => prompt.result === undefined)
    .map(prompt => prompt.constructor.name);

  return {
    withStealthyHood,
    attack:{name:printedAttack.name,damage:printedAttack.damage,
      cost:printedAttack.cost},
    before,after,
    printedDamage:printedAttack.damage,
    damageCounterObserved:b.active.damage,
    damageResolution:'not asserted by this direct staged AttackAction probe',
    stoutlandStillActive:b.active.getPokemonCard() === stoutland,
    vileplumeOnBench:b.bench.includes(vileplumeSlot),
    unresolvedPrompts,
    expected:{
      sentinelSuppressed:true,
      vileplumeItemLockAbilityStillActive:true,
      stealthyHoodDoesNotStopAttackEffect:true
    }
  };
}

function run() {
  const noHood = runCase(false);
  const withHood = runCase(true);
  for (const row of [noHood,withHood]) {
    assert.deepEqual(row.after.sentinel,{blocked:true,visible:false},
      'Gastro Acid did not suppress Active Stoutland Sentinel');
    assert.deepEqual(row.after.irritatingPollen,{blocked:false,visible:true},
      'Gastro Acid incorrectly disabled Bench Vileplume Irritating Pollen');
    assert.equal(row.printedDamage,20,'Gastro Acid printed damage changed');
    assert.equal(row.stoutlandStillActive,true);
    assert.equal(row.vileplumeOnBench,true);
    assert.deepEqual(row.unresolvedPrompts,[]);
    assert.deepEqual(row.unresolvedPrompts,[],
      'Unexpected prompt in the single-attack staged test');
  }
  return {
    schema:'agent48-arbok-gastro-acid-native-v1',
    engine:'twinleafgg/'+ENGINE_PIN,
    status:'PINNED_NATIVE_ATTACK_EFFECT_CONFIRMED',
    cases:[noHood,withHood],
    qualifiedCompetitiveGames:0,
    scope:'one constructed board; native AttackAction and ability reducer only; no opponent response, policy, full game, or matchup result'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports = {run,runCase,ENGINE_PIN};
