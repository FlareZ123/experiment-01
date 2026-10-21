'use strict';

const assert=require('node:assert/strict');

const VERSION='agent8-actor-emergency-ace-trainer-v1';
const ACE_TRAINER='Ace Trainer AOR';

/**
 * Last-chance owner-only draw Supporter when the current root would pass.
 * The real Store enforces Ace Trainer's printed condition and effect.
 * This experimental policy deliberately requires being behind in Prizes,
 * no Supporter consumed this turn, some deck stock, and a dead-end root.
 * It neither looks into either concealed deck nor models hand value or
 * future opponent Trainer counts.
 *
 * @param {object} view Authenticated detached actorObservation owner root.
 * @returns {{kind:'play-ace-trainer',handIndex:number,printing:string}|null}
 */
function chooseEmergencyAceTrainer(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const opp=view.opponentPublic;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1 ||
      r.supporterPlayLocked===true ||
      own.publicTurnRestrictions?.supporterPlayLocked===true ||
      r.supporterPlayedTurn!==0 ||
      !(own.prizeCount>opp?.prizeCount) ||
      own.deckCount<=0 ||
      view.ownHand.length<4)return null;
  const handIndex=view.ownHand.indexOf(ACE_TRAINER);
  return handIndex<0?null:{
    kind:'play-ace-trainer',handIndex,printing:ACE_TRAINER
  };
}

module.exports={VERSION,ACE_TRAINER,chooseEmergencyAceTrainer};
