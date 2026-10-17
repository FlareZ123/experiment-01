'use strict';

const path=require('node:path');
const load=relative=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',relative));

/**
 * Narrow public-board source-deal predicate. Search never reads the deck
 * before the Fog Crystal prompt, and the prompt player can inspect their
 * own deck under the printed card rules.
 *
 * @param {object} state Pinned source State.
 * @param {object} player Champion-B player.
 * @returns {{kind:string,handIndex?:number,benchIndex?:number}|null}
 */
function chooseTurn55RondoAction(state,player) {
  if (state.turn!==55 || state.phase!==2 || state.activePlayer!==1 ||
      player?.id!==202 || state.prompts.some(p=>p.result===undefined)) return null;

  const opponent=state.players.find(p=>p.id!==player.id);
  if (opponent?.active.getPokemonCard()?.fullName!=='Squawkabilly ex PAL' ||
      opponent.bench.filter(slot=>slot.getPokemonCard()).length!==5 ||
      player.prizes.filter(p=>p.cards.length>0).length!==2) return null;
  const ix=player.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName==="Lillie's Clefairy ex JTG");
  const active=player.active.getPokemonCard()?.fullName;
  const clefairy=ix<0 && active==="Lillie's Clefairy ex JTG"
    ?player.active:player.bench[ix];
  if (!clefairy) return null;
  const attached=clefairy.energies.cards;
  const psychic=attached.some(card=>card.name==='Psychic Energy');
  if (!psychic) return null;
  if (attached.length<2) {
    if(player.energyPlayedTurn>=state.turn) return null;
    const energy=player.hand.cards.findIndex(c=>c.name==='Psychic Energy');
    if(energy>=0) return {kind:'attach-clefairy-psychic',
      handIndex:energy,benchIndex:ix};
    const fog=player.hand.cards.findIndex(c=>c.fullName==='Fog Crystal CRE');
    return fog<0?null:{kind:'search-psychic',handIndex:fog};
  }
  if (active==="Lillie's Clefairy ex JTG") {
    return {kind:'attack-full-moon-rondo'};
  }
  if (active==='Dialga-GX UPR' && ix>=0 &&
      player.active.tools.some(c=>c.fullName==='Float Stone PLF') &&
      player.retreatedTurn!==state.turn) {
    return {kind:'retreat-into-clefairy',benchIndex:ix};
  }
  return null;
}

/**
 * Exact-turn reversible source policy fork with action telemetry.
 * @template T
 * @param {()=>T} execute Source-dealt completed or bounded match.
 * @returns {{result:T,choices:object[]}}
 */
function withRank10ClefairyRondoPolicy(execute) {
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {RetreatAction,AttackAction}=load('game/store/actions/game-actions');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=load('game/game-message');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const choices=[];
  SimpleTacticsAi.prototype.decodeNextAction=function chooseRondo(state) {
    const player=state.players.find(p=>p.id===this.client.id);
    if (player?.id===202 && state.turn===55) {
      const prompt=state.prompts.find(p=>p.result===undefined);
      if (prompt instanceof ChooseCardsPrompt && prompt.playerId===202 &&
          prompt.message===GameMessage.CHOOSE_CARD_TO_HAND &&
          player.supporter.cards.some(c=>c.fullName==='Fog Crystal CRE')) {
        const energy=prompt.cards.cards.find(c=>c.name==='Psychic Energy');
        if(energy && prompt.validate([energy])) {
          choices.push({turn:state.turn,kind:'find-psychic-energy',
            prompt:prompt.id,selected:energy.fullName});
          return new ResolvePromptAction(prompt.id,[energy]);
        }
      }
      if (!prompt) {
        const choice=chooseTurn55RondoAction(state,player);
        if(choice) {
          let action;
          if(choice.kind==='attack-full-moon-rondo') {
            action=new AttackAction(202,'Full Moon Rondo');
          } else if(choice.kind==='retreat-into-clefairy') {
            action=new RetreatAction(202,choice.benchIndex);
          } else {
            const target=choice.kind==='search-psychic'
              ?{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}
              :{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
                index:choice.benchIndex};
            action=new PlayCardAction(202,choice.handIndex,target);
          }
          choices.push({turn:state.turn,kind:choice.kind,
            card:choice.handIndex===undefined?null:
              player.hand.cards[choice.handIndex]?.fullName||null});
          return action;
        }
      }
    }
    return previous.call(this,state);
  };
  try {
    return {result:execute(),choices};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={chooseTurn55RondoAction,withRank10ClefairyRondoPolicy};
