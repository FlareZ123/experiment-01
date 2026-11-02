'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent9-owner-vip-alternatives-readonly-accepted-store-v1';
const VIP='Battle VIP Pass FST';
const MSG='CHOOSE_CARD_TO_PUT_ONTO_BENCH';
const PRINTS=['Mew V FST','Genesect V FST','Crobat V DAA','Dedenne GX UNB'];

/**
 * Read-only physical owner-prompt audit. It observes exactly the original
 * native deck-search prompt opened for the owner after a Store-accepted VIP.
 * Neither actor decisions, original prompts, validation nor gameplay change.
 *
 * @template T
 * @param {()=>T} execute Synchronous existing pinned native workload.
 * @param {{Store?:object}} [deps] Pure fixture injection.
 * @returns {{result:T,audit:object}}
 */
function withOwnerVipAlternativesReceipt(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(root,'game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const knownStores=new WeakSet();
  const vipAwait=new WeakMap();
  let observedGames=0;
  const audit={version:VERSION,observerOnly:true,
    ownerDeckReadOnlyWhenNativeSearchOpened:true,
    nativeStoreGames:0,acceptedVipRoots:0,
    ownerVipDeckPromptsProposed:0,ownerVipDeckPromptsAccepted:0,
    ownerVipDeckPromptsRejected:0,rows:[],
    competitiveQualifiedGames:0};

  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&
      !knownStores.has(this)){
      knownStores.add(this);
      observedGames++;
      audit.nativeStoreGames=observedGames;
      vipAwait.set(this,new Map());
    }
    const isNativeGame=knownStores.has(this);
    const players=isNativeGame?this.state?.players??[]:[];
    const awaiting=isNativeGame?vipAwait.get(this):null;
    let attemptedVip=null,promptWitness=null;
    if(isNativeGame&&action?.constructor?.name==='PlayCardAction'){
      const seat=players.findIndex(p=>p.id===action.id);
      const player=players[seat];
      const candidate=player?.hand?.cards?.[action.handIndex];
      if(candidate?.fullName===VIP){
        attemptedVip={seat,playerId:player.id,turn:this.state.turn};
      }
    }
    if(isNativeGame&&action?.constructor?.name==='ResolvePromptAction'){
      const prompt=this.state.prompts?.find(p=>p.id===action.id&&
        p.result===undefined);
      const seat=players.findIndex(p=>p.id===prompt?.playerId);
      const owner=players[seat];
      const waiting=owner?awaiting.get(owner.id):null;
      if(prompt?.constructor?.name==='ChooseCardsPrompt'&&
        prompt.message===MSG&&prompt.cards===owner?.deck&&
        waiting?.turn===this.state.turn){
        const allowed=prompt.cards.cards.filter(card=>
          prompt.validate([card])===true);
        const selected=Array.isArray(action.result)?action.result:[];
        promptWitness={
          gameOrdinal:observedGames,turn:this.state.turn,seat,
          originalPromptId:prompt.id,
          selected: selected.map(c=>c.fullName),
          nativeChosenValid:prompt.validate(selected)===true,
          availableNamedPrintings:Object.fromEntries(PRINTS.map(n=>[
            n,allowed.filter(c=>c.fullName===n).length])),
          eligibleTotalBasics:allowed.length,
          deckBefore:owner.deck.cards.length,
          benchBefore:owner.bench.filter(b=>b.cards.length>0).length,
          nativeAccepted:false,benchPlacementConfirmed:false
        };
        audit.ownerVipDeckPromptsProposed++;
      }
    }
    try{
      const value=before.value.apply(this,[action,...rest]);
      if(attemptedVip){
        awaiting.set(attemptedVip.playerId,{turn:attemptedVip.turn});
        audit.acceptedVipRoots++;
      }
      if(promptWitness){
        const owner=players[promptWitness.seat];
        const nowBench=owner.bench.filter(b=>b.cards.length>0).length;
        const nowDeck=owner.deck.cards.length;
        promptWitness.nativeAccepted=true;
        promptWitness.deckAfter=nowDeck;
        promptWitness.benchAfter=nowBench;
        promptWitness.benchPlacementConfirmed=
          nowBench-promptWitness.benchBefore===promptWitness.selected.length&&
          promptWitness.deckBefore-nowDeck===promptWitness.selected.length;
        audit.ownerVipDeckPromptsAccepted++;
        audit.rows.push(promptWitness);
        awaiting.delete(owner.id);
      }
      return value;
    }catch(error){
      if(promptWitness){
        audit.ownerVipDeckPromptsRejected++;
        promptWitness.error=String(error?.message??error);
        audit.rows.push(promptWitness);
      }
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{
    const result=execute();
    return {result,audit};
  }catch(error){
    error.agent9VipOwnerAlternativesAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}
module.exports={VERSION,VIP,MSG,PRINTS,withOwnerVipAlternativesReceipt};
