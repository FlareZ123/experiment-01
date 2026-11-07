'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-owner-vs-seeker-professor-draw-v1';
const SEEKER='VS Seeker PHF';
const PROFESSOR_PREFIX="Professor's Research ";

/**
 * Conservative exact-owner-hand two-step search and draw. No own unknown
 * deck or Prize identities, opponent hand contents, or speculative State.
 * This is only a root proposal: native Store acceptance, prompt selection,
 * physical movement and full draw effect require separate receipts.
 *
 * Restrict to a single card in hand to avoid discarding protected resources.
 * The completed Professor effect should then draw seven cards if enough deck
 * remains, but that is not certified at proposal time.
 *
 * @param {object} view Detached native actorObservation.
 * @returns {{kind:string,handIndex:number,printing:string,target:string}|null}
 */
function chooseOwnerSeekerResearchRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.discard)||
      !Array.isArray(view.ownHand)||view.ownHand.length!==1||
      !Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
      !Number.isSafeInteger(own.deckCount)||own.deckCount<7||
      resources?.supporterPlayedTurn!==0||
      resources?.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true||
      (own.resolvingSupporter??[]).length>0)return null;

  const only=view.ownHand[0];
  if(only.startsWith(PROFESSOR_PREFIX)){
    return {kind:'play-seeker-recovered-research',handIndex:0,
      printing:only,target:only};
  }
  if(only!==SEEKER||resources?.itemPlayLocked===true||
      own.publicTurnRestrictions?.itemPlayLocked===true)return null;
  const target=own.discard.filter(x=>typeof x==='string'&&
    x.startsWith(PROFESSOR_PREFIX)).sort()[0];
  return target?{kind:'play-seeker-get-research',handIndex:0,
    printing:SEEKER,target}:null;
}

module.exports={VERSION,SEEKER,PROFESSOR_PREFIX,
  chooseOwnerSeekerResearchRoot};
