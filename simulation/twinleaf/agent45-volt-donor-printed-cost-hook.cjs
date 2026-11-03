'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {canPayVoltCost}=require('../evaluation/agent45-volt-cyclone-donor-debt.cjs');

const VERSION='agent45-source-volt-donor-payable-preference-v1';

/**
 * Find an alternate donor preserving the currently printed LCC Volt cost.
 * The baseline native choice is retained if it already preserves payability.
 * All values are public in-play Energy names; unknown effects fail closed.
 * @param {string[]} originalEnergyNames
 * @param {string[]} publicStadiumNames
 * @param {string} nativeDonorName
 * @returns {string|null} Different donor name, or null to keep native.
 */
function preferredAlternativeDonorName(originalEnergyNames,publicStadiumNames,nativeDonorName){
  if(!Array.isArray(originalEnergyNames)||
     !Array.isArray(publicStadiumNames)||
     typeof nativeDonorName!=='string'||!originalEnergyNames.includes(nativeDonorName)||
     canPayVoltCost(originalEnergyNames,publicStadiumNames)!==true)return null;
  const nativeRemaining=originalEnergyNames.slice();
  nativeRemaining.splice(nativeRemaining.indexOf(nativeDonorName),1);
  if(canPayVoltCost(nativeRemaining,publicStadiumNames)===true)return null;
  for(const alternative of new Set(originalEnergyNames)){
    if(alternative===nativeDonorName)continue;
    const remaining=originalEnergyNames.slice();
    remaining.splice(remaining.indexOf(alternative),1);
    if(canPayVoltCost(remaining,publicStadiumNames)===true)return alternative;
  }
  return null;
}

/**
 * Reversible native, source-printed optional donor policy; only selects the
 * physical Energy to be moved within a genuine TWM77 Volt Cyclone prompt.
 * The original target is kept unchanged, and native prompt.validate and
 * independent paper prompt guards remain authoritative. No private zones
 * or opponent hidden information are read for decisions.
 *
 * @template T
 * @param {()=>T} run Synchronous native game or staged native Store.
 * @param {{seat:0|1}} options Genuine source player seat.
 * @param {{Store?:Function,IronThornsex?:Function,AttachEnergyPromptResolver?:Function,
 *   SlotType?:object,PlayerType?:object}} [deps] Pure-test seams.
 * @returns {{result:T,audit:object}}
 */
function withPrintedVoltDonorPreference(run,options,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(options?.seat===0||options?.seat===1);
  const seat=options.seat;
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=name=>require(path.join(root,name));
  const Store=deps.Store??native('game/store/store').Store;
  const IronThornsex=deps.IronThornsex??native(
    'sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex').IronThornsex;
  const AttachEnergyPromptResolver=deps.AttachEnergyPromptResolver??native(
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver').AttachEnergyPromptResolver;
  const enums=deps.SlotType&&deps.PlayerType?deps:
    native('game/store/actions/play-card-action');
  const {PlayerType,SlotType}=enums;
  const beforeReduce=Object.getOwnPropertyDescriptor(IronThornsex.prototype,'reduceEffect');
  const beforePrompt=Object.getOwnPropertyDescriptor(
    AttachEnergyPromptResolver.prototype,'getPromptResult');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const descriptor of [beforeReduce,beforePrompt,beforeDispatch])
    assert.equal(typeof descriptor?.value,'function');

  const marked=new WeakSet();
  const chosenResults=new WeakMap();
  const initializedStores=new WeakSet();
  const audit={
    version:VERSION,ownerSeat:seat,markedSourcePrompts:0,
    eligibleOwnerPromptChoices:0,
    nativeAlreadyPreservedPrintedCost:0,
    safePrintedCostAlternativesFound:0,
    nativeValidAlternativesSelected:0,
    fallbackOriginalNativeChoice:0,
    selectedIntentReceipts:[],
    nativeAcceptedSelectedMoves:0,
    nativeRejectedSelectedMoves:0,
    acceptedPhysicalTransferReceipts:[],
    liveStoreDetected:false,
    allPromptFamiliesPaperVerified:false,
    competitiveGameQualified:false
  };

  function reduceEffect(store,state,effect){
    const original=effect?.constructor?.name==='AfterAttackEffect'&&
      effect.attack===this.attacks?.[0];
    const prior=original?new Set(state.prompts):null;
    const result=beforeReduce.value.call(this,store,state,effect);
    if(original){
      for(const prompt of state.prompts){
        if(!prior.has(prompt)&&
           prompt?.constructor?.name==='AttachEnergyPrompt'&&
           prompt.playerId===effect.player?.id){
          marked.add(prompt);
          audit.markedSourcePrompts++;
        }
      }
    }
    return result;
  }

  function getPromptResult(state,prompt){
    const nativeChoice=beforePrompt.value.call(this,state,prompt);
    const owner=state?.players?.[seat];
    if(!marked.has(prompt)||state.activePlayer!==seat||
       owner?.id!==prompt.playerId||
       owner.active?.getPokemonCard()?.fullName!=='Iron Thorns ex TWM'||
       prompt.cardList!==owner.active||
       prompt.playerType!==PlayerType.BOTTOM_PLAYER||
       !Array.isArray(prompt.slots)||prompt.slots.length!==1||
       prompt.slots[0]!==SlotType.BENCH||
       !Array.isArray(nativeChoice)||nativeChoice.length!==1||
       !nativeChoice[0]?.card||!nativeChoice[0]?.to||
       !owner.active.energies.cards.includes(nativeChoice[0].card))
      return nativeChoice;
    audit.eligibleOwnerPromptChoices++;
    const energyCards=owner.active.energies.cards;
    const names=energyCards.map(card=>card.name);
    const stadiums=state.players.flatMap(player=>
      player.stadium.cards.map(card=>card.name));
    const originalName=nativeChoice[0].card.name;
    const selectedName=preferredAlternativeDonorName(
      names,stadiums,originalName);
    if(selectedName===null){
      if(canPayVoltCost(names.filter((_,i)=>
        i!==names.indexOf(originalName)),stadiums)===true)
        audit.nativeAlreadyPreservedPrintedCost++;
      audit.fallbackOriginalNativeChoice++;
      return nativeChoice;
    }
    audit.safePrintedCostAlternativesFound++;
    const physical=energyCards.find(card=>
      card.name===selectedName&&prompt.cardList.cards.includes(card));
    if(!physical){
      audit.fallbackOriginalNativeChoice++;
      return nativeChoice;
    }
    const alternative=[{card:physical,to:nativeChoice[0].to}];
    if(prompt.validate(alternative,state)!==true){
      audit.fallbackOriginalNativeChoice++;
      return nativeChoice;
    }
    audit.nativeValidAlternativesSelected++;
    const detail={
      turn:state.turn,ownerSeat:seat,source:'Iron Thorns ex TWM',
      nativeDonor:originalName,preferredDonor:physical.name,
      publicStadium:stadiums,ownerActiveEnergyBefore:names,
      targetIndex:nativeChoice[0].to.index,
      nativePromptId:prompt.id
    };
    chosenResults.set(alternative,{...detail,physical});
    audit.selectedIntentReceipts.push(detail);
    return alternative;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'){
      initializedStores.add(this);
      audit.liveStoreDetected=true;
    }
    const details=action?.constructor?.name==='ResolvePromptAction'?
      chosenResults.get(action.result):null;
    if(!details)return beforeDispatch.value.call(this,action,...args);
    const owner=this.state.players[details.ownerSeat];
    const recipient=owner.bench[details.targetIndex];
    const beforeSource=owner.active.energies.cards.includes(details.physical);
    const beforeTarget=recipient.energies.cards.includes(details.physical);
    try{
      const result=beforeDispatch.value.call(this,action,...args);
      const removed=beforeSource&&!owner.active.energies.cards.includes(details.physical);
      const received=!beforeTarget&&recipient.energies.cards.includes(details.physical);
      audit.nativeAcceptedSelectedMoves++;
      audit.acceptedPhysicalTransferReceipts.push({
        ...details,physical:details.physical.fullName,
        genuineLiveStore:initializedStores.has(this),
        sourceHadCardBefore:beforeSource,
        movedFromActive:removed,receivedOnBench:received,
        printedCostStillPayable:canPayVoltCost(
          owner.active.energies.cards.map(card=>card.name),
          this.state.players.flatMap(player=>
            player.stadium.cards.map(card=>card.name)))
      });
      return result;
    }catch(error){
      audit.nativeRejectedSelectedMoves++;
      throw error;
    }
  }
  Object.defineProperty(IronThornsex.prototype,'reduceEffect',
    {...beforeReduce,value:reduceEffect});
  Object.defineProperty(AttachEnergyPromptResolver.prototype,'getPromptResult',
    {...beforePrompt,value:getPromptResult});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(IronThornsex.prototype.reduceEffect,reduceEffect);
    assert.strictEqual(AttachEnergyPromptResolver.prototype.getPromptResult,
      getPromptResult);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(AttachEnergyPromptResolver.prototype,
      'getPromptResult',beforePrompt);
    Object.defineProperty(IronThornsex.prototype,'reduceEffect',beforeReduce);
  }
}

module.exports={VERSION,preferredAlternativeDonorName,withPrintedVoltDonorPreference};
