'use strict';

/**
 * Detached source-State evidence surrounding a real turn-five Koraidon
 * decision, the retreat, and its next end-of-turn resolution. The snapshot
 * is deliberately diagnostic and excludes speculative Store clones.
 * @param {object} state
 */
function snapshot(state) {
  const defender=state.players[1],attacker=state.players[0];
  const prizes=state.players.map(p=>p.prizes.filter(z=>z.cards.length>0).length);
  const pokemon=list=>list?.getPokemonCard()?.fullName??null;
  return {
    turn:state.turn,activePlayer:state.activePlayer,
    prizes,active:pokemon(defender.active),
    bench:defender.bench.map(pokemon),
    discard:defender.discard.cards.map(c=>c.fullName),
    activeEnergy:defender.active.energies.cards.map(c=>c.fullName),
    pending:defender.pendingEndOfTurnEffects.map(item=>({
      type:item.type,
      pokemon:pokemon(item.target),
      targetLocation:item.target===defender.active?'active':
        defender.bench.includes(item.target)?'bench':
          item.target===attacker.active?'opponent-active':'unknown',
      attack:item.attack?.name??null,
      source:item.sourceCard?.fullName??null
    }))
  };
}

/**
 * Observe pre and post root dispatch without changing the result or action.
 * @template T
 * @param {Function} Store Compiled source Store constructor.
 * @param {()=>T} work Live game.
 */
function withRank10PaleMoonWindow(Store,work) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(typeof descriptor?.value!=='function') throw new TypeError('No Store.dispatch');
  let live=null;
  const events=[];
  const dispatch=function(...args) {
    const name=args[0]?.constructor?.name??null;
    if(!live && name==='AddPlayerAction') live=this;
    const observed=this===live&&this.state.turn===5&&
      ['PassTurnAction','RetreatAction','AttackAction'].includes(name);
    const before=observed?snapshot(this.state):null;
    const outcome=descriptor.value.apply(this,args);
    if(observed) events.push({action:name,before,after:snapshot(this.state)});
    return outcome;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  let result;
  try {result=work();}
  finally {Object.defineProperty(Store.prototype,'dispatch',descriptor);}
  return {result,events};
}
module.exports={snapshot,withRank10PaleMoonWindow};
