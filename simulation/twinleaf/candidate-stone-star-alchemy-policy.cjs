'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const STONE='Forest Seal Stone SIT';

/**
 * Locate a public Pokémon V holding an actual Stone, without reading deck
 * contents, private cards or future state.
 * @param {object} own Acting player's visible board and VSTAR marker.
 * @param {number} selfType Pinned PlayerType.BOTTOM_PLAYER.
 * @param {readonly string[]} vTags Pinned printed V-family tags.
 * @returns {object|null} CardTarget for one eligible holder.
 */
function stoneHolder(own,selfType,vTags){
  if(own.usedVSTAR || own.deck.cards.length===0)return null;
  let chosen=null;
  own.forEachPokemon(selfType,(slot,pokemon,target)=>{
    if(chosen || !pokemon || !pokemon.tags.some(x=>vTags.includes(x)))return;
    if(slot.tools.some(tool=>tool.fullName===STONE))chosen=target;
  });
  return chosen;
}

/**
 * Research opt-in for candidate-only owner-visible Stone-granted Star
 * Alchemy proposal. Engine is still responsible for legal-action validation.
 * This policy does not choose the card from the ensuing deck-search prompt.
 * @template T
 * @param {0|1} candidateSeat Physical candidate seat.
 * @param {()=>T} execute Synchronous pinned source-run.
 * @returns {{result:T,audit:object}}
 */
function withStoneStarAlchemy(candidateSeat,execute){
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(typeof execute,'function');
  const engine=file=>require(path.join(output,file));
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayerType}=engine('game/store/actions/play-card-action');
  const {CardTag}=engine('game/store/card/card-types');
  const {GamePhase}=engine('game/store/state/state');
  const defs=engine('simple-bot/simple-bot-definitions');
  const index=defs.allSimpleTactics.findIndex(T=>T.name==='UseAbilityTactic');
  assert.ok(index>=0);
  const ownerId=candidateSeat===0?101:202;
  const tags=[CardTag.POKEMON_V,CardTag.POKEMON_VMAX,
    CardTag.POKEMON_VSTAR,CardTag.POKEMON_VUNION];
  const events=[];
  class CandidateStoneStarTactic extends SimpleTactic {
    useTactic(state,player){
      if(player.id!==ownerId || state.phase!==GamePhase.PLAYER_TURN ||
          state.activePlayer!==candidateSeat ||
          state.prompts.some(p=>p.result===undefined))return undefined;
      const target=stoneHolder(player,PlayerType.BOTTOM_PLAYER,tags);
      if(!target)return undefined;
      events.push({turn:state.turn,kind:'stone-star-alchemy-proposal',target});
      return new UseAbilityAction(player.id,'Star Alchemy',target);
    }
  }
  defs.allSimpleTactics.splice(index,0,CandidateStoneStarTactic);
  try {
    return {result:execute(),audit:{
      version:'candidate-stone-star-alchemy-owner-v1',
      candidateSeat,events,competitiveQualifiedGames:0
    }};
  } finally {
    assert.equal(defs.allSimpleTactics[index],CandidateStoneStarTactic);
    defs.allSimpleTactics.splice(index,1);
  }
}
module.exports={STONE,stoneHolder,withStoneStarAlchemy};
