'use strict';

const assert=require('node:assert/strict');

/** @param {object} card @returns {string} */
const printing=card=>{
  assert.ok(typeof card?.fullName==='string'&&card.fullName.length>0);
  return card.fullName;
};

/**
 * A complete detached, exact-printing description of a face-up Pokémon.
 * Every field here is visible to both players in a paper match.
 * @param {object} slot Pinned engine Pokémon card list.
 * @returns {object|null}
 */
function visiblePokemon(slot){
  const pokemon=slot.getPokemonCard();
  if(!pokemon)return null;
  return {
    printing:printing(pokemon),name:pokemon.name,
    hp:pokemon.hp,damage:slot.damage,
    evolutionPrintings:slot.cards.map(printing),
    energies:slot.energies.cards.map(printing),
    tools:slot.tools.map(printing),
    attacks:pokemon.attacks.map(attack=>({
      name:attack.name,cost:[...attack.cost]
    })),
    abilities:pokemon.powers.map(power=>power.name)
  };
}

/** @param {object} player @returns {object} */
function publicPlayer(player){
  return {
    active:visiblePokemon(player.active),
    bench:player.bench.map(visiblePokemon),
    stadium:player.stadium.cards.map(printing),
    discard:player.discard.cards.map(printing),
    lostZone:player.lostzone.cards.map(printing),
    resolvingSupporter:player.supporter.cards.map(printing),
    handCount:player.hand.cards.length,
    deckCount:player.deck.cards.length,
    prizeCount:player.prizes.reduce((sum,slot)=>sum+slot.cards.length,0)
  };
}

/** @param {any} value @returns {any} */
function freezeView(value){
  if(value&&typeof value==='object'){
    Object.values(value).forEach(freezeView);
    Object.freeze(value);
  }
  return value;
}

/**
 * Construct the only native-State-derived input admitted to an actor-owned
 * decision module at a root or pending owner-authenticated prompt.
 * The own hand is private to its owner; the two public
 * boards, discard piles and counts are visible to both sides. Hidden deck,
 * face-down Prize, and opponent hand *identities* are never read.
 *
 * The caller may supply an authenticated owner K1 snapshot. This routine
 * refuses physical deck/Prize identities even if the owner has performed
 * a legitimate deck search: such information must enter through the
 * separately provenance-checked owner-knowledge ledger.
 *
 * This is an interface for NEW decision policies, not a repair to Twinleaf's
 * unmodified SimpleTacticsAi. Native action construction and legality checks
 * must remain separate and use the genuine Store state.
 *
 * @param {object} state Real, already-authenticated Store State.
 * @param {0|1} seat Actual acting physical seat.
 * @param {{ownerK1Snapshot?:object}} [options]
 * @returns {object} Deeply frozen, detached actor observation.
 */
function actorObservation(state,seat,options={}){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  const owner=state.players[seat];
  const pending=state.prompts?.find(prompt=>prompt.result===undefined)??null;
  if(pending){
    assert.equal(pending.playerId,owner.id,
      'Only the prompted actor may inspect its own decision observation');
  }else{
    assert.equal(state.activePlayer,seat,'Actor-only root observation');
  }
  const ownK1=options.ownerK1Snapshot??null;
  if(ownK1!==null){
    assert.equal(typeof ownK1.exactMembershipKnown,'boolean');
    assert.ok(Number.isSafeInteger(ownK1.epoch)&&ownK1.epoch>=0);
  }
  const result={
    actorSeat:seat,globalTurn:state.turn,phase:state.phase,
    decisionKind:pending?'owner-prompt':'owner-root',
    pendingPromptType:pending?.constructor.name??null,
    pendingOwnerDeckSearch:Boolean(pending&&pending.cards===owner.deck),
    ownHand:owner.hand.cards.map(printing),
    ownPublic:publicPlayer(owner),
    opponentPublic:publicPlayer(state.players[1-seat]),
    ownTurnResources:{
      supporterPlayedTurn:owner.supporterTurn,
      energyPlayedTurn:owner.energyPlayedTurn,
      stadiumPlayedTurn:owner.stadiumPlayedTurn,
      vstarUsed:owner.usedVSTAR===true,
      itemPlayLocked:owner.cannotPlayItemCards===true,
      supporterPlayLocked:owner.cannotPlaySupporterCards===true,
      stadiumPlayLocked:owner.cannotPlayStadiumCards===true,
      specialEnergyPlayLocked:owner.cannotPlaySpecialEnergyCards===true
    },
    ownerK1:ownK1===null?null:{
      epoch:ownK1.epoch,
      exactMembershipKnown:ownK1.exactMembershipKnown,
      knownPrintings:ownK1.knownPrintings?.map(row=>({
        printing:row.printing,copies:row.copies
      }))??null,
      invalidationReason:ownK1.invalidationReason??null
    }
  };
  return freezeView(result);
}

module.exports={printing,visiblePokemon,publicPlayer,actorObservation};
