'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent41-owner-capture-energy-deck-search-v3-exposure';
const CAPTURE='Capture Energy RCL';

/**
 * A Capture Energy search is a licensed view of the owner's own deck, after
 * the native Store actually creates the source effect's owner-deck prompt.
 * Choose a Basic only when a Bench slot is free. A zero-choice search is
 * permitted by the paper deck-search rule and only proposed if Store-valid.
 *
 * @param {object} prompt Genuine pending native ChooseCardsPrompt.
 * @param {object} owner Current genuine prompt owner.
 * @param {{BASIC:number}} Stage Native printed stage constants.
 * @param {object} state Current Store state for native prompt validation.
 * @returns {{cards:object[],kind:string}|null}
 */
function captureChoice(prompt,owner,Stage,state){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt' ||
     prompt.playerId!==owner?.id ||
     prompt.result!==undefined || prompt.cards!==owner.deck ||
     !Number.isSafeInteger(Stage?.BASIC) ||
     !Number.isSafeInteger(prompt.options?.max) ||
     prompt.options.max!==1 ||
     prompt.options.min!==0)return null;
  const free=owner.bench.some(slot=>slot.cards.length===0);
  if(free){
    // The deck's physical iteration order is irrelevant after a search.
    const canonical=[...owner.deck.cards].sort((a,b)=>
      a.fullName<b.fullName?-1:a.fullName>b.fullName?1:0);
    for(const card of canonical){
      if(card.stage===Stage.BASIC &&
         prompt.validate([card],state)===true)
        return {kind:'bench-basic',cards:[card]};
    }
  }
  return prompt.validate([],state)===true?
    {kind:'empty-valid-search',cards:[]}:null;
}

/**
 * Reversible, generic, two-seat owner prompt continuation. The intervention
 * can only follow an actual, successfully Store-dispatched hand-to-Pokemon
 * Capture Energy attachment that immediately creates a new owner-deck prompt.
 * It never observes deck contents while selecting the root attachment.
 *
 * @template T
 * @param {()=>T} next Genuine synchronous native match.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,
 *   ResolvePromptAction?:Function,Stage?:object}} [deps] Native test seam.
 * @returns {{result:T,audit:object}}
 */
function withOwnerCaptureEnergySearch(next,deps={}){
  assert.equal(typeof next,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Ai=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const Stage=deps.Stage??load('game/store/card/card-types').Stage;
  const beforeBot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeBot?.value,'function');
  assert.equal(typeof beforeStore?.value,'function');

  let live=null,stores=0;
  const pendingById=new Map();
  const proposals=new WeakMap();
  const audit={version:VERSION,physicalStores:0,acceptedCaptureAttachments:0,
    originalCapturePlayRootAttempts:0,captureRootDispatchThrows:0,
    captureRootsWithoutPhysicalAttachment:0,
    acceptedCaptureWithoutMatchingPrompt:0,
    matchedOwnerDeckPrompts:0,ownerSearchProposals:0,
    ownerSearchReturnsWithoutThrow:0,acceptedOwnerSearches:0,
    rejectedOwnerSearches:0,unsettledOwnerSearches:0,
    sourceBasicPhysicallyBenched:0,emptySearchesAccepted:0,
    records:[],paperGameQualified:false,competitiveGamesQualified:0};

  function dispatch(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&this!==live){
      live=this;
      stores++;
      pendingById.clear();
      audit.physicalStores=stores;
    }
    const actual=this===live;
    const before=this.state;
    const seat=actual&&type==='PlayCardAction'?
      before.players.findIndex(p=>p.id===action.clientId):-1;
    const owner=seat>=0?before.players[seat]:null;
    const energy=owner?.hand?.cards?.[action.handIndex];
    const track=actual && type==='PlayCardAction' &&
      energy?.fullName===CAPTURE;
    if(track)audit.originalCapturePlayRootAttempts++;
    const countCaptureAttached=player=>
      [player.active,...player.bench].reduce((n,slot)=>n+
        (slot.energies?.cards??[]).filter(c=>c.fullName===CAPTURE).length,0);
    const beforeCount=track?countCaptureAttached(owner):null;
    const existingPrompts=track?
      new Set((before.prompts??[]).map(p=>p.id)):null;
    const proposed=actual?proposals.get(action):null;
    const ownerBefore=proposed?before.players[proposed.seat]:null;
    const promptBefore=proposed?(before.prompts??[]).find(p=>
      p.id===action.id && p.playerId===proposed.ownerId &&
      p.result===undefined && p.cards===ownerBefore?.deck):null;
    const selected=proposed?.cards[0];
    const deckHadSelected=!!selected&&
      ownerBefore.deck.cards.includes(selected);
    const benchHadSelected=!!selected&&
      ownerBefore.bench.some(slot=>slot.cards.includes(selected));
    let result;
    try{
      result=beforeStore.value.apply(this,[action,...args]);
    }catch(error){
      if(proposed)audit.rejectedOwnerSearches++;
      if(track)audit.captureRootDispatchThrows++;
      throw error;
    }
    if(track){
      const current=this.state.players[seat];
      // Physical printing-count delta survives engines that clone card objects.
      const attached=countCaptureAttached(current)===beforeCount+1;
      if(attached)audit.acceptedCaptureAttachments++;
      else audit.captureRootsWithoutPhysicalAttachment++;
      const pending=attached?this.state.prompts?.find(p=>
        !existingPrompts.has(p.id) && p.result===undefined &&
        p.playerId===current.id &&
        p.constructor?.name==='ChooseCardsPrompt' &&
        p.cards===current.deck):null;
      if(attached&&!pending)audit.acceptedCaptureWithoutMatchingPrompt++;
      if(pending)pendingById.set(current.id,{
        promptId:pending.id,turn:this.state.turn,seat,
        storeOrdinal:stores,card:CAPTURE
      });
    }
    if(proposed){
      audit.ownerSearchReturnsWithoutThrow++;
      // Pinned Store may silently ignore a missing prompt or item. A return
      // cannot license an accepted search unless this exact pending native
      // prompt received the submitted answer.
      const settled=!!promptBefore && action.result!==undefined &&
        promptBefore.result===action.result;
      if(!settled){
        audit.unsettledOwnerSearches++;
        throw new Error('Capture Energy owner search returned without settling the pending prompt');
      }
      const ownerAfter=this.state.players[proposed.seat];
      const placed=proposed.cards.length===1 && deckHadSelected &&
        !benchHadSelected &&
        !ownerAfter.deck.cards.includes(selected) &&
        ownerAfter.bench.some(slot=>slot.cards.includes(selected));
      audit.acceptedOwnerSearches++;
      if(placed)audit.sourceBasicPhysicallyBenched++;
      if(proposed.cards.length===0)audit.emptySearchesAccepted++;
      if(audit.records.length<32)audit.records.push({
        storeOrdinal:proposed.storeOrdinal,
        seat:proposed.seat,turn:proposed.turn,
        kind:proposed.kind,selectedBasic:selected?.fullName??null,
        nativePromptSettled:true,physicalDeckToBenchVerified:placed,
        paperEffectVerified:proposed.cards.length===0||placed
      });
      pendingById.delete(proposed.ownerId);
    }
    return result;
  }

  function decode(state){
    if(state!==live?.state)return beforeBot.value.call(this,state);
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0)return beforeBot.value.call(this,state);
    const owner=state.players[seat];
    const pending=pendingById.get(owner.id);
    const prompt=state.prompts?.find(p=>p.id===pending?.promptId &&
      p.result===undefined);
    if(!pending || pending.seat!==seat || pending.turn!==state.turn ||
      !prompt || prompt.playerId!==owner.id ||
      prompt.cards!==owner.deck)return beforeBot.value.call(this,state);
    audit.matchedOwnerDeckPrompts++;
    const choice=captureChoice(prompt,owner,Stage,state);
    if(!choice)return beforeBot.value.call(this,state);
    const action=new ResolvePromptAction(prompt.id,choice.cards);
    proposals.set(action,{
      ownerId:owner.id,seat,turn:state.turn,
      storeOrdinal:pending.storeOrdinal,
      cards:choice.cards,kind:choice.kind
    });
    audit.ownerSearchProposals++;
    return action;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeStore,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...beforeBot,value:decode
  });
  try{return {result:next(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.ownerCaptureSearchAudit={...audit,records:[...audit.records]};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',beforeBot);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeStore);
  }
}

module.exports={VERSION,CAPTURE,captureChoice,withOwnerCaptureEnergySearch};
