'use strict';

const assert=require('node:assert/strict');
const VERSION='agent49-original-rank13-first-crispin-seeker-recovery-v1';
const SEEKER='VS Seeker PHF';
const CRISPIN='Crispin SCR';
const TREASURE='Mysterious Treasure FLI';

/**
 * Recover the specific first-turn Crispin that was just paid to Mysterious
 * Treasure, while VS Seeker is still available as an Item. The prompt is
 * resolved separately using the exact owner-discard native ChooseCardsPrompt.
 * This is a default-off resource line, with no future Supporter-play promise.
 * @param {object} view Detached player-owned current root observation.
 * @returns {object|null} Exact source-validated VS Seeker native-neutral root.
 */
function chooseFirstCrispinSeekerRecovery(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources;
  if(view.globalTurn!==1||!own?.active||
     resources?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     !own.discard?.includes(CRISPIN)||
     !own.discard?.includes(TREASURE)||
     view.ownHand.includes(CRISPIN))return null;
  const index=view.ownHand.indexOf(SEEKER);
  if(index<0)return null;
  return {
    kind:'play-seeker-get-crispin',
    handIndex:index,printing:SEEKER,target:CRISPIN,
    source:VERSION,ownerVisible:true,
    retrievedSupporterNotPlayableOnFirstTurn:true
  };
}
module.exports={VERSION,chooseFirstCrispinSeekerRecovery};
