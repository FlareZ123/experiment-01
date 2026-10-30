'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

/**
 * An experimental owner-only chooser for Iron Thorns ex's real native
 * Volt Cyclone MoveEnergyPrompt. Never inspects opponent's private zones.
 * The owner can choose the Energy to move after the printed attack damage.
 *
 * @template T
 * @param {()=>T} work Real native Store game.
 * @param {{seat:0|1,donorName?:string}} options
 * @returns {{result:T,audit:object}}
 */
function withSourceVoltCycloneEnergyDonor(work,options){
  assert.equal(typeof work,'function');
  assert.ok(options?.seat===0||options?.seat===1);
  const {seat}=options;
  const name=options.donorName??null;
  const root=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(root,p));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {AttachEnergyPromptResolver}=native(
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const beforeResolve=Object.getOwnPropertyDescriptor(
    AttachEnergyPromptResolver.prototype,'getPromptResult');
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeResolve?.value,'function');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  const selected=new WeakMap();
  const audit={
    sourceSeat:seat,preferredPhysicalName:name,
    ownerMovePromptsObserved:0,
    validPreferredMoves:0,
    selectedPreferredMoves:0,
    acceptedPreferredMoves:0,
    rejectedPreferredMoves:0,
    receipts:[],
    ownerPendingPromptKinds:[],
    nativeEnergyMovementTransitions:[],
    sourceAttachEnergyPromptsObserved:0,
    preferredAttachEnergyResultsSelected:0,
    preferredPhysicallyMoved:0,
    sourceAttachEnergyPreferredFallbacks:0,
    competitiveQualified:false
  };

  // Volt Cyclone's original pinned implementation uses AttachEnergyPrompt
  // and the typed AttachEnergyPromptResolver. It does not use MoveEnergyPrompt.
  // The real attached Energy is a public owner-board physical card.
  function resolveAttachEnergy(state,prompt){
    const p=state.players[seat];
    if(!name||state.activePlayer!==seat||state.turn!==3||!p||
       prompt?.constructor?.name!=='AttachEnergyPrompt'||
       prompt.playerId!==p.id||
       p.active.getPokemonCard()?.name!=='Iron Thorns ex')
      return beforeResolve.value.call(this,state,prompt);
    audit.sourceAttachEnergyPromptsObserved++;
    const dest=p.bench.findIndex(x=>
      x.getPokemonCard()?.name==='Iron Thorns ex');
    const physical=p.active.energies.cards.find(x=>
      x.name===name&&prompt.cardList?.cards.includes(x));
    if(!physical||dest<0){
      audit.sourceAttachEnergyPreferredFallbacks++;
      return beforeResolve.value.call(this,state,prompt);
    }
    const to={
      player:prompt.playerType,slot:SlotType.BENCH,index:dest
    };
    const transfers=[{card:physical,to}];
    if(prompt.validate(transfers,state)!==true){
      audit.sourceAttachEnergyPreferredFallbacks++;
      return beforeResolve.value.call(this,state,prompt);
    }
    audit.preferredAttachEnergyResultsSelected++;
    audit.receipts.push({kind:'owner-preferred-AttachEnergyPrompt-result',
      turn:state.turn,promptId:prompt.id,
      chosenPhysical:physical.fullName,
      sourceActiveBefore:p.active.energies.cards.map(c=>c.fullName),
      targetBenchIndex:dest,
      exactPromptCardPool:prompt.cardList.cards.map(c=>c.fullName)});
    return transfers;
  }

  function decode(state){
    const actorSeat=state.players.findIndex(p=>p.id===this.client?.id);
    const p=state.players[seat];
    const pending=state.prompts.find(x=>x.result===undefined);
    if(actorSeat===seat&&state.activePlayer===seat&&
       state.turn===3&&p?.active.getPokemonCard()?.name==='Iron Thorns ex'){
      const pendingKinds=state.prompts.filter(x=>
        x.result===undefined).map(x=>({
          kind:x.constructor.name,id:x.id,owner:x.playerId===p.id
        }));
      if(pendingKinds.length){
        const text=JSON.stringify(pendingKinds);
        if(!audit.ownerPendingPromptKinds.some(x=>
          JSON.stringify(x.pending)===text)){
          audit.ownerPendingPromptKinds.push({turn:state.turn,
            pending:pendingKinds});
        }
      }
    }
    if(actorSeat!==seat||state.activePlayer!==seat||
       state.turn!==3||!p||
       pending?.constructor?.name!=='MoveEnergyPrompt'||
       pending.playerId!==p.id||
       p.active.getPokemonCard()?.name!=='Iron Thorns ex')
      return beforeDecode.value.call(this,state);
    const existing=p.active.energies.cards.map(c=>c.fullName);
    const benches=p.bench.map((slot,i)=>({
      slot,index:i,
      name:slot.getPokemonCard()?.name??null
    })).filter(x=>x.name);
    audit.ownerMovePromptsObserved++;
    if(!name)
      return beforeDecode.value.call(this,state);
    const energy=p.active.energies.cards.find(c=>c.name===name);
    const dest=benches.find(x=>x.name==='Iron Thorns ex');
    if(!energy||!dest){
      audit.receipts.push({
        kind:'owner-menu-no-valid-intent',turn:state.turn,
        handVisible:false,energyNames:existing,
        benchNames:benches.map(x=>x.name)});
      return beforeDecode.value.call(this,state);
    }
    const from={
      player:PlayerType.BOTTOM_PLAYER,
      slot:SlotType.ACTIVE,index:0
    };
    const to={
      player:PlayerType.BOTTOM_PLAYER,
      slot:SlotType.BENCH,index:dest.index
    };
    const movement=[{from,to,card:energy}];
    if(pending.validate(movement,state)!==true)
      return beforeDecode.value.call(this,state);
    audit.validPreferredMoves++;
    const action=new ResolvePromptAction(pending.id,movement);
    selected.set(action,{sourceSeat:seat,
      turn:state.turn,energy,energyName:energy.fullName,
      destination:dest.index,sourceName:p.active.getPokemonCard().fullName,
      beforeActive:existing});
    audit.selectedPreferredMoves++;
    return action;
  }
  function dispatch(action,...rest){
    const event=selected.get(action);
    if(!event){
      const state=this.state;
      const source=state?.players?.[seat];
      const observe=state?.turn===3&&state.activePlayer===seat&&
        source?.active.getPokemonCard()?.name==='Iron Thorns ex';
      const stateDigest=()=>({
        active:source.active.energies.cards.map(c=>c.fullName),
        benches:source.bench.map((b,i)=>({
          i,pokemon:b.getPokemonCard()?.name??null,
          energy:b.energies.cards.map(c=>c.fullName)
        })).filter(b=>b.pokemon)
      });
      const before=observe?stateDigest():null;
      const pending=observe?state.prompts.filter(x=>
        x.result===undefined).map(x=>({
          kind:x.constructor.name,
          owner:x.playerId===source.id
        })):[];
      const result=beforeDispatch.value.apply(this,[action,...rest]);
      if(observe){
        const after=stateDigest();
        if(JSON.stringify(before)!==JSON.stringify(after)){
          audit.nativeEnergyMovementTransitions.push({
            turn:3,triggerAction:action?.constructor?.name,
            pendingBefore:pending,before,after
          });
          if(name&&action?.constructor?.name==='ResolvePromptAction'&&
             pending.some(x=>x.kind==='AttachEnergyPrompt'&&x.owner)&&
             before.active.some(x=>x.startsWith(name))&&
             !after.active.some(x=>x.startsWith(name))&&
             after.benches.some((b,i)=>
               b.energy.some(x=>x.startsWith(name))&&
               !before.benches[i]?.energy.some(x=>x.startsWith(name)))){
            audit.preferredPhysicallyMoved++;
          }
        }
      }
      return result;
    }
    const p=this.state.players[event.sourceSeat];
    const originalBenchEnergy=p.bench[event.destination].energies.cards.slice();
    try{
      const result=beforeDispatch.value.apply(this,[action,...rest]);
      audit.acceptedPreferredMoves++;
      audit.receipts.push({
        kind:'accepted-real-native-move-prompt',
        sourceSeat:seat,turn:event.turn,
        fromPokemon:event.sourceName,
        toBenchIndex:event.destination,
        requestedPhysicalEnergy:event.energyName,
        beforeActive:event.beforeActive,
        afterActive:p.active.energies.cards.map(c=>c.fullName),
        beforeTargetBench:originalBenchEnergy.map(c=>c.fullName),
        afterTargetBench:p.bench[event.destination].energies.cards.map(c=>
          c.fullName),
        movedPhysicalEnergy:
          !p.active.energies.cards.includes(event.energy)&&
          p.bench[event.destination].energies.cards.includes(event.energy)
      });
      return result;
    }catch(error){
      audit.rejectedPreferredMoves++;
      audit.receipts.push({kind:'rejected-native-move',
        turn:event.turn,preferred:event.energyName,
        error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(AttachEnergyPromptResolver.prototype,
    'getPromptResult',{...beforeResolve,value:resolveAttachEnergy});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:dispatch});
  try{return {result:work(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',beforeDecode);
    assert.strictEqual(AttachEnergyPromptResolver.prototype.getPromptResult,
      resolveAttachEnergy);
    Object.defineProperty(AttachEnergyPromptResolver.prototype,
      'getPromptResult',beforeResolve);
  }
}
module.exports={withSourceVoltCycloneEnergyDonor};
