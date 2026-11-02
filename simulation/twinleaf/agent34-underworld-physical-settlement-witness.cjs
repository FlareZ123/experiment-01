'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent34-original-underworld-owned-physical-effect-v1';

/** Only own-hand/deck counts and own public in-play Bench Energy are read. */
function ownerSnapshot(owner,source,psychicType){
  return {
    hand:owner.hand.cards.length,
    deck:owner.deck.cards.length,
    sourceMarker:owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER',source),
    bench:owner.bench.map(slot=>({
      pokemon:slot.getPokemonCard()?.fullName??null,
      printedPsychic:slot.getPokemonCard()?.cardType?.includes(psychicType)===true,
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
  const psychicType=deps.psychicType??require(path.join(root,
    'game/store/card/card-types')).CardType.PSYCHIC;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  let live=null,game=0,ordinal=0;
  const awaitingByOwner=new Map(),events=[],opened=[],rejected=[];
  const summary=()=>({
    version:VERSION,gamesSeen:game,
    abilityPromptsOpened:opened.length,
    acceptedNativePromptResolutions:events.length,
    confirmedCompleteEffects:events.filter(e=>e.fullPhysicalEffect).length,
    opened,events,rejected,
    rejectedNativeAttachEnergyPrompts:rejected.length,
    sourceOwnHandOnly:true,
    opponentsHiddenZonesNeverRead:true,
    competitiveGameQualified:false
  });
  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&this!==live){
      live=this;game++;awaitingByOwner.clear();
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
      const before=owner&&source?ownerSnapshot(owner,source,psychicType):null;
      const native=original.value.apply(this,[action,...args]);
      if(owner&&source){
        const entry={
          game,sourceSeat:this.state.players.indexOf(owner),
          rootDispatchOrdinal:ordinal,turn:this.state.turn,
          sourcePrinting:source.fullName,
          sourceMarkerUnspent:before.sourceMarker===false,
          promptId:null
        };
        opened.push(entry);
        // Twinleaf first inserts WaitPrompt and creates the actual
        // AttachEnergyPrompt on the following accepted prompt resolution.
        awaitingByOwner.set(owner.id,{ownerId:owner.id,source,entry});
      }
      return native;
    }
    const prompt=kind==='ResolvePromptAction'?this.state.prompts.find(p=>
      p.id===action.id&&p.result===undefined):null;
    const context=prompt?.constructor?.name==='AttachEnergyPrompt'?
      awaitingByOwner.get(prompt.playerId):null;
    if(context&&context.entry.turn===this.state.turn){
      context.entry.promptId=prompt.id;
      const owner=this.state.players.find(p=>p.id===context.ownerId);
      const before=ownerSnapshot(owner,context.source,psychicType);
      let native;
      try{
        native=original.value.apply(this,[action,...args]);
      }catch(error){
        // Rejected native prompt answers remain evidence of bot-policy
        // failures. This witness consults only the acting owner's printed
        // Bench geometry and the energy the owner offered to transfer.
        // It does not disclose opposing concealed zones or raw card IDs.
        const attempted=Array.isArray(action.result)?
          action.result.map(assignment=>{
            const target=assignment?.to;
            const ownBench=target?.player===PlayerType.BOTTOM_PLAYER&&
              target.slot===SlotType.BENCH&&
              Number.isSafeInteger(target.index)?
              before.bench[target.index]:null;
            return {
              toOwnBench:Boolean(ownBench),
              ownBenchIndex:ownBench?target.index:null,
              ownerVisibleRecipient:ownBench?.pokemon??null,
              printedPsychic:ownBench?.printedPsychic??null,
              offeredEnergyPrinting:assignment?.card?.fullName??null
            };
          }):null;
        rejected.push({
          ...context.entry,promptDispatchOrdinal:ordinal,
          nativePromptRejected:true,
          offeredAssignmentCount:attempted?.length??null,
          attempted,
          errorClass:error?.constructor?.name??null,
          noOpponentConcealedZonesRead:true
        });
        throw error;
      }
      const after=ownerSnapshot(owner,context.source,psychicType);
      awaitingByOwner.delete(context.ownerId);
      const changed=before.bench.map((slot,index)=>{
        const later=after.bench[index];
        const added=[...new Set(later.energies)].filter(name=>
          later.energies.filter(x=>x===name).length>
          slot.energies.filter(x=>x===name).length);
        const valid=slot.pokemon!==null&&
          slot.pokemon===later.pokemon&&
          later.printedPsychic===true&&
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
