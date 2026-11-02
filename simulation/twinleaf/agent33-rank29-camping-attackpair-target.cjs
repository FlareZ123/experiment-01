'use strict';
const assert = require('node:assert/strict');

const VERSION='agent33-original-rank29-gear-two-piece-prompt-v1';
const DCE='Double Colorless Energy SUM';
const THUNDER='Thunder Mountain Prism Star LOT';

/**
 * A native-neutral target preference for an authorized own-deck Camping Gear
 * ChooseCardsPrompt. All card membership inputs come from the real OWNER's
 * search prompt; own-hand and face-up board come from the actor's detached
 * observation at that same prompt. No presearch K0 information enters.
 *
 * This is a bounded tactical preference to complete the two-piece Thorns
 * attack line. It is deliberately not an independently qualified game policy.
 *
 * @param {object} view Authentic detached own-prompt actor observation.
 * @param {object[]} actualOwnerDeckCards Physical owner deck card objects.
 * @param {(physicalCards:object[])=>boolean} validate Real prompt validator.
 * @returns {object|null} Chosen card and owner-only rationale, if a missing
 *   piece is search-available; caller handles all other legal fallbacks.
 */
function chooseRank29TwoPieceCampingSearch(view,actualOwnerDeckCards,validate){
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.ok(Array.isArray(view.ownHand)&&
    Array.isArray(actualOwnerDeckCards));
  assert.equal(typeof validate,'function');
  const active=view.ownPublic?.active;
  if(!active||active.name!=='Iron Thorns ex')return null;
  const ownStadium=view.ownPublic.stadium??[];
  const opposingStadium=view.opponentPublic?.stadium??[];
  const energyReady=view.ownHand.includes(DCE)||
    (active.energies??[]).includes(DCE);
  const thunderReady=view.ownHand.includes(THUNDER)||
    [...ownStadium,...opposingStadium].includes(THUNDER);
  const priority=[
    ...(!energyReady?[DCE]:[]),
    ...(!thunderReady?[THUNDER]:[])
  ];
  for(const printing of priority){
    const physical=actualOwnerDeckCards.find(card=>
      card?.fullName===printing&&validate([card])===true);
    if(physical)return {
      printing,physical,
      reason:printing===DCE?'missing-iron-thorns-dce':
        'missing-iron-thorns-thunder',
      knownPubliclyReady:energyReady&&thunderReady,
      source:'owner-prompt-deck-and-owner-visible-public-state',
      competitiveQualified:false
    };
  }
  return null;
}

module.exports={VERSION,DCE,THUNDER,
  chooseRank29TwoPieceCampingSearch};
