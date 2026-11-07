'use strict';

const assert=require('node:assert/strict');
const {enumerateActorToolCandidates}=
  require('./agent18-actor-tool-candidate-frontier.cjs');

const FLOAT_STONE_PREFIX='Float Stone ';
const FOREST_SEAL_STONE_PREFIX='Forest Seal Stone ';

/**
 * @param {object|null|undefined} pokemon Owner/public Pokémon snapshot.
 * @returns {boolean} Whether this Pokémon has a printed Ability.
 */
function hasPrintedAbility(pokemon){
  return Array.isArray(pokemon?.abilities)&&
    pokemon.abilities.some(ability=>
      typeof ability?.name==='string'&&ability.name.length>0
    );
}

/**
 * @param {object|null|undefined} pokemon Owner/public Pokémon snapshot.
 * @returns {boolean} Whether this is an unequipped Garbotoxin Garbodor.
 */
function isUnequippedGarbotoxin(pokemon){
  return pokemon?.name==='Garbodor'&&
    Array.isArray(pokemon.abilities)&&
    pokemon.abilities.some(ability=>ability?.name==='Garbotoxin')&&
    Array.isArray(pokemon.tools)&&pokemon.tools.length===0;
}

/**
 * @param {object|null|undefined} pokemon Owner/public Pokémon snapshot.
 * @returns {boolean} Whether this Pokémon is a Pokémon V/VSTAR/VMAX recipient.
 */
function isPokemonV(pokemon){
  const name=pokemon?.name??'';
  return name.endsWith(' V')||name.endsWith(' VMAX')||
    name.endsWith(' VSTAR');
}

/**
 * Conservatively preserve a still-usable Star Alchemy before activating
 * Garbotoxin. The source can use an owner-held Forest Seal Stone on a free
 * Pokémon V, or use one already attached to a Pokémon V, while VSTAR remains
 * unused. The native actor observation exposes the public vstarUsed marker.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @returns {boolean} Whether a possible Star Alchemy use should be preserved.
 */
function shouldDeferForStarAlchemy(view){
  if(view.ownPublic.publicTurnRestrictions.vstarUsed===true)return false;
  const ownerPokemon=[
    view.ownPublic.active,
    ...view.ownPublic.bench
  ].filter(Boolean);
  const forestSealStoneInHand=view.ownHand.some(printing=>
    printing.startsWith(FOREST_SEAL_STONE_PREFIX)
  );
  const forestSealStoneOnV=ownerPokemon.some(pokemon=>
    isPokemonV(pokemon)&&pokemon.tools.some(tool=>
      tool.startsWith(FOREST_SEAL_STONE_PREFIX)
    )
  );
  const freePokemonV=ownerPokemon.some(pokemon=>
    isPokemonV(pokemon)&&pokemon.tools.length===0
  );
  return forestSealStoneOnV||
    (forestSealStoneInHand&&freePokemonV);
}

/**
 * Select an owner-held Tool for an unequipped Garbotoxin Garbodor when the
 * opponent has a Pokémon with a printed Ability on its public board.
 *
 * This is an owner-only proposal. It reads only the acting player's hand,
 * the acting player's public board, and the opponent's public board. It does
 * not inspect the opponent's hidden hand, discard pile, or deck. Agent18's
 * enumerator supplies only candidates; the native Store remains the
 * authority for whether a Tool attachment is legal.
 *
 * Float Stone is preferred for mobility. Forest Seal Stone is a fallback
 * only when Star Alchemy is already used or no usable Pokémon V recipient
 * remains. When a VSTAR Power can still be used, the selector defers the
 * Garbotoxin lock rather than disabling that option prematurely.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @param {{toolPrintings:Set<string>}} catalog Public Tool printing catalog.
 * @returns {object|null} Native owner-root Tool candidate intent.
 */
function chooseGarbodorToolIntent(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog?.toolPrintings instanceof Set);

  const opponentPokemon=[
    view.opponentPublic.active,
    ...view.opponentPublic.bench
  ];
  if(!opponentPokemon.some(hasPrintedAbility))return null;

  const garbodorTargets=[
    {slot:'active',index:0,pokemon:view.ownPublic.active},
    ...view.ownPublic.bench.map((pokemon,index)=>({
      slot:'bench',index,pokemon
    }))
  ].filter(target=>isUnequippedGarbotoxin(target.pokemon));
  if(garbodorTargets.length===0)return null;
  if(shouldDeferForStarAlchemy(view))return null;

  const candidates=enumerateActorToolCandidates(
    view,catalog.toolPrintings
  );
  for(const target of garbodorTargets){
    const floatStone=candidates.find(item=>
      item.printing.startsWith(FLOAT_STONE_PREFIX)&&
      item.slot===target.slot&&item.index===target.index
    );
    if(floatStone)return {
      ...floatStone,
      source:'agent36-garbotoxin-float-stone-v1'
    };
    const forestSealStone=candidates.find(item=>
      item.printing.startsWith(FOREST_SEAL_STONE_PREFIX)&&
      item.slot===target.slot&&item.index===target.index
    );
    if(forestSealStone)return {
      ...forestSealStone,
      source:'agent36-garbotoxin-fss-fallback-v1'
    };
  }
  return null;
}

module.exports={
  chooseGarbodorToolIntent,
  shouldDeferForStarAlchemy
};
