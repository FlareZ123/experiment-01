'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-rank30-original-native-filch-vs-funded-rondo-v1';

/**
 * Reversible original native Store counterfactual on one authenticated
 * source owner's existing AttackAction. Rondo is offered only where Bench
 * Latias ex has its face-up Skyliner and Clefairy has two real Psychic cards.
 * Native Store cost check and accepted RetreatAction are required.
 *
 * The actual Attacking Pokémon after retreat is selected independently by
 * the normal two-seat bot. The fork cannot change opposing actor choices.
 *
 * @template T
 * @param {()=>T} execute Real source rank30 game.
 * @param {{sourceSeat:0|1,targetTurn:number,treatment:boolean}} config
 * @returns {{result:T,audit:object}} Retrospective native observation.
 */
function withRank30FilchVsRondoFork(execute,config){
  assert.equal(typeof execute,'function');
  assert.ok(config.sourceSeat===0||config.sourceSeat===1);
  assert.ok(Number.isSafeInteger(config.targetTurn)&&config.targetTurn>0);
  const load=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const {Store}=load('game/store/store');
  const {CheckRetreatCostEffect}=load('game/store/effects/check-effects');
  const {RetreatAction}=load('game/store/actions/game-actions');
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const handled=new WeakSet();
  const audit={version:VERSION,sourceSeat:config.sourceSeat,
    targetTurn:config.targetTurn,treatment:config.treatment,
    nativeSourceFilchOpportunities:0,actualRetreatsAccepted:0,
    nativeRetreatFailures:0,ownerVisibleWindows:[],
    neverInspectedOpponentHiddenZones:true,
    nativeActionReplacementOnly:true,competitiveQualified:false};
  function dispatch(action,...args){
    const state=this.state,owner=state?.players?.[config.sourceSeat];
    const actionName=action?.constructor?.name;
    const actor=action?.clientId??action?.id??action?.playerId;
    const ownerTurn=owner?.id===actor&&
      state.activePlayer===config.sourceSeat&&
      state.turn===config.targetTurn;
    if(!ownerTurn||actionName!=='AttackAction'||handled.has(this))
      return before.value.apply(this,[action,...args]);
    const active=owner.active?.getPokemonCard();
    if(active?.name!=='Mimikyu')
      return before.value.apply(this,[action,...args]);
    const skyliner=owner.bench.some(slot=>
      slot.getPokemonCard()?.fullName==='Latias ex SSP'&&
      slot.getPokemonCard()?.powers?.some(p=>p.name==='Skyliner'));
    if(!skyliner)
      return before.value.apply(this,[action,...args]);
    const index=owner.bench.findIndex(slot=>
      slot.getPokemonCard()?.fullName==="Lillie's Clefairy ex JTG"&&
      slot.energies.cards.filter(card=>
        card.fullName.startsWith('Psychic Energy ')).length>=2);
    if(index<0)return before.value.apply(this,[action,...args]);
    const check=new CheckRetreatCostEffect(owner);
    this.reduceEffect(state,check);
    audit.nativeSourceFilchOpportunities++;
    const window={
      globalTurn:state.turn,sourceSeat:config.sourceSeat,
      ownerId:owner.id,originalAction:actionName,
      originalAttack:action?.attackName??action?.attack??null,
      ownActive:active.fullName,ownActiveEnergies:
        owner.active.energies.cards.map(card=>card.fullName),
      benchLatiasSkyliner:skyliner,
      targetBenchIndex:index,
      targetClefairyEnergies:owner.bench[index].energies.cards
        .map(card=>card.fullName),
      checkRetreatCostUnits:check.cost.length,
      priorRetreatTurn:owner.retreatedTurn,
      ownActiveStatuses:[...(owner.active.specialConditions??[])],
      opponentPublicActive:
        state.players[1-config.sourceSeat].active
          .getPokemonCard()?.fullName??null};
    audit.ownerVisibleWindows.push(window);
    if(!config.treatment||check.cost.length!==0||
       owner.retreatedTurn===state.turn||
       owner.active.specialConditions?.some(condition=>
         condition==='ASLEEP'||condition==='PARALYZED')){
      return before.value.apply(this,[action,...args]);
    }
    handled.add(this);
    try{
      const result=before.value.apply(this,[
        new RetreatAction(owner.id,index),...args]);
      audit.actualRetreatsAccepted++;
      window.nativeRetreatAccepted=true;
      window.activeAfter=owner.active.getPokemonCard()?.fullName??null;
      return result;
    }catch(error){
      audit.nativeRetreatFailures++;
      window.nativeError=String(error?.stack??error).slice(0,1400);
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){if(error&&typeof error==='object')
    error.agent6FilchRondoAudit={...audit,aborted:true};throw error;}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}
module.exports={VERSION,withRank30FilchVsRondoFork};
