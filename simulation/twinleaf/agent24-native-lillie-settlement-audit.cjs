'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent24-native-lillie-prompt-settlement-v1';
const PRINTING="Lillie's Determination M1L";

/** Read-only, physically rooted Supporter shuffle/draw receipt. Never changes
 * actions, card order, prompt decisions or the owner's private hand. All
 * submitted output contains card counts and public printing only.
 * @template T
 * @param {()=>T} execute Genuine synchronous Store game(s).
 * @param {{Store?:Function}} [deps] Native Store or a controlled test seam.
 * @returns {{result:T,audit:object}}
 */
function withNativeLillieDrawSettlementAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let liveStore=null,pending=null;
  const events=[];
  const kind=action=>action?.constructor?.name;
  const owner=(store,id)=>store.state?.players?.find(p=>p.id===id);
  function snapshot(store,id){
    const p=owner(store,id);
    if(!p)return null;
    return {hand:p.hand.cards.length,deck:p.deck.cards.length,
      supporterQuota:p.supporterTurn,
      prizes:p.prizes.filter(slot=>slot.cards.length>0).length,
      unresolvedPrompts:store.state.prompts.filter(q=>q.result===undefined).length,
      turn:store.state.turn,cardInHand:p.hand.cards.some(c=>c.fullName===PRINTING)};
  }
  function checkPending(store){
    if(!pending||pending.store!==store)return;
    const {event,id,card}=pending;
    const state=store.state,p=owner(store,id);
    if(!p)return;
    const after=snapshot(store,id);
    event.lastObserved=after;
    if(after.unresolvedPrompts>0)return;
    const consumed=p.hand.cards.includes(card)===false;
    const quota=after.supporterQuota>event.before.supporterQuota;
    const expectedDraw=Math.min(event.before.prizes===6?8:6,
      event.before.deck+event.before.hand-1);
    const expectedHand=expectedDraw;
    const expectedDeck=event.before.deck+event.before.hand-1-expectedDraw;
    event.expected={hand:expectedHand,deck:expectedDeck};
    event.promptChainEndedOnOriginalTurn=after.turn===event.before.turn;
    event.printedDrawPostcondition=event.promptChainEndedOnOriginalTurn&&
      consumed&&quota&&after.hand===expectedHand&&after.deck===expectedDeck;
    event.completion='prompt-chain-resolved';
    pending=null;
  }
  function observed(action,...args){
    if(kind(action)==='AddPlayerAction'&&this!==liveStore){
      if(pending){pending.event.completion='new-game-before-resolution';pending=null;}
      liveStore=this;
    }
    const live=this===liveStore;
    let chosen=null;
    if(live&&kind(action)==='PlayCardAction'){
      const id=action.id,p=owner(this,id);
      const card=p?.hand?.cards?.[action.handIndex];
      if(card?.fullName===PRINTING){
        chosen={store:this,id,card,event:{schema:VERSION,id,seat:this.state.players.indexOf(p),
          printing:PRINTING,before:snapshot(this,id),dispatchOutcome:null,
          completion:'pending',printedDrawPostcondition:false}};
        events.push(chosen.event);
      }
    }
    try{
      const result=prior.value.apply(this,[action,...args]);
      if(chosen){
        chosen.event.dispatchOutcome='returned';
        pending=chosen;
      }
      if(live)checkPending(this);
      return result;
    }catch(error){
      if(chosen){chosen.event.dispatchOutcome='threw';
        chosen.event.completion='native-rejected';
        chosen.event.error=String(error?.message??error);}
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:observed});
  try{
    const result=execute();
    return {result,audit:{schema:VERSION,readOnly:true,
      supportRoots:events.length,
      returned:events.filter(x=>x.dispatchOutcome==='returned').length,
      printedDrawConfirmed:events.filter(x=>x.printedDrawPostcondition).length,
      unresolved:events.filter(x=>x.completion==='pending').length,
      events:events.slice(0,16),
      competitiveQualified:false,
      interpretation:'Native same-turn shuffle/draw counts and quota are checked after all prompts; tactical value and opponent competence remain unmeasured'}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={VERSION,PRINTING,withNativeLillieDrawSettlementAudit};
