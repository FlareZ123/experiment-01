'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-recovered-professor-physical-seven-draw-witness-v1';
const RESEARCH_PREFIX="Professor's Research ";

/**
 * Trusted post-selection auditor for one exact physical Supporter draw.
 *
 * Private deck object references are captured only inside this observer and
 * never returned to a decision policy or serialized. Before is the actual
 * physical Store state immediately before a selected owner-only Supporter
 * PlayCardAction. The observer does not choose cards, invoke effects, inspect
 * an opponent's concealed zones, or alter the State.
 *
 * @param {object} state Native pre-dispatch State.
 * @param {0|1} seat Actual acting player.
 * @param {number} handIndex Real native PlayCardAction hand index.
 * @returns {{verify:(after:object)=>object}}
 */
function captureProfessorResearchPhysicalDraw(state,seat,handIndex){
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(handIndex)&&handIndex>=0);
  const owner=state.players[seat];
  assert.equal(state.activePlayer,seat);
  assert.equal(owner.hand.cards.length,1,
    'restricted receipt requires the lone physical Research');
  const physicalSupporter=owner.hand.cards[handIndex];
  assert.ok(typeof physicalSupporter?.fullName==='string'&&
    physicalSupporter.fullName.startsWith(RESEARCH_PREFIX));
  const priorDeck=owner.deck.cards;
  assert.ok(Array.isArray(priorDeck)&&priorDeck.length>=7);
  const priorPhysicalDeck=new Set(priorDeck);
  assert.equal(priorPhysicalDeck.size,priorDeck.length,
    'each deck card must have a distinct physical object identity');
  const originalDeckCount=priorDeck.length;
  const quotaBefore=owner.supporterTurn;
  const originalTurn=state.turn;

  function verify(after){
    const player=after.players[seat];
    const newlyHeld=player.hand.cards;
    const physicalDrawnExactlySeven=newlyHeld.length===7&&
      new Set(newlyHeld).size===7&&newlyHeld.every(card=>
        priorPhysicalDeck.has(card)&&!player.deck.cards.includes(card));
    const sourceCardResolved=
      !player.hand.cards.includes(physicalSupporter)&&
      (player.supporter.cards.includes(physicalSupporter)||
       player.discard.cards.includes(physicalSupporter));
    const deckCountConserved=player.deck.cards.length===
      originalDeckCount-7;
    const supporterQuotaSpent=player.supporterTurn===quotaBefore+1;
    const turnUnchanged=after.turn===originalTurn;
    return {
      version:VERSION,actorSeat:seat,
      valid:physicalDrawnExactlySeven&&sourceCardResolved&&
        deckCountConserved&&supporterQuotaSpent&&turnUnchanged,
      physicalDrawnExactlySeven,
      sourceCardResolved,deckCountConserved,
      supporterQuotaSpent,turnUnchanged,
      originalDeckCount,afterDeckCount:player.deck.cards.length,
      afterHandCount:newlyHeld.length,
      ownerPrivateDeckIdentitySerialized:false,
      nativeEffectCompleted:
        physicalDrawnExactlySeven&&deckCountConserved&&supporterQuotaSpent
    };
  }
  return {verify};
}

module.exports={VERSION,captureProfessorResearchPhysicalDraw};
