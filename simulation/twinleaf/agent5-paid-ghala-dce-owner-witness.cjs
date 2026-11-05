'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent5-paid-ghala-dce-owner-physical-witness-v1';
const DCE='Double Colorless Energy SUM';

/**
 * A read-only owner hand and face-up board snapshot at an actual Energy-card
 * play. No unopened deck, Prize contents, or opposing concealed zone is read.
 * @param {object} player Native acting player, at a real Store dispatch.
 * @returns {object}
 */
function publicAndOwnerSnapshot(player){
  const pokemon=slot=>({
    name:slot.getPokemonCard()?.name??null,
    energies:slot.energies.cards.map(c=>c.fullName),
    tools:slot.tools.map(c=>c.fullName)
  });
  return {
    hand:player.hand.cards.map(c=>c.fullName),
    active:pokemon(player.active),
    bench:player.bench.map(pokemon),
    stadium:player.stadium.cards.map(c=>c.fullName),
    energyPlayedTurn:player.energyPlayedTurn,
    stadiumPlayedTurn:player.stadiumPlayedTurn,
    cannotPlayEnergyCards:player.cannotPlayEnergyCards,
    cannotPlayStadiumCards:player.cannotPlayStadiumCards
  };
}

/**
 * Witness actual source-owned Double Colorless Energy plays in a pre-existing
 * native run. Store state is inspected only after a real actor submits a held
 * card; this wrapper never selects, submits, rejects, or mutates an action.
 * The owner can inspect their own hand and all in-play Pokemon.
 * @template T
 * @param {()=>T} execute Existing native runner.
 * @param {{trialId?:string,Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaidHalaDceOwnerWitness(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const audit={
    schema:VERSION,
    trialId:deps.trialId??null,
    actualNativeStores:0,
    sourceTurn2Seat0DceCardPlayObservations:[],
    opponentConcealedZonesRead:false,
    unopenedOwnerDeckRead:false,
    selectedOrMutatedAnyAction:false,
    qualifiedCompetitiveGames:0
  };
  let live=null;
  function dispatch(action,...rest){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&!live){
      live=this;
      audit.actualNativeStores++;
    }
    const actual=this===live;
    const state=this.state;
    const seat=actual&&kind==='PlayCardAction'?
      state.players.findIndex(p=>p.id===action.id):-1;
    const owner=seat>=0?state.players[seat]:null;
    const physical=owner?.hand?.cards?.[action.handIndex]??null;
    const selected=actual&&state.turn===2&&seat===0&&
      physical?.fullName===DCE;
    const prior=selected?publicAndOwnerSnapshot(owner):null;
    const result=before.value.call(this,action,...rest);
    if(selected){
      const after=this.state.players[seat];
      const post=publicAndOwnerSnapshot(after);
      const locations=[
        {slot:'Active',pokemon:after.active},
        ...after.bench.map((pokemon,i)=>({
          slot:'Bench '+i,pokemon
        }))
      ].filter(x=>x.pokemon.energies.cards.includes(physical))
        .map(x=>x.slot);
      audit.sourceTurn2Seat0DceCardPlayObservations.push({
        actualActingSeat:seat,
        globalTurn:state.turn,
        actualPlayedPrinting:physical.fullName,
        physicalCardLeftOwnHand:!after.hand.cards.includes(physical),
        attachedExactPhysicalObjectToOwnPokemon:locations.length===1,
        exactPhysicalRecipientSlots:locations,
        playCardTarget:{...action.target},
        before:prior,
        after:post
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{
    return {result:execute(),audit};
  }catch(error){
    if(error&&typeof error==='object'){
      error.agent5PaidHalaDceOwnerWitness={...audit};
    }
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}

module.exports={VERSION,DCE,publicAndOwnerSnapshot,
  withPaidHalaDceOwnerWitness};
