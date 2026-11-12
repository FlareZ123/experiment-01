'use strict';

const SHADOW_V='Shadow Rider Calyrex V';
const SHADOW_VMAX='Shadow Rider Calyrex VMAX';
const PSYCHIC='Psychic Energy';
const RANKING_VERSION='agent41-hood-arven-item-priority-v1';

function cards(value){
  if(Array.isArray(value))return value;
  return Array.isArray(value?.cards)?value.cards:[];
}
function slotPokemon(slot){return slot?.getPokemonCard?.()??null;}
function lexical(a,b){
  const x=String(a?.fullName??a?.name??'');
  const y=String(b?.fullName??b?.name??'');
  return x<y?-1:x>y?1:0;
}

function contextFor(state,seat,supporterTrainerType,pokemonSuperType){
  if(!state?.players||state.players.length!==2||(seat!==0&&seat!==1))return null;
  const owner=state.players[seat],opponent=state.players[1-seat];
  const hand=cards(owner.hand),deck=cards(owner.deck),discard=cards(owner.discard);
  const ownBoard=[owner.active,...(owner.bench??[])].map(slotPokemon).filter(Boolean);
  const handNames=new Set(hand.map(card=>card?.name));
  const deckNames=new Set(deck.map(card=>card?.name));
  const boardNames=ownBoard.map(card=>card.name);
  const discardHasPokemon=discard.some(card=>
    pokemonSuperType!==undefined&&card?.superType===pokemonSuperType);
  const discardHasSupporter=supporterTrainerType!==undefined&&
    discard.some(card=>card?.trainerType===supporterTrainerType);
  const handHasSupporter=supporterTrainerType!==undefined&&
    hand.some(card=>card?.trainerType===supporterTrainerType);
  const deckHasSupporter=supporterTrainerType!==undefined&&
    deck.some(card=>card?.trainerType===supporterTrainerType);
  const opponentHasTool=[opponent.active,...(opponent.bench??[])].some(slot=>
    Array.isArray(slot?.tools)&&slot.tools.length>0);
  const opponentHasStadium=cards(owner.stadium).length>0||
    cards(opponent.stadium).length>0;
  const ownerPrizes=owner.prizes==null?6:cards(owner.prizes).length;
  const opponentPrizes=opponent.prizes==null?6:cards(opponent.prizes).length;
  return {
    owner,opponent,hand,deck,discard,handNames,deckNames,boardNames,
    discardHasPokemon,discardHasSupporter,handHasSupporter,deckHasSupporter,
    opponentHasTool,opponentHasStadium,opponentAhead:opponentPrizes<ownerPrizes,
    hasPsychicHand:handNames.has(PSYCHIC),hasPsychicDeck:deckNames.has(PSYCHIC),
    hasPsychicDiscard:discard.some(card=>card?.name===PSYCHIC),
    hasShadowV:handNames.has(SHADOW_V)||boardNames.includes(SHADOW_V)||
      boardNames.includes(SHADOW_VMAX),
    hasShadowVmax:handNames.has(SHADOW_VMAX)||boardNames.includes(SHADOW_VMAX),
    hasShadowVDeck:deckNames.has(SHADOW_V),
    hasShadowVmaxDeck:deckNames.has(SHADOW_VMAX),
    handHasNightStretcher:handNames.has('Night Stretcher'),
    handHasVsSeeker:handNames.has('VS Seeker'),
    canPayDiscardItem:hand.length>0
  };
}

function scoreHoodArvenItem(item,ctx){
  switch(item?.name){
    case 'Night Stretcher':
      if(ctx.hasPsychicDiscard&&!ctx.hasPsychicHand)
        return {score:130,reason:'recover Psychic Energy already in discard'};
      if(ctx.discardHasPokemon&&!ctx.hasShadowVmax)
        return {score:105,reason:'recover a discarded Pokémon for the board'};
      if(ctx.hasPsychicDiscard||ctx.discardHasPokemon)
        return {score:80,reason:'recover an available discard resource'};
      return {score:5,reason:'no visible recovery target'};
    case 'Fog Crystal':
      if(!ctx.hasPsychicHand&&ctx.hasPsychicDeck)
        return {score:120,reason:'find Psychic Energy for Underworld Door'};
      if(!ctx.hasShadowV&&ctx.hasShadowVDeck)
        return {score:110,reason:'find a missing Shadow Rider V'};
      if(ctx.hasPsychicDeck)
        return {score:75,reason:'retain flexible Psychic Energy or Basic access'};
      return {score:10,reason:'no visible high-value Fog Crystal target'};
    case 'VS Seeker':
      if(ctx.discardHasSupporter&&!ctx.handHasSupporter)
        return {score:115,reason:'recover a Supporter from discard'};
      if(ctx.discardHasSupporter)
        return {score:80,reason:'retain access to a discarded Supporter'};
      return {score:5,reason:'no visible Supporter target'};
    case 'Battle Compressor':
      if(ctx.handHasNightStretcher&&ctx.hasPsychicDeck)
        return {score:110,reason:'enable Night Stretcher recovery of a deck Psychic Energy'};
      if(ctx.handHasVsSeeker&&ctx.deckHasSupporter)
        return {score:90,reason:'enable VS Seeker recovery of a deck Supporter'};
      return {score:35,reason:'general deck-thinning option'};
    case 'Mysterious Treasure':
      if(!ctx.hasShadowVmax&&ctx.hasShadowVmaxDeck&&ctx.canPayDiscardItem)
        return {score:105,reason:'find a missing Shadow Rider VMAX'};
      if(!ctx.hasShadowV&&ctx.hasShadowVDeck&&ctx.canPayDiscardItem)
        return {score:100,reason:'find a missing Shadow Rider V'};
      if((ctx.hasShadowVDeck||ctx.hasShadowVmaxDeck)&&ctx.canPayDiscardItem)
        return {score:65,reason:'flexible Psychic Pokémon access'};
      return {score:10,reason:'no visible high-value Pokémon target or discard cost'};
    case 'Quick Ball':
      if(!ctx.hasShadowV&&ctx.hasShadowVDeck&&ctx.canPayDiscardItem)
        return {score:95,reason:'find a missing Basic Shadow Rider V'};
      return {score:40,reason:'general Basic Pokémon access'};
    case 'Unfair Stamp':
      if(ctx.opponentAhead)
        return {score:100,reason:'disrupt an opponent who is ahead on Prizes'};
      return {score:15,reason:'preserve a comeback disruption option'};
    case 'Field Blower':
      if(ctx.opponentHasTool||ctx.opponentHasStadium)
        return {score:85,reason:'answer a public opposing Tool or Stadium'};
      return {score:10,reason:'no visible opposing Tool or Stadium'};
    case 'Hisuian Heavy Ball':
      if(!ctx.hasShadowV&&ctx.hasShadowVDeck)
        return {score:75,reason:'backup access to a Basic if it is Prized'};
      return {score:25,reason:'Prized-Basic check as a lower-priority option'};
    default:
      return {score:1,reason:'unclassified Item; deterministic fallback'};
  }
}

/**
 * Candidate-specific deterministic Item ranking for the Hood Arven line.
 * Only owner hand/deck/discard, public boards/tools/stadiums, and public Prize
 * counts are used. Deck order and opponent hidden zones are never features.
 */
function rankHoodArvenItems(state,seat,items,supporterTrainerType,pokemonSuperType){
  const ctx=contextFor(state,seat,supporterTrainerType,pokemonSuperType);
  if(!ctx)return [];
  return (items??[]).map(card=>({card,...scoreHoodArvenItem(card,ctx)}))
    .sort((a,b)=>b.score-a.score||lexical(a.card,b.card));
}

module.exports={RANKING_VERSION,rankHoodArvenItems,scoreHoodArvenItem};
