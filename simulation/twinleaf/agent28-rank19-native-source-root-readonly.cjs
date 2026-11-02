'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent28-original-rank19-native-public-active-roots-readonly-v1';
const RAGING='Raging Bolt ex TEF';
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Shadow-evaluate the existing pure Float Stone selector from the real
 * source player's information set. This proposal is audit-only and never
 * replaces, dispatches or validates a chosen native action.
 * @param {object} state Native current Store State.
 * @param {0|1} seat Physical source actor seat.
 * @returns {object|null}
 */
function observedMobilityProposal(state,seat){
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const {chooseOwnerFloatStoneMobility}=require(
    './agent1-owner-float-stone-mobility.cjs');
  const {SpecialCondition}=require(path.join(
    OUT,'game/store/card/card-types'));
  return chooseOwnerFloatStoneMobility(actorObservation(state,seat),{
    specialConditions:{
      ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED
    }
  });
}


/** @param {object} player Complete physical card zones, used only to identify the frozen source deck after native setup. */
function countSourceRagingCopies(player){
  const lists=[player.active,player.deck,player.hand,player.discard,
    player.lostzone,player.stadium,player.supporter,
    ...(player.bench??[]),...(player.prizes??[])];
  return lists.reduce((n,list)=>n+(list?.cards??[]).filter(card=>
    card.fullName===RAGING).length,0);
}

/** @param {object} player Public native Pokémon board only. */
function publicOwnerBoard(player){
  const active=player.active.getPokemonCard();
  const bench=player.bench.map(slot=>{
    const pokemon=slot.getPokemonCard();
    return pokemon?{
      printing:pokemon.fullName,
      attachedEnergy:(slot.energies?.cards??[]).map(c=>c.fullName)
    }:null;
  });
  return {
    activePrinting:active?.fullName??null,
    activeEnergy:(player.active.energies?.cards??[]).map(c=>c.fullName),
    activeTools:player.active.tools.map(c=>c.fullName),
    bench
  };
}

/**
 * Post-identity read-only original Store dispatch observer. Collects source
 * owner root position before each actual native action; never substitutes a
 * decision or consults any hidden zone during decision-making. The frozen
 * exact original-source 60 is recognized by two physical Raging Bolt TEF cards
 * after both original AddPlayerActions. Source identification is retrospective
 * audit code and is not presented to any player policy.
 *
 * @template T
 * @param {()=>T} run Synchronous original native full-game replay.
 * @param {{Store?:Function,GamePhase?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRank19NativePublicActiveReadOnly(run,deps={}){
  assert.equal(typeof run,'function');
  const Store=deps.Store??
    require(path.join(OUT,'game/store/store')).Store;
  const GamePhase=deps.GamePhase??
    require(path.join(OUT,'game/store/state/state')).GamePhase;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const sessions=new WeakMap(),records=[];
  let prepared=0;
  const original=descriptor.value;

  function observedDispatch(action,...rest){
    const actionType=action?.constructor?.name??'UnknownAction';
    if(actionType==='AddPlayerAction'&&!sessions.has(this)){
      sessions.set(this,{gameIndex:++prepared,sourceSeat:null,
        records:[],sourceIdentityCounts:null});
    }
    const session=sessions.get(this);
    const state=this.state;
    let observedRoot=null;
    if((session?.sourceSeat===0||session?.sourceSeat===1)&&
       state?.phase===GamePhase.PLAYER_TURN&&
       state.activePlayer===session.sourceSeat&&
       !state.prompts?.some(p=>p.result===undefined)&&
       actionType!=='ResolvePromptAction'){
      const board=publicOwnerBoard(state.players[session.sourceSeat]);
      const basicEnergyCards=[
        ...board.activeEnergy,...board.bench.flatMap(p=>p?.attachedEnergy??[])
      ].filter(p=>/^(Lightning|Fighting|Darkness|Grass|Fire|Water|Psychic|Metal|Fairy) Energy /.test(p)).length;
      const owner=state.players[session.sourceSeat];
      const ownHand=owner.hand.cards.map(card=>card.fullName);
      const heldMobility=ownHand.filter(printing=>
        ['Float Stone BKT','Guzma BUS','VS Seeker PHF',
          'Arven OBF'].includes(printing));
      observedRoot={
        actionOrdinalWithinSourceGame:session.records.length,
        turn:state.turn,
        retreatedTurn:owner.retreatedTurn,
        mobilityProposal:observedMobilityProposal(state,session.sourceSeat),
        actionType,
        actionAttack:actionType==='AttackAction'?action.name:null,
        ...board,
        attachedBasicEnergyCards:basicEnergyCards,
        heldMobility
      };
      session.records.push(observedRoot);
    }
    const result=original.call(this,action,...rest);
    const next=this.state;
    if(observedRoot&&actionType==='RetreatAction'){
      const nextOwner=next.players[session.sourceSeat];
      const nextBoard=publicOwnerBoard(nextOwner);
      observedRoot.afterRetreat={
        phase:next.phase,turn:next.turn,
        activePrinting:nextBoard.activePrinting,
        activeEnergy:nextBoard.activeEnergy,
        activeTools:nextBoard.activeTools,
        benchedRaging:nextBoard.bench.filter(p=>p?.printing===RAGING),
        retreatedTurn:nextOwner.retreatedTurn,
        remainingPrizes:nextOwner.getPrizeLeft(),
        pendingPromptTypes:(next.prompts??[])
          .filter(p=>p.result===undefined).map(p=>p.constructor.name)
      };
    }
    if(session&&session.sourceIdentityCounts===null&&
       next?.players?.length===2&&actionType==='AddPlayerAction'){
      const counts=next.players.map(countSourceRagingCopies);
      if(counts.includes(2)&&counts.includes(0)){
        session.sourceSeat=counts.indexOf(2);
        session.sourceIdentityCounts=counts;
        records.push(session);
      }
    }
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:observedDispatch});
  try{
    const result=run();
    const audit=records.map(s=>{
      const active=s.records.filter(r=>r.activePrinting===RAGING);
      const bench=s.records.filter(r=>
        r.bench.some(p=>p?.printing===RAGING));
      const fundedBench=bench.filter(r=>r.bench.some(p=>
        p?.printing===RAGING&&p.attachedEnergy.length>0));
      const fundedWhileHoOh=fundedBench.filter(r=>
        r.activePrinting==='Ho-Oh EX DRX');
      return {gameIndex:s.gameIndex,sourceSeat:s.sourceSeat,
        sourcePhysicalRagingCounts:s.sourceIdentityCounts,
        sourceOwnerRootCount:s.records.length,
        sourceRagingActiveRoots:active.length,
        sourceRagingActiveUniqueTurns:[...new Set(active.map(x=>x.turn))],
        sourceRagingBenchRoots:bench.length,
        sourceRagingBenchedWithEnergyRoots:fundedBench.length,
        sourceRagingBenchUniqueTurns:[...new Set(bench.map(x=>x.turn))],
        fundedHoOhActiveRoots:fundedWhileHoOh.length,
        fundedHoOhWithFloatStoneHeld:fundedWhileHoOh.filter(x=>
          x.heldMobility.includes('Float Stone BKT')).length,
        fundedHoOhWithGuzmaHeld:fundedWhileHoOh.filter(x=>
          x.heldMobility.includes('Guzma BUS')).length,
        fundedHoOhWithVSSeekerHeld:fundedWhileHoOh.filter(x=>
          x.heldMobility.includes('VS Seeker PHF')).length,
        fundedHoOhWithArvenHeld:fundedWhileHoOh.filter(x=>
          x.heldMobility.includes('Arven OBF')).length,
        fundedHoOhWithFloatStoneAttached:fundedWhileHoOh.filter(x=>
          x.activeTools.includes('Float Stone BKT')).length,
        sourceRetreatPostDispatch:s.records.filter(r=>r.afterRetreat)
          .map(r=>({turn:r.turn,...r.afterRetreat})),
        fundedHoOhMobilitySamples:fundedWhileHoOh.slice(0,20).map(r=>({
          turn:r.turn,action:r.actionType,
          hand:r.heldMobility,activeTools:r.activeTools,
          activeEnergy:r.activeEnergy,retreatedTurn:r.retreatedTurn,
          mobilityProposal:r.mobilityProposal,
          benchRaging:r.bench.filter(p=>p?.printing===RAGING)
        })),
        sourceRagingBenchSamples:bench.slice(0,16).map(r=>({
          turn:r.turn,action:r.actionType,
          active:r.activePrinting,activeEnergy:r.activeEnergy,
          benchedRaging:r.bench.filter(p=>p?.printing===RAGING)
        })),
        bellowingDeclared:s.records.filter(x=>
          x.actionType==='AttackAction'&&
          x.actionAttack==='Bellowing Thunder').length,
        sourceActivePrintingCounts:s.records.reduce((out,r)=>{
          const key=r.activePrinting??'(none)';
          out[key]=(out[key]??0)+1;return out;
        },{}),
        ragingActiveEnergySamples:active.slice(0,25).map(r=>({
          turn:r.turn,action:r.actionType,
          activeEnergy:r.activeEnergy,
          attachedBasicEnergyCards:r.attachedBasicEnergyCards,
          bench:r.bench.filter(Boolean)
        }))
      };
    });
    return {result,audit,version:VERSION,
      qualification:'retrospective, read-only, source-identified native root census'};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,RAGING,countSourceRagingCopies,
  publicOwnerBoard,observedMobilityProposal,
  withRank19NativePublicActiveReadOnly};
