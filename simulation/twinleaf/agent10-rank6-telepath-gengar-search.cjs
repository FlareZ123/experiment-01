'use strict';
const assert=require('node:assert/strict');

const GENGAR='Gengar & Mimikyu-GX TEU';
const MEWTWO='Mewtwo & Mew-GX UNM';

/**
 * Select already owner-visible exact physical deck instances only during
 * the actual owner's pending source-deck search. This is a scripted historical
 * tactical fork, not a general information-safe player.
 *
 * @param {object} pending Actual ChooseCardsPrompt whose cards===owner.deck.
 * @param {object} state Genuine Store State.
 * @returns {object[]} Original native source card instances.
 */
function chooseGengarFirst(pending,state){
  const gengar=pending.cards.cards.find(card=>card.fullName===GENGAR);
  if(!gengar)return [];
  const mewtwo=pending.cards.cards.find(card=>card.fullName===MEWTWO);
  if(mewtwo&&pending.validate([gengar,mewtwo],state))
    return [gengar,mewtwo];
  if(pending.validate([gengar],state))return [gengar];
  return [];
}

/**
 * One genuine t3 owner Telepathic Psychic search redirection. Intercepts
 * exactly one native owner prompt after authentic Store dispatch; no hidden
 * source cards or pre-search owner deck are read. The chosen search card
 * instances are validated by the actual pending Store prompt.
 *
 * @template T
 * @param {{Store:Function,SimpleTacticsAi:Function,ResolvePromptAction:Function,GamePhase:object}} deps
 * @param {()=>T} execute Synchronous original canonical-source game.
 * @param {{seat:0|1,turn:number}} scope
 * @returns {{result:T,audit:object}}
 */
function withRank6GengarK1Search(deps,execute,scope){
  assert.equal(typeof execute,'function');
  assert.ok(scope.seat===0||scope.seat===1);
  assert.ok(Number.isSafeInteger(scope.turn)&&scope.turn>0);
  const {Store,SimpleTacticsAi,ResolvePromptAction,GamePhase}=deps;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const initial=SimpleTacticsAi.prototype.decodeNextAction;
  assert.equal(typeof descriptor?.value,'function');
  assert.equal(typeof initial,'function');
  const events=[];
  let realStore=null,applied=false,seenActualOwnerPrompt=0;

  function dispatch(action){
    if(!realStore&&action?.constructor?.name==='AddPlayerAction')
      realStore=this;
    return descriptor.value.call(this,action);
  }

  function decoder(state){
    const owner=state.players?.[scope.seat];
    const pending=state.prompts?.filter(p=>p.result===undefined)??[];
    if(!applied&&realStore?.state===state &&
      state.turn===scope.turn&&state.activePlayer===scope.seat &&
      state.phase===GamePhase.PLAYER_TURN &&
      owner?.id===this.client?.id && pending.length===1 &&
      pending[0].constructor?.name==='ChooseCardsPrompt' &&
      pending[0].playerId===owner.id &&
      pending[0].cards===owner.deck &&
      owner.active.getPokemonCard()?.name==='Latias ex' &&
      owner.active.energies.cards.some(c=>
        c.name==='Telepathic Psychic Energy')){
      seenActualOwnerPrompt++;
      const picked=chooseGengarFirst(pending[0],state);
      events.push({
        turn:state.turn,seat:scope.seat,kind:'genuine-owner-K1-search',
        liveStoreIdentical:true,ownerPromptValidated:picked.length>0,
        picked:picked.map(c=>c.fullName),
        eligibleGengarCards:pending[0].cards.cards.filter(c=>
          c.fullName===GENGAR).length,
        eligibleMewtwoCards:pending[0].cards.cards.filter(c=>
          c.fullName===MEWTWO).length,
        readsPreSearchOwnerDeck:false,readsOpponentConcealed:false
      });
      // One authorized prompt only; never move any card outside Store.
      applied=true;
      if(picked.length)return new ResolvePromptAction(pending[0].id,picked);
    }
    return initial.call(this,state);
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:dispatch});
  SimpleTacticsAi.prototype.decodeNextAction=decoder;
  try{
    const result=execute();
    return {result,audit:{
      schema:'agent10-rank6-owner-t3-telepath-gengar-K1-fork-v1',
      exactHistoricalTurn:scope.turn,candidateSeat:scope.seat,
      seenActualOwnerPrompt,applied,events,
      usesOnlyAuthenticatedOwnerDeckPrompt:true,
      policyImprovementCertified:false,competitiveGameQualified:false
    }};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoder,
      'Another nested bot hook was not restored');
    assert.strictEqual(Store.prototype.dispatch,dispatch,
      'Another nested Store hook was not restored');
    SimpleTacticsAi.prototype.decodeNextAction=initial;
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={GENGAR,MEWTWO,chooseGengarFirst,withRank6GengarK1Search};
