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
 * unused. This check only defers the Tool proposal; the normal player policy
 * must still produce the actual attachment and VSTAR-use actions.
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
 * Evaluate the owner-visible Garbotoxin Tool opportunity and explain why
 * it did or did not produce a native Tool candidate.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @param {{toolPrintings:Set<string>}} catalog Public Tool printing catalog.
 * @param {{deferForStarAlchemy?:boolean}} [options]
 * @returns {{intent:object|null,reason:string,opponentAbilityCount:number,
 *   garbodorTargetCount:number,toolCandidateCount:number,
 *   vstarUsed:boolean|null,starAlchemyDeferred:boolean}}
 */
function evaluateGarbodorToolIntent(view,catalog,options={}){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog?.toolPrintings instanceof Set);
  assert.ok(options&&typeof options==='object');
  assert.ok(options.deferForStarAlchemy===undefined||
    typeof options.deferForStarAlchemy==='boolean');

  const opponentPokemon=[
    view.opponentPublic.active,
    ...view.opponentPublic.bench
  ];
  const opponentAbilityCount=opponentPokemon.filter(
    hasPrintedAbility
  ).length;
  const empty={
    intent:null,opponentAbilityCount,garbodorTargetCount:0,
    toolCandidateCount:0,
    vstarUsed:view.ownPublic.publicTurnRestrictions.vstarUsed??null,
    starAlchemyDeferred:false
  };
  if(opponentAbilityCount===0)
    return {...empty,reason:'no-opponent-ability'};

  const garbodorTargets=[
    {slot:'active',index:0,pokemon:view.ownPublic.active},
    ...view.ownPublic.bench.map((pokemon,index)=>({
      slot:'bench',index,pokemon
    }))
  ].filter(target=>isUnequippedGarbotoxin(target.pokemon));
  if(garbodorTargets.length===0)
    return {...empty,reason:'no-unequipped-garbodor',
      garbodorTargetCount:0};

  const candidates=enumerateActorToolCandidates(
    view,catalog.toolPrintings
  );
  const eligibleCandidates=garbodorTargets.flatMap(target=>
    candidates.filter(item=>
      item.slot===target.slot&&item.index===target.index&&
      (item.printing.startsWith(FLOAT_STONE_PREFIX)||
       item.printing.startsWith(FOREST_SEAL_STONE_PREFIX))
    )
  );
  const candidateStatus={
    ...empty,garbodorTargetCount:garbodorTargets.length,
    toolCandidateCount:eligibleCandidates.length
  };
  if(eligibleCandidates.length===0)
    return {...candidateStatus,reason:'no-tool-candidate'};

  if(options.deferForStarAlchemy===true&&shouldDeferForStarAlchemy(view))
    return {...candidateStatus,reason:'star-alchemy-available',
      starAlchemyDeferred:true};

  for(const target of garbodorTargets){
    const floatStone=eligibleCandidates.find(item=>
      item.printing.startsWith(FLOAT_STONE_PREFIX)&&
      item.slot===target.slot&&item.index===target.index
    );
    if(floatStone)return {
      ...candidateStatus,reason:'selected',
      intent:{...floatStone,source:'agent36-garbotoxin-float-stone-v1'}
    };
    const forestSealStone=eligibleCandidates.find(item=>
      item.printing.startsWith(FOREST_SEAL_STONE_PREFIX)&&
      item.slot===target.slot&&item.index===target.index
    );
    if(forestSealStone)return {
      ...candidateStatus,reason:'selected',
      intent:{...forestSealStone,source:'agent36-garbotoxin-fss-fallback-v1'}
    };
  }
  return {...candidateStatus,reason:'no-tool-candidate'};
}

/**
 * Select the preferred native Tool candidate, if the current public/own
 * information supports one.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @param {{toolPrintings:Set<string>}} catalog Public Tool printing catalog.
 * @param {{deferForStarAlchemy?:boolean}} [options]
 * @returns {object|null} Native owner-root Tool candidate intent.
 */
function chooseGarbodorToolIntent(view,catalog,options={}){
  return evaluateGarbodorToolIntent(view,catalog,options).intent;
}

module.exports={
  chooseGarbodorToolIntent,
  evaluateGarbodorToolIntent,
  shouldDeferForStarAlchemy
};
