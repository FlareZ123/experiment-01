'use strict';
const assert=require('node:assert/strict');
const {NEUTRAL_STADIUM_PRINTINGS}=
  require('../2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
const {rankHoodArvenItems,RANKING_VERSION}=
  require('./agent41-hood-arven-item-priority.cjs');

const VERSION='agent31-owner-arven-for-held-hood-search-v2';
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
 * Choose actual printed Hood plus a resource-ranked Item from the owner's
 * revealed live deck search. Item ranking uses only owner-visible resources
 * and public opponent state, never the shuffled deck order or opponent hidden
 * zones. Fail closed unless the native prompt validator accepts the selection.
 *
 * @param {object} state Genuine Store State.
 * @param {0|1} seat Acting owner seat.
 * @param {object} prompt Genuine pending native ChooseCardsPrompt.
 * @param {new (...args:any[])=>object} ResolvePromptAction Pinned native class.
 * @param {string|number} itemTrainerType Actual pinned native TrainerType.ITEM.
 * @param {string|number} [supporterTrainerType] Actual pinned TrainerType.SUPPORTER.
 * @param {string|number} [pokemonSuperType] Actual pinned SuperType.POKEMON.
 * @returns {{action:object,chosen:string[],complete:boolean,item:string|null,itemScore:number|null,itemReason:string}|null}
 */
function resolveArvenHoodSearch(state,seat,prompt,ResolvePromptAction,itemTrainerType,
  supporterTrainerType=null,pokemonSuperType=null){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(typeof ResolvePromptAction,'function');
  assert.ok(typeof itemTrainerType==='number'||
    typeof itemTrainerType==='string');
  const owner=state.players[seat];
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.playerId!==owner.id||prompt.result!==undefined||
     prompt.cards!==owner.deck||!Array.isArray(owner.deck?.cards))
    return null;
  const hood=owner.deck.cards.find(c=>c.fullName===HOOD);
  if(!hood)return null;
  const cards=owner.deck.cards;
  // Rank the complete live Item candidate set from owner-visible resources.
  // The native prompt validator remains the final authority for each pair.
  const options=cards.filter(c=>c!==hood&&
    c?.trainerType===itemTrainerType);
  const ranked=rankHoodArvenItems(state,seat,options,
    supporterTrainerType,pokemonSuperType);
  let selected=null,selectedItem=null;
  for(const candidate of ranked){
    const item=candidate.card;
    if(prompt.validate?.([hood,item],state)===true){
      selected=[hood,item];selectedItem=candidate;break;
    }
    if(prompt.validate?.([item,hood],state)===true){
      selected=[item,hood];selectedItem=candidate;break;
    }
  }
  if(selected===null&&prompt.validate?.([hood],state)===true)
    selected=[hood];
  if(selected===null)return null;
  return {
    action:new ResolvePromptAction(prompt.id,selected),
    chosen:selected.map(x=>x.fullName),
    complete:selected.length===2,
    nativePromptId:prompt.id,
    item:selectedItem?.card.fullName??null,
    itemScore:selectedItem?.score??null,
    itemReason:selectedItem?.reason??'Hood-only selection passed native validation',
    itemRankingVersion:RANKING_VERSION
  };
}
module.exports={VERSION,chooseArvenHoodRoot,resolveArvenHoodSearch};
