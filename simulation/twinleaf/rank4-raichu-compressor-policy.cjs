'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));
const ENERGY_PRINTS=['Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'];
const SETUP_POKEMON=new Set([
  'Pikachu LOR','Voltorb ROS','Ditto Prism Star LOT',
  'Alolan Raichu UNM','Electrode-GX CES'
]);

/**
 * Return exact card instances shown by the current owner-deck search.
 * Prefer distinct relevant Energy printings before additional duplicates.
 * @param {any[]} visibleCards
 * @param {number} maximum
 * @returns {any[]}
 */
function chooseSourceEnergy(visibleCards,maximum) {
  const chosen=[];
  for(const printing of ENERGY_PRINTS) {
    const card=visibleCards.find(c=>c.fullName===printing&&!chosen.includes(c));
    if(card&&chosen.length<maximum)chosen.push(card);
  }
  for(const printing of ENERGY_PRINTS) {
    for(const card of visibleCards) {
      if(chosen.length>=maximum)break;
      if(card.fullName===printing&&!chosen.includes(card))chosen.push(card);
    }
  }
  // Paper Compressor must select at least one when played. If the owner
  // searches an unexpectedly Energy-empty deck, log the mandatory fallback
  // through the ordinary Store resolution; never fabricate a target identity.
  if(!chosen.length&&maximum>0&&visibleCards.length)chosen.push(visibleCards[0]);
  return chosen;
}

/**
 * Source opening policy uses only the acting owner's board/hand and the
 * public turn. It does not inspect either face-down Prize area or deck cards.
 * @param {any} state
 * @param {any} player
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function shouldPrepareRaichu(state,player,playerTurnPhase) {
  if(state.phase!==playerTurnPhase||state.turn>2||
     state.prompts.some(p=>p.result===undefined)||
     player.cannotPlayItemCards===true||
     player.deck.cards.length===0||
     !player.hand.cards.some(c=>c.name==='Battle Compressor'))return false;
  return [player.active,...player.bench].some(slot=>
    SETUP_POKEMON.has(slot.getPokemonCard()?.fullName));
}

/**
 * One source-seat opt-in for rank 4. Uses a genuine held-Item PlayCardAction
 * followed by the owner's actual ChooseCardsPrompt with printed Energy cards.
 * @param {any} options Pinned SimpleTacticsAi options
 * @returns {any}
 */
function withRank4RaichuCompressor(options) {
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GamePhase}=engine('game/store/state/state');
  if(options.tactics.some(t=>t.name==='Rank4RaichuCompressorTactic')&&
     options.promptResolvers.some(r=>r.name==='Rank4RaichuCompressorResolver')){
    return options;
  }
  class Rank4RaichuCompressorTactic extends SimpleTactic {
    /** @param {any} state @param {any} player */
    useTactic(state,player) {
      if(!shouldPrepareRaichu(state,player,GamePhase.PLAYER_TURN))return;
      const index=player.hand.cards.findIndex(c=>c.name==='Battle Compressor');
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  class Rank4RaichuCompressorResolver extends PromptResolver {
    /** @param {any} state @param {any} player @param {any} prompt */
    resolvePrompt(state,player,prompt) {
      if(!(prompt instanceof ChooseCardsPrompt)||
         prompt.player!==player||prompt.cards!==player.deck||
         !player.supporter.cards.some(c=>c.name==='Battle Compressor'))return;
      const chosen=chooseSourceEnergy(prompt.cards.cards,prompt.options.max);
      if(chosen.length&&prompt.validate(chosen,state)){
        return new ResolvePromptAction(prompt.id,chosen);
      }
    }
  }
  const index=options.tactics.findIndex(t=>t.name==='PlayTrainerTactic');
  if(index<0)throw new Error('Pinned PlayTrainerTactic is missing');
  return {...options,
    tactics:[...options.tactics.slice(0,index),
      Rank4RaichuCompressorTactic,...options.tactics.slice(index)],
    promptResolvers:[Rank4RaichuCompressorResolver,...options.promptResolvers]
  };
}
module.exports={ENERGY_PRINTS,SETUP_POKEMON,chooseSourceEnergy,
  shouldPrepareRaichu,withRank4RaichuCompressor};
