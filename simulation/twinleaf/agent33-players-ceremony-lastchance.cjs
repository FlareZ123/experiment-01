'use strict';
const assert=require('node:assert/strict');
const VERSION='agent33-player-ceremony-owner-lastchance-v1';

/**
 * Optional native Player's Ceremony SP127 draw-two end-turn, never changing
 * any frozen Beach experiment. This Japanese promo requires the separately
 * verified research-native hook before any actual game can execute.
 * @param {object} view Authenticated detached actor-root observation.
 * @returns {object|null}
 */
function choosePlayersCeremonyLastChance(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own.active)return null;
  if(!Number.isSafeInteger(own.deckCount)||own.deckCount<8)return null;
  if(!Number.isSafeInteger(r.stadiumUsedTurn)||
     r.stadiumUsedTurn>=view.globalTurn)return null;
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const inPlay=stadium.some(p=>p.startsWith("Player's Ceremony "));
  if(inPlay){
    if(view.ownHand.length>5)return null;
    return {kind:'use-players-ceremony',cardsToDraw:2,
      reason:'otherwise-pass-ceremony-draw-two'};
  }
  if(stadium.length>0)return null;
  const handIndex=view.ownHand.findIndex(p=>
    p.startsWith("Player's Ceremony "));
  if(handIndex<0||r.stadiumPlayLocked!==false||
     !Number.isSafeInteger(r.stadiumPlayedTurn)||
     r.stadiumPlayedTurn>=view.globalTurn)return null;
  if(view.ownHand.length-1>5)return null;
  return {kind:'play-players-ceremony',handIndex,
    printing:view.ownHand[handIndex],
    reason:'place-unused-ceremony-before-lastchance-draw'};
}
module.exports={VERSION,choosePlayersCeremonyLastChance};
