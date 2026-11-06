'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent3-ko-source-prompt-physical-v4-root-bound';

/**
 * Observe native Store KO-effect -> real Prize prompt -> exact selected physical
 * card transfers as ONE joined event, while preserving player decisions.
 *
 * Source is matched by recipient/destination/Prize count within one
 * authoritative headless root Store action, not by a unique
 * checkState token. A different same-Store effect may still be confounded.
 * No hidden card names or contents are consulted or returned.
 *
 * @template T
 * @param {()=>T} execute A synchronous native Store experiment.
 * @param {{Store?:Function,GameMessage?:object,maxRecords?:number,
 *   rootBinding:{current:object|null}}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withKoSourcePromptPhysical(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??
    require(path.join(output,'game/store/store')).Store;
  const GameMessage=deps.GameMessage??
    require(path.join(output,'game/game-message')).GameMessage;
  const maxRecords=deps.maxRecords??64;
  const rootBinding=deps.rootBinding;
  assert.ok(rootBinding&&typeof rootBinding==='object',
    'Root-bound provenance requires the native onRootStoreCreated binding');
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const proto=Store.prototype;
  const names=['dispatch','reduceEffect','prompt'];
  const original=Object.fromEntries(names.map(k=>
    [k,Object.getOwnPropertyDescriptor(proto,k)]));
  for(const k of names) {
    assert.equal(typeof original[k]?.value,'function');
    assert.equal(original[k].configurable,true);
  }

  const pending=new WeakMap();
  const issued=new WeakMap();
  const sessions=new WeakMap();
  const isAuthoritative=store=>
    store===rootBinding.current && sessions.has(store);
  let rootDepth=0;
  let nextSession=0;
  const audit={
    version:VERSION,
    registeredStoreSessions:0,
    ignoredUnboundAddPlayerActions:0,
    rootStoreCallbackBindingRequired:true,
    eligibleKoEffects:0,
    expiredUnjoinedKoEffects:0,
    nativeSourcePrompts:0,
    nativeSourceSettledAnswers:0,
    nativeSourceUnresolvedAnswers:0,
    nativeSourceRejectedAnswers:0,
    nativeInvalidSelectionAnswers:0,
    exactSourceJoinedHandTransfers:0,
    exactSourceJoinedLostZoneTransfers:0,
    sourceJoinedOtherDestinations:0,
    unrelatedPrizePrompts:0,
    bySeat:{0:0,1:0},
    records:[],recordsOmitted:0,
    chosenPrizeFacesReadByPolicy:false,
    realStoreIdentityProofComplete:false,
    uniqueCheckStateOriginCertified:false,
    paperKoCertified:false,
    competitivelyQualifiedGames:0
  };
  function reduceEffect(state,effect,...args) {
    const sourceCandidate=isAuthoritative(this) && rootDepth>0 &&
      this.calculatingPlayability!==true &&
      effect?.constructor?.name==='KnockOutEffect';
    const returned=original.reduceEffect.value.apply(this,
      [state,effect,...args]);
    if(sourceCandidate && effect.preventDefault===false &&
       Number.isSafeInteger(effect.prizeCount) && effect.prizeCount>0) {
      const owner=state.players.find(p=>p.id===effect.player?.id);
      const taker=state.players.find(p=>p.id!==effect.player?.id);
      if(owner&&taker) {
        const events=pending.get(this)??[];
        events.push({playerId:taker.id,
          destination:effect.prizeDestination??taker.hand,
          count:effect.prizeCount});
        pending.set(this,events);
        audit.eligibleKoEffects++;
      }
    }
    return returned;
  }
  function prompt(state,prompts,...args) {
    const list=Array.isArray(prompts)?prompts:[prompts];
    const realRoot=isAuthoritative(this)&&rootDepth>0;
    const events=pending.get(this)??[];
    const joined=[];
    if(realRoot)for(const p of list) {
      if(p?.constructor?.name!=='ChoosePrizePrompt' ||
         p.message!==GameMessage.CHOOSE_PRIZE_CARD)continue;
      const matches=events.filter(e=>e.playerId===p.playerId &&
        e.destination===p.options?.destination);
      const enough=Number.isSafeInteger(p.options?.count) &&
        p.options.count>0 && matches.length>0 &&
        matches.reduce((n,e)=>n+e.count,0)>=p.options.count;
      joined.push({prompt:p,matched:enough});
      if(enough)for(const event of matches)
        events.splice(events.indexOf(event),1);
    }
    const returned=original.prompt.value.apply(this,
      [state,prompts,...args]);
    for(const j of joined) {
      if(j.matched && state.prompts?.includes(j.prompt)) {
        issued.set(j.prompt,true);
        audit.nativeSourcePrompts++;
      } else audit.unrelatedPrizePrompts++;
    }
    return returned;
  }

  function dispatch(action,...args) {
    if(action?.constructor?.name==='AddPlayerAction') {
      if(this!==rootBinding.current) {
        audit.ignoredUnboundAddPlayerActions++;
      } else if(!sessions.has(this)) {
        sessions.set(this,++nextSession);
        audit.registeredStoreSessions++;
      }
    }
    const realRoot=isAuthoritative(this);
    const state=this.state;
    const question=realRoot &&
      action?.constructor?.name==='ResolvePromptAction'
      ? state.prompts?.find(p=>p.id===action.id &&
        p.result===undefined && issued.has(p))
      : null;
    const seat=question?
      state.players.findIndex(p=>p.id===question.playerId):-1;
    const owner=seat>=0?state.players[seat]:null;
    const slots=question&&Array.isArray(action.result)?
      action.result:null;
    const valid=Array.isArray(slots)&&slots.length>0 &&
      new Set(slots).size===slots.length &&
      Array.isArray(owner?.prizes) &&
      slots.every(slot=>owner.prizes.includes(slot) &&
        Array.isArray(slot.cards)&&slot.cards.length>0);
    const physical=valid?slots.flatMap(slot=>slot.cards.slice()):[];
    const prePrize=owner?.prizes?.reduce((n,s)=>n+s.cards.length,0)??null;
    if(realRoot)rootDepth++;
    let returned;
    try {
      returned=original.dispatch.value.apply(this,[action,...args]);
    } catch(error) {
      if(question)audit.nativeSourceRejectedAnswers++;
      throw error;
    } finally {
      if(realRoot) {
        rootDepth--;
        if(rootDepth===0) {
          const unjoined=pending.get(this)??[];
          audit.expiredUnjoinedKoEffects+=unjoined.length;
          pending.delete(this);
        }
      }
    }
    if(!question)return returned;
    if(question.result!==action.result) {
      audit.nativeSourceUnresolvedAnswers++;
      return returned;
    }
    if(!valid) {
      audit.nativeInvalidSelectionAnswers++;
      return returned;
    }
    audit.nativeSourceSettledAnswers++;
    if(seat===0||seat===1)audit.bySeat[seat]++;
    const stillPrized=physical.some(card=>
      owner.prizes.some(slot=>slot.cards.includes(card)));
    const inHand=!stillPrized&&physical.length>0 &&
      physical.every(card=>owner.hand.cards.includes(card));
    const inLostZone=!stillPrized&&physical.length>0 &&
      Array.isArray(owner.lostzone?.cards) &&
      physical.every(card=>owner.lostzone.cards.includes(card));
    let destination='other-or-unverified';
    if(inHand) {
      destination='owner-hand';
      audit.exactSourceJoinedHandTransfers++;
    } else if(inLostZone) {
      destination='owner-lost-zone';
      audit.exactSourceJoinedLostZoneTransfers++;
    } else audit.sourceJoinedOtherDestinations++;
    const record={
      session:sessions.get(this),seat,
      turn:state.turn,phase:state.phase,
      selectedSlots:slots.length,selectedPhysicalCards:physical.length,
      prePrizeCards:prePrize,
      postPrizeCards:owner.prizes.reduce((n,s)=>n+s.cards.length,0),
      nativePromptResolved:true,destination
    };
    if(audit.records.length<maxRecords)audit.records.push(record);
    else audit.recordsOmitted++;
    return returned;
  }

  Object.defineProperty(proto,'dispatch',{...original.dispatch,value:dispatch});
  Object.defineProperty(proto,'reduceEffect',
    {...original.reduceEffect,value:reduceEffect});
  Object.defineProperty(proto,'prompt',{...original.prompt,value:prompt});
  try{return {result:execute(),audit};}
  catch(error) {
    if(error&&typeof error==='object')
      error.agent3KoSourcePhysicalAudit={
        ...audit,records:[...audit.records],aborted:true};
    throw error;
  } finally {
    Object.defineProperty(proto,'prompt',original.prompt);
    Object.defineProperty(proto,'reduceEffect',original.reduceEffect);
    Object.defineProperty(proto,'dispatch',original.dispatch);
  }
}

module.exports={VERSION,withKoSourcePromptPhysical};
