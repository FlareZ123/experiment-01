'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));
const ENERGY=new Set(['Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR']);

/**
 * Owner-board/hand and public Prize conditions for proposed Escape Rope.
 * No opponent face-down Prize, hand or deck card is inspected.
 * @param {any} state
 * @param {any} player
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function shouldPivotWithRope(state,player,playerTurnPhase){
  if(state.phase!==playerTurnPhase||
     state.prompts.some(p=>p.result===undefined)||
     player.cannotPlayItemCards===true||
     player.active.getPokemonCard()?.fullName==='Alolan Raichu UNM'||
     !player.hand.cards.some(c=>c.fullName==='Escape Rope BST')||
     !player.bench.some(b=>b.getPokemonCard()?.fullName==='Alolan Raichu UNM')||
     !player.bench.some(b=>b.getPokemonCard()?.fullName==='Electrode-GX CES')||
     player.discard.cards.filter(c=>ENERGY.has(c.fullName)).length<3)return false;
  const opponent=state.players.find(p=>p.id!==player.id);
  if(!opponent)return false;
  const ownPrizes=player.getPrizeLeft(),opponentPrizes=opponent.getPrizeLeft();
  return opponentPrizes>2&&ownPrizes>opponentPrizes-2;
}

/**
 * Source-only opt-in native Item proposal and *own* Switch-Pokemon prompt
 * selection. The opponent's preceding Escape Rope choice remains unmodified.
 * @param {any} options Pinned SimpleTacticsAi options
 * @returns {any}
 */
function withRank4RopePivot(options) {
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {ChoosePokemonPrompt}=engine('game/store/prompts/choose-pokemon-prompt');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');
  if(options.tactics.some(t=>t.name==='Rank4RaichuRopeTactic')&&
     options.promptResolvers.some(t=>t.name==='Rank4RaichuRopeResolver'))return options;
  class Rank4RaichuRopeTactic extends SimpleTactic {
    /** @param {any} state @param {any} player */
    useTactic(state,player){
      if(!shouldPivotWithRope(state,player,GamePhase.PLAYER_TURN))return;
      const index=player.hand.cards.findIndex(c=>c.fullName==='Escape Rope BST');
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  class Rank4RaichuRopeResolver extends PromptResolver {
    /** @param {any} state @param {any} player @param {any} prompt */
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChoosePokemonPrompt)||
         prompt.playerId!==player.id||
         prompt.message!==GameMessage.CHOOSE_POKEMON_TO_SWITCH||
         prompt.playerType!==PlayerType.BOTTOM_PLAYER||
         !prompt.slots.includes(SlotType.BENCH)||
         !player.supporter.cards.some(c=>c.fullName==='Escape Rope BST'))return;
      const raichu=player.bench.find(b=>
        b.getPokemonCard()?.fullName==='Alolan Raichu UNM');
      if(raichu&&prompt.validate([raichu],state)){
        return new ResolvePromptAction(prompt.id,[raichu]);
      }
    }
  }
  const index=options.tactics.findIndex(t=>t.name==='PlayTrainerTactic');
  if(index<0)throw Error('Pinned PlayTrainerTactic missing');
  return {...options,
    tactics:[...options.tactics.slice(0,index),
      Rank4RaichuRopeTactic,...options.tactics.slice(index)],
    promptResolvers:[Rank4RaichuRopeResolver,...options.promptResolvers]
  };
}
module.exports={shouldPivotWithRope,withRank4RopePivot};
