'use strict';
const assert=require('node:assert/strict');
const VERSION='agent33-tropical-beach-owner-lastchance-v2-held-stadium';

/**
 * Owner-visible optional Stadium use before an otherwise unsupported Pass.
 * The native Store retains final legality authority. This only acts after
 * the root policy has declined payable attacks and every enabled play.
 * @param {object} view Detached authenticated owner-root observation.
 * @returns {object|null} Native-neutral, end-turn Stadium intent.
 */
function chooseTropicalBeachLastChance(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(!own.active)return null;
  if(!Number.isSafeInteger(r.stadiumUsedTurn)||
     r.stadiumUsedTurn>=view.globalTurn)return null;
  if(!Number.isSafeInteger(own.deckCount)||own.deckCount<0)return null;
  const beachInPlay=stadium.some(s=>s.startsWith('Tropical Beach '));
  const handIndex=beachInPlay?-1:
    view.ownHand.findIndex(s=>s.startsWith('Tropical Beach '));
  // Deliberately do not replace a Stadium: Sky Field Bench expansion,
  // Chaotic Swell protection and opposing locks require further modeling.
  const placeFromHand=!beachInPlay&&stadium.length===0&&handIndex>=0&&
    r.stadiumPlayLocked===false&&
    Number.isSafeInteger(r.stadiumPlayedTurn)&&
    r.stadiumPlayedTurn<view.globalTurn;
  if(!beachInPlay&&!placeFromHand)return null;
  const handSize=view.ownHand.length-(placeFromHand?1:0);
  const draw=Math.min(7-handSize,own.deckCount);
  // This is a defensive last-chance policy for control decks: conserve enough
  // deck to withstand at least one additional turn cycle after taking cards.
  if(draw<2||own.deckCount-draw<6)return null;
  if(placeFromHand)return {kind:'play-tropical-beach',
    printing:view.ownHand[handIndex],handIndex,
    reason:'place-uncontested-stadium-before-lastchance-draw'};
  return {kind:'use-tropical-beach',cardsToDraw:draw,
    reason:'otherwise-pass-draw-before-ending-turn'};
}
module.exports={VERSION,chooseTropicalBeachLastChance};
