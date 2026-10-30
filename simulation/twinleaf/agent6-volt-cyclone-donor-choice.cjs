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
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
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
    competitiveQualified:false
  };

  function decode(state){
    const actorSeat=state.players.findIndex(p=>p.id===this.client?.id);
    const p=state.players[seat];
    const pending=state.prompts.find(x=>x.result===undefined);
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
    if(!event)return beforeDispatch.value.apply(this,[action,...rest]);
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
  }
}
module.exports={withSourceVoltCycloneEnergyDonor};
