'use strict';
const path=require('node:path');
/**
 * Experimental policy-only sample of deck order for hypothetical actions.
 * Does not preserve known top-deck information, infer unknown Prizes, or hide
 * opponent hands. Never treat its outcomes as competitive win estimates.
 * @param {()=>number} [rng] Speculative independent random stream.
 */
function installHypotheticalDeckOrderSampler(rng=()=>Math.random()){
 const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const {SimpleTactic}=require(path.join(root,'simple-bot/simple-tactics/simple-tactics'));
 const before=SimpleTactic.prototype.evaluateAction;
 SimpleTactic.prototype.evaluateAction=function(state,...args){
  const saved=state.players.map(p=>({p,order:p.deck.cards.slice()}));
  try{
   for(const {p,order} of saved){
    const sampled=order.slice().sort((a,b)=>a.fullName.localeCompare(b.fullName)||a.id-b.id);
    for(let i=sampled.length-1;i>0;i--){
     const j=Math.floor(rng()*(i+1));
     [sampled[i],sampled[j]]=[sampled[j],sampled[i]];
    }
    p.deck.cards.splice(0,p.deck.cards.length,...sampled);
   }
   return before.call(this,state,...args);
  }finally{
   for(const {p,order} of saved)p.deck.cards.splice(0,p.deck.cards.length,...order);
  }
 };
 return ()=>{SimpleTactic.prototype.evaluateAction=before;};
}
module.exports={installHypotheticalDeckOrderSampler};
