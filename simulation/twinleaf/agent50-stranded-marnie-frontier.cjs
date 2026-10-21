'use strict';

const assert=require('node:assert/strict');

const VERSION='agent50-public-stranded-marnie-last-chance-v1';

/**
 * Source-independent, actor-only last-chance draw proposal.
 * Call after the normal root planner has exhausted attacks, attachments,
 * evolution, retreat and other meaningful actions. The real native Store
 * still determines whether playing the Supporter is legal and what it draws.
 * This chooses a card from the owner's hand, never hidden deck/Prize cards.
 *
 * @param {object} view Detached actorObservation at a real owner root.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseStrandedMarnie(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const turn=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||
      own.active.energies.length!==0||
      !own.bench.some(pokemon=>pokemon&&pokemon.energies.length>0)||
      turn.supporterPlayedTurn===view.globalTurn||
      turn.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true||
      view.ownHand.length>5||
      own.deckCount===0)return null;
  const handIndex=view.ownHand.indexOf('Marnie SSH');
  return handIndex<0?null:{
    kind:'play-stranded-marnie',handIndex,printing:view.ownHand[handIndex]
  };
}

module.exports={VERSION,chooseStrandedMarnie};
