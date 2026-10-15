'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Verify the two *published* Raichu/Electrode source lists and preserve
 * unavailable rank 25 rather than substituting another player's cards.
 */
function publishedRaichuEnergies() {
  const manifest = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  const expected = ['Reversal Energy', 'Counter Energy', 'Unit Energy LPM'];
  const found = [];
  for (const rank of [4, 17]) {
    const deck = manifest.decks.find(candidate => candidate.rank === rank);
    assert.ok(deck, 'Published Raichu source rank ' + rank + ' absent');
    assert.match(deck.archetype, /Raichu Electrode/u);
    assert.equal(deck.cards.reduce((sum, row) => sum + row.count, 0), 60);
    const energies = deck.cards.filter(row => row.category === 'Energy');
    assert.equal(energies.reduce((sum, row) => sum + row.count, 0), 12);
    assert.deepEqual(energies.map(row => [row.name, row.count, row.printing.set])
      .sort((a, b) => a[0].localeCompare(b[0])),
    expected.map(name => [name, 4, name === 'Reversal Energy' ? 'PAL' :
      name === 'Counter Energy' ? 'CIN' : 'UPR'])
      .sort((a, b) => a[0].localeCompare(b[0])));
    assert.equal(deck.cards.filter(row => row.name === 'Alolan Raichu')
      .reduce((sum, row) => sum + row.count, 0), 2);
    found.push({rank, player: deck.player, energies: energies.map(row =>
      ({name: row.name, count: row.count, set: row.printing.set}))});
  }
  assert.ok(manifest.missing_full_lists.some(entry => entry.rank === 25));
  assert.ok(!manifest.decks.some(deck => deck.rank === 25));
  return found;
}

/** @param {string[]} energyNames @param {string|null} stadiumName */
function stagedRaichu(energyNames, stadiumName) {
  const cards = initializeCards();
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { GamePhase } = load('game/store/state/state');
  const { Format } = load('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; a.name = 'Raichu';
  b.id = 202; b.name = 'Target';
  state.players = [a, b];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;

  /** @param {string} name */
  const card = name => {
    const value = cards.getCardByName(name);
    assert.ok(value, 'Pinned Twinleaf card missing: ' + name);
    return value;
  };
  const raichu = card('Alolan Raichu UNM');
  assert.ok(raichu.attacks.some(attack => attack.name === 'Electro Rain'));
  a.active.cards.push(raichu);
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const attached = energyNames.map(card);
  for (const energy of attached) {
    a.active.cards.push(energy);
    a.active.energies.cards.push(energy);
  }
  if (stadiumName) b.stadium.cards.push(card(stadiumName));
  return {store, state, a, b, attached, card};
}

/** @param {ReturnType<typeof stagedRaichu>} fixture */
function providedEnergy(fixture) {
  const { CheckProvidedEnergyEffect } = load('game/store/effects/check-effects');
  const check = new CheckProvidedEnergyEffect(fixture.a);
  fixture.store.reduceEffect(fixture.state, check);
  return check.energyMap.map(entry => ({name: entry.card.name, provides: entry.provides}));
}

/**
 * Conditional engine-board test of Temple denial and reversible Stadium effects.
 * No full game, opponent policy, evolution timing or attachment access is modeled.
 */
function testRaichuTemple() {
  const source = publishedRaichuEnergies();
  const { CardType } = load('game/store/card/card-types');
  const { AttackAction } = load('game/store/actions/game-actions');
  const unit = 'Unit Energy LPM UPR';
  const reversal = 'Reversal Energy PAL';
  const counter = 'Counter Energy CIN';

  const active = stagedRaichu([unit], null);
  const natural = providedEnergy(active);
  assert.equal(natural.length, 1);
  assert.ok(natural[0].provides.includes(CardType.LIGHTNING),
    'Unit Energy LPM must furnish Lightning for Electro Rain');

  active.b.stadium.cards.push(active.card('Temple of Sinnoh ASR'));
  const temple = providedEnergy(active);
  assert.deepEqual(temple.map(row => row.provides), [[CardType.COLORLESS]]);
  assert.throws(() => active.store.dispatch(new AttackAction(101, 'Electro Rain')),
    'Temple must deny typed Lightning payment with the attached Unit Energy');

  active.b.stadium.cards.splice(0, 1, active.card('Sky Field ROS'));
  const restored = providedEnergy(active);
  assert.ok(restored[0].provides.includes(CardType.LIGHTNING),
    'Replacing Temple with rank-4 Sky Field must restore attached Unit Energy');

  const all = stagedRaichu([unit, reversal, counter], 'Temple of Sinnoh ASR');
  const allLocked = providedEnergy(all);
  assert.deepEqual(allLocked.map(row => row.provides),
    [[CardType.COLORLESS], [CardType.COLORLESS], [CardType.COLORLESS]],
    'All three printed Raichu Special Energy families become one Colorless each');

  all.b.stadium.cards.splice(0, 1, all.card('PokéStop PGO'));
  const replacement = providedEnergy(all);
  assert.ok(replacement[0].provides.includes(CardType.LIGHTNING),
    'Replacing Temple with rank-17 PokéStop must restore Unit Energy Lightning');

  const paid = stagedRaichu([unit], null);
  // The action may enter a legal target-choice prompt; its paid-cost
  // legality is the only property asserted here.
  paid.store.dispatch(new AttackAction(101, 'Electro Rain'));

  return {
    sourceRanks: source,
    verified: {
      unitEnergyProvidesLightningWithoutTemple: true,
      templeConvertsThreeSourceSpecialEnergiesToColorless: true,
      templeRejectsElectroRainCost: true,
      skyFieldRestoresUnitLightning: true,
      pokeStopRestoresUnitLightning: true,
      electroRainActionAcceptedWithUnitLightning: true
    },
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'Injected conditional board, true card reducers and attack action; no full-game or policy result'
  };
}

if (require.main === module) console.log(JSON.stringify(testRaichuTemple(), null, 2));
module.exports = { publishedRaichuEnergies, stagedRaichu, providedEnergy, testRaichuTemple };
