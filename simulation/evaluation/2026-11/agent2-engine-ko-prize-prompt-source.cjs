'use strict';

/*
 * Pinned-Twinleaf source classifier for mandatory engine KO continuation.
 *
 * This is an opt-in research-side helper, NOT wired to the frozen V3 host.
 * It reads native Store state only inside the HOST trusted boundary and
 * returns the same public typed engine source already allowed by the
 * actor-visible prompt protocol. It must never run in a policy worker.
 *
 * Derived from a9905a76:
 * ptcg-server/src/game/store/effect-reducers/check-effect.ts
 * ptcg-server/src/game/store/actions/play-card-action.ts
 * ptcg-server/src/game/store/state/state.ts
 * ptcg-server/src/game/game-message.ts
 */
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const P=Object.freeze({
  WAITING:0,SETUP:1,PLAYER_TURN:2,ATTACK:3,AFTER_ATTACK:4,
  CHOOSE_PRIZES:5,BETWEEN_TURNS:6,FINISHED:7,DRAW:8,
  BOTTOM_PLAYER:2,BENCH:2
});
const ACTIVE_PHASES=new Set([
  P.PLAYER_TURN,P.ATTACK,P.AFTER_ATTACK,P.CHOOSE_PRIZES,
  P.BETWEEN_TURNS,P.DRAW
]);
const PROMOTION='CHOOSE_NEW_ACTIVE_POKEMON';
const PRIZE_TO_HAND='CHOOSE_PRIZE_CARD';
const PRIZE_TO_DISCARD='CHOOSE_PRIZE_CARD_TO_DISCARD';
const label=(prompt)=>prompt?.constructor?.name??'';
function cards(slot){return Array.isArray(slot?.cards)?slot.cards:[];}
function occupied(slot){return cards(slot).length>0;}
function ownerShape({prompt,state,actorSeat,provenance,enginePin}){
  if(enginePin!==ENGINE_PIN||provenance!==null&&provenance!==undefined)
    return null;
  if(!Number.isSafeInteger(actorSeat)||actorSeat<0||actorSeat>1||
    !ACTIVE_PHASES.has(state?.phase)||!Array.isArray(state?.players)||
    state.players.length!==2)return null;
  const actor=state.players[actorSeat],opp=state.players[1-actorSeat];
  if(!actor||!opp||!prompt||
    prompt.result!==undefined||prompt.playerId!==actor.id||
    typeof prompt.getPerspectivePlayerId!=='function'||
    prompt.getPerspectivePlayerId()!==actor.id)return null;
  return {actor,opp};
}
function classifyNativeEngineContinuation(args={}){
  const owned=ownerShape(args);
  if(!owned)return null;
  const {prompt}=args,{actor,opp}=owned;
  const m=prompt?.message,kind=label(prompt),options=prompt.options;
  if(!options||typeof options!=='object'||Array.isArray(options))
    return null;
  if(kind==='ChoosePokemonPrompt'&&m===PROMOTION){
    if(occupied(actor.active)||!Array.isArray(actor.bench)||
      !actor.bench.some(occupied)||prompt.playerType!==P.BOTTOM_PLAYER||
      !Array.isArray(prompt.slots)||prompt.slots.length!==1||
      prompt.slots[0]!==P.BENCH||
      options.min!==1||options.max!==1||
      options.allowCancel!==false)return null;
  }else if(kind==='ChoosePrizePrompt'&&
    (m===PRIZE_TO_HAND||m===PRIZE_TO_DISCARD)){
    if(args.state.isSuddenDeath===true||
      !Array.isArray(actor.prizes)||actor.prizes.length===0||
      !Array.isArray(opp.bench)||!Array.isArray(opp.active?.cards)||
      ![opp.active,...opp.bench].some(occupied))return null;
    const left=actor.prizes.filter(occupied).length;
    if(left<=1||!Number.isSafeInteger(options.count)||
      options.count<1||options.count>=left||
      options.max!==options.count||options.allowCancel!==false||
      options.useOpponentPrizes!==false)return null;
    if(m===PRIZE_TO_DISCARD&&options.destination!==actor.discard)return null;
    if(m===PRIZE_TO_HAND&&options.destination===actor.discard)return null;
  }else{return null;}
  return Object.freeze({
    classification:'actor-choice',
    sourceKind:'engine',
    sourcePrinting:null,
    effectName:m
  });
}

module.exports={ENGINE_PIN,P,PROMOTION,PRIZE_TO_HAND,PRIZE_TO_DISCARD,
  classifyNativeEngineContinuation};
