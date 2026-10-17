'use strict';
const assert=require('node:assert/strict');

/** Observe a player's own hand at a real turn decision. Never pass this to a policy. */
function ownHandSnapshot(state,seat,enums){
 const player=state.players[seat];
 const cards=player.hand.cards.map(c=>({
   printing:c.fullName,
   category:c.superType===enums.SuperType.ENERGY?'Energy':
     c.superType===enums.SuperType.POKEMON?'Pokemon':
     c.superType===enums.SuperType.TRAINER?
       'Trainer-'+Object.keys(enums.TrainerType).find(k=>enums.TrainerType[k]===c.trainerType):'Other'
 }));
 return {turn:state.turn,seat,ownHand:cards,
   energyPlayedTurn:player.energyPlayedTurn,
   supporterTurn:player.supporterTurn,
   energyInHand:cards.filter(c=>c.category==='Energy').length,
   supportersInHand:cards.filter(c=>c.category==='Trainer-SUPPORTER').length};
}

/** Temporary observer around the exact live-source opponent Retreat, root 231. */
function withTurn29OwnHandAudit(Store,work,enums){
 const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 assert.equal(typeof original?.value,'function');
 const ordinals=new Map(),observations=[];
 const dispatch=function(action,...args){
  const name=action?.constructor?.name;
  if(name==='AddPlayerAction'&&!ordinals.has(this))ordinals.set(this,0);
  if(ordinals.has(this)){
   const ordinal=ordinals.get(this);
   if(ordinal===231&&this.state.turn===29&&
     this.state.activePlayer===0&&name==='RetreatAction'){
    observations.push({ordinal,action:name,
      ownHand:ownHandSnapshot(this.state,0,enums),
      zoneDigest:enums.digest(this.state)});
   }
   ordinals.set(this,ordinal+1);
  }
  return original.value.call(this,action,...args);
 };
 Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
 try{return {result:work(),observations};}
 finally{Object.defineProperty(Store.prototype,'dispatch',original);}
}
module.exports={ownHandSnapshot,withTurn29OwnHandAudit};
