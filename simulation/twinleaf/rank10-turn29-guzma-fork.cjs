'use strict';
const assert=require('node:assert/strict');
/** @param {Function} Store @param {Function} Bot @param {Function} PlayCardAction @param {()=>any} work @param {boolean} forced */
function withGuzmaFork(Store,Bot,PlayCardAction,work,forced){
  const ds=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const da=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof ds.value,'function');
  assert.equal(typeof da.value,'function');
  let root=null,ordinal=0,activated=false;
  const actions=[];
  const dispatch=function(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)ordinal++;
    return ds.value.call(this,action,...args);
  };
  const decode=function(state,...args){
    if(!activated&&state===root?.state&&ordinal===231&&state.turn===29&&state.activePlayer===0){
      const player=state.players[0];
      if(this.client?.id===player.id){
        const proposal=da.value.call(this,state,...args);
        assert.equal(proposal?.constructor?.name,'RetreatAction');
        const handIndex=player.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
        assert.ok(handIndex>=0);
        activated=true;
        actions.push({ordinal,original:proposal.constructor.name,heldGuzma:true,forced});
        if(forced)return new PlayCardAction(player.id,handIndex,{player:0,slot:1,index:0});
        return proposal;
      }
    }
    return da.value.call(this,state,...args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...ds,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...da,value:decode});
  try{return {result:work(),activated,actions};}
  finally{
    Object.defineProperty(Bot.prototype,'decodeNextAction',da);
    Object.defineProperty(Store.prototype,'dispatch',ds);
  }
}
module.exports={withGuzmaFork};
