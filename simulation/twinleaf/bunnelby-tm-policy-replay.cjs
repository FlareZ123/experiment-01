'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedToolAttack} = require('./tm-attack-policy-characterization.cjs');
const {withToolAttackAwareness} = require('./tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine} = require('./bunnelby-evolution-policy.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const engine = relative => require(path.join(output, relative));

/**
 * Construct the published rank-2 Bunnelby / Jet / TM turn-2 evolution core,
 * paired with an actual source-printing rank-1 opponent-zone distribution.
 * This conditions on rare resource access; it does not sample openings.
 * @returns {object}
 */
function stageSourceBunnelbyBoard() {
  const f = preparedToolAttack();
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {CardList} = engine('game/store/state/card-list');
  const manager = initializeCards();
  /** @param {string} name */
  const get = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Pinned card missing: ' + name);
    return c;
  };
  f.state.turn = 2;
  const active = get('Bunnelby PRC');
  const jet = get('Jet Energy PAL');
  const tool = get('Technical Machine: Evolution PAR');
  f.attacker.active.cards.splice(0, f.attacker.active.cards.length, active, jet);
  f.attacker.active.energies.cards.splice(0, f.attacker.active.energies.cards.length, jet);
  f.attacker.active.tools.splice(0, f.attacker.active.tools.length, tool);
  f.attacker.bench.length = 0;
  for (const name of ['Oddish UNB','Pidgey MEW']) {
    const slot = new PokemonCardList();
    slot.cards.push(get(name));
    f.attacker.bench.push(slot);
  }
  f.attacker.deck.cards.splice(0, f.attacker.deck.cards.length,
    ...['Gloom UNB','Pidgeotto TEU','Vileplume AOR','Pidgeot ex OBF',
      'Grass Energy MEE'].map(get));

  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true});
  const rank1 = field.decks.find(deck => deck.rank === 1);
  assert.ok(rank1?.playableUnderEngine, 'Need resolved rank-1 source list');
  const stock = [...rank1.cardIds];
  const activePrint = 'Shadow Rider Calyrex V CRE';
  const pos = stock.indexOf(activePrint);
  assert.ok(pos >= 0, 'Source deck must contain target Basic');
  stock.splice(pos, 1);
  f.defender.active.cards.splice(0, f.defender.active.cards.length,
    get(activePrint));
  f.defender.hand.cards.splice(0, f.defender.hand.cards.length,
    ...stock.splice(0, 7).map(get));
  f.defender.prizes = stock.splice(0, 6).map(name => {
    const list = new CardList();
    list.cards.push(get(name));
    return list;
  });
  f.defender.deck.cards.splice(0, f.defender.deck.cards.length,
    ...stock.map(get));
  assert.ok(f.defender.deck.cards.length >= 40);

  let nextId = 1;
  for (const side of [f.attacker, f.defender]) {
    for (const zone of [side.active, side.deck, side.hand,
      side.discard, ...side.bench, ...side.prizes]) {
      for (const card of zone.cards) card.id = nextId++;
    }
    for (const card of side.active.tools) card.id = nextId++;
  }
  return {fixture: f, opponentSourceRank: 1, bunnelby: active, tool};
}

/**
 * Exercise the pinned SimpleTacticsAi and Store through actual search,
 * evolution, optional Barrage and animation prompts.
 * All strategic decisions come from the bot; shuffle order is kept stable
 * for a conditioned setup test, without implying a sampled game.
 * @param {{diagnostic?:boolean}} [options] Permit descriptive, non-passing experimental clone diagnostics.
 * @returns {object}
 */
function replayBunnelbyTmBot(options = {}) {
  const {fixture: f} = stageSourceBunnelbyBoard();
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const defs = engine('simple-bot/simple-bot-definitions');
  const base = {
    tactics: defs.allSimpleTactics, promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores, arbiter: defs.defaultArbiterOptions
  };
  const bot = new SimpleTacticsAi({id: f.attacker.id},
    withBunnelbyEvolutionLine(withToolAttackAwareness(base)), null);
  const first = bot.decodeNextAction(f.state);
  assert.equal(first?.name, 'Evolution');
  f.store.dispatch(first);
  const prompts = [];
  let secondAttack = null;
  let unresolvedPrompt = null;
  for (let i = 0; i < 60; i++) {
    const p = f.store.state.prompts.find(prompt => prompt.result === undefined);
    if (!p) break;
    const kind = p.constructor.name;
    // WaitPrompt acknowledges engine animation without a strategic selection.
    const action = kind === 'ShuffleDeckPrompt'
      ? new ResolvePromptAction(p.id,
        Array.from({length: f.attacker.deck.cards.length}, (_, index) => index))
      : kind === 'WaitPrompt' ? new ResolvePromptAction(p.id, null)
        : bot.decodeNextAction(f.store.state);
    if (!action) {
      if (!options.diagnostic) assert.ok(action, 'No bot answer for prompt ' + kind);
      unresolvedPrompt = kind;
      break;
    }
    if (kind === 'ChooseAttackPrompt') {
      secondAttack = action.result?.name;
    }
    prompts.push({
      kind,
      answer: kind === 'ChooseAttackPrompt' ? secondAttack :
        kind === 'ChooseCardsPrompt' ?
          (action.result || []).map(card => card.name) : undefined
    });
    f.store.dispatch(action);
    if (options.diagnostic) {
      prompts[prompts.length - 1].boardAfter =
        f.attacker.bench.map(slot => slot.getPokemonCard()?.name ?? null);
    }
  }
  const stillPending=f.store.state.prompts.some(p => p.result === undefined);
  const board = f.attacker.bench.map(slot => slot.getPokemonCard()?.name);
  const reachedSecondStage = !stillPending &&
    board.length === 2 && board[0] === 'Vileplume' &&
    board[1] === 'Pidgeot ex' && secondAttack === 'Evolution';
  if (!options.diagnostic) {
    assert.equal(stillPending, false,
      'Policy replay must not leave a pending prompt');
    assert.deepEqual(board, ['Vileplume','Pidgeot ex'],
      'Policy should evolve two Basic to Stage 2 by double TM');
    assert.equal(secondAttack, 'Evolution');
  }
  return {
    success: reachedSecondStage,
    sourceRanks: {evolutionLine: 2, opponent: 1},
    firstAttack: first.name,
    secondAttack,
    finalBench: board,
    prompts,
    ...(options.diagnostic ? {stillPending, unresolvedPrompt} : {}),
    caveat: 'Conditioned real Store + actual bot prompts, fixed deck order, no sampled draw or competitive win rate'
  };
}
if (require.main === module) {
  console.log(JSON.stringify(replayBunnelbyTmBot(), null, 2));
}
module.exports = {stageSourceBunnelbyBoard, replayBunnelbyTmBot};
