'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent34-original-underworld-owned-physical-effect-v1';

/** Only own-hand/deck counts and own public in-play Bench Energy are read. */
function ownerSnapshot(owner,source){
  return {
    hand:owner.hand.cards.length,
    deck:owner.deck.cards.length,
    sourceMarker:owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER',source),
    bench:owner.bench.map(slot=>({
      pokemon:slot.getPokemonCard()?.fullName??null,
      energies:slot.energies.cards.map(card=>card.fullName)
    }))
  };
}

/**
 * Reversible actual-Store audit of a chosen Underworld Door root, its native
 * prompt and complete physical resolution. No extra actions are proposed.
 * Source is the exact in-play VMAX object, retained only in private closures.
 *
 * @template T
 * @param {()=>T} work Synchronous genuine pinned engine game(s).
 * @param {object} [deps] Test injection.
 * @returns {{result:T,audit:object}}
 */
function withUnderworldPhysicalSettlementWitness(work,deps={}){
  assert.equal(typeof work,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(root,'game/store/store')).Store;
  const {PlayerType,SlotType}=deps.cardActions??require(path.join(root,
    'game/store/actions/play-card-action'));
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  let live=null,game=0,ordinal=0;
  const pending=new Map(),events=[],opened=[];
  const summary=()=>({
    version:VERSION,gamesSeen:game,
    abilityPromptsOpened:opened.length,
    acceptedNativePromptResolutions:events.length,
    confirmedCompleteEffects:events.filter(e=>e.fullPhysicalEffect).length,
    opened,events,sourceOwnHandOnly:true,
    opponentsHiddenZonesNeverRead:true,
    competitiveGameQualified:false
  });
  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&this!==live){
      live=this;game++;pending.clear();
    }
    if(this!==live)return original.value.apply(this,[action,...args]);
    ordinal++;
    if(kind==='UseAbilityAction'&&action.name==='Underworld Door'){
      const owner=this.state.players.find(p=>p.id===action.clientId);
      const target=action.target;
      const slot=target?.player===PlayerType.BOTTOM_PLAYER?
        (target.slot===SlotType.ACTIVE?owner?.active:
          target.slot===SlotType.BENCH?owner?.bench[target.index]:null):null;
      const source=slot?.getPokemonCard();
      const before=owner&&source?ownerSnapshot(owner,source):null;
      const native=original.value.apply(this,[action,...args]);
      if(owner&&source){
        const prompt=this.state.prompts.find(p=>
          p.result===undefined&&p.playerId===owner.id&&
          p.constructor.name==='AttachEnergyPrompt');
        const entry={
          game,sourceSeat:this.state.players.indexOf(owner),
          rootDispatchOrdinal:ordinal,turn:this.state.turn,
          sourcePrinting:source.fullName,
          sourceMarkerUnspent:before.sourceMarker===false,
          promptId:prompt?.id??null
        };
        opened.push(entry);
        if(prompt)pending.set(prompt.id,{ownerId:owner.id,source,entry});
      }
      return native;
    }
    if(kind==='ResolvePromptAction'&&pending.has(action.id)){
      const context=pending.get(action.id);
      const owner=this.state.players.find(p=>p.id===context.ownerId);
      const before=ownerSnapshot(owner,context.source);
      const native=original.value.apply(this,[action,...args]);
      const after=ownerSnapshot(owner,context.source);
      pending.delete(action.id);
      const changed=before.bench.map((slot,index)=>{
        const later=after.bench[index];
        const added=later.energies.filter(name=>
          later.energies.filter(x=>x===name).length>
          slot.energies.filter(x=>x===name).length);
        const valid=slot.pokemon!==null&&
          slot.pokemon===later.pokemon&&
          later.energies.length===slot.energies.length+1&&
          slot.energies.every(name=>
            later.energies.filter(x=>x===name).length>=
            slot.energies.filter(x=>x===name).length)&&
          added.length===1&&added[0].startsWith('Psychic Energy ');
        return valid?{index,recipient:later.pokemon,energy:added[0]}:null;
      }).filter(Boolean);
      const fullPhysicalEffect=before.sourceMarker===false&&
        after.sourceMarker===true&&before.deck>=2&&
        after.deck===before.deck-2&&after.hand===before.hand+1&&
        changed.length===1;
      events.push({
        ...context.entry,promptDispatchOrdinal:ordinal,
        acceptedNativePrompt:true,physicalBenchChanges:changed,
        sourceMarkerBefore:before.sourceMarker,
        sourceMarkerAfter:after.sourceMarker,
        ownHandBefore:before.hand,ownHandAfter:after.hand,
        ownDeckBefore:before.deck,ownDeckAfter:after.deck,
        fullPhysicalEffect,
        noCardIdentitiesReadFromDeck:true
      });
      return native;
    }
    return original.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    return {result:work(),audit:summary()};
  }catch(error){
    if(error&&typeof error==='object')error.underworldPhysicalAbort=summary();
    throw error;
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}
module.exports={VERSION,withUnderworldPhysicalSettlementWitness};
