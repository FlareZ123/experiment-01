'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(output, file));

const SOURCE_TURNS = new Set([21, 23, 25, 27]);

/**
 * Visible-source and own-hand prerequisite for the authentic rank-8 escape.
 * Do not read either deck, opponent hand, or face-down Prize cards.
 * @param {object} state Pinned Twinleaf game state.
 * @param {object} player The champion-reference player.
 * @param {'tool'|'paid'} mode Investigated route.
 * @returns {object|null} Selected target metadata, or null.
 */
function sourceEscapeOpportunity(state, player, mode) {
  if (!SOURCE_TURNS.has(state.turn) || state.phase !== 2 ||
      state.activePlayer !== 0 || player?.id !== 101 ||
      state.prompts.some(prompt => prompt.result === undefined)) return null;
  if (player.active.getPokemonCard()?.name !== 'Latias ex') return null;
  const psychic = list => list.energies.cards.filter(c =>
    c.name === 'Psychic Energy').length;
  if (psychic(player.active) < 2) return null;
  const benchIndex = player.bench.findIndex(slot =>
    slot.getPokemonCard()?.name === 'Trevenant & Dusknoir-GX' &&
    psychic(slot) >= 3);
  if (benchIndex < 0) return null;
  const opponent = state.players[1];
  const garbodorIndex = opponent.bench.findIndex(slot =>
    slot.getPokemonCard()?.name === 'Garbodor' &&
    slot.tools.some(c => c.name === 'Float Stone'));
  if (garbodorIndex < 0) return null;
  const blowerIndex = player.hand.cards.findIndex(c => c.name === 'Field Blower');
  if (mode === 'tool' && blowerIndex < 0) return null;
  return {
    turn: state.turn, benchIndex, garbodorIndex, blowerIndex,
    latiasEnergy: player.active.energies.cards.map(c => c.fullName),
    targetEnergy: player.bench[benchIndex].energies.cards.map(c => c.fullName)
  };
}

/**
 * Replace exactly one already-selected Pass in an unchanged source 60-card
 * game. The branch uses real Store actions and real prompt validation.
 * This is a diagnostic override, not a general playing policy.
 * @template T
 * @param {'tool'|'paid'} mode
 * @param {()=>T} work Synchronous source-dealt game.
 * @returns {{result:T,events:object[],opportunity:object|null,stage:string}}
 */
function withRank8EscapePolicy(mode, work) {
  if (!['tool', 'paid'].includes(mode)) throw new TypeError('Unknown escape route');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {RetreatAction, AttackAction} =
    engine('game/store/actions/game-actions');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const events = [];
  let stage = 'idle';
  let opportunity = null;
  SimpleTacticsAi.prototype.decodeNextAction = function rank8EscapeDecision(state) {
    const player = state.players.find(p => p.id === this.client.id);
    if (!player || player.id !== 101 || state.turn !== opportunity?.turn &&
        stage !== 'idle') return original.call(this, state);
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (stage === 'idle') {
      const selection = original.call(this, state);
      const possible = sourceEscapeOpportunity(state, player, mode);
      if (!possible || selection?.constructor?.name !== 'PassTurnAction') {
        return selection;
      }
      opportunity = possible;
      if (mode === 'tool') {
        stage = 'await-tool-prompt';
        events.push({turn:state.turn,kind:'forced-field-blower-after-source-pass',
          originalAction:'PassTurnAction'});
        return new PlayCardAction(player.id, possible.blowerIndex,
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
      }
      stage = 'await-attack';
      events.push({turn:state.turn,kind:'forced-paid-retreat-after-source-pass',
        originalAction:'PassTurnAction'});
      return new RetreatAction(player.id, possible.benchIndex);
    }
    if (stage === 'await-tool-prompt' && pending?.playerId === player.id &&
        pending.constructor.name === 'ChoosePokemonPrompt') {
      const target = state.players[1].bench[opportunity.garbodorIndex];
      if (target?.getPokemonCard()?.name === 'Garbodor' &&
          pending.validate([target], state)) {
        events.push({turn:state.turn,kind:'target-garbodor-tool',
          promptId:pending.id});
        return new ResolvePromptAction(pending.id,[target]);
      }
    }
    if (stage === 'await-tool-prompt' && !pending) {
      const target = state.players[1].bench[opportunity.garbodorIndex];
      if (target && !target.tools.some(c => c.name === 'Float Stone')) {
        stage = 'await-attack';
        events.push({turn:state.turn,kind:'forced-post-blower-retreat'});
        return new RetreatAction(player.id, opportunity.benchIndex);
      }
    }
    if (stage === 'await-attack' && !pending &&
        player.active.getPokemonCard()?.name === 'Trevenant & Dusknoir-GX') {
      stage = 'done';
      events.push({turn:state.turn,kind:'forced-night-watch'});
      return new AttackAction(player.id,'Night Watch');
    }
    return original.call(this,state);
  };
  try {
    const result = work();
    return {result,events,opportunity,stage};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = {sourceEscapeOpportunity, withRank8EscapePolicy};
