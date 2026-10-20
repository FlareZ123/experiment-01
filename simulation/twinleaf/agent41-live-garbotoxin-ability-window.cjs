'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {publicBoardSnapshot}=require('./public-board-telemetry.cjs');
const engine=relative=>require(path.join(output,relative));

/**
 * Read-only native Store observation of rank11's source-first Tool Garbodor
 * and candidate's first response during global turn two. An Ability-block
 * check uses the pinned engine's real PowerEffect reduction against an actual
 * candidate in-play Pokémon, but a probe alone cannot certify all paper rules.
 *
 * This hook watches the real AddPlayer-started Store only, ignores detached
 * speculative Stores, and restores the original method after execution.
 *
 * @template T
 * @param {()=>T} execute Pinned synchronous canonical game.
 * @param {{sourceSeat?:0|1,candidateSeat?:0|1,turn?:number}} [options]
 * @param {{Store?:Function,GamePhase?:object,isAbilityBlocked?:Function,
 *   publicBoardSnapshot?:Function}} [deps] Pure test-only injected boundary.
 * @returns {{result:T,audit:object}}
 */
function withLiveGarbodorAbilityWindow(execute,{
  sourceSeat=0,candidateSeat=1,turn=2
}={},deps={}){
  assert.equal(typeof execute,'function');
  assert.ok((sourceSeat===0||sourceSeat===1)&&candidateSeat===1-sourceSeat);
  assert.ok(Number.isSafeInteger(turn)&&turn>0);
  const Store=deps.Store??engine('game/store/store').Store;
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const isAbilityBlocked=deps.isAbilityBlocked??
    engine('game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  const publicBoard=deps.publicBoardSnapshot??publicBoardSnapshot;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let actual=null;
  const audit={
    schema:'agent41-authentic-rank11-garbotoxin-ability-window-v1',
    sourceSeat,candidateSeat,turn,
    before:null,after:null,realStoreOnly:true,
    expectedPrintedGarbodor:'Garbodor BKP',
    type:'development-only-postaction-engine-powercheck',
    paperAndPolicyQualified:false
  };
  const tooledSource=(source)=>[source.active,...source.bench].some(slot=>
    slot.getPokemonCard()?.fullName==='Garbodor BKP' &&
    slot.tools.length>0);
  function dispatch(action){
    if(!actual&&action.constructor.name==='AddPlayerAction')actual=this;
    const result=previous.value.call(this,action);
    if(this!==actual || this.state.turn!==turn ||
        this.state.activePlayer!==candidateSeat ||
        this.state.phase!==GamePhase.PLAYER_TURN ||
        this.state.prompts.some(prompt=>prompt.result===undefined))return result;
    const state=this.state;
    const source=state.players[sourceSeat];
    const candidate=state.players[candidateSeat];
    const sourceTool=tooledSource(source);
    if((sourceTool&&audit.before)||(!sourceTool&&(!audit.before||audit.after)))
      return result;
    const ownActive=candidate.active.getPokemonCard();
    if(!ownActive)return result;
    const printedNewMoon=(ownActive.powers??[]).find(power=>
      power.name==='New Moon')??null;
    const activePowerChecks=(ownActive.powers??[]).map(power=>({
      name:power.name,
      blocked:Boolean(isAbilityBlocked(this,state,candidate,ownActive,power))
    }));
    // Garbotoxin affects publicly visible Benched Powers as well as the
    // Active Power. Keep the old Active-only fields for frozen packet readers.
    const inPlayPowerChecks=[
      ...activePowerChecks.map(check=>({
        zone:'Active',benchIndex:null,printing:ownActive.fullName,...check
      })),
      ...candidate.bench.flatMap((slot,index)=>{
        const pokemon=slot.getPokemonCard();
        return (pokemon?.powers??[]).map(power=>({
          zone:'Bench',benchIndex:index,printing:pokemon.fullName,
          name:power.name,
          blocked:Boolean(isAbilityBlocked(this,state,candidate,pokemon,power))
        }));
      })
    ];
    const snap={
      action:action.constructor.name,
      globalTurn:state.turn,
      sourceGarbodorHasTool:sourceTool,
      candidateActive:ownActive.fullName,
      candidatePrintedPowerNames:(ownActive.powers??[]).map(p=>p.name),
      candidatePrintedPowerChecks:activePowerChecks,
      candidateInPlayPrintedPowerChecks:inPlayPowerChecks,
      // The generic no-Power call is historical diagnostics only. Pinned
      // IS_ABILITY_BLOCKED synthesizes a generic Ability when Power is absent,
      // which can yield a false positive for exempt printed Abilities.
      candidateGenericAbilityBlocked:isAbilityBlocked(
        this,state,candidate,ownActive),
      candidatePrintedNewMoonBlocked:printedNewMoon?
        Boolean(isAbilityBlocked(this,state,candidate,ownActive,printedNewMoon)):
        null,
      publicBoard:publicBoard(state)
    };
    if(sourceTool)audit.before=snap;
    else audit.after=snap;
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{
    return {result:execute(),audit};
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch,
      'Native read-only Store window lost hook ownership');
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={withLiveGarbodorAbilityWindow};
