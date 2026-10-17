'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const load=relative=>require(path.join(output,relative));

/**
 * Restrict the experiment to the authentic champion-B rank-10 source position.
 * It never examines an opponent's hand, deck or face-down Prizes.
 * @param {object} state Pinned Twinleaf State.
 * @param {object} player Candidate slot B.
 * @param {number} [sourceTurn=55] The archived candidate turn under test.
 * @returns {{kind:string,handIndex?:number}|null}
 */
function chooseFieldBlowerSourceAction(state,player,sourceTurn=55) {
  if (state.turn!==sourceTurn || state.phase!==2 || player?.id!==202 ||
      state.activePlayer!==1 ||
      state.prompts.some(prompt=>prompt.result===undefined)) return null;
  const bench=player.bench;
  const occupied=bench.filter(slot=>slot.getPokemonCard()).length;
  if (occupied!==3) return null;
  const hand=player.hand.cards;
  const shadow=hand.findIndex(card=>card.fullName==='Shadow Rider Calyrex V CRE');
  if (shadow<0) return null;
  const stadium=state.players.some(p=>
    p.stadium.cards.some(card=>card.fullName==='Parallel City BKT'));
  if (stadium) {
    const blower=hand.findIndex(card=>card.fullName==='Field Blower GRI');
    return blower<0?null:{kind:'remove-parallel-city',handIndex:blower};
  }
  if (bench[3] && !bench[3].getPokemonCard()) {
    return {kind:'bench-shadow-rider',handIndex:shadow};
  }
  return null;
}

/**
 * Opt-in single-decision source policy hook. It is installed outside runMatch
 * and restored unconditionally; it does not modify the upstream submodule.
 * @template T
 * @param {()=>T} execute Run one match.
 * @param {number} [sourceTurn=55] The authentic source turn to intervene.
 * @returns {{result:T,choices:object[]}} The real played match and intercepted actions.
 */
function withRank10FieldBlowerPolicy(execute,sourceTurn=55) {
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GameMessage}=load('game/game-message');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const choices=[];
  SimpleTacticsAi.prototype.decodeNextAction=function fieldBlowerCandidateDecision(state) {
    const id=this.client.id;
    const player=state.players.find(p=>p.id===id);
    if (id===202 && state.turn===sourceTurn && player) {
      const pending=state.prompts.find(p=>p.result===undefined);
      const isBlowerInResolution=player.supporter.cards.some(card=>
        card.fullName==='Field Blower GRI');
      if (pending?.playerId===id && isBlowerInResolution) {
        if (pending.constructor.name==='SelectOptionPrompt' &&
            pending.values?.[0]?.includes('Discard the Stadium')) {
          const action=new ResolvePromptAction(pending.id,0);
          choices.push({turn:state.turn,kind:'choose-stadium',prompt:pending.id});
          return action;
        }
        if (pending.constructor.name==='ChoosePokemonPrompt' &&
            pending.message===GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS &&
            pending.validate([],state)) {
          choices.push({turn:state.turn,kind:'keep-tools',prompt:pending.id});
          return new ResolvePromptAction(pending.id,[]);
        }
      }
      if (!pending) {
        const choice=chooseFieldBlowerSourceAction(state,player,sourceTurn);
        if (choice) {
          const target=choice.kind==='remove-parallel-city'?
            {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}:
            {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:3};
          const action=new PlayCardAction(id,choice.handIndex,target);
          choices.push({turn:state.turn,kind:choice.kind,
            printing:player.hand.cards[choice.handIndex]?.fullName,
            benchOccupied:player.bench.filter(s=>s.getPokemonCard()).length});
          return action;
        }
      }
    }
    return original.call(this,state);
  };
  try {
    return {result:execute(),choices};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={chooseFieldBlowerSourceAction,withRank10FieldBlowerPolicy};
