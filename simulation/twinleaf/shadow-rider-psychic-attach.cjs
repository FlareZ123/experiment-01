'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const load = modulePath => require(path.join(root, modulePath));

/**
 * Pick one visible Shadow Rider attacker to receive a Psychic Energy.
 * Power a VMAX to its printed three-Energy Max Geist threshold before
 * spreading manual attachments. The policy is deliberately restricted to
 * opposing Active Iron Thorns ex for the rank-6 lock-fidelity experiment.
 *
 * @param {object} player Pinned Twinleaf Player.
 * @returns {{zone:'active'|'bench',index:number}|null}
 */
function chooseShadowRiderTarget(player) {
  const slots = [
    {zone:'active',index:0,slot:player.active},
    ...player.bench.map((slot,index)=>({zone:'bench',index,slot}))
  ];
  const targets = slots.flatMap(entry => {
    const pokemon = entry.slot.getPokemonCard();
    if (!pokemon || !['Shadow Rider Calyrex VMAX','Shadow Rider Calyrex V'].includes(pokemon.name)) {
      return [];
    }
    const psychic = entry.slot.energies.cards.filter(card=>card.name==='Psychic Energy').length;
    if (psychic >= 3 || entry.slot.cannotAttachEnergyFromHandNextTurn) return [];
    return [{...entry,stage: pokemon.name==='Shadow Rider Calyrex VMAX' ? 2 : 1,
      psychic}];
  });
  targets.sort((a,b) =>
    b.stage-a.stage ||
    Number(b.zone==='active')-Number(a.zone==='active') ||
    b.psychic-a.psychic ||
    a.index-b.index
  );
  return targets.length ? {zone:targets[0].zone,index:targets[0].index} : null;
}

/**
 * Source-locked, opt-in counterfactual attachment tactic.
 * It leaves the upstream AttachEnergyTactic available as fallback.
 * Legality is checked by dispatching onto a cloned Twinleaf Store, without
 * changing live state or changing the pinned vendor code.
 *
 * @returns {Function} A SimpleTacticsAi-compatible tactic constructor.
 */
function makeShadowRiderPsychicAttachTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {Simulator}=load('game/bots/simulator');

  return class ShadowRiderPsychicAttachTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      if (state.prompts.some(p=>p.result===undefined) ||
          player.energyPlayedTurn>=state.turn) return;
      const opponent=state.players.find(p=>p.id!==player.id);
      if (!opponent || opponent.active.getPokemonCard()?.name!=='Iron Thorns ex') return;
      const handIndex=player.hand.cards.findIndex(card=>card.name==='Psychic Energy');
      if (handIndex<0) return;
      const wanted=chooseShadowRiderTarget(player);
      if (!wanted) return;
      const target={
        player:PlayerType.BOTTOM_PLAYER,
        slot:wanted.zone==='active' ? SlotType.ACTIVE : SlotType.BENCH,
        index:wanted.index
      };
      const action=new PlayCardAction(player.id,handIndex,target);
      try {
        const sim=new Simulator(state,this.options.arbiter);
        sim.dispatch(action);
        return action;
      } catch {
        return;
      }
    }
  };
}

/**
 * Interpose the narrow tactic before ordinary Energy scoring. Other deck
 * engines and opposing policy choices remain subject to their normal logic.
 *
 * @param {object} options Pinned SimpleBotOptions.
 * @returns {object} Shallow-copied options with opt-in tactic.
 */
function withShadowRiderPsychicPriority(options) {
  const at=options.tactics.findIndex(tactic=>tactic.name==='AttachEnergyTactic');
  if(at<0) throw new Error('Pinned AttachEnergyTactic is missing.');
  return {
    ...options,
    tactics:[
      ...options.tactics.slice(0,at),
      makeShadowRiderPsychicAttachTactic(),
      ...options.tactics.slice(at)
    ]
  };
}

module.exports = {
  chooseShadowRiderTarget,
  makeShadowRiderPsychicAttachTactic,
  withShadowRiderPsychicPriority
};
