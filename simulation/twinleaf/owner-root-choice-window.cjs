'use strict';

const assert=require('node:assert/strict');

/** @param {object|null} value One selected native prompt object. */
function choiceName(value){
  if(value===null||value===undefined)return null;
  if(typeof value==='string')return value;
  if(typeof value==='number')return null;
  if(typeof value==='object'){
    if(typeof value.fullName==='string')return value.fullName;
    if(typeof value.name==='string')return value.name;
    if(typeof value.getPokemonCard==='function'){
      return value.getPokemonCard()?.fullName||null;
    }
  }
  return null;
}

/** @param {object} player Observed owner. */
function publicOwnPokemon(player){
  return {
    active:player.active.getPokemonCard()?.fullName||null,
    bench:player.bench.map(s=>s.getPokemonCard()?.fullName||null)
  };
}

/**
 * Read-only bounded successful-root observer of an owner's own choices.
 * Capture chosen native prompt response and the public board before and
 * after each genuine Store.dispatch. The owner may inspect an active
 * own-deck ChooseCardsPrompt, but this collector never enumerates unseen
 * deck contents or Prize positions. Speculative Stores are excluded by
 * exact root Store identity, established on the first AddPlayerAction.
 *
 * @template T
 * @param {Function} Store The pinned Store constructor.
 * @param {0|1} ownerSeat Physical observed actor seat.
 * @param {()=>T} execute A complete synchronous source-dealt run.
 * @param {{turnStart:number,turnEnd:number}} window Inclusive turn scope.
 * @returns {{result:T,trace:object[],rootActionCount:number}}
 */
function withOwnerRootChoiceWindow(Store,ownerSeat,execute,window){
  assert.ok(ownerSeat===0||ownerSeat===1);
  assert.equal(typeof execute,'function');
  assert.ok(Number.isInteger(window.turnStart));
  assert.ok(Number.isInteger(window.turnEnd));
  assert.ok(window.turnEnd>=window.turnStart);
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root=null,rootActions=0;
  const trace=[];
  function observe(action,...args){
    const type=action?.constructor?.name||'UnknownAction';
    if(root===null&&type==='AddPlayerAction')root=this;
    const isRoot=this===root;
    const prior=this.state;
    const capture=isRoot&&prior?.players?.length===2&&
      prior.turn>=window.turnStart&&prior.turn<=window.turnEnd;
    const player=capture?prior.players[ownerSeat]:null;
    const before=player?publicOwnPokemon(player):null;
    const pending=capture?prior.prompts.find(p=>p.result===undefined):null;
    const sourceCard=capture&&type==='PlayCardAction'?
      player.hand.cards[action.handIndex]?.fullName||null:null;
    const selection=capture&&type==='ResolvePromptAction'?
      (Array.isArray(action.result)?action.result:[action.result])
        .map(choiceName).filter(Boolean).slice(0,12):[];
    const beforeTurn=prior?.turn;
    const result=descriptor.value.call(this,action,...args);
    if(isRoot)rootActions++;
    if(capture&&trace.length<100) {
      const afterPlayer=this.state.players[ownerSeat];
      trace.push({
        rootOrdinal:rootActions,turnBefore:beforeTurn,
        turnAfter:this.state.turn,action:type,
        sourceCard,previousPrompt:pending?.constructor?.name||null,
        promptWasOwnDeck:pending?.cards===player.deck,
        selectedPrintedCards:selection,
        before,after:publicOwnPokemon(afterPlayer)
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:observe});
  try{
    const result=execute();
    return {result,trace,rootActionCount:rootActions};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={choiceName,publicOwnPokemon,withOwnerRootChoiceWindow};
