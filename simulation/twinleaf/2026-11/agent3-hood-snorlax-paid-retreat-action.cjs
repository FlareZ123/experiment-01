'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../headless.cjs');
const { installToolJammerHook } = require('../tool-jammer-hook.cjs');

const output = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Exercise the real pinned Store RetreatAction against Snorlax PGO Block.
 *
 * The candidate's Active Shadow Rider Calyrex VMAX has its printed two-Energy
 * retreat cost paid with two Psychic Energy. A plain Shadow Rider V is the
 * legal Bench destination. This deliberately does not use Latias, Float Stone,
 * or any zero-cost retreat shortcut.
 *
 * @param {{hood?:boolean,benchHood?:boolean,toolJammer?:boolean,stadium?:string,candidateSeat?:0|1}} options
 */
function paidRetreatAgainstSnorlax(options = {}) {
  const candidateSeat = options.candidateSeat ?? 0;
  assert.ok(candidateSeat === 0 || candidateSeat === 1,
    'Candidate must occupy one of the two physical player seats');
  const manager = initializeCards();
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { RetreatAction } = engine('game/store/actions/game-actions');
  const { CheckPokemonPowersEffect, CheckRetreatCostEffect } =
    engine('game/store/effects/check-effects');

  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Pinned engine card missing ' + name);
    return found;
  };

  const candidate = new Player();
  candidate.id = candidateSeat === 0 ? 101 : 202;
  candidate.name = 'Shadow Rider candidate';
  const opponent = new Player();
  opponent.id = candidateSeat === 0 ? 202 : 101;
  opponent.name = 'Snorlax Block opponent';

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = candidateSeat === 0 ? [candidate, opponent] : [opponent, candidate];
  state.turn = 3;
  state.activePlayer = candidateSeat;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  for (const player of state.players) {
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
  }

  const vmaxSlot = candidate.active;
  vmaxSlot.cards.push(
    card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE')
  );
  const vmax = vmaxSlot.getPokemonCard();
  const psychicEnergy = [
    card('Psychic Energy SVE'),
    card('Psychic Energy SVE')
  ];
  vmaxSlot.energies.cards.push(...psychicEnergy);
  if (options.hood) vmaxSlot.tools.push(card('Stealthy Hood UNB'));

  const benchTarget = new PokemonCardList();
  benchTarget.cards.push(card('Shadow Rider Calyrex V CRE'));
  candidate.bench.push(benchTarget);

  if (options.benchHood) {
    const benchVmax = new PokemonCardList();
    benchVmax.cards.push(
      card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE')
    );
    benchVmax.tools.push(card('Stealthy Hood UNB'));
    candidate.bench.push(benchVmax);
  }

  const snorlax = card('Snorlax PGO');
  opponent.active.cards.push(snorlax);
  if (options.toolJammer) {
    opponent.active.tools.push(card('Tool Jammer BST'));
  }
  if (options.stadium) {
    opponent.stadium.cards.push(card(options.stadium));
  }

  // The printed VMAX Retreat Cost is exactly two Colorless. Two Psychic
  // Energy physically attached to the Active VMAX fund the same RetreatAction
  // in every arm.
  const retreatCost = new CheckRetreatCostEffect(candidate);
  store.reduceEffect(state, retreatCost);
  assert.equal(retreatCost.cost.length, 2,
    'Shadow Rider Calyrex VMAX must retain its printed two-Energy Retreat Cost');
  assert.equal(vmaxSlot.energies.cards.length, 2,
    'Both physical Psychic Energy must be attached before retreat');

  const restoreToolJammer = installToolJammerHook();
  try {
    const blockCheck = new CheckPokemonPowersEffect(opponent, snorlax);
    store.reduceEffect(state, blockCheck);
    const blockListed = blockCheck.powers.some(power => power.name === 'Block');

    const doorCheck = new CheckPokemonPowersEffect(candidate, vmax);
    store.reduceEffect(state, doorCheck);
    const underworldDoorListed =
      doorCheck.powers.some(power => power.name === 'Underworld Door');

    let exception = null;
    try {
      store.dispatch(new RetreatAction(candidate.id, 0));
    } catch (error) {
      exception = String(error?.message ?? error);
    }

    const activeAfter = candidate.active.getPokemonCard()?.name ?? null;
    const vmaxAfter = [candidate.active, ...candidate.bench].find(slot =>
      slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX'
    );
    const discardedPsychicEnergy = candidate.discard.cards.filter(card =>
      card.name === 'Psychic Energy'
    ).length;
    const vmaxEnergyAfter = vmaxAfter?.energies.cards.filter(card =>
      card.name === 'Psychic Energy'
    ).length ?? null;

    return {
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      format: 'EXPANDED',
      action: 'RetreatAction',
      options: { candidateSeat, hood: !!options.hood,
        toolJammer: !!options.toolJammer, stadium: options.stadium ?? null },
      retreatCostEnergyCount: retreatCost.cost.length,
      physicalPsychicEnergyBefore: psychicEnergy.length,
      hoodPhysicallyAttached: vmaxSlot.tools.some(tool =>
        tool.name === 'Stealthy Hood'),
      benchHoodPhysicallyAttached: candidate.bench.some(slot =>
        slot.tools.some(tool => tool.name === 'Stealthy Hood')),
      blockListed,
      underworldDoorListed,
      activeAfter,
      retreatSucceeded: activeAfter === 'Shadow Rider Calyrex V',
      discardedPsychicEnergy,
      vmaxEnergyAfter,
      exception
    };
  } finally {
    restoreToolJammer();
  }
}

module.exports = { paidRetreatAgainstSnorlax };
