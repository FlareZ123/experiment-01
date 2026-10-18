'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const mod=n=>require(path.join(root,n));

/** Source-specific one-action target fork; calls original decision first. */
function withHoodRedirect(run){
  const {SimpleTacticsAi}=mod('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=mod('game/store/actions/play-card-action');
  const {GamePhase}=mod('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let selected=null;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const proposal=original.call(this,state);
    const own=state.players.find(p=>p.id===this.client?.id);
    if(!selected&&own?.id===202&&state.turn===2&&state.activePlayer===1&&
       state.phase===GamePhase.PLAYER_TURN&&!state.prompts.some(p=>p.result===undefined)){
      const handIndex=own.hand.cards.findIndex(c=>c.name==='Stealthy Hood');
      const all=[{s:own.active,kind:SlotType.ACTIVE,index:0},
        ...own.bench.map((s,index)=>({s,kind:SlotType.BENCH,index}))];
      const v=all.find(x=>x.s.getPokemonCard()?.name==='Shadow Rider Calyrex V'
        &&x.s.tools.length===0);
      const opponent=state.players[0];
      const locked=[opponent.active,...opponent.bench].some(s=>
        s.getPokemonCard()?.name==='Garbodor'&&s.tools.length>0);
      if(handIndex>=0&&v&&locked){
        assert.equal(proposal.constructor.name,'PlayCardAction');
        const action=new PlayCardAction(own.id,handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:v.kind,index:v.index});
        assert.equal(this.isValidAction(state,action),true);
        selected={turn:2,target:v.s.getPokemonCard().fullName};
        return action;
      }
    }
    return proposal;
  };
  try{return {result:run(),selected};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}
module.exports={withHoodRedirect};
