'use strict';

const assert = require('node:assert/strict');

/** @param {object} slot */
function publicPokemon(slot) {
  const pokemon=slot?.getPokemonCard?.();
  return pokemon ? {
    name:pokemon.name,
    damage:slot.damage,
    attachedEnergyCards:slot.energies.cards.length
  } : null;
}

/** @param {object} state @param {number} seat */
function publicSide(state,seat) {
  const player=state.players[seat];
  return {
    active:publicPokemon(player.active),
    bench:player.bench.map((slot,index)=>({index,pokemon:publicPokemon(slot)}))
      .filter(x=>x.pokemon!==null),
    prizesRemaining:player.prizes.filter(x=>x.cards.length>0).length
  };
}

/**
 * Read-only witness of a physically dispatched Acerola use. Capture the public
 * Pokémon board before playing, and after any forced prompt chain.
 * Avoid other speculative Store instances and restore the original dispatch.
 *
 * @template T
 * @param {Function} Store The pinned game Store class.
 * @param {()=>T} work One synchronous physical game.
 * @param {{turn?:number,seat?:number}} [options]
 * @returns {{result:T,events:object[],pending:boolean}}
 */
function withAcerolaPublicObserver(Store,work,options={}) {
  const {turn=3,seat=0}=options;
  assert.ok(typeof Store?.prototype?.dispatch==='function');
  assert.ok(typeof work==='function');
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  let root=null;
  let pending=null;
  const events=[];
  const wrapped=function(...args) {
    const action=args[0];
    if(!root && action?.constructor?.name==='AddPlayerAction') root=this;
    if(this!==root) return original.value.apply(this,args);
    const state=this.state;
    const isAcerola=action?.constructor?.name==='PlayCardAction' &&
      state?.turn===turn && state.activePlayer===seat &&
      state.players[seat].hand.cards[action.handIndex]?.name==='Acerola';
    if(isAcerola) {
      assert.equal(pending,null,'Acerola observations cannot overlap');
      pending={turn,seat,before:publicSide(state,seat),
        sourceDispatchAction:'PlayCardAction',actionHandCard:'Acerola'};
    }
    const result=original.value.apply(this,args);
    if(pending && !this.state.prompts.some(p=>p.result===undefined)) {
      pending.after=publicSide(this.state,seat);
      events.push(pending);
      pending=null;
    }
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:wrapped});
  let result;
  try {result=work();}
  finally {Object.defineProperty(Store.prototype,'dispatch',original);}
  return {result,events,pending:pending!==null};
}


/**
 * Observe printed attacker and defender board just before each genuine root
 * Store AttackAction. This observer does not inspect hidden hands or Prizes.
 *
 * @template T
 * @param {Function} Store
 * @param {()=>T} work
 * @returns {{result:T,attacks:object[]}}
 */
function withPublicAttackTargets(Store,work) {
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  let root=null;
  const attacks=[];
  const wrapped=function(...args) {
    const action=args[0];
    if(!root && action?.constructor?.name==='AddPlayerAction') root=this;
    if(this===root && action?.constructor?.name==='AttackAction' &&
        this.state.players.length===2) {
      const state=this.state;
      const seat=state.activePlayer;
      const attacker=state.players[seat].active.getPokemonCard();
      const defender=state.players[1-seat].active.getPokemonCard();
      attacks.push({
        turn:state.turn,seat,announcedAttack:action.name,
        attacker:attacker?.name??null,
        defender:defender?.name??null,
        defenderCurrentDamage:state.players[1-seat].active.damage,
        defenderPrintedHP:defender?.hp??null,
        opponentActiveBoard:publicSide(state,1-seat)
      });
    }
    return original.value.apply(this,args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:wrapped});
  let result;
  try{result=work();}
  finally{Object.defineProperty(Store.prototype,'dispatch',original);}
  return {result,attacks};
}

module.exports={publicPokemon,publicSide,withAcerolaPublicObserver,
  withPublicAttackTargets};
