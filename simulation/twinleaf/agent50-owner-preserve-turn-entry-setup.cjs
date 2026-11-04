'use strict';

const assert=require('node:assert/strict');

const VERSION='agent50-owner-preserve-turn-entry-setup-proposal-v1';
const ENTRY_TEXT=/\bwhen you play this pok[eé]mon from your hand onto your bench\b/i;

/**
 * Recognize a printed in-turn hand-to-Bench Ability from the physical owner's
 * card's published power text. This code never accesses any concealed zone.
 * @param {{powers?:Array<{text?:string}>}} card Own printed Card instance.
 * @returns {boolean}
 */
function isTurnEntrySupport(card){
  return Array.isArray(card?.powers)&&card.powers.some(power=>
    typeof power?.text==='string'&&ENTRY_TEXT.test(power.text));
}

/**
 * A deterministic, source-rank-agnostic candidate opening policy for the
 * pinned normal setup ChooseCardsPrompt. It protects in-turn entry supports:
 * choose the first nonprotected eligible Basic as Active if possible, bench
 * eligible unprotected Basics only, and hold protected Basics for a possible
 * later in-turn hand play.
 *
 * If every eligible Basic is protected, one must be Active, so choose its
 * earliest eligible physical card. If a prompt has zero minimum (optional
 * mulligan-bonus Bench placement), explicitly decline it. The native prompt's
 * published selection validator is the last authority on proposed indices.
 *
 * This does not model offense, lock, mulligans, Supporter path or opponent.
 * It is an opt-in comparison policy, not a replacement for selected v3.
 *
 * @param {{cards:object,options:{min:number,max:number,blocked?:number[]},validate:(c:object[])=>boolean}} prompt Genuine owner prompt.
 * @param {{hand:{cards:object[]}}} owner Authenticated prompt owner.
 * @param {{BASIC:number}} Stage Pinned native stage enum.
 * @param {{PLAY_DURING_SETUP:number|string}} CardTag Pinned native tag enum.
 * @returns {object[]|null} Legal native selection or unsupported null.
 */
function chooseOwnedProtectedStartingBasics(prompt,owner,Stage,CardTag){
  assert.ok(prompt&&owner&&Stage&&CardTag);
  if(prompt.cards!==owner.hand)return null;
  const {min,max}=prompt.options;
  if(min===0)return prompt.validate([])?[]:null;
  if(min!==1||!Number.isSafeInteger(max)||max<1)return null;
  const blocked=new Set(prompt.options.blocked??[]);
  const eligible=owner.hand.cards.filter((card,index)=>
    !blocked.has(index)&&
    (card.stage===Stage.BASIC||
      card.tags?.includes(CardTag.PLAY_DURING_SETUP))&&
    prompt.validate([card]));
  if(eligible.length===0)return null;
  const unprotected=eligible.filter(card=>!isTurnEntrySupport(card));
  const active=unprotected[0]??eligible[0];
  const result=[active];
  for(const card of unprotected){
    if(card===active||result.length>=max)continue;
    if(prompt.validate([...result,card]))result.push(card);
  }
  return prompt.validate(result)?result:null;
}

module.exports={VERSION,ENTRY_TEXT,isTurnEntrySupport,
  chooseOwnedProtectedStartingBasics};
