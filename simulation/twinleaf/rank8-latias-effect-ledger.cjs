'use strict';

/**
 * A narrow observer of the exact source-dealt rank8 decision turn.
 * Hidden zones are reduced to counts and never given to either bot.
 * @param {object} state Pinned live State.
 * @param {number} actingPlayerId The candidate's real player id.
 * @returns {object|null}
 */
function rank8ImmediateEffectSnapshot(state, actingPlayerId) {
  const owner = state.players.find(player => player.id === actingPlayerId);
  const opponent = state.players.find(player => player.id !== actingPlayerId);
  if (!owner || !opponent) return null;
  /** @param {object} player @param {string} name */
  const location = (player, name) => {
    const slots=[{where:'active',slot:player.active},
      ...player.bench.map((slot,index)=>({where:'bench:'+index,slot}))];
    const matching=slots.find(({slot})=>slot.getPokemonCard()?.name===name);
    if(!matching) return null;
    return {
      where:matching.where,
      damage:matching.slot.damage,
      energy:matching.slot.energies.cards.map(c=>c.fullName),
      tools:matching.slot.tools.map(c=>c.fullName)
    };
  };
  return {
    turn:state.turn,
    phase:state.phase,
    actingSeat:state.activePlayer,
    ownerActive:owner.active.getPokemonCard()?.name??null,
    opponentActive:opponent.active.getPokemonCard()?.name??null,
    opponentActiveDamage:opponent.active.damage,
    latias:location(owner,'Latias ex'),
    trevenantDusknoir:location(owner,'Trevenant & Dusknoir-GX'),
    garbodor:location(opponent,'Garbodor'),
    ownerDiscardedPsychic:owner.discard.cards.filter(c=>c.name==='Psychic Energy').length,
    opponentHandCount:opponent.hand.cards.length,
    opponentDeckCount:opponent.deck.cards.length,
    opponentDiscardCount:opponent.discard.cards.length,
    retreatedTurn:owner.retreatedTurn,
    pendingPromptTypes:state.prompts.filter(prompt=>prompt.result===undefined)
      .map(prompt=>prompt.constructor.name)
  };
}

/**
 * Capture before and after every genuine candidate root-Store dispatch in
 * the selected source turn, without inspecting any speculative Simulator Store.
 * Source State remains untouched. Class method always restored.
 * @template T
 * @param {function} Store Pinned engine constructor.
 * @param {()=>T} execute A single synchronous source match.
 * @param {{turn:number,playerId:number}} scope Exact source deal selector.
 * @returns {{result:T,observations:object[]}}
 */
function withRank8SourceActionEffects(Store, execute, scope) {
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(!original || typeof original.value!=='function') {
    throw new TypeError('Expected Store dispatch method');
  }
  let live=null;
  const observations=[];
  const wrapper=function (...args) {
    const action=args[0];
    if(!live && action?.constructor?.name==='AddPlayerAction') live=this;
    const state=this.state;
    const eligible=this===live && state.turn===scope.turn &&
      state.players.some(player=>player.id===scope.playerId) &&
      state.activePlayer===state.players.findIndex(p=>p.id===scope.playerId);
    const before=eligible?rank8ImmediateEffectSnapshot(state,scope.playerId):null;
    const actionType=action?.constructor?.name??null;
    const player=state.players.find(p=>p.id===scope.playerId);
    const preCard=actionType==='PlayCardAction'
      ? player?.hand.cards[action.handIndex]?.fullName??null:null;
    const prePrompt=state.prompts.find(p=>p.result===undefined);
    let failure=null;
    try {
      return original.value.apply(this,args);
    } catch(error) {
      failure=String(error?.message||error);
      throw error;
    } finally {
      if(eligible && before) {
        observations.push({
          action:actionType,
          card:preCard,
          declaredAttack:actionType==='AttackAction'?action.name:null,
          prompt:actionType==='ResolvePromptAction'
            ?prePrompt?.constructor?.name??null:null,
          before,
          after:rank8ImmediateEffectSnapshot(this.state,scope.playerId),
          error:failure
        });
      }
    }
  };
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:wrapper});
  try {
    return {result:execute(),observations};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={rank8ImmediateEffectSnapshot,withRank8SourceActionEffects};
