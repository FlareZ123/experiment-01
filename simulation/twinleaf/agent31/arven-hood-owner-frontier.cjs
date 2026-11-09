'use strict';
const assert=require('node:assert/strict');
const {NEUTRAL_STADIUM_PRINTINGS}=
  require('../2026-11/agent4-thorns-lock-field-neutral-v3.cjs');

const VERSION='agent31-owner-arven-for-held-hood-search-v1';
const ARVEN=/^Arven [A-Z0-9]{2,6}(?: [0-9]+)?$/;
const HOOD='Stealthy Hood UNB';
const LOCK='Iron Thorns ex TWM';
const TARGET='Shadow Rider Calyrex VMAX CRE';
const NEUTRAL=new Set(NEUTRAL_STADIUM_PRINTINGS);

/**
 * Offer a held, playable Arven only when its Tool channel would address
 * a visible opposing Initialization lock and a real untooled VMAX exists.
 * The owner has no right to inspect its unseen deck before resolving Arven.
 * A separate native prompt adapter must select a physical Hood if searchable;
 * proposing Arven alone is neither card access nor a proven useful action.
 *
 * @param {object} view Detached owner hand and public game board.
 * @param {{toolPrintings:Set<string>}} catalog Public complete card index.
 * @returns {object|null} An owner-root intent for native PlayCardAction.
 */
function chooseArvenHoodRoot(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic;
  const r=view.ownTurnResources;
  if(opp?.active?.printing!==LOCK||
     !opp.active.abilities?.includes('Initialization')||
     !Array.isArray(opp.active.tools)||opp.active.tools.length>0||
     !Array.isArray(opp.bench)||
     !opp.bench.every(s=>s===null||s.printing===LOCK)||
     own?.active?.printing==='Wobbuffet PHF'||
     !Array.isArray(own?.bench)||!Array.isArray(view.ownHand)||
     !catalog?.toolPrintings?.has(HOOD)||
     !(r?.supporterPlayedTurn===0&&r.supporterPlayLocked===false)||
     own.publicTurnRestrictions?.supporterPlayLocked===true)return null;
  const stadiums=[...(own.stadium??[]),...(opp.stadium??[])];
  if(!stadiums.every(s=>typeof s==='string'&&NEUTRAL.has(s)))
    return null;
  // Use a physically held Hood directly whenever possible; Arven consumes
  // the Supporter resource and should not dominate a cheaper card action.
  if(view.ownHand.includes(HOOD))return null;
  const index=view.ownHand.findIndex(c=>ARVEN.test(c));
  if(index<0)return null;
  const benchIndex=own.bench.findIndex(p=>
    p?.printing===TARGET&&
    p.abilities?.includes('Underworld Door')&&
    Array.isArray(p.tools)&&p.tools.length===0);
  if(benchIndex<0)return null;
  return {
    kind:'play-arven-for-hood',source:VERSION,
    handIndex:index,printing:view.ownHand[index],
    benchIndex,requiresNativeOwnerDeckSearch:true,
    requestedTool:HOOD,
    itemAccessOutcomeUnknown:true
  };
}

/**
 * Choose actual printed Hood from the owner-revealed live deck search. Arven
 * can also search an Item, but the exact Item depends on current resources.
 * Do not assume an Item is available, and fail closed if no native selection
 * passes the game's own prompt validator.
 *
 * @param {object} state Genuine Store State.
 * @param {0|1} seat Acting owner seat.
 * @param {object} prompt Genuine pending native ChooseCardsPrompt.
 * @param {new (...args:any[])=>object} ResolvePromptAction Pinned native class.
 * @returns {{action:object,chosen:string[],complete:boolean}|null}
 */
function resolveArvenHoodSearch(state,seat,prompt,ResolvePromptAction){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(typeof ResolvePromptAction,'function');
  const owner=state.players[seat];
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.playerId!==owner.id||prompt.result!==undefined||
     prompt.cards!==owner.deck||!Array.isArray(owner.deck?.cards))
    return null;
  const hood=owner.deck.cards.find(c=>c.fullName===HOOD);
  if(!hood)return null;
  const cards=owner.deck.cards;
  // The exact native prompt validation is authoritative. Prefer Hood and
  // an Item, but never select the physically same card twice.
  const options=cards.filter(c=>c!==hood&&
    c?.trainerType!==undefined&&
    c.trainerType!==null&&
    c.fullName!==HOOD);
  // Item classification is owned by the pinned card's TrainerType enum.
  // No generic Trainer is accepted without native prompt.validate.
  const accepted=[];
  for(const item of options){
    if(prompt.validate?.([hood,item],state)===true){
      accepted.push({result:[hood,item],item});
      break;
    }
    if(prompt.validate?.([item,hood],state)===true){
      accepted.push({result:[item,hood],item});
      break;
    }
  }
  let selected=accepted[0]?.result??null;
  if(selected===null&&prompt.validate?.([hood],state)===true)
    selected=[hood];
  if(selected===null)return null;
  return {
    action:new ResolvePromptAction(prompt.id,selected),
    chosen:selected.map(x=>x.fullName),
    complete:selected.length===2,
    nativePromptId:prompt.id
  };
}
module.exports={VERSION,chooseArvenHoodRoot,resolveArvenHoodSearch};
