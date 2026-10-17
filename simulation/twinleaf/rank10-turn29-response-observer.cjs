'use strict';
const assert=require('node:assert/strict');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');
/** @param {object} slot @returns {object} */
function publicPokemon(slot) {
  const card=slot.getPokemonCard();
  return {name:card?.fullName??null,
    printedAttacks:(card?.attacks??[]).map(a=>({name:a.name,cost:a.cost,damage:a.damage})),
    energies:slot.energies.cards.map(c=>c.fullName),
    tools:slot.tools.cards.map(c=>c.fullName),damage:slot.damage};
}
/** @param {object} state @returns {object} */
function publicResponseBoard(state) {
  return {turn:state.turn,activeSeat:state.activePlayer,
    stadiums:state.players.map(p=>p.stadium.cards.map(c=>c.fullName)),
    players:state.players.map((p,seat)=>({seat,id:p.id,
      active:publicPokemon(p.active),
      bench:p.bench.map(publicPokemon).filter(x=>x.name!==null),
      handSize:p.hand.cards.length,deckSize:p.deck.cards.length,
      prizesRemaining:p.prizes.length,usedGX:p.usedGX===true,
      usedVSTAR:p.usedVSTAR===true,retreatedTurn:p.retreatedTurn,
      energyPlayedTurn:p.energyPlayedTurn}))};
}
/**
 * Observe live Regidrago turn29 source actions only. Return public board
 * projections and a digest of complete source zones, never hidden identities.
 * @template T
 * @param {Function} Store
 * @param {()=>T} work
 * @param {{zoneDigest?:(state:object)=>string}} [options]
 * @returns {{result:T,events:object[],rootDispatchCount:number}}
 */
function withTurn29ResponseObserver(Store,work,options={}) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const digest=options.zoneDigest??(s=>zoneSnapshotDigest(sourceZoneSnapshot(s)));
  let root=null,ordinal=0;
  const events=[];
  const wrapped=function(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root){
      const kind=action?.constructor?.name;
      if(this.state.turn===29&&this.state.activePlayer===0&&
         ['RetreatAction','PassTurnAction','AttackAction'].includes(kind)){
        events.push({ordinal,action:kind,board:publicResponseBoard(this.state),
          sourceZoneSha256:digest(this.state)});
      }
      ordinal++;
    }
    return descriptor.value.call(this,action,...args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:wrapped});
  try {return {result:work(),events,rootDispatchCount:ordinal};}
  finally {Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}
module.exports={publicPokemon,publicResponseBoard,withTurn29ResponseObserver};
