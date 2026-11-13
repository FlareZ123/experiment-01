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

  let benchHoodSlot = null;
  if (options.benchHood) {
    benchHoodSlot = new PokemonCardList();
    benchHoodSlot.cards.push(
      card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE')
    );
    benchHoodSlot.tools.push(card('Stealthy Hood UNB'));
    candidate.bench.push(benchHoodSlot);
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
      benchHoodPhysicallyAttached: !!benchHoodSlot &&
        benchHoodSlot.tools.some(tool => tool.name === 'Stealthy Hood'),
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



/**
 * Exercise the complete staged same-turn Snorlax answer in the pinned Store:
 * remove an opponent Active Tool Jammer when present, attach Hood to the
 * currently affected Active VMAX, pay its two-Psychic retreat, promote a
 * seven-Psychic Lillie's Clefairy ex, and resolve Full Moon Rondo.
 *
 * Both sides have five Benched Pokémon. With 10 damage already on the
 * 150-HP Snorlax, the printed Rondo formula is 220 and should take one Prize.
 * This is a deliberately staged mechanics sequence, not a source-dealt game.
 *
 * @param {{candidateSeat?:0|1,toolJammer?:boolean,stadium?:string}} options
 */
function completeHoodedSnorlaxSequence(options = {}) {
  const candidateSeat = options.candidateSeat ?? 0;
  assert.ok(candidateSeat === 0 || candidateSeat === 1,
    'Candidate must occupy one of the two physical player seats');
  const manager = initializeCards();
  let nextCardId = 1;
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Pinned engine card missing ' + name);
    found.id = nextCardId++;
    return found;
  };

  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  const { RetreatAction, AttackAction } =
    engine('game/store/actions/game-actions');
  const { CheckPokemonPowersEffect, CheckRetreatCostEffect } =
    engine('game/store/effects/check-effects');

  const candidate = new Player();
  candidate.id = candidateSeat === 0 ? 101 : 202;
  candidate.name = 'Hood Shadow Rider candidate';
  const opponent = new Player();
  opponent.id = candidateSeat === 0 ? 202 : 101;
  opponent.name = 'Snorlax Stall opponent';

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = candidateSeat === 0 ? [candidate, opponent] : [opponent, candidate];
  state.turn = 8;
  state.activePlayer = candidateSeat;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  for (const player of state.players) {
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    for (let i = 0; i < 8; i++) player.deck.cards.push(card('Dratini OBF'));
  }

  const vmaxSlot = candidate.active;
  vmaxSlot.cards.push(
    card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE')
  );
  const vmax = vmaxSlot.getPokemonCard();
  const retreatEnergy = [
    card('Psychic Energy SVE'),
    card('Psychic Energy SVE')
  ];
  vmaxSlot.cards.push(...retreatEnergy);
  vmaxSlot.energies.cards.push(...retreatEnergy);

  const clefairySlot = new PokemonCardList();
  clefairySlot.cards.push(card("Lillie's Clefairy ex JTG"));
  const clefairyEnergy = Array.from({ length: 7 }, () =>
    card('Psychic Energy SVE'));
  clefairySlot.cards.push(...clefairyEnergy);
  clefairySlot.energies.cards.push(...clefairyEnergy);
  candidate.bench.push(clefairySlot);
  for (let i = 0; i < 4; i++) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Dratini OBF'));
    candidate.bench.push(bench);
  }

  const snorlaxSlot = opponent.active;
  const snorlax = card('Snorlax PGO');
  snorlaxSlot.cards.push(snorlax);
  snorlaxSlot.damage = 10;
  for (let i = 0; i < 5; i++) {
    const bench = new PokemonCardList();
    bench.cards.push(card('Dratini OBF'));
    opponent.bench.push(bench);
  }

  const toolJammer = options.toolJammer ? card('Tool Jammer BST') : null;
  if (toolJammer) opponent.active.tools.push(toolJammer);
  if (options.stadium) {
    opponent.stadium.cards.push(card(options.stadium));
  }

  const fieldBlower = card('Field Blower GRI');
  const hood = card('Stealthy Hood UNB');
  candidate.hand.cards.push(fieldBlower, hood);
  const pending = () => store.state.prompts.find(p => p.result === undefined);
  const restoreToolJammer = installToolJammerHook();

  try {
    let fieldBlowerPlayed = false;
    if (toolJammer) {
      const blowerIndex = candidate.hand.cards.indexOf(fieldBlower);
      assert.ok(blowerIndex >= 0, 'Field Blower must be owner-visible in hand');
      store.dispatch(new PlayCardAction(candidate.id, blowerIndex, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
      const targetPrompt = pending();
      assert.equal(targetPrompt?.constructor.name, 'ChoosePokemonPrompt',
        'Field Blower must request its real native Tool target');
      assert.equal(targetPrompt.validate([opponent.active], store.state), true,
        'The opponent Active Snorlax must be a legal Field Blower target');
      store.dispatch(new ResolvePromptAction(targetPrompt.id, [opponent.active]));
      fieldBlowerPlayed = true;
      assert.equal(candidate.discard.cards.includes(fieldBlower), true,
        'Field Blower must leave the candidate hand');
      assert.equal(opponent.active.tools.includes(toolJammer), false,
        'Field Blower must remove Tool Jammer before Hood is attached');
      assert.equal(opponent.discard.cards.includes(toolJammer), true,
        'The exact Tool Jammer must enter the opponent discard');
      assert.equal(pending(), undefined,
        'Field Blower must finish before the Hood action');
    }

    const hoodIndex = candidate.hand.cards.indexOf(hood);
    assert.ok(hoodIndex >= 0, 'Stealthy Hood must remain owner-visible in hand');
    store.dispatch(new PlayCardAction(candidate.id, hoodIndex, {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
    }));
    assert.equal(candidate.active.tools.includes(hood), true,
      'Hood must physically attach to the currently affected Active VMAX');
    assert.equal(candidate.hand.cards.includes(hood), false);

    const blockCheck = new CheckPokemonPowersEffect(opponent, snorlax);
    store.reduceEffect(store.state, blockCheck);
    const blockListed = blockCheck.powers.some(power => power.name === 'Block');
    const doorCheck = new CheckPokemonPowersEffect(candidate, vmax);
    store.reduceEffect(store.state, doorCheck);
    const underworldDoorListed =
      doorCheck.powers.some(power => power.name === 'Underworld Door');

    const retreatCost = new CheckRetreatCostEffect(candidate);
    store.reduceEffect(store.state, retreatCost);
    assert.equal(retreatCost.cost.length, 2,
      'The VMAX must retain its printed two-Energy Retreat Cost');
    assert.equal(vmaxSlot.energies.cards.length, 2,
      'Both physical Psychic Energy must fund the retreat');

    store.dispatch(new RetreatAction(candidate.id, 0));
    assert.equal(candidate.active.getPokemonCard()?.fullName,
      "Lillie's Clefairy ex JTG",
      'The funded Clefairy must be promoted by the paid RetreatAction');
    assert.equal(candidate.active.energies.cards.length, 7,
      'All seven Psychic Energy must remain on Clefairy');
    const vmaxAfter = [candidate.active, ...candidate.bench].find(slot =>
      slot.getPokemonCard()?.fullName === 'Shadow Rider Calyrex VMAX CRE');
    assert.ok(vmaxAfter, 'The retreated VMAX must remain on the Bench');
    assert.equal(vmaxAfter.energies.cards.filter(c =>
      c.name === 'Psychic Energy').length, 0);
    assert.equal(candidate.discard.cards.filter(c =>
      c.name === 'Psychic Energy').length, 2,
      'Exactly the two retreat Energy must be discarded');

    const candidateBenchAtAttack = candidate.bench.filter(slot =>
      slot.getPokemonCard()).length;
    const opponentBenchAtAttack = opponent.bench.filter(slot =>
      slot.getPokemonCard()).length;
    const expectedRondoDamage =
      20 + 20 * (candidateBenchAtAttack + opponentBenchAtAttack);
    assert.equal(candidateBenchAtAttack, 5);
    assert.equal(opponentBenchAtAttack, 5);
    assert.equal(expectedRondoDamage, 220);

    store.dispatch(new AttackAction(candidate.id, 'Full Moon Rondo'));
    let snorlaxDamageAfterAttackAction = snorlaxSlot.damage;
    const prompts = [];
    for (let i = 0; i < 24; i++) {
      const prompt = pending();
      if (!prompt) break;
      const name = prompt.constructor.name;
      prompts.push(name);
      let selection;
      if (name === 'WaitPrompt') {
        selection = null;
      } else if (name === 'ChoosePrizePrompt') {
        const owner = store.state.players.find(p => p.id === prompt.playerId) ??
          candidate;
        selection = owner.prizes.filter(prize => prize.cards.length > 0)
          .slice(0, prompt.options.count);
      } else if (name === 'ChoosePokemonPrompt') {
        const owner = store.state.players.find(p => p.id === prompt.playerId) ??
          opponent;
        const available = owner.bench.filter(slot => slot.getPokemonCard());
        assert.ok(available.length > 0,
          'The forced-promotion owner must have a legal Benched Pokémon');
        selection = [available[0]];
      } else {
        assert.fail('Unhandled native Full Moon Rondo prompt: ' + name);
      }
      if (typeof prompt.validate === 'function') {
        assert.equal(prompt.validate(selection, store.state), true,
          'Invalid native ' + name + ' resolution');
      }
      store.dispatch(new ResolvePromptAction(prompt.id, selection));
      if (Number.isFinite(snorlaxSlot.damage)) {
        snorlaxDamageAfterAttackAction = Math.max(
          snorlaxDamageAfterAttackAction, snorlaxSlot.damage);
      }
    }
    assert.equal(pending(), undefined,
      'Full Moon Rondo must finish all prize and promotion prompts');

    const attackName =
      store.state.playerLastAttack[candidate.id]?.attack?.name ?? null;
    const snorlaxDiscarded = opponent.discard.cards.includes(snorlax);
    const prizesTaken = 6 - candidate.prizes.filter(p =>
      p.cards.length > 0).length;
    assert.equal(attackName, 'Full Moon Rondo');
    assert.equal(snorlaxDiscarded, true,
      '220 Rondo damage must KO the 150-HP Snorlax with 10 prior damage');
    assert.equal(prizesTaken, 1,
      'The Snorlax KO must resolve exactly one Prize');
    assert.equal(candidate.active.getPokemonCard()?.fullName,
      "Lillie's Clefairy ex JTG",
      'The Clefairy attacker must remain Active after Rondo');
    assert.equal(candidateBenchAtAttack, 5);
    assert.equal(opponentBenchAtAttack, 5);

    return {
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      format: 'EXPANDED',
      candidateSeat,
      toolJammerInitiallyPresent: !!toolJammer,
      fieldBlowerPlayed,
      toolJammerRemoved: !!toolJammer &&
        opponent.discard.cards.includes(toolJammer),
      stadium: options.stadium ?? null,
      blockListed,
      underworldDoorListed,
      hoodOnCurrentActiveBeforeRetreat: true,
      retreatCostEnergyCount: retreatCost.cost.length,
      retreatSucceeded: true,
      candidateActiveAfterRetreat: "Lillie's Clefairy ex JTG",
      clefairyPsychicEnergyAtAttack: clefairySlot.energies.cards.length,
      candidateBenchAtAttack,
      opponentBenchAtAttack,
      expectedRondoDamage,
      snorlaxDamageAfterAttackAction,
      attackName,
      snorlaxDiscarded,
      prizesTaken,
      prompts,
      competitiveGameQualified: false
    };
  } finally {
    restoreToolJammer();
  }
}

module.exports = {
  paidRetreatAgainstSnorlax,
  completeHoodedSnorlaxSequence
};

