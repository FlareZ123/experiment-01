'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent10-rank9-extra-energy-bomb-owner-frontier-v1';
const ROOTS=new Set(['PlayCardAction','PassTurnAction','UseAbilityAction','AttackAction','RetreatAction','UseStadiumAction']);

/**
 * Exact source-print scope: Electrode-GX CES48 has Extra Energy Bomb.
 * This is only an owner-visible opportunity census, never an action selector.
 * The printed effect excludes Pokémon-GX and Pokémon-EX recipients. Native
 * slot card identities and attached Energies are face-up information.
 * @param {object} state Genuine pinned native Store state before a root action.
 * @param {0|1} seat Owner physical seat.
 * @param {number|string} energySuperType Pinned SuperType.ENERGY enum.
 * @returns {object} Detached owner and public-zone facts.
 */
function rank9BombOwnerSnapshot(state,seat,energySuperType){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  const opposing=state.players[1-seat];
  assert.ok(owner&&opposing);
  const slots=[{location:'active',slot:owner.active},
    ...owner.bench.map((slot,index)=>({location:'bench:'+index,slot}))];
  const pokemon=slots.map(({location,slot})=>{
    const card=slot.getPokemonCard();
    return card?{
      location,printing:card.fullName??card.name,
      attachedEnergyCards:slot.energies.cards.map(x=>x.fullName??x.name)
    }:null;
  }).filter(Boolean);
  const electrode=pokemon.filter(x=>x.printing==='Electrode-GX CES');
  const possibleTargets=pokemon.filter(x=>
    !/(?:-GX|-EX)(?:\s|$)/.test(x.printing));
  const discardedEnergy=owner.discard.cards.filter(card=>
    card.superType===energySuperType);
  const hand=owner.hand.cards;
  const held=(name)=>hand.filter(card=>
    (card.fullName??card.name??'').startsWith(name+' ')).length;
  const heldDiscardConnectors={
    battleCompressor:held('Battle Compressor'),
    ultraBall:held('Ultra Ball'),secretBox:held('Secret Box')
  };
  const heldEnergyPrintings=hand.filter(card=>
    card.superType===energySuperType).map(card=>card.fullName??card.name);
  const opponentPrizes=opposing.getPrizeLeft();
  return {
    globalTurn:state.turn,ownerSeat:seat,ownerPrizes:owner.getPrizeLeft(),
    opponentPrizes,activePrinting:pokemon.find(x=>x.location==='active')?.printing??null,
    electrodeLocations:electrode.map(x=>x.location),
    discardedEnergyPrintings:discardedEnergy.map(x=>x.fullName??x.name),
    discardedEnergyCount:discardedEnergy.length,
    heldDiscardConnectors,heldEnergyPrintings,
    ownerHandSize:hand.length,ownerDeckCount:owner.deck.cards.length,
    anyEnergyInDiscard:discardedEnergy.length>0,
    atLeastFiveEnergyCardsInDiscard:discardedEnergy.length>=5,
    eligibleRecipientLocations:possibleTargets.map(x=>x.location),
    eligibleRecipientPrintings:possibleTargets.map(x=>x.printing),
    eligibleMegaAbsolEx:possibleTargets.some(x=>x.printing==='Mega Absol ex M1L'),
    sourceHasElectrode:electrode.length>0,
    possibleEnergyTransferGeometry:electrode.length>0&&
      discardedEnergy.length>0&&possibleTargets.length>0,
    apparentTwoPrizeSelfKoRisk:electrode.length>0&&opponentPrizes<=2,
    ownBoard:pokemon,
    boundary:'Owner discard and face-up board only. Ability permission, minimum attachment, recipient legality, board locks, opportunity cost, native selected effect and Prize settlement remain unverified.'
  };
}

/**
 * Observe native root choices in their existing order without intervention.
 * Each original Store instance is labeled by its chronological trial index;
 * caller must verify exactly one Store per registered trial before joining.
 * @template T
 * @param {()=>T} execute Synchronous original bilateral run.
 * @param {{Store?:Function,energySuperType?:number|string,
 *   trialSourceSeats:(0|1)[]}} deps
 * @returns {{result:T,audit:object}}
 */
function withRank9BombOwnerFrontier(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(deps.trialSourceSeats)&&deps.trialSourceSeats.every(x=>x===0||x===1));
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const energySuperType=deps.energySuperType??
    require(path.join(output,'game/store/card/card-types')).SuperType.ENERGY;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const observedStores=new Map();
  const records=[];
  function report(){
    return {
      version:VERSION,observedStoreCount:records.length,
      expectedRegisteredTrials:deps.trialSourceSeats.length,
      oneStorePerRegisteredTrial:records.length===deps.trialSourceSeats.length,
      trials:records.map(r=>({
        trialIndex:r.trialIndex,sourceSeat:r.sourceSeat,
        dispatchesObserved:r.dispatchesObserved,
        firstOwnerRoots:r.firstOwnerRoots,
        acceptedSourcePasses:r.acceptedSourcePasses,
        sourceAbilityRoots:r.sourceAbilityRoots,
        rejectedOwnerRoots:r.rejectedOwnerRoots
      })),
      changedNativePolicy:false,ownerOnly:true,
      certifiedPaperAbilityOpportunity:false,
      competitivelyQualifiedGames:0
    };
  }
  function wrapped(action,...args){
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&!observedStores.has(this)){
      const trialIndex=records.length;
      const record={trialIndex,sourceSeat:deps.trialSourceSeats[trialIndex]??null,
        dispatchesObserved:0,seen:new Set(),firstOwnerRoots:[],
        acceptedSourcePasses:[],sourceAbilityRoots:[],rejectedOwnerRoots:[]};
      observedStores.set(this,record);
      records.push(record);
    }
    const record=observedStores.get(this);
    if(record)record.dispatchesObserved++;
    const state=this.state;
    const seat=record?.sourceSeat;
    const pending=state?.prompts?.some(p=>p.result===undefined)===true;
    const root=ROOTS.has(name)&&seat!==null&&seat!==undefined&&
      state.activePlayer===seat&&!pending&&Number.isSafeInteger(state.turn)&&state.turn>0;
    const before=root?rank9BombOwnerSnapshot(state,seat,energySuperType):null;
    try{
      const result=previous.value.call(this,action,...args);
      if(before){
        const event={...before,action:name,
          abilityName:name==='UseAbilityAction'?action.name??null:null};
        const key=String(before.globalTurn);
        if(!record.seen.has(key)){
          record.seen.add(key);
          record.firstOwnerRoots.push(event);
        }
        if(name==='PassTurnAction')record.acceptedSourcePasses.push(event);
        if(name==='UseAbilityAction')record.sourceAbilityRoots.push(event);
      }
      return result;
    }catch(error){
      if(before)record.rejectedOwnerRoots.push({
        turn:before.globalTurn,action:name,
        message:String(error?.message??error)});
      if(error&&typeof error==='object')error.rank9BombOwnerEvidence=report();
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:wrapped});
  try{
    const result=execute();
    return {result,audit:report()};
  }catch(error){
    if(error&&typeof error==='object'&&!error.rank9BombOwnerEvidence)
      error.rank9BombOwnerEvidence=report();
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,wrapped);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,rank9BombOwnerSnapshot,withRank9BombOwnerFrontier};
