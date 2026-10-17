'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stageRank2SourceK0} = require('./rank2-full-source-k0-sampler.cjs');
const {initializeCards} = require('./headless.cjs');
const {withMandatoryOptionFallback} = require('./mandatory-option-policy.cjs');
const {withBunnelbyGuzmaHalaMode1} =
  require('./bunnelby-guzma-hala-policy.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Construct two genuinely 60-card-conserving boards that differ only in
 * the owner-hidden placement of both Gloom. The bot can see identical K0
 * owner information until Guzma & Hala actually searches the deck.
 * @param {boolean} prizeBothGloom
 */
function stageGuzmaHand(prizeBothGloom) {
  const f = stageRank2SourceK0(prizeBothGloom);
  const {GamePhase} = engine('game/store/state/state');
  const {Store} = engine('game/store/store');
  const manager = initializeCards();
  const sourceCards = f.rank2.cardIds.map(fullName =>
    manager.getCardByName(fullName));
  const energy = f.player.active.energies.cards.find(card =>
    card.fullName === 'Jet Energy PAL');
  const tool = f.player.active.tools.find(card =>
    card.fullName === 'Technical Machine: Evolution PAR');
  assert.ok(energy && tool);
  f.player.active.energies.cards.splice(
    f.player.active.energies.cards.indexOf(energy), 1);
  f.player.active.cards.splice(f.player.active.cards.indexOf(energy), 1);
  f.player.active.tools.splice(f.player.active.tools.indexOf(tool), 1);
  f.player.deck.cards.push(energy, tool);
  f.state.phase = GamePhase.PLAYER_TURN;
  f.state.activePlayer = f.state.players.findIndex(side =>
    side.id === f.player.id);
  const store = new Store({onStateChange() {}});
  store.state = f.state;

  const defs = engine('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const options = withBunnelbyGuzmaHalaMode1(
    withMandatoryOptionFallback({
      tactics: defs.allSimpleTactics,
      promptResolvers: defs.allPromptResolvers,
      scores: defs.defaultStateScores,
      arbiter: defs.defaultArbiterOptions
    }), sourceCards);
  const bot = new SimpleTacticsAi({id: f.player.id}, options, null);
  return {store, state: f.state, player: f.player, bot,
    sourceCards, prizeBothGloom};
}

/** @param {object} action */
function chosenNames(action) {
  return Array.isArray(action?.result) ?
    action.result.map(card => card.fullName) : null;
}

/**
 * Observe the actual generic bot discard and search choices after the
 * conditionally selected G&H mode-one option. Do not force favorable cards.
 * @param {boolean} prizeBothGloom
 */
function probeGuzmaDiscardChoice(prizeBothGloom) {
  const f = stageGuzmaHand(prizeBothGloom);
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {SelectOptionPrompt} =
    engine('game/store/prompts/select-option-prompt');
  const {ChooseCardsPrompt} =
    engine('game/store/prompts/choose-cards-prompt');
  const handIndex = f.player.hand.cards.findIndex(card =>
    card.fullName === 'Guzma & Hala CEC');
  assert.ok(handIndex >= 0);
  f.store.dispatch(new PlayCardAction(f.player.id,handIndex,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));

  const modePrompt = f.state.prompts.find(p => p.result === undefined);
  assert.ok(modePrompt instanceof SelectOptionPrompt);
  const mode = f.bot.decodeNextAction(f.state);
  assert.equal(mode?.result, 1,
    'Source-aware policy must choose the actual discard-search mode');
  f.store.dispatch(mode);

  const discardPrompt = f.state.prompts.find(p => p.result === undefined);
  assert.ok(discardPrompt instanceof ChooseCardsPrompt);
  const discard = f.bot.decodeNextAction(f.state);
  const discardedNames = chosenNames(discard);
  if (!discard || !discardPrompt.validate(discard.result)) {
    return {prizeBothGloom,mode:mode.result,discardedNames,
      stage:'discard-selection-blocked'};
  }
  f.store.dispatch(discard);

  const searchPrompt = f.state.prompts.find(p => p.result === undefined);
  assert.ok(searchPrompt instanceof ChooseCardsPrompt);
  const search = f.bot.decodeNextAction(f.state);
  const searchedNames = chosenNames(search);
  if (!search || !searchPrompt.validate(search.result)) {
    return {prizeBothGloom,mode:mode.result,discardedNames,
      searchedNames,stage:'search-selection-blocked'};
  }
  return {
    prizeBothGloom,mode:mode.result,
    discardedNames,searchedNames,
    availableInHandBeforeSearch: f.player.hand.cards.map(c => c.fullName),
    stage:'search-selected',
    caveat:'Constructed full-source-60 K0 board; upstream bot picks discards and search but no game is completed'
  };
}

/** Run the K0-indistinguishable pair. */
function probePair() {
  const unprized = probeGuzmaDiscardChoice(false);
  const prized = probeGuzmaDiscardChoice(true);
  return {
    unprized, prized,
    k0DiscardSelectionIdentical:
      JSON.stringify(unprized.discardedNames) ===
      JSON.stringify(prized.discardedNames),
    caveat:'Only pre-search mode and discard must agree at K0. Later deck search may legitimately differ after revealing actual deck contents.'
  };
}

if (require.main === module) console.log(JSON.stringify(probePair(), null, 2));
module.exports = {stageGuzmaHand, probeGuzmaDiscardChoice, probePair};
