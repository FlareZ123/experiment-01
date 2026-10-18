'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Staged actual Store first-turn Tool attachment and Boost Shake evolution.
 * @param {'Forest Seal Stone SIT'|'Float Stone BKT'|null} toolName
 * @param {'Garbodor BKP'|'Garbodor LTR'} evolvedName
 * @returns {object}
 */
function runCase(toolName, evolvedName) {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} name */
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Unavailable pinned card: ' + name);
    c.id = id++;
    return c;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect} = engine('game/store/effects/check-effects');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; b.id = 202;
  state.players = [a, b];
  state.turn = 1;
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  a.active.cards.push(card('Mega Absol ex MEG'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmax = card('Shadow Rider Calyrex VMAX CRE');
  const benchVmax = new PokemonCardList();
  benchVmax.cards.push(card('Shadow Rider Calyrex V CRE'), vmax);
  b.bench.push(benchVmax);
  const trash = new PokemonCardList();
  const trubbish = card('Trubbish BKP');
  trash.cards.push(trubbish);
  a.bench.push(trash);
  for (const p of state.players) {
    p.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
    for (let i = 0; i < 12; i++) p.deck.cards.push(card('Psychic Energy SVE'));
  }
  const evolved = card(evolvedName);
  a.deck.cards.push(evolved);
  const shake = card('Boost Shake EVS');
  a.hand.cards.push(shake);
  const tool = toolName ? card(toolName) : null;
  if (tool) a.hand.cards.push(tool);
  const available = (player, pokemon) => {
    const check = new CheckPokemonPowersEffect(player, pokemon);
    store.reduceEffect(state, check);
    return check.powers.map(p => p.name);
  };
  const before = available(b, vmax);
  assert.ok(before.includes('Underworld Door'), 'Baseline Power missing');
  const pending = () => state.prompts.find(p => p.result === undefined);
  const play = (selected, target) => {
    const handIndex = a.hand.cards.indexOf(selected);
    assert.ok(handIndex >= 0);
    store.dispatch(new PlayCardAction(a.id, handIndex, target));
  };
  if (tool) {
    play(tool, {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0});
    assert.equal(trash.tools.includes(tool), true, 'Tool not on Trubbish');
    assert.equal(available(a, trubbish).includes('Star Alchemy'), false,
      'Forest Stone must not grant VSTAR Power to non-V Pokémon');
    assert.equal(pending(), undefined);
  }
  play(shake, {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
  const search = pending();
  assert.equal(search?.constructor.name, 'ChooseCardsPrompt',
    'Boost Shake must search the source deck');
  assert.equal(search.validate([evolved], state), true);
  store.dispatch(new ResolvePromptAction(search.id, [evolved]));
  const recipient = pending();
  assert.equal(recipient?.constructor.name, 'ChoosePokemonPrompt',
    'Boost Shake must prompt for the evolution recipient');
  assert.equal(recipient.validate([trash], state), true,
    'Newly played first-turn Trubbish must be a valid target');
  store.dispatch(new ResolvePromptAction(recipient.id, [trash]));
  for (let k = 0; k < 4 && pending(); k++) {
    const prompt = pending();
    if (prompt.constructor.name === 'ShuffleDeckPrompt') {
      store.dispatch(new ResolvePromptAction(prompt.id,
        a.deck.cards.map((_, i) => i)));
    } else if (prompt.constructor.name === 'WaitPrompt') {
      store.dispatch(new ResolvePromptAction(prompt.id, null));
    } else {
      throw new Error('Unresolved prompt ' + prompt.constructor.name);
    }
  }
  assert.equal(pending(), undefined, 'Search/evolution prompts must settle');
  assert.equal(trash.getPokemonCard(), evolved, 'Boost Shake evolution failed');
  assert.deepEqual(trash.tools, tool ? [tool] : [],
    'Boost Shake must preserve Pokémon Tool across evolution');
  const after = available(b, vmax);
  const lockLive = !after.includes('Underworld Door');
  assert.equal(lockLive, !!tool,
    'Garbotoxin must disable other Pokémon Abilities only when equipped');
  assert.equal(available(a, evolved).includes('Star Alchemy'), false);
  return {tool: toolName, printing: evolvedName, lockLive,
    beforeAbilities: before, afterAbilities: after,
    toolPreserved: trash.tools.map(x => x.fullName),
    vstarOnNonV: false, originalTurn: 1, turnAfter: state.turn};
}

/** @returns {object} */
function run() {
  const rows = ['Garbodor BKP', 'Garbodor LTR'].flatMap(print =>
    [null, 'Float Stone BKT', 'Forest Seal Stone SIT']
      .map(tool => runCase(tool, print)));
  return {
    kind: 'firstturn-forest-seal-stone-garbotoxin-staged-store-v1',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'Staged board; real first-turn Store Tool and Boost Shake actions, no natural opponent policy or full match',
    rows
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, runCase};

