'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent4-allturn-owner-volt-attach-energy-v1';

/**
 * Pick only a genuine actor-owned, publicly attached physical Energy for the
 * mandatory printed Iron Thorns ex TWM Volt Cyclone transfer. This narrow
 * adapter reads the acting player's face-up Active and Bench, plus their own
 * live native prompt. It does not examine opponent cards or concealed zones.
 *
 * @param {object} state Genuine native Store state
 * @param {number} actorId
 * @param {{PlayerType:object,SlotType:object,SuperType:object}} enums
 * @returns {object|null} Owner-only card assignment plus public receipt
 */
function chooseOwnVoltTransfer(state,actorId,enums){
  const owner=state?.players?.find(p=>p.id===actorId);
  const pending=state?.prompts?.find(p=>p.result===undefined);
  if(!owner||!pending||pending.playerId!==owner.id||
     pending.constructor.name!=='AttachEnergyPrompt'||
     owner.active?.getPokemonCard?.()?.fullName?.startsWith(
       'Iron Thorns ex TWM')!==true||
     pending.cardList!==owner.active||
     pending.playerType!==enums.PlayerType.BOTTOM_PLAYER||
     !Array.isArray(pending.slots)||
     !pending.slots.includes(enums.SlotType.BENCH)||
     pending.min!==1||pending.max!==1||pending.allowCancel===true)
    return null;
  const energies=owner.active.energies?.cards??[];
  if(!Array.isArray(energies)||!Array.isArray(owner.bench))
    return null;
  const donors=energies.filter(card=>
    card.superType===enums.SuperType.ENERGY&&
    pending.cardList.cards.includes(card));
  const desirability=card=>
    card.name==='Capture Energy'?0:
    card.name==='Double Colorless Energy'?2:
    card.name==='Speed Lightning Energy'?3:1;
  const stableDonors=donors.map((card,i)=>({card,i}))
    .sort((a,b)=>desirability(a.card)-desirability(b.card)||a.i-b.i);
  const benches=owner.bench.map((slot,index)=>({
    index,slot,character:slot.getPokemonCard?.()??null
  })).filter(x=>x.character!==null).sort((a,b)=>
    Number(b.character.name==='Iron Thorns ex')-
      Number(a.character.name==='Iron Thorns ex')||
    (a.slot.energies?.cards?.length??0)-
      (b.slot.energies?.cards?.length??0)||a.index-b.index);
  for(const {card} of stableDonors)
    for(const target of benches){
      const result=[{
        card,to:{player:pending.playerType,
          slot:enums.SlotType.BENCH,index:target.index}
      }];
      if(pending.validate(result,state)!==true)continue;
      return {
        ownerId:owner.id,ownerSeat:state.players.indexOf(owner),
        promptId:pending.id,turn:state.turn,
        originalActiveName:owner.active.getPokemonCard().name,
        chosenExactPhysicalCard:card,
        result,benchIndex:target.index,
        ownerAttachedEnergyNamesBefore:energies.map(x=>x.name),
        chosenEnergyName:card.name,
        eligibleDonors:stableDonors.length
      };
    }
  return null;
}

/**
 * Reversible all-turn original-source owner prompt closure.
 * Install this around the *actual native runMatch* entry, after the
 * incumbent raw-State fallback quarantine has installed its fail-closed
 * decoder. The same policy can act on physical seat 0 or seat 1.
 *
 * @template T
 * @param {()=>T} next Genuine native runMatch call.
 * @param {{SimpleTacticsAi?:Function,ResolvePromptAction?:Function,
 *   enums?:object}} [deps] Pure unit-test injection.
 * @returns {{result:T,audit:object}}
 */
function withOwnerVoltTransfer(next,deps={}){
  assert.equal(typeof next,'function');
  const root=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native=pathName=>require(path.join(root,pathName));
  const Ai=deps.SimpleTacticsAi??native('simple-bot/simple-tactics-ai')
    .SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??native(
    'game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const enums=deps.enums??{
    ...native('game/store/actions/play-card-action'),
    ...native('game/store/card/card-types')
  };
  const previous=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={
    version:VERSION,ownerPromptChoices:0,
    allNativeDecoderInvocations:0,
    ownVoltAttachPromptDecoderHits:0,
    ownVoltPromptShapeDiagnostics:[],
    attemptedNativeOwnerReplyCount:0,
    sourceOwnerPhysicalSeatCounts:[0,0],
    publicOwnerSelectionReceipts:[],
    rawStateFallbackWhenUnmatchedStillQuarantined:true,
    wholePolicyPaperLegalCertified:false,competitiveGamesQualified:0
  };
  function ownerDecode(state){
    audit.allNativeDecoderInvocations++;
    const active=state?.players?.find(p=>p.id===this.client?.id);
    const pending=state?.prompts?.find(p=>p.result===undefined);
    if(pending?.constructor?.name==='AttachEnergyPrompt' &&
       active&&pending.playerId===active.id){
      audit.ownVoltAttachPromptDecoderHits++;
      if(audit.ownVoltPromptShapeDiagnostics.length<6)
        audit.ownVoltPromptShapeDiagnostics.push({
          turn:state.turn,
          seat:state.players.indexOf(active),
          activeName:active.active?.getPokemonCard?.()?.name??null,
          activeFullName:active.active?.getPokemonCard?.()?.fullName??null,
          ownerCardListIsActive:pending.cardList===active.active,
          min:pending.min??null,max:pending.max??null,
          allowCancel:pending.allowCancel??null,
          promptPlayerTypeMatches:
            pending.playerType===enums.PlayerType.BOTTOM_PLAYER,
          promptBenchesIncluded:Array.isArray(pending.slots)&&
            pending.slots.includes(enums.SlotType.BENCH),
          ownOccupiedBenchCount:active.bench?.filter(x=>
            !!x.getPokemonCard?.()).length??0,
          ownActiveAttachedEnergyNames:
            active.active?.energies?.cards?.map(x=>x.name)??[],
          nativePromptCardPoolNames:
            pending.cardList?.cards?.map(x=>x.name)??[]
        });
    }
    const intent=chooseOwnVoltTransfer(state,this.client?.id,enums);
    if(intent===null)return previous.value.call(this,state);
    audit.ownerPromptChoices++;
    audit.sourceOwnerPhysicalSeatCounts[intent.ownerSeat]++;
    const action=new ResolvePromptAction(intent.promptId,intent.result);
    audit.attemptedNativeOwnerReplyCount++;
    audit.publicOwnerSelectionReceipts.push({
      turn:intent.turn,ownerSeat:intent.ownerSeat,
      ownerPromptId:intent.promptId,
      sourcePokemon:intent.originalActiveName,
      chosenEnergyName:intent.chosenEnergyName,
      benchIndex:intent.benchIndex,
      attachedEnergyBefore:intent.ownerAttachedEnergyNamesBefore,
      eligiblePhysicalEnergyChoices:intent.eligibleDonors,
      genuineNativeAction:action.constructor.name
    });
    return action;
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...previous,value:ownerDecode});
  try{return {result:next(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.nativeOwnerVoltAttemptAudit={...audit,
        publicOwnerSelectionReceipts:[...audit.publicOwnerSelectionReceipts]};
    throw error;
  }
  finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,ownerDecode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',previous);
  }
}
module.exports={VERSION,chooseOwnVoltTransfer,withOwnerVoltTransfer};
