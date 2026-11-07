'use strict';
const assert=require('node:assert/strict');

const VERSION='agent8-public-event-receipt-v2';

/**
 * Only face-up cards and native public-use markers enter this detached
 * receipt. It deliberately excludes hand/deck/Prize contents, raw markers,
 * native instance IDs and un-timestamped playerLastAttack.
 *
 * @param {object} state Authenticated pinned Twinleaf State.
 * @param {0|1} seat Real current acting seat.
 * @param {object[]|null} [previousOpponentTurnAttacks=null]
 *   Research-owned, turn-stamped public history; null means unavailable,
 *   while [] means the opponent's previous turn contained no attacks.
 * @returns {Readonly<object>}
 */
function publicEventReceipt(state,seat,previousOpponentTurnAttacks=null){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(state.activePlayer,seat,'Event receipt is actor-turn scoped');
  const owner=state.players[seat];
  const opponent=state.players[1-seat];
  let opponentLastTurnAttacks=null;
  if(previousOpponentTurnAttacks!==null){
    assert.ok(Array.isArray(previousOpponentTurnAttacks));
    opponentLastTurnAttacks=previousOpponentTurnAttacks.map(row=>{
      assert.equal(row.playerId,opponent.id);
      assert.ok(Number.isSafeInteger(row.turn)&&row.turn>=0);
      assert.ok(typeof row.sourceCardFullName==='string'&&row.sourceCardFullName.length>0);
      assert.ok(typeof row.attackName==='string'&&row.attackName.length>0);
      assert.equal(typeof row.gxAttack,'boolean');
      assert.equal(typeof row.copycatAttack,'boolean');
      return Object.freeze({
        turn:row.turn,sourcePrinting:row.sourceCardFullName,
        attackName:row.attackName,gxAttack:row.gxAttack,
        copycatAttack:row.copycatAttack
      });
    });
    Object.freeze(opponentLastTurnAttacks);
  }

  /** @param {object} slot @returns {object|null} */
  const view=slot=>{
    const pokemon=slot.getPokemonCard();
    if(!pokemon)return null;
    const ledger=owner.movedToActiveThisTurn;
    const moved=Array.isArray(ledger)&&Number.isSafeInteger(pokemon.id)?
      ledger.includes(pokemon.id):null;
    const marker=owner.marker;
    const used=(name,source)=>typeof marker?.hasMarker==='function'?
      marker.hasMarker(name,source):null;
    const abilities=[];
    if(pokemon.fullName==='Shadow Rider Calyrex VMAX CRE'){
      abilities.push({name:'Underworld Door',
        usedThisTurn:used('UNDERWORLD_DOOR_MARKER',pokemon)});
    }
    if(pokemon.fullName==='Genesect V FST'){
      abilities.push({name:'Fusion Strike System',
        usedThisTurn:used('FUSION_STRIKE_SYSTEM_MARKER',pokemon)});
    }
    if(pokemon.fullName==='Pidgeot ex OBF'){
      abilities.push({name:'Quick Search',
        usedThisTurn:used('QUICK_SEARCH_MARKER')});
    }
    if(pokemon.fullName==='Dedenne-GX UNB'){
      abilities.push({name:'Dedechange',usedThisTurn:used('DEDECHANGE_MARKER')});
    }
    if(pokemon.fullName==='Crobat V DAA'){
      abilities.push({name:'Dark Asset',usedThisTurn:used('DARK_ASSET_MARKER')});
    }
    if(pokemon.fullName==='Squawkabilly ex PAL'){
      abilities.push({name:'Squawk and Seize',
        usedThisTurn:typeof owner.usedSquawkAndSeizeThisTurn==='boolean'?
          owner.usedSquawkAndSeizeThisTurn:null});
    }
    if(pokemon.name==='Fezandipiti ex'){
      abilities.push({name:'Flip the Script',
        usedThisTurn:typeof owner.usedTableTurner==='boolean'?
          owner.usedTableTurner:null});
    }
    return {
      printing:pokemon.fullName,
      movedFromBenchToActiveThisTurn:moved,
      knownAbilityUse:abilities
    };
  };
  const clone=entry=>entry===null?null:Object.freeze({
    ...entry,
    knownAbilityUse:Object.freeze(entry.knownAbilityUse.map(
      used=>Object.freeze(used)))
  });
  return Object.freeze({
    version:VERSION,actorSeat:seat,turn:state.turn,
    ownerActive:clone(view(owner.active)),
    ownerBench:Object.freeze(owner.bench.map(slot=>clone(view(slot)))),
    // Last-opponent-turn copied attack history is intentionally unknown:
    // pinned playerLastAttack has no turn stamp and can outlive a Pass.
    priorOpponentTurnKO:Object.freeze({
      any:typeof owner.pokemonKnockedOutDuringOpponentsLastTurn==='boolean'?
        owner.pokemonKnockedOutDuringOpponentsLastTurn:null,
      byAttack:typeof owner.pokemonKnockedOutByAttackDuringOpponentsLastTurn==='boolean'?
        owner.pokemonKnockedOutByAttackDuringOpponentsLastTurn:null
    }),
    // Legacy single-record field stays unknown; the turn-stamped list below
    // is supplied only by the research-owned Store event tracker.
    opponentLastTurnAttack:null,
    opponentLastTurnAttacks
  });
}
module.exports={VERSION,publicEventReceipt};
