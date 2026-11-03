'use strict';
const assert=require('node:assert/strict');
const LETTER="Professor's Letter BKT";
const DARK='Darkness Energy MEE';

/**
 * Propose a source-owned first global turn Item only when the original
 * registered 60 and visible zones guarantee two unprized target Energy.
 * This is a pure K0-safe option, never a certified native action.
 * @param {object} view Detached owner actorObservation.
 * @param {{darknessCopies:number,letterCopies:number}} knownOwnSixty
 * @returns {{kind:string,printing:string,handIndex:number}|null}
 */
function chooseRank11Letter(view,knownOwnSixty){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(knownOwnSixty&&Number.isSafeInteger(knownOwnSixty.darknessCopies));
  assert.ok(Number.isSafeInteger(knownOwnSixty.letterCopies));
  const owner=view.ownPublic,resources=view.ownTurnResources;
  if(view.globalTurn!==1||!owner?.active||owner.deckCount<2||
    owner.prizeCount>6||
    resources?.itemPlayLocked===true||
    owner.publicTurnRestrictions?.itemPlayLocked===true||
    knownOwnSixty.darknessCopies<owner.prizeCount+2||
    knownOwnSixty.letterCopies<1)return null;
  const hand=view.ownHand;
  const index=hand.indexOf(LETTER);
  if(index<0||hand.includes(DARK))return null;
  const other=[...(owner.discard??[]),...(owner.lostZone??[]),
    ...(owner.active.energies??[]),
    ...(owner.bench??[]).flatMap(slot=>slot?.energies??[])];
  if(other.includes(DARK))return null;
  return {kind:'play-professors-letter',printing:LETTER,handIndex:index};
}
module.exports={LETTER,DARK,chooseRank11Letter};
