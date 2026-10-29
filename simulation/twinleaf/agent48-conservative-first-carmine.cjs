'use strict';

const assert=require('node:assert/strict');

const VERSION='agent48-conservative-first-carmine-v1';
const CARMINE='Carmine TWM';

/**
 * Conservative one-use source-owner first-turn draw opportunity. Carmine's
 * printed exception permits a Supporter when going first on the first turn.
 * We protect every non-Carmine hand card from the discard-all cost. Duplicate
 * Carmine copies are strategically redundant after the Supporter quota is
 * consumed. This narrow model deliberately leaves many useful Carmine plays
 * unmodeled until discard affordability is measured.
 *
 * @param {object} view Deep-frozen detached actorObservation.
 * @returns {{kind:'play-carmine-first',handIndex:number,
 *   printing:string,discardedDuplicateCarmines:number}|null}
 */
function chooseConservativeFirstCarmine(view){
  assert.equal(view?.decisionKind,'owner-root');
  if(view.globalTurn!==1)return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||!Array.isArray(view.ownHand))return null;
  if(r?.supporterPlayedTurn!==0||
     r?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     own.resolvingSupporter?.length>0)return null;
  // The actual Store enforces card-specific timing and all overriding locks.
  if(!Number.isInteger(own.deckCount)||own.deckCount<5)return null;
  const idx=view.ownHand.indexOf(CARMINE);
  if(idx<0)return null;
  const rest=view.ownHand.filter((_,i)=>i!==idx);
  if(rest.some(printing=>printing!==CARMINE))return null;
  return {kind:'play-carmine-first',handIndex:idx,printing:CARMINE,
    discardedDuplicateCarmines:rest.length};
}

module.exports={VERSION,CARMINE,chooseConservativeFirstCarmine};
