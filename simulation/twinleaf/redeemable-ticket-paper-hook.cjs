'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));
let restoreActive=null;

/** @returns {() => void} Revert the pinned reducer. */
function installRedeemableTicketPaperOrderHook(){
  if(restoreActive)throw new Error('Ticket hook already installed');
  const {RedeemableTicket}=load('sets/10-scarlet-and-violet/set-journey-together/exchange-ticket');
  const {TrainerEffect}=load('game/store/effects/play-card-effects');
  const {MOVE_CARDS}=load('game/store/prefabs/prefabs');
  const before=RedeemableTicket.prototype.reduceEffect;
  RedeemableTicket.prototype.reduceEffect=function(store,state,effect){
    if(!(effect instanceof TrainerEffect)||effect.trainerCard!==this)
      return before.call(this,store,state,effect);
    const player=effect.player;
    const prizes=player.prizes.filter(p=>p.cards.length>0);
    const count=prizes.reduce((s,p)=>s+p.cards.length,0);
    if(count===0)return before.call(this,store,state,effect);
    MOVE_CARDS(store,state,player.hand,player.discard,{cards:[effect.trainerCard],sourceCard:this});
    const returned=prizes.flatMap(p=>p.cards);
    this.shuffleArray(returned);
    player.deck.cards.push(...returned);
    prizes.forEach(p=>{p.cards=[];});
    for(let i=0;i<count;i++){
      const card=player.deck.cards.shift();
      if(card){
        const prize=player.prizes.find(p=>p.cards.length===0);
        if(prize)prize.cards.push(card);
        else player.deck.cards.unshift(card);
      }
    }
    player.prizes.forEach(p=>{p.isSecret=true;});
    MOVE_CARDS(store,state,player.supporter,player.discard,{cards:[this],sourceCard:this});
    return state;
  };
  const patched=RedeemableTicket.prototype.reduceEffect;
  const restore=()=>{
    if(RedeemableTicket.prototype.reduceEffect!==patched)
      throw new Error('Ticket hook restoration order changed');
    RedeemableTicket.prototype.reduceEffect=before;
    restoreActive=null;
  };
  restoreActive=restore;
  return restore;
}
module.exports={installRedeemableTicketPaperOrderHook};
