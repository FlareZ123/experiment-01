'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} p @returns {any} */
const load = p => require(path.join(output, p));

/**
 * Active first, then Bench order mirrors pinned Player.forEachPokemon and
 * EvolveTactic. Return an alternative only when strictly more attached
 * Psychic Energy is present, with exactly one matching VMAX in hand.
 *
 * @param {object} player Pinned Player or minimal read-only fixture.
 * @param {{turn:number}} state
 * @returns {{handIndex:number,zone:'active'|'bench',index:number,psychic:number}|null}
 */
function preferShadowRiderEvolution(player, state) {
  const handIndices = player.hand.cards.flatMap((card, index) =>
    card.name === 'Shadow Rider Calyrex VMAX' &&
    card.evolvesFrom === 'Shadow Rider Calyrex V' ? [index] : []);
  if (handIndices.length !== 1) return null;

  const locations = [
    {slot:player.active,zone:'active',index:0},
    ...player.bench.map((slot,index)=>({slot,zone:'bench',index}))
  ];
  const targets = locations.flatMap(({slot,zone,index}) => {
    const pokemon = slot.getPokemonCard();
    if (pokemon?.name !== 'Shadow Rider Calyrex V' ||
        slot.pokemonPlayedTurn === state.turn) return [];
    const psychic = slot.energies.cards.filter(c=>c.name==='Psychic Energy').length;
    return [{handIndex:handIndices[0],zone,index,psychic}];
  });
  if (targets.length < 2) return null;
  const preferred = targets.reduce((best,target) =>
    target.psychic > best.psychic ? target : best, targets[0]);
  return preferred.psychic > targets[0].psychic ? preferred : null;
}

/** @returns {Function} SimpleTactic subclass for the pinned research engine. */
function makeShadowRiderEvolutionTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  return class ShadowRiderEvolutionPriorityTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state, player) {
      const choice = preferShadowRiderEvolution(player, state);
      if (!choice) return;
      return new PlayCardAction(player.id, choice.handIndex, {
        player:PlayerType.BOTTOM_PLAYER,
        slot:choice.zone==='active' ? SlotType.ACTIVE : SlotType.BENCH,
        index:choice.index
      });
    }
  };
}

/**
 * Insert before the original EvolveTactic. Fallback actions remain unchanged.
 * The custom tactic does not speculate, read deck/Prize order, or mutate state.
 * @param {{tactics:Function[]}} options
 * @param {Function} [injectedTactic] Test-only constructor override.
 * @returns {{tactics:Function[]}}
 */
function withShadowRiderEvolutionPriority(options, injectedTactic) {
  const index=options.tactics.findIndex(t=>t.name==='EvolveTactic');
  if (index < 0) throw new Error('Pinned EvolveTactic extension point missing.');
  const tactic=injectedTactic || makeShadowRiderEvolutionTactic();
  return {...options,tactics:[
    ...options.tactics.slice(0,index),tactic,...options.tactics.slice(index)
  ]};
}

module.exports={
  preferShadowRiderEvolution,makeShadowRiderEvolutionTactic,
  withShadowRiderEvolutionPriority
};
