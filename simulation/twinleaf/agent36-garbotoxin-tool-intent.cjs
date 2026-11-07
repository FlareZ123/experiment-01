'use strict';

const assert=require('node:assert/strict');
const {enumerateActorToolCandidates}=
  require('./agent18-actor-tool-candidate-frontier.cjs');

const FLOAT_STONE_PRINTING_PREFIX='Float Stone ';

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
 * Select a held Float Stone for an own Garbotoxin Garbodor when the opponent
 * has a Pokémon with a printed Ability on its public board.
 *
 * This is an owner-only proposal. It reads only the acting player's hand,
 * the acting player's public board, and the opponent's public board. It does
 * not inspect the opponent's hidden hand, discard pile, or deck. Agent18's
 * enumerator supplies only a candidate; the native Store remains the
 * authority for whether the Tool attachment is legal.
 *
 * Float Stone is preferred explicitly so a held Forest Seal Stone can remain
 * available for a Pokémon V's Star Alchemy before Garbotoxin is activated.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @param {{toolPrintings:Set<string>}} catalog Public Tool printing catalog.
 * @returns {object|null} Native owner-root Tool candidate intent.
 */
function chooseGarbodorFloatStoneIntent(view,catalog){
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

  const candidates=enumerateActorToolCandidates(
    view,catalog.toolPrintings
  );
  for(const target of garbodorTargets){
    const candidate=candidates.find(item=>
      item.printing.startsWith(FLOAT_STONE_PRINTING_PREFIX)&&
      item.slot===target.slot&&item.index===target.index
    );
    if(candidate)return {
      ...candidate,
      source:'agent36-garbotoxin-float-stone-v1'
    };
  }
  return null;
}

module.exports={chooseGarbodorFloatStoneIntent};
