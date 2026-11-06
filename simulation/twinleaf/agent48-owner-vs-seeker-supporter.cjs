'use strict';

const assert=require('node:assert/strict');

const VERSION='agent48-owner-vs-seeker-supporter-prompt-v1';

/**
 * Select the exact physical Supporter from the acting owner's authenticated
 * native discard prompt. No rival zone, deck, Prize, or hidden identity is read.
 * @param {object} state Genuine pinned Store State.
 * @param {0|1} seat Physical seat of the prompted owner.
 * @param {object} prompt Pending native ChooseCardsPrompt.
 * @param {new (...args:any[])=>object} ResolvePromptAction Native constructor.
 * @param {string} targetPrinting Exact fullName of the requested Supporter.
 * @returns {{action:object,card:object,ownerId:string|number,seat:0|1,promptId:string|number,targetPrinting:string}}
 */
function selectOwnerVsSeekerSupporterPrompt(
  state,seat,prompt,ResolvePromptAction,targetPrinting
){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(typeof targetPrinting,'string');
  assert.ok(targetPrinting.length>0);
  assert.equal(typeof ResolvePromptAction,'function');
  const owner=state.players[seat];
  assert.ok(owner?.discard?.cards);
  assert.equal(prompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,owner.id);
  assert.strictEqual(prompt.cards,owner.discard,
    'Owner VS Seeker retrieval must never read deck, Prize or rival zones');
  assert.ok(prompt.result===undefined);
  const card=owner.discard.cards.find(x=>x.fullName===targetPrinting);
  assert.ok(card,
    `Expected own-public ${targetPrinting} printing absent in live prompt`);
  assert.ok(prompt.validate([card],state),
    'Native owner-discard prompt rejected selected Supporter');
  return {
    action:new ResolvePromptAction(prompt.id,[card]),
    card,
    ownerId:owner.id,
    seat,
    promptId:prompt.id,
    targetPrinting
  };
}

/**
 * Backward-compatible action-only facade for callers that do not need the
 * selected physical card receipt.
 * @param {object} state
 * @param {0|1} seat
 * @param {object} prompt
 * @param {new (...args:any[])=>object} ResolvePromptAction
 * @param {string} targetPrinting
 * @returns {object}
 */
function chooseOwnerVsSeekerSupporterPrompt(
  state,seat,prompt,ResolvePromptAction,targetPrinting
){
  return selectOwnerVsSeekerSupporterPrompt(
    state,seat,prompt,ResolvePromptAction,targetPrinting
  ).action;
}

module.exports={VERSION,selectOwnerVsSeekerSupporterPrompt,
  chooseOwnerVsSeekerSupporterPrompt};
