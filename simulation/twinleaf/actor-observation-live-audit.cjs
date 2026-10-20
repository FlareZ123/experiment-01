'use strict';
const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {createHash}=require('node:crypto');
const {actorObservation}=require('./actor-observation-contract.cjs');

/**
 * A structural replica in which face-down card arrays expose their length
 * and no card objects. The source State is left unchanged.
 * @param {object} state
 * @param {0|1} seat
 * @returns {object}
 */
function obscureHiddenIdentities(state,seat){
  const countOnly=cards=>Object.freeze({length:cards.length});
  const masked=state.players.map((player,index)=>{
    const next=Object.create(player);
    const deck=Object.create(player.deck);
    deck.cards=countOnly(player.deck.cards);
    next.deck=deck;
    next.prizes=player.prizes.map(prize=>({
      cards:countOnly(prize.cards)
    }));
    if(index!==seat){
      const hand=Object.create(player.hand);
      hand.cards=countOnly(player.hand.cards);
      next.hand=hand;
    }
    return next;
  });
  const prompts=(state.prompts??[]).map(prompt=>{
    const owner=state.players.findIndex(p=>p.id===prompt.playerId);
    if(owner<0||prompt.cards!==state.players[owner].deck)return prompt;
    const maskedPrompt=Object.create(prompt);
    maskedPrompt.cards=masked[owner].deck;
    return maskedPrompt;
  });
  const shadow=Object.create(state);
  shadow.players=masked;
  shadow.prompts=prompts;
  return shadow;
}

/**
 * Observe only real Store.dispatch roots. Full native game decisions are
 * unchanged. Genuine Store identity starts at its first AddPlayerAction.
 * @template T
 * @param {Function} Store
 * @param {()=>T} run
 * @returns {{result:T,audit:object}}
 */
function withActualStoreActorObservation(Store,run){
  assert.equal(typeof run,'function');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let live=null,games=0,dispatches=0,observed=0,prompts=0;
  const samples=[];
  function observedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==live){
      live=this;
      games++;
    }
    if(this===live){
      dispatches++;
      const state=this.state;
      if(state?.players?.length===2){
        const prompt=state.prompts.find(p=>p.result===undefined);
        const seat=prompt?state.players.findIndex(p=>
          p.id===prompt.playerId):state.activePlayer;
        if(seat===0||seat===1){
          const actual=actorObservation(state,seat);
          const masked=actorObservation(obscureHiddenIdentities(state,seat),seat);
          assert.ok(isDeepStrictEqual(actual,masked),
            'Changing face-down identities altered actor-only observation');
          observed++;
          if(prompt)prompts++;
          if(samples.length<24)samples.push({
            game:games,dispatch:dispatches,turn:actual.globalTurn,seat,
            kind:actual.decisionKind,prompt:actual.pendingPromptType,
            ownDeckSearch:actual.pendingOwnerDeckSearch,
            ownerHandCount:actual.ownHand.length,
            opponentHandCount:actual.opponentPublic.handCount,
            viewSha256:createHash('sha256').update(
              JSON.stringify(actual)).digest('hex')
          });
        }
      }
    }
    return descriptor.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:observedDispatch
  });
  try{
    const result=run();
    return {result,audit:{
      version:'actor-observation-live-source-concealment-v1',
      games,actualRootDispatches:dispatches,
      observedActorDecisions:observed,ownerPrompts:prompts,
      allShadowParityChecksPassed:true,samples,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={obscureHiddenIdentities,withActualStoreActorObservation};
