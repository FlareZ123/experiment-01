'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, providedEnergy} = require('./temple-raichu-board.cjs');
const {installElectrodeGXEnergyHook} = require('./electrode-gx-energy-hook.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(OUTPUT, moduleName));

/**
 * Verify the real source-printed rank-9 inventory before constructing a
 * deliberately staged, conditional board. Does not reconstruct a natural
 * opening, evolution sequence, discard route or tournament outcome.
 *
 * @returns {object} Published original opponent record.
 */
function sourceRank9() {
  const roster = require('../../results/aichi-2026/full-decklists.json');
  const source = roster.decks.find(row => row.rank === 9);
  assert.ok(source);
  assert.equal(source.archetype, 'Absol Electrode');
  assert.equal(source.cards.reduce((sum, row) => sum + row.count, 0), 60);
  const exact = (name, set, number) => source.cards
    .filter(row => row.name === name &&
      row.printing?.set === set && row.printing?.number === number)
    .reduce((sum, row) => sum + row.count, 0);
  assert.equal(exact('Electrode-GX', 'CES', '48'), 2);
  assert.equal(exact('Mega Absol ex', 'MEG', '86'), 1);
  assert.equal(exact('Prism Energy', 'ASC', '216'), 4);
  assert.equal(exact('Darkness Energy', 'MEE', '15'), 2);
  return source;
}

/**
 * An opt-in pinned-Store rule probe for Extra Energy Bomb's lowercase-ex
 * attachment destination. The mandatory Energy hook corrects a known pinned
 * optional-attachment bug, and is always uninstalled after this one fixture.
 *
 * @returns {object} Reproducible live-Store prompt and Zone observations.
 */
function runRank9MegaRecipient() {
  const source = sourceRank9();
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {CardType, CardTag} = load('game/store/card/card-types');

  const game = stagedRaichu([], null);
  const mega = game.card('Mega Absol ex M1L');
  assert.ok(mega.hasTag(CardTag.POKEMON_ex));
  assert.ok(!mega.hasTag(CardTag.POKEMON_EX));
  assert.ok(!mega.hasTag(CardTag.POKEMON_GX));
  game.a.active.cards.splice(0, 1, mega);
  const electrode = new PokemonCardList();
  electrode.cards.push(game.card('Electrode-GX CES'));
  game.a.bench.push(electrode);

  const fiveSourceEnergy = [
    game.card('Prism Energy ASC'),
    game.card('Prism Energy ASC'),
    game.card('Prism Energy ASC'),
    game.card('Prism Energy ASC'),
    game.card('Darkness Energy MEE')
  ];
  game.a.discard.cards.push(...fiveSourceEnergy);
  for (const player of [game.a, game.b]) {
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(game.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(game.card('Psychic Energy SVE'));
  }

  const release = installElectrodeGXEnergyHook();
  try {
    const opponentPrizesBefore = game.b.getPrizeLeft();
    game.store.dispatch(new UseAbilityAction(game.a.id, 'Extra Energy Bomb', {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
    }));
    for (let step = 0; step < 3; step++) {
      const pending = game.state.prompts.find(prompt => prompt.result === undefined);
      if (pending?.constructor.name !== 'WaitPrompt') break;
      game.store.dispatch(new ResolvePromptAction(pending.id, null));
    }
    const prompt = game.state.prompts.find(value => value.result === undefined);
    assert.ok(prompt);
    assert.equal(prompt.constructor.name, 'AttachEnergyPrompt');
    assert.equal(prompt.options.min, 5, 'Corrected printed 5-Energy obligation');
    const destination = {
      player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
    };
    const transfers = fiveSourceEnergy.map(card => ({card, to: destination}));
    assert.equal(prompt.validate(transfers), true,
      'Printed modern Mega ex must remain an eligible Bomb destination');
    game.store.dispatch(new ResolvePromptAction(prompt.id, transfers));
    for (let step = 0; step < 14; step++) {
      const pending = game.state.prompts.find(value => value.result === undefined);
      if (!pending) break;
      const name = pending.constructor.name;
      let result;
      if (name === 'WaitPrompt') result = null;
      else if (name === 'ShuffleDeckPrompt') {
        result = Array.from({length: game.a.deck.cards.length}, (_, i) => i);
      } else if (name === 'ChoosePrizePrompt') {
        result = game.b.prizes.filter(prize => prize.cards.length)
          .slice(0, pending.options.count);
      } else {
        throw new Error('Unexpected post-Bomb real Store prompt: ' + name);
      }
      assert.equal(pending.validate(result, game.state), true, name);
      game.store.dispatch(new ResolvePromptAction(pending.id, result));
    }
    assert.equal(game.state.prompts.some(prompt => prompt.result === undefined), false);
    assert.equal(game.a.active.getPokemonCard()?.name, 'Mega Absol ex');
    assert.equal(game.a.active.energies.cards.length, fiveSourceEnergy.length);
    assert.equal(fiveSourceEnergy.every(card =>
      game.a.active.energies.cards.includes(card)), true);
    assert.equal(fiveSourceEnergy.some(card => game.a.discard.cards.includes(card)), false);
    assert.equal(game.a.discard.cards.some(card =>
      card.fullName === 'Electrode-GX CES'), true);
    assert.equal(opponentPrizesBefore - game.b.getPrizeLeft(), 2);

    const provided = providedEnergy(game);
    assert.equal(provided.length, 5);
    assert.equal(provided.every(row => row.provides.includes(CardType.DARK) ||
      row.provides.includes(CardType.ANY)), true,
      'Prism on a Basic provides a wildcard and printed Darkness provides Dark');
    const attacked = mega.attacks.find(attack => attack.name === 'Claw of Darkness');
    assert.ok(attacked);
    return {
      sourceRank: source.rank, sourcePlayer: source.player,
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      stagedRecipient: mega.fullName,
      publishedPrinting: 'Mega Absol ex MEG 86',
      attached: fiveSourceEnergy.map(card => card.fullName),
      energyMap: provided,
      mandatoryPromptAccepted: true,
      opponentPrizesFromElectrodeSelfKO: 2,
      copiedTextSemanticsQualified: false,
      naturalSourceLineEstablished: false,
      qualifiedCompetitiveGames: 0
    };
  } finally {
    release();
  }
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runRank9MegaRecipient(), null, 2) + '\n');
}

module.exports = {sourceRank9, runRank9MegaRecipient};
