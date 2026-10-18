'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Identify a visible live-Garbotoxin response using only our hand and public
 * Pokémon/Tool zones. A VMAX with Underworld Door is preferred to its Basic V
 * ancestor; an already Tool-equipped attacker is excluded.
 *
 * @param {object} own Acting player's live public board and own hand.
 * @param {object} opponent Opponent's public board.
 * @returns {{slot:'ACTIVE'|'BENCH',index:number,pokemon:string}|null}
 */
function chooseProtectedShadowRider(own, opponent) {
  if (!own.hand.cards.some(card => card.name === 'Stealthy Hood')) return null;
  const enemy = [opponent.active, ...opponent.bench];
  if (!enemy.some(zone => zone.getPokemonCard()?.name === 'Garbodor' &&
      zone.tools.length > 0)) return null;
  const slots = [{zone:own.active,slot:'ACTIVE',index:0},
    ...own.bench.map((zone,index) => ({zone,slot:'BENCH',index}))];
  const eligible = slots.filter(row =>
    ['Shadow Rider Calyrex V','Shadow Rider Calyrex VMAX'].includes(
      row.zone.getPokemonCard()?.name) && row.zone.tools.length === 0);
  eligible.sort((a,b) =>
    (a.zone.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX' ? 0 : 1) -
    (b.zone.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX' ? 0 : 1));
  const first = eligible[0];
  return first ? {slot:first.slot,index:first.index,
    pokemon:first.zone.getPokemonCard().fullName} : null;
}

/**
 * Narrow, opt-in Tool-attachment counterfactual with no hardcoded seed or turn.
 * Limits itself to one successful intervention. All original downstream
 * actions are selected by the existing bot, and prototype restoration is
 * checked. This is an ability-availability probe, not a strong playing policy.
 *
 * @template T
 * @param {0|1} candidateSeat Physical candidate seat.
 * @param {()=>T} execute Synchronous headless game.
 * @returns {{result:T,policyAudit:object}}
 */
function withEarlyShadowRiderHood(candidateSeat, execute) {
  if (![0,1].includes(candidateSeat) || typeof execute !== 'function') {
    throw new TypeError('Expected a physical candidate seat and runner');
  }
  const load = name => require(path.join(output,name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const {GamePhase} = load('game/store/state/state');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const ownerId = candidateSeat === 0 ? 101 : 202;
  const events = [];
  let selected = false;

  function choose(state) {
    const own = state.players.find(player => player.id === this.client?.id);
    if (own?.id !== ownerId || selected ||
        state.phase !== GamePhase.PLAYER_TURN ||
        state.activePlayer !== candidateSeat ||
        state.prompts.some(prompt => prompt.result === undefined)) {
      return previous.call(this,state);
    }
    const opponent = state.players[1-candidateSeat];
    const target = chooseProtectedShadowRider(own,opponent);
    if (target) {
      const handIndex = own.hand.cards.findIndex(card => card.name === 'Stealthy Hood');
      const action = new PlayCardAction(own.id,handIndex,{
        player:PlayerType.BOTTOM_PLAYER,
        slot:target.slot === 'ACTIVE' ? SlotType.ACTIVE : SlotType.BENCH,
        index:target.index
      });
      if (this.isValidAction(state,action)) {
        selected = true;
        events.push({turn:state.turn,kind:'selected-root-play',
          card:own.hand.cards[handIndex].fullName,target,
          ownHand:own.hand.cards.map(card => card.fullName),
          sourceGarbodorTools:[opponent.active,...opponent.bench].flatMap(zone =>
            zone.getPokemonCard()?.name === 'Garbodor' ?
              zone.tools.map(card => card.fullName) : [])});
        return action;
      }
      events.push({turn:state.turn,kind:'pinned-legal-action-rejected',target});
    }
    return previous.call(this,state);
  }

  SimpleTacticsAi.prototype.decodeNextAction = choose;
  try {
    return {result:execute(),policyAudit:{
      version:'early-shadow-rider-hood-source-v1',
      selected,events,qualifiedForCompetitiveInference:false
    }};
  } finally {
    if (SimpleTacticsAi.prototype.decodeNextAction !== choose) {
      throw new Error('Hood policy lost prototype ownership');
    }
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports={chooseProtectedShadowRider,withEarlyShadowRiderHood};
