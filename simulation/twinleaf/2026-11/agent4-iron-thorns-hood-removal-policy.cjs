'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');

/**
 * Owner-visible Hood targets on either physical position. Active is considered
 * first, then Benched VMAX, then Benched V. No opponent-private zones are read.
 * @param {object} opponent
 * @returns {Array<{zone:object,slot:'active'|'bench',index:number,pokemon:string,tool:string}>}
 */
function hoodedShadowTargets(opponent) {
  const zones = [opponent.active, ...opponent.bench].map((zone, position) => ({
    zone,
    slot: position === 0 ? 'active' : 'bench',
    index: position === 0 ? 0 : position - 1
  }));
  return zones.flatMap(entry => {
    const pokemon = entry.zone?.getPokemonCard?.();
    if (!pokemon || !['Shadow Rider Calyrex VMAX', 'Shadow Rider Calyrex V'].includes(pokemon.name)) return [];
    const hood = entry.zone.tools.find(card => card.name === 'Stealthy Hood');
    return hood ? [{ ...entry, pokemon: pokemon.fullName || pokemon.name, tool: hood.fullName || hood.name }] : [];
  }).sort((a, b) => {
    const rank = row => row.zone.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX' ? 0 : 1;
    return rank(a) - rank(b) || Number(a.slot !== 'active') - Number(b.slot !== 'active') || a.index - b.index;
  });
}

/**
 * Exclude an Active Hood when Tool Jammer on the source Active suppresses it.
 * @param {object} opponent
 * @param {object} source
 * @returns {Array<{zone:object,slot:'active'|'bench',index:number,pokemon:string,tool:string}>}
 */
function sourceEffectiveHoodTargets(opponent, source) {
  // Tool Jammer on the source Active suppresses the opponent Active's Tools;
  // that Active Hood is already ineffective and is not a removal target.
  const activeToolJammer = source.active.tools.some(card => card.name === 'Tool Jammer');
  return hoodedShadowTargets(opponent).filter(target =>
    !(activeToolJammer && target.slot === 'active'));
}

/**
 * List owner-visible removal options in a fixed counterplay priority order.
 * Field Blower is an ordinary Item (up to two Tools), Megaton Blower is the
 * singleton ACE SPEC, and Faba consumes the Supporter for turn. This is a
 * development heuristic, not a claim of optimal play.
 * @param {object} state
 * @param {object} source
 * @param {object} opponent
 * @param {0|1} sourceSeat
 * @param {number} playerTurnPhase
 * @returns {Array<{card:string,targets:Array<object>,priorityReason:string}>}
 */
function sourceRemovalCandidates(state, source, opponent, sourceSeat, playerTurnPhase) {
  if (state.phase !== playerTurnPhase || state.activePlayer !== sourceSeat ||
      state.prompts.some(prompt => prompt.result === undefined) ||
      source.active.getPokemonCard()?.name !== 'Iron Thorns ex') return [];
  const targets = sourceEffectiveHoodTargets(opponent, source);
  if (!targets.length) return [];
  const held = new Set(source.hand.cards.map(card => card.name));
  const priorities = [
    ['Field Blower', 'ordinary Item; can remove up to two Tools without spending ACE SPEC or Supporter'],
    ['Megaton Blower', 'ACE SPEC Item; broad Tool/Special Energy removal while preserving Supporter tempo'],
    ['Faba', 'Supporter; targeted single Tool removal to the Lost Zone']
  ];
  return priorities.filter(([name]) => held.has(name)).map(([card, priorityReason]) => ({
    card, targets, priorityReason
  }));
}

/** @returns {{card:string,targets:Array<object>,priorityReason:string}|null} */
function sourceRemovalOpportunity(state, source, opponent, sourceSeat, playerTurnPhase) {
  return sourceRemovalCandidates(state, source, opponent, sourceSeat, playerTurnPhase)[0] || null;
}

/**
 * Pure owner/public-board selection for Faba's actual prompts.
 * @param {object} args
 * @returns {{result:number|object[],nextStage:string,targetZone:object|null,kind:string}|null}
 */
function sourceFabaHoodPromptChoice({ state, source, opponent, prompt, stage, targetZone = null }) {
  if (!prompt || prompt.result !== undefined || prompt.playerId !== source.id) return null;
  if (stage === 'choice') {
    if (prompt.constructor?.name !== 'SelectPrompt' ||
        prompt.message !== 'DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY') return null;
    const index = prompt.values?.indexOf('CHOICE_TOOL') ?? -1;
    return index < 0 ? null : { result: index, nextStage: 'pokemon', targetZone: null, kind: 'faba-tool-menu' };
  }
  if (stage === 'pokemon') {
    if (prompt.constructor?.name !== 'ChoosePokemonPrompt' ||
        prompt.message !== 'CHOOSE_POKEMON_TO_DISCARD_CARDS' || typeof prompt.validate !== 'function') return null;
    const target = sourceEffectiveHoodTargets(opponent, source).find(row => prompt.validate([row.zone], state));
    return target ? { result: [target.zone], nextStage: 'tool', targetZone: target.zone, kind: 'faba-hooded-shadow-target' } : null;
  }
  if (stage === 'tool') {
    if (prompt.constructor?.name !== 'ChooseCardsPrompt' ||
        prompt.message !== 'CHOOSE_CARD_TO_DISCARD' || prompt.cards !== targetZone ||
        typeof prompt.validate !== 'function') return null;
    const hood = targetZone?.tools.find(card => card.name === 'Stealthy Hood');
    return hood && prompt.validate([hood], state) ?
      { result: [hood], nextStage: 'done', targetZone, kind: 'faba-specific-hood' } : null;
  }
  return null;
}

/**
 * Pure owner/public-board selection for Field Blower's native mode and target prompts.
 * The pinned engine's split Tools/Stadium mode is handled by choosing the Tools-only
 * branch, a legal subset of printed text; mixed Tool/Stadium selection parity is not
 * validated by this adapter.
 * @param {object} args
 * @returns {{result:number|object[],nextStage:string,kind:string}|null}
 */
function sourceFieldBlowerHoodPromptChoice({ state, source, opponent, prompt, stage }) {
  if (!prompt || prompt.result !== undefined || prompt.playerId !== source.id) return null;
  if (stage === 'start' && prompt.constructor?.name === 'SelectOptionPrompt') {
    const values = prompt.values || [];
    const stadiumIndex = values.findIndex(value => /stadium/i.test(String(value)));
    const toolIndex = values.findIndex(value => /tool/i.test(String(value)));
    if (toolIndex < 0 || toolIndex === stadiumIndex) return null;
    return { result: toolIndex, nextStage: 'pokemon', kind: 'field-blower-tools-mode' };
  }
  if ((stage === 'start' || stage === 'pokemon') &&
      prompt.constructor?.name === 'ChoosePokemonPrompt' &&
      prompt.message === 'CHOOSE_POKEMON_TO_DISCARD_CARDS' &&
      typeof prompt.validate === 'function') {
    const preferred = sourceEffectiveHoodTargets(opponent, source).map(row => row.zone).slice(0, 2);
    if (!preferred.length) return null;
    const candidates = [preferred, ...preferred.map(zone => [zone])];
    for (const selected of candidates) {
      if (prompt.validate(selected, state)) {
        return { result: selected, nextStage: 'done', kind: 'field-blower-hood-targets' };
      }
    }
  }
  return null;
}

/**
 * DEVELOPMENT ADAPTER ONLY. This wraps the native SimpleTacticsAi boundary
 * and reads only the source's own hand plus the candidate's public board, but
 * it is not a V3 actor-only role policy. Port the decision logic to detached
 * actorObservation before admitting it to a frozen field-policy bundle.
 * The caller must run inside headless.runMatch so the pinned Megaton
 * compatibility hook is installed and restored by the shared runner.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withIronThornsHoodRemoval(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Require source physical seat and synchronous runner');
  }
  const load = name => require(path.join(OUTPUT, name));
  const { SimpleTacticsAi } = load('simple-bot/simple-tactics-ai');
  const { PlayCardAction, PlayerType, SlotType } = load('game/store/actions/play-card-action');
  const { GamePhase } = load('game/store/state/state');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const prior = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const events = [];
  const usedCards = new Set();
  let pendingCounter = null;

  function choose(state) {
    const own = state.players.find(side => side.id === this.client?.id);
    if (own?.id !== sourceId) return prior.call(this, state);
    const opponent = state.players[1 - sourceSeat];
    const prompt = state.prompts.find(row => row.playerId === own.id && row.result === undefined);

    if (pendingCounter) {
      if (!prompt) {
        pendingCounter = null;
      } else {
        const decision = pendingCounter.card === 'Faba' ?
          sourceFabaHoodPromptChoice({ state, source: own, opponent, prompt,
            stage: pendingCounter.stage, targetZone: pendingCounter.targetZone }) :
          pendingCounter.card === 'Field Blower' ?
            sourceFieldBlowerHoodPromptChoice({ state, source: own, opponent, prompt,
              stage: pendingCounter.stage }) : null;
        if (decision) {
          const activeCard = pendingCounter.card;
          pendingCounter.stage = decision.nextStage;
          if (decision.targetZone) pendingCounter.targetZone = decision.targetZone;
          const targetZones = decision.targetZone ? [decision.targetZone] :
            Array.isArray(decision.result) ? decision.result.filter(value =>
              typeof value?.getPokemonCard === 'function') : [];
          if (decision.nextStage === 'done') pendingCounter = null;
          events.push({
            kind: activeCard === 'Faba' ? 'selected-source-faba-prompt' :
              'selected-source-fieldblower-prompt',
            card: activeCard, turn: state.turn, choice: decision.kind,
            resultCount: Array.isArray(decision.result) ? decision.result.length : 1,
            targetPokemon: targetZones.map(zone => zone?.getPokemonCard?.()?.fullName ?? null)
          });
          return new ResolvePromptAction(prompt.id, decision.result);
        }
        return prior.call(this, state);
      }
    }

    if (prompt) return prior.call(this, state);
    const candidates = sourceRemovalCandidates(state, own, opponent, sourceSeat, GamePhase.PLAYER_TURN);
    for (const candidate of candidates) {
      const index = own.hand.cards.findIndex(card => card.name === candidate.card && !usedCards.has(card));
      if (index < 0) continue;
      const card = own.hand.cards[index];
      const action = new PlayCardAction(own.id, index, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      });
      if (!this.isValidAction(state, action)) {
        events.push({ kind: 'pinned-source-play-rejected', turn: state.turn,
          proposedCard: candidate.card, visibleTargets: candidate.targets });
        continue;
      }
      usedCards.add(card);
      pendingCounter = candidate.card === 'Faba' ?
        { card: candidate.card, stage: 'choice', targetZone: null } :
        candidate.card === 'Field Blower' ?
          { card: candidate.card, stage: 'start', targetZone: null } :
          { card: candidate.card, stage: 'done', targetZone: null };
      events.push({ kind: 'selected-source-play', turn: state.turn,
        card: card.fullName || card.name, cardName: candidate.card,
        priorityReason: candidate.priorityReason, visibleTargets: candidate.targets,
        sourceActive: own.active.getPokemonCard()?.fullName,
        candidateActive: opponent.active.getPokemonCard()?.fullName });
      return action;
    }
    return prior.call(this, state);
  }

  SimpleTacticsAi.prototype.decodeNextAction = choose;
  try {
    const result = execute();
    return { result, policyAudit: {
      version: 'agent4-iron-thorns-hood-removal-v1', sourceSeat,
      selectedCards: events.filter(row => row.kind === 'selected-source-play').map(row => row.cardName),
      fabaStage: pendingCounter?.card === 'Faba' ? pendingCounter.stage : null,
      fieldBlowerStage: pendingCounter?.card === 'Field Blower' ? pendingCounter.stage : null,
      events, qualifiedCompetitiveGames: 0
    } };
  } finally {
    if (SimpleTacticsAi.prototype.decodeNextAction !== choose) {
      throw new Error('Iron Thorns Hood removal wrapper lost its prototype');
    }
    SimpleTacticsAi.prototype.decodeNextAction = prior;
  }
}

module.exports = {
  hoodedShadowTargets, sourceEffectiveHoodTargets, sourceRemovalCandidates, sourceRemovalOpportunity,
  sourceFabaHoodPromptChoice, sourceFieldBlowerHoodPromptChoice,
  withIronThornsHoodRemoval
};
