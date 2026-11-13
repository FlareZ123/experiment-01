'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Return a candidate-only RetreatTactic subclass that evaluates an actual
 * retreat followed by Max Geist against the best current-Active attack and
 * the native RetreatTactic's preferred retreat line. It also evaluates the
 * opponent's immediate legal retreat options on a public-board counterfactual.
 *
 * Attack/retreat simulations use the pinned Simulator directly and abstain
 * when an unresolved player-choice prompt would be required. This avoids
 * using the native prompt resolvers to inspect hidden opponent information.
 *
 * This is a one-opponent-action tactical heuristic: it models legal retreat
 * responses on the current public board, not between-turn effects, the
 * opponent's complete turn, future gust, or a full prize-map search.
 *
 * @param {Function|null} BaseTacticOverride Test seam / currently installed
 *   candidate RetreatTactic subclass. Native callers omit it.
 * @param {object} [deps] Test-only engine/action constructor injection.
 * @returns {Function} Candidate-specific tactic constructor.
 */
function hoodAwareMaxGeistRetreatTacticClass(BaseTacticOverride=null,deps={}) {
  const engine = modulePath => require(path.join(output,modulePath));
  const BaseTactic=BaseTacticOverride??
    engine('simple-bot/simple-tactics/retreat-tactic').RetreatTactic;
  const actionTypes=deps.actionTypes??
    engine('game/store/actions/game-actions');
  const {AttackAction,RetreatAction}=actionTypes;
  const Simulator=deps.Simulator??engine('game/bots/simulator').Simulator;
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const GameError=deps.GameError??engine('game/game-error').GameError;
  const GameMessage=deps.GameMessage??engine('game/game-message').GameMessage;
  if(typeof AttackAction!=='function'||typeof RetreatAction!=='function'||
     typeof Simulator!=='function'||!GamePhase?.PLAYER_TURN||
     typeof GameError!=='function'||!GameMessage) {
    throw new TypeError('Pinned AttackAction, RetreatAction, Simulator, GamePhase, GameError, and GameMessage are required');
  }
  const expectedIllegalMessages=new Set([
    GameMessage.NOT_ENOUGH_ENERGY,
    GameMessage.UNKNOWN_ATTACK,
    GameMessage.CANNOT_USE_ATTACK,
    GameMessage.CANNOT_ATTACK_ON_FIRST_TURN,
    GameMessage.CANNOT_RETREAT,
    GameMessage.BLOCKED_BY_EFFECT
  ]);
  const scoreMargin=Number.isFinite(deps.scoreMargin)?deps.scoreMargin:0;

  class HoodMaxGeistRetreatTactic extends BaseTactic {
    simulateWithoutPlayerChoice(state,action) {
      try {
        const nextState=new Simulator(state,this.options.arbiter).dispatch(action);
        if(nextState?.prompts?.some(prompt=>prompt.result===undefined)) {
          return {state:undefined,needsChoice:true};
        }
        return {state:nextState,needsChoice:false};
      } catch(error) {
        // Known game-rule rejections are ordinary invalid candidates. An
        // unexpected engine error is not treated as evidence that an attack
        // is unavailable; abstain rather than promote on an incomplete model.
        if(error instanceof GameError&&expectedIllegalMessages.has(error.message)) {
          return {state:undefined,needsChoice:false};
        }
        return {state:undefined,needsChoice:true};
      }
    }

    scoreAfterBestPublicRetreatResponse(afterAttackState,playerId) {
      if(afterAttackState.winner!==undefined&&afterAttackState.winner!==null) {
        return {score:this.getStateScore(afterAttackState,playerId),complete:true};
      }
      const turnOwner=afterAttackState.players[afterAttackState.activePlayer];
      if(turnOwner?.usedTurnSkip) {
        return {score:this.getStateScore(afterAttackState,playerId),complete:true};
      }
      const opponentIndex=afterAttackState.players.findIndex(item=>item.id!==playerId);
      if(opponentIndex<0) {
        return {score:this.getStateScore(afterAttackState,playerId),complete:true};
      }
      const opponent=afterAttackState.players[opponentIndex];
      let worst=this.getStateScore(afterAttackState,playerId);
      for(let benchIndex=0;benchIndex<(opponent.bench??[]).length;benchIndex++) {
        // Retreat legality depends on public board state (including abilities
        // such as Skyliner). Switch the active seat only on a shallow state
        // shell; Simulator deep-clones it before applying the action. Do not
        // PassTurnAction here: that would draw from the opponent's hidden deck.
        const opponentTurnState=Object.assign(
          Object.create(Object.getPrototypeOf(afterAttackState)),
          afterAttackState,
          {activePlayer:opponentIndex,phase:GamePhase.PLAYER_TURN}
        );
        const response=this.simulateWithoutPlayerChoice(opponentTurnState,
          new RetreatAction(opponent.id,benchIndex));
        if(response.needsChoice)return {score:undefined,complete:false};
        if(response.state) {
          worst=Math.min(worst,this.getStateScore(response.state,playerId));
        }
      }
      return {score:worst,complete:true};
    }

    bestAttackScore(state,playerId) {
      const player=state.players.find(item=>item.id===playerId);
      const active=player?.active?.getPokemonCard?.();
      const attackBonus=this.options?.scores?.tactics?.attackBonus??0;
      let best=this.getStateScore(state,playerId)-attackBonus;
      for(const attack of active?.attacks??[]) {
        const attempt=this.simulateWithoutPlayerChoice(state,
          new AttackAction(playerId,attack.name));
        if(attempt.needsChoice)return {score:undefined,complete:false};
        if(!attempt.state)continue;
        const response=this.scoreAfterBestPublicRetreatResponse(attempt.state,playerId);
        if(!response.complete)return response;
        if(response.score>best)best=response.score;
      }
      return {score:best,complete:true};
    }

    useTactic(state,player) {
      const maxGeistBenchIndices=(player.bench??[]).flatMap((slot,index)=>{
        const pokemon=slot?.getPokemonCard?.();
        return pokemon?.name==='Shadow Rider Calyrex VMAX'&&
          pokemon.attacks?.some(attack=>attack.name==='Max Geist')?[index]:[];
      });
      if(maxGeistBenchIndices.length===0)return super.useTactic(state,player);

      // Preserve the existing generic retreat line as a baseline, including
      // any better non-Shadow-Rider promotion it already selected.
      const baseRetreat=super.useTactic(state,player);
      const currentAttack=this.bestAttackScore(state,player.id);
      if(!currentAttack.complete)return baseRetreat;
      let baselineScore=currentAttack.score;
      if(baseRetreat) {
        const afterBaseRetreat=this.simulateAction(state,baseRetreat);
        if(afterBaseRetreat) {
          const baseAttack=this.bestAttackScore(afterBaseRetreat,player.id);
          if(!baseAttack.complete)return baseRetreat;
          baselineScore=Math.max(
            baselineScore,
            this.getStateScore(afterBaseRetreat,player.id),
            baseAttack.score
          );
        }
      }

      let bestRetreat=null;
      let bestScore=baselineScore;
      for(const benchIndex of maxGeistBenchIndices) {
        const retreatAction=new RetreatAction(player.id,benchIndex);
        const retreatAttempt=this.simulateWithoutPlayerChoice(state,retreatAction);
        if(retreatAttempt.needsChoice||!retreatAttempt.state)continue;
        const afterRetreat=retreatAttempt.state;
        const afterPlayer=afterRetreat.players.find(item=>item.id===player.id);
        if(afterPlayer?.active?.getPokemonCard?.()?.name!==
           'Shadow Rider Calyrex VMAX')continue;

        const attackAttempt=this.simulateWithoutPlayerChoice(afterRetreat,
          new AttackAction(player.id,'Max Geist'));
        if(attackAttempt.needsChoice||!attackAttempt.state)continue;
        const response=this.scoreAfterBestPublicRetreatResponse(
          attackAttempt.state,player.id);
        if(!response.complete)continue;
        if(response.score>bestScore+scoreMargin) {
          bestScore=response.score;
          bestRetreat=retreatAction;
        }
      }
      return bestRetreat??baseRetreat;
    }
  }

  return HoodMaxGeistRetreatTactic;
}

module.exports={hoodAwareMaxGeistRetreatTacticClass};
