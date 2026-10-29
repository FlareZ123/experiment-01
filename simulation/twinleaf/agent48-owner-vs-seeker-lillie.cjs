'use strict';

const assert=require('node:assert/strict');

const VERSION='agent48-owner-seeker-lillie-v1';
const SEEKER='VS Seeker PHF';
const LILLIE="Lillie's Determination M1L";

/**
 * One strictly owner-visible Item -> discard Supporter -> low-hand draw plan.
 * Any opponent secret, own undeclared deck identity, or unknown Prize printing
 * is irrelevant: only physically held cards, owner's public discard, printed
 * card names, turn resources and public game counts enter.
 *
 * A Supporter is a costly once-per-turn resource. We require a low hand,
 * enough physical remaining deck cards for the expected Lillie draw, and
 * no printed lock. The genuine Store remains the authority on legality.
 *
 * @param {object} view Detached actorObservation.
 * @returns {{kind:string,handIndex:number,printing:string,target:string}|null}
 */
function chooseSeekerLillieRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||view.globalTurn<=1||!Array.isArray(view.ownHand)||
     !Array.isArray(own.discard)||!Number.isSafeInteger(own.prizeCount))
    return null;
  if(view.ownHand.length===0||view.ownHand.length>3||
     r?.supporterPlayedTurn!==0||
     r?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     own.resolvingSupporter?.length>0)return null;
  const draw=own.prizeCount===6?8:6;
  if(!Number.isSafeInteger(own.deckCount)||own.deckCount<draw)return null;

  const direct=view.ownHand.indexOf(LILLIE);
  if(direct>=0)return {kind:'play-seeker-recovered-lillie',
    handIndex:direct,printing:LILLIE,target:LILLIE};

  if(r?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     !own.discard.includes(LILLIE))return null;
  const index=view.ownHand.indexOf(SEEKER);
  if(index<0)return null;
  return {kind:'play-seeker-get-lillie',handIndex:index,
    printing:SEEKER,target:LILLIE};
}

/**
 * Deterministic own-discard native ChooseCardsPrompt selection after a
 * confirmed preceding actor-owned VS Seeker root. Fail closed if prompt
 * is not the exact authenticated owner's discard, or target is unavailable.
 *
 * @param {object} state Genuine pinned Store State.
 * @param {0|1} seat Physical seat of live prompted actor.
 * @param {object} prompt Pending genuine native ChooseCardsPrompt.
 * @param {new (...args:any[])=>object} ResolvePromptAction Native constructor.
 * @returns {object} Native owner-only physically selected prompt reply.
 */
function chooseSeekerLilliePrompt(state,seat,prompt,ResolvePromptAction){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  const owner=state.players[seat];
  assert.equal(prompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,owner.id);
  assert.strictEqual(prompt.cards,owner.discard,
    'Owner VS Seeker retrieval must never read deck, Prize or rival zones');
  assert.ok(prompt.result===undefined);
  const card=owner.discard.cards.find(x=>x.fullName===LILLIE);
  assert.ok(card,'Expected own-public Lillie printing absent in live prompt');
  assert.ok(prompt.validate([card],state),
    'Native owner-discard prompt rejected selected Supporter');
  return new ResolvePromptAction(prompt.id,[card]);
}

module.exports={VERSION,SEEKER,LILLIE,
  chooseSeekerLillieRoot,chooseSeekerLilliePrompt};
