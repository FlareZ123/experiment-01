'use strict';
const assert=require('node:assert/strict');
/** Source-only paired Wobbuffet versus Dialga retreat-target experiment. */
function withOnePrizeRetreat({Store,Bot,RetreatAction},work,force){
 const ds=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const db=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
 let root=null,ordinal=0,observation=null;
 const dispatch=function(action,...rest){
  if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
  if(this===root)ordinal++;
  return ds.value.call(this,action,...rest);
 };
 const decode=function(state,...rest){
  if(!observation&&state===root?.state&&ordinal===231&&
     state.turn===29&&state.activePlayer===0){
   const player=state.players[0];
   if(this.client?.id===player.id){
    const original=db.value.call(this,state,...rest);
    assert.equal(original?.constructor?.name,'RetreatAction');
    const bench=player.bench.map(s=>s.getPokemonCard()?.fullName??null);
    const index=bench.indexOf('Wobbuffet PHF');
    assert.ok(index>=0);
    assert.equal(bench[original.benchIndex],'Dialga-GX UPR');
    assert.equal(state.players[1].getPrizeLeft(),2);
    observation={ordinal,normal:bench[original.benchIndex],
      alternative:bench[index],normalIndex:original.benchIndex,
      alternateIndex:index,force};
    return force?new RetreatAction(player.id,index):original;
   }
  }
  return db.value.call(this,state,...rest);
 };
 Object.defineProperty(Store.prototype,'dispatch',{...ds,value:dispatch});
 Object.defineProperty(Bot.prototype,'decodeNextAction',{...db,value:decode});
 try{return {result:work(),observation};}
 finally{
  Object.defineProperty(Bot.prototype,'decodeNextAction',db);
  Object.defineProperty(Store.prototype,'dispatch',ds);
 }
}
module.exports={withOnePrizeRetreat};
