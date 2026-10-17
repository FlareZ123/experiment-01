'use strict';

const assert=require('node:assert/strict');

/**
 * Counterfactual at the original actual rank-1 bot's turn-three Acerola
 * proposal after a source-dealt rank-6 Volt Cyclone.
 *
 * The original bot is always evaluated first in both branches. Both branches
 * therefore consume the original choice's policy RNG draws before any
 * alternative action is dispatched. Only the first verified live Store
 * Acerola proposal may be replaced with PassTurnAction.
 *
 * @template T
 * @param {{Store:Function,Bot:Function,PassTurnAction:Function}} types
 * @param {()=>T} work
 * @param {{forcePass?:boolean}} [options]
 * @returns {{result:T,sourceChoices:object[],forced:boolean}}
 */
function withRank6AcerolaPassFork(types,work,options={}) {
  const {Store,Bot,PassTurnAction}=types;
  const dispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const decode=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof dispatch?.value,'function');
  assert.equal(typeof decode?.value,'function');
  let root=null,forced=false;
  const sourceChoices=[];
  const wrappedDispatch=function(...args) {
    if(!root && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return dispatch.value.apply(this,args);
  };
  const wrappedDecode=function(state,...args) {
    const proposal=decode.value.call(this,state,...args);
    if(state!==root?.state || state.turn!==3 || state.activePlayer!==0 ||
        this.client?.id!==state.players[0]?.id ||
        proposal?.constructor?.name!=='PlayCardAction') return proposal;
    const player=state.players[0];
    if(player.hand.cards[proposal.handIndex]?.name!=='Acerola') return proposal;
    assert.equal(player.active.getPokemonCard()?.name,
      'Shadow Rider Calyrex VMAX');
    assert.equal(player.active.damage,140);
    assert.equal(player.active.energies.cards.length,2);
    assert.equal(player.bench.filter(slot=>slot.getPokemonCard()).length,1);
    assert.equal(player.bench.find(slot=>slot.getPokemonCard())?
      .getPokemonCard()?.name,'Dialga-GX');
    sourceChoices.push({turn:state.turn,seat:state.activePlayer,
      proposal:'PlayCardAction',card:'Acerola',
      publicActive:player.active.getPokemonCard().name,
      publicDamage:player.active.damage,
      publicEnergyCardCount:player.active.energies.cards.length,
      selectedAction:options.forcePass===true?'PassTurnAction':'PlayCardAction'});
    if(options.forcePass===true) {
      assert.equal(forced,false,'Source Acerola counterfactual fired more than once');
      forced=true;
      return new PassTurnAction(player.id);
    }
    return proposal;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...dispatch,value:wrappedDispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...decode,value:wrappedDecode});
  let result;
  try{result=work();}
  finally{
    Object.defineProperty(Bot.prototype,'decodeNextAction',decode);
    Object.defineProperty(Store.prototype,'dispatch',dispatch);
  }
  return {result,sourceChoices,forced};
}

module.exports={withRank6AcerolaPassFork};
