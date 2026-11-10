'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {validAttachEnergyTargets}=
  require('../attach-energy-targets.cjs');

const VERSION='agent26-mew-energy-mix-owner-prompt-v1';
const MEW_V='Mew V FST';
const MEW_VMAX='Mew VMAX FST';

/**
 * One actual Energy Mix deck-search payment, using only the acting owner's
 * native search menu and their own publicly visible Fusion Strike Mew board.
 * A card in an opponent's hidden zones can never enter this function.
 *
 * @param {object} state Actual native Store state.
 * @param {object} prompt The owner's live AttachEnergyPrompt.
 * @param {number} ownerId Acting owner's native client ID.
 * @param {object} enums Pinned native PlayerType, SlotType, SuperType.
 * @returns {object|null} Exact physical selected Energy and target.
 */
function chooseEnergyMixAttachment(state,prompt,ownerId,enums){
  const owner=state?.players?.find(player=>player.id===ownerId);
  if(!owner||!prompt||prompt.constructor?.name!=='AttachEnergyPrompt'||
     prompt.playerId!==ownerId||prompt.cardList!==owner.deck||
     prompt.playerType!==enums.PlayerType.BOTTOM_PLAYER||
     prompt.options?.max!==1||
     !Array.isArray(prompt.slots)||
     !Array.isArray(prompt.cardList?.cards)||
     typeof prompt.validate!=='function')return null;
  const recipients=[];
  for(const [index,slot] of owner.bench.entries()){
    if(!prompt.slots.includes(enums.SlotType.BENCH))break;
    if(slot?.getPokemonCard?.()?.fullName!==MEW_V)continue;
    recipients.push({slot,target:{player:prompt.playerType,
      slot:enums.SlotType.BENCH,index}});
  }
  if(prompt.slots.includes(enums.SlotType.ACTIVE)&&
     owner.active?.getPokemonCard?.()?.fullName===MEW_VMAX){
    recipients.push({slot:owner.active,target:{player:prompt.playerType,
      slot:enums.SlotType.ACTIVE,index:0}});
  }
  recipients.sort((a,b)=>
    (a.slot.energies?.cards?.length??0)-
      (b.slot.energies?.cards?.length??0)||
    (a.target.slot===enums.SlotType.BENCH?-1:0)-
      (b.target.slot===enums.SlotType.BENCH?-1:0));
  const candidateEnergy=prompt.cardList.cards.filter(card=>
    card.superType===enums.SuperType.ENERGY)
    .sort((a,b)=>Number(b.name==='Double Colorless Energy')-
      Number(a.name==='Double Colorless Energy'));
  for(const card of candidateEnergy){
    for(const recipient of recipients){
      const choice=[{card,to:recipient.target}];
      if(!validAttachEnergyTargets(choice,recipients.map(x=>({
        target:x.target,list:x.slot
      })),prompt.options)||
         prompt.validate(choice,state)!==true)continue;
      return {ownerId,promptId:prompt.id,card,target:recipient.target,
        recipientSlot:recipient.slot,
        chosenEnergyPrinting:card.fullName,
        targetPokemonPrinting:recipient.slot.getPokemonCard().fullName,
        proposed:choice};
    }
  }
  return null;
}

/**
 * Pinned-Store integration. The source is an actual accepted copied
 * Mew V Energy Mix prompt, after Mew VMAX's Cross Fusion Strike.
 * Both player seats use identical eligibility. The original decoder
 * handles every other owner, source, prompt, or unsupported situation.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless match batch.
 * @param {{Store?:Function,Ai?:Function,ResolvePromptAction?:Function,
 * enums?:object}} [deps] Pinned engine classes or pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withMewEnergyMixOwnerPrompt(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const native=relative=>require(path.join(root,relative));
  const Store=deps.Store??native('game/store/store').Store;
  const Ai=deps.Ai??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const enums=deps.enums??{
    ...native('game/store/actions/play-card-action'),
    ...native('game/store/card/card-types')
  };
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof oldDispatch?.value,'function');
  assert.equal(typeof oldDecode?.value,'function');
  let liveStore=null;
  const pendingByOwner=new Map();
  const submitted=new WeakMap();
  const audit={schema:VERSION,actualEnergyMixPrompts:0,
    validatedOwnerSelections:0,nativeAccepted:0,
    physicalAttachmentsConfirmed:0,nativeRejected:0,
    delegatedOtherPrompts:0,receipts:[],
    paperQualifiedGames:0};

  function dispatch(action,...args){
    const before=this.state;
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'){
      liveStore=this;
      pendingByOwner.clear();
    }
    const sourcePrompt=before?.prompts?.find(p=>
      p.result===undefined&&p.id===action?.id);
    const seat=before?.players?.findIndex(p=>p.id===sourcePrompt?.playerId);
    const copiedEnergyMix=this===liveStore &&
      kind==='ResolvePromptAction'&&
      sourcePrompt?.constructor?.name==='ChooseAttackPrompt'&&
      action.result?.name==='Energy Mix'&&
      seat>=0&&before.activePlayer===seat&&
      before.players[seat].active?.getPokemonCard?.()?.fullName===MEW_VMAX&&
      before.players[seat].bench.some(slot=>
        slot?.getPokemonCard?.()?.fullName===MEW_V);
    const proposed=submitted.get(action);
    let value;
    try{value=oldDispatch.value.call(this,action,...args);}
    catch(error){
      if(proposed)audit.nativeRejected++;
      throw error;
    }
    if(copiedEnergyMix){
      const newPrompt=this.state.prompts?.find(p=>
        p.result===undefined&&p.constructor?.name==='AttachEnergyPrompt'&&
        p.playerId===sourcePrompt.playerId);
      if(newPrompt){
        pendingByOwner.set(sourcePrompt.playerId,{
          store:this,turn:before.turn,promptId:newPrompt.id,seat});
        audit.actualEnergyMixPrompts++;
      }
    }
    if(proposed){
      audit.nativeAccepted++;
      const owner=this.state.players[proposed.seat];
      const attached=owner?.deck?.cards?.includes(proposed.card)===false&&
        proposed.recipientSlot?.energies?.cards?.includes(proposed.card)===true;
      if(attached)audit.physicalAttachmentsConfirmed++;
      pendingByOwner.delete(proposed.ownerId);
      audit.receipts.push({
        seat:proposed.seat,turn:proposed.turn,promptId:proposed.promptId,
        energy:proposed.energy,target:proposed.target,
        nativeAccepted:true,exactPhysicalEnergyAttached:attached
      });
    }
    return value;
  }

  function decode(state,...args){
    const owner=state?.players?.find(player=>player.id===this.client?.id);
    const pending=state?.prompts?.find(p=>p.result===undefined);
    const record=pendingByOwner.get(owner?.id);
    if(!owner||!record||record.store!==liveStore||
       state!==liveStore.state||state.turn!==record.turn||
       state.activePlayer!==record.seat||pending?.id!==record.promptId){
      return oldDecode.value.call(this,state,...args);
    }
    const selected=chooseEnergyMixAttachment(state,pending,owner.id,enums);
    if(!selected){
      audit.delegatedOtherPrompts++;
      return oldDecode.value.call(this,state,...args);
    }
    const action=new ResolvePromptAction(pending.id,selected.proposed);
    submitted.set(action,{...selected,seat:record.seat,turn:state.turn,
      energy:selected.chosenEnergyPrinting,
      target:{...selected.target}});
    audit.validatedOwnerSelections++;
    return action;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldDecode,value:decode
  });
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.energyMixOwnerPromptAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
}

module.exports={VERSION,MEW_V,MEW_VMAX,chooseEnergyMixAttachment,
  withMewEnergyMixOwnerPrompt};
