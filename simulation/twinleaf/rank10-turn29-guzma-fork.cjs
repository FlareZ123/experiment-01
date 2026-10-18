'use strict';
const assert=require('node:assert/strict');
/**
 * Branch at the actual archived rank10 post-Shred Retreat, preserving the
 * original proposal and its policy RNG consumption in both arms.
 * @param {{Store:Function,Bot:Function,PlayCardAction:Function,
 * ResolvePromptAction:Function,PlayerType:object,SlotType:object}} types
 * @param {()=>any} work
 * @param {{forceGuzma:boolean}} options
 */
function withGuzmaFork(types,work,{forceGuzma}) {
  const {Store,Bot,PlayCardAction,ResolvePromptAction,PlayerType,SlotType}=types;
  const ds=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const da=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof ds?.value,'function');
  assert.equal(typeof da?.value,'function');
  let root=null,ordinal=0,stage='start';
  const actions=[];
  const dispatch=function(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)ordinal++;
    return ds.value.call(this,action,...args);
  };
  const decode=function(state,...args){
    const live=state===root?.state&&state.turn===29&&state.activePlayer===0;
    const player=live?state.players[0]:null;
    if(!player||this.client?.id!==player.id)
      return da.value.call(this,state,...args);
    const pending=state.prompts.find(p=>
      p.playerId===player.id&&p.result===undefined);
    if(stage==='start'&&ordinal===231&&!pending){
      const before=player.hand.cards.map(c=>c.fullName);
      const proposal=da.value.call(this,state,...args);
      assert.equal(proposal?.constructor?.name,'RetreatAction',
        'Source bot proposal changed at root231');
      assert.deepEqual(before.slice().sort(),[
        'Mysterious Treasure FLI','Budew ASC','Guzma BUS'].sort());
      const handIndex=player.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
      actions.push({ordinal,original:proposal.constructor.name,
        heldGuzma:true,forced:forceGuzma});
      if(!forceGuzma){stage='control';return proposal;}
      stage='pick-opponent';
      return new PlayCardAction(player.id,handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }
    if(stage==='pick-opponent'){
      assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
        'Expected real Guzma opponent selection');
      const eligible=state.players[1].bench.filter(s=>
        s.getPokemonCard()&&pending.validate([s],state));
      assert.ok(eligible.length>0,'No legal opponent Bench target');
      const target=eligible.find(s=>
        s.getPokemonCard().name.includes('Shadow Rider'))??eligible[0];
      actions.push({choice:'opponent',pokemon:target.getPokemonCard().fullName});
      stage='pick-own';
      return new ResolvePromptAction(pending.id,[target]);
    }
    if(stage==='pick-own'){
      assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
        'Expected real Guzma own selection');
      const eligible=player.bench.filter(s=>
        s.getPokemonCard()&&pending.validate([s],state));
      assert.ok(eligible.length>0,'No legal own Bench switch');
      const target=eligible.find(s=>
        s.getPokemonCard().fullName==='Regidrago VSTAR SIT')??eligible[0];
      actions.push({choice:'own',pokemon:target.getPokemonCard().fullName});
      stage='done';
      return new ResolvePromptAction(pending.id,[target]);
    }
    return da.value.call(this,state,...args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...ds,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...da,value:decode});
  try{return {result:work(),stage,actions};}
  finally{
    Object.defineProperty(Bot.prototype,'decodeNextAction',da);
    Object.defineProperty(Store.prototype,'dispatch',ds);
  }
}
module.exports={withGuzmaFork};
