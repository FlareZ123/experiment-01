'use strict';

const path = require('node:path');
const {TOOLS, untooledTrubbish, freeBenchIndex, directBoostShakeOpportunity} =
  require('./rank11-direct-opportunity.cjs');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Autonomous, opt-in direct rank11 Boost Shake experiment. The baseline
 * Back Order route remains untouched. Choices before genuine deck-search
 * prompts use only the acting hand and public board.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @param {{k1AvoidMissingGarbodor?:boolean}} [configuration]
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11DirectBoostShake(sourceSeat, execute,
  {k1AvoidMissingGarbodor = false, k0AvoidAllGarbodorHeld = false} = {}) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Known rank11 seat and synchronous game required.');
  }
  const load = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  const prior = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0};
  const actions = [];
  let line = null;
  let stepIndex = 0;
  let aborted = null;
  let witness = null;

  /** @param {object} player @param {string} name @param {object} target */
  function play(player, name, target) {
    const at = player.hand.cards.findIndex(card => card.name === name);
    return at < 0 ? null : new PlayCardAction(player.id, at, target);
  }
  /** @param {object} state @param {object} player @param {object} prompt @param {string} name */
  function deckChoice(state, player, prompt, name) {
    if (prompt?.constructor.name !== 'ChooseCardsPrompt' ||
        prompt.playerId !== player.id || prompt.cards !== player.deck) return null;
    const found = prompt.cards.cards.find(card => card.name === name);
    return found && prompt.validate([found], state) ?
      new ResolvePromptAction(prompt.id, [found]) : null;
  }
  /** @param {object} player @param {string} tool */
  function tooledTrubbish(player, tool) {
    return player.bench.find(slot =>
      slot.getPokemonCard()?.name === 'Trubbish' &&
      slot.tools.some(item => item.name === tool));
  }

  SimpleTacticsAi.prototype.decodeNextAction = function rank11Direct(state) {
    const player = state.players.find(side => side.id === this.client?.id);
    if (!player || player.id !== sourceId) {
      if (line && stepIndex === line.steps.length && !witness &&
          state.activePlayer !== sourceSeat && state.turn > line.turn) {
        const source = state.players[sourceSeat];
        witness = {
          turn: state.turn,
          equippedGarbodor: source.bench.some(slot =>
            slot.getPokemonCard()?.name === 'Garbodor' &&
            slot.tools.some(tool => TOOLS.includes(tool.name)))
        };
      }
      return prior.call(this, state);
    }
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (!line && !pending) {
      const found = directBoostShakeOpportunity(
        state, player, sourceSeat, GamePhase.PLAYER_TURN,
        k0AvoidAllGarbodorHeld);
      if (found) {
        const prefix = found.route === 'vip' ? ['vip', 'trubbish-search'] :
          found.route === 'hand' ? ['trubbish-hand'] : [];
        line = {...found, turn:state.turn,
          steps:[...prefix, 'attach-tool', 'boost-shake', 'garbodor-search', 'garbodor-target']};
      }
    }
    if (!line || aborted || stepIndex >= line.steps.length) return prior.call(this, state);
    const step = line.steps[stepIndex];
    const expectsPrompt = step.endsWith('-search') || step === 'garbodor-target';
    // Preserve the line while unrelated Wait/Shuffle prompts are resolved.
    if (!!pending !== expectsPrompt) return prior.call(this, state);
    if (pending && pending.constructor.name !==
        (step === 'garbodor-target' ? 'ChoosePokemonPrompt' : 'ChooseCardsPrompt')) {
      return prior.call(this, state);
    }
    let action = null;
    if (step === 'vip') action = play(player, 'Battle VIP Pass', board);
    if (step === 'trubbish-hand') {
      const index = freeBenchIndex(player);
      if (index >= 0) action = play(player, 'Trubbish',
        {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH, index});
    }
    if (step === 'trubbish-search') {
      action = deckChoice(state, player, pending, 'Trubbish');
      if (action && k1AvoidMissingGarbodor &&
          pending.playerId === player.id && pending.cards === player.deck &&
          !pending.cards.cards.some(card => card.name === 'Garbodor')) {
        aborted = {turn:state.turn, stepIndex, step,
          reason:'own-deck-search-established-no-Garbodor',
          ownerDeckSearch:true, garbodorInOwnerSearch:0,
          garbodorInOwnHand:player.hand.cards.filter(card =>
            card.name === 'Garbodor').length};
      }
    }
    if (step === 'attach-tool') {
      const index = untooledTrubbish(player);
      if (index >= 0) action = play(player, line.tool,
        {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH, index});
    }
    if (step === 'boost-shake' && tooledTrubbish(player, line.tool)) {
      action = play(player, 'Boost Shake', board);
    }
    if (step === 'garbodor-search') {
      action = deckChoice(state, player, pending, 'Garbodor');
    }
    if (step === 'garbodor-target') {
      const target = tooledTrubbish(player, line.tool);
      if (target && pending?.constructor.name === 'ChoosePokemonPrompt' &&
          pending.validate([target], state)) {
        action = new ResolvePromptAction(pending.id, [target]);
      }
    }
    if (!action) {
      const ownerSearch = pending?.constructor.name === 'ChooseCardsPrompt' &&
        pending.playerId === player.id && pending.cards === player.deck;
      const eligible = ownerSearch ? pending.cards.cards.filter(card =>
        card.name === 'Garbodor') : [];
      aborted = {turn:state.turn, stepIndex, step,
        prompt:pending?.constructor.name || null,
        ownerDeckSearch:ownerSearch,
        garbodorInOwnerSearch:ownerSearch ? eligible.length : null,
        garbodorWithValidSelection:ownerSearch ? eligible.filter(card =>
          pending.validate([card],state)).length : null,
        garbodorInOwnHand:ownerSearch ? player.hand.cards.filter(card =>
          card.name === 'Garbodor').length : null};
      return prior.call(this, state);
    }
    actions.push({turn:state.turn, step, className:action.constructor.name});
    stepIndex += 1;
    return action;
  };
  try {
    const result = execute();
    return {result, policyAudit:{
      version:k1AvoidMissingGarbodor ? 'rank11-direct-boostshake-k1-v2' :
        'rank11-direct-boostshake-v1', sourceSeat,
      opportunityTurn:line?.turn ?? null, route:line?.route ?? null,
      selectedTool:line?.tool ?? null,
      k1AvoidMissingGarbodor, actions, aborted,
      nextTurnLockWitness:witness,
      completed:!!line && stepIndex === line.steps.length &&
        witness?.equippedGarbodor === true,
      qualifiedForCompetitiveInference:false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = prior;
  }
}

module.exports = {withRank11DirectBoostShake};
