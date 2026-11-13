'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Return a candidate-only RetreatTactic subclass that evaluates an actual
 * retreat followed by Max Geist against the best current-Active attack and
 * the native RetreatTactic's preferred retreat line. Each attack line also
 * includes the opponent's best legal immediate retreat response.
 *
 * Max Geist is considered only when the pinned Simulator accepts the attack
 * after a real RetreatAction. This deliberately avoids treating Energy counts
 * or a Bench VMAX as proof that the attack is available. The existing
 * StateScore is used consistently for both sides of the comparison.
 *
 * This is a one-opponent-action tactical heuristic: it models legal retreat
 * responses after passing the turn, not the opponent's complete turn, future
 * gust, or a full prize-map search.
 *
 * @param {Function|null} BaseTacticOverride Test seam / currently installed
 *   candidate RetreatTactic subclass. Native callers omit it.
 * @param {object} [deps] Test-only action constructor injection.
 * @returns {Function} Candidate-specific tactic constructor.
 */
function hoodAwareMaxGeistRetreatTacticClass(BaseTacticOverride=null,deps={}) {
  const engine = modulePath => require(path.join(output,modulePath));
  const BaseTactic=BaseTacticOverride??
    engine('simple-bot/simple-tactics/retreat-tactic').RetreatTactic;
  const actionTypes=deps.actionTypes??
    engine('game/store/actions/game-actions');
  const {AttackAction,RetreatAction,PassTurnAction}=actionTypes;
  if(typeof AttackAction!=='function'||typeof RetreatAction!=='function'||
     typeof PassTurnAction!=='function') {
    throw new TypeError('Pinned AttackAction, RetreatAction, and PassTurnAction constructors are required');
  }
  const scoreMargin=Number.isFinite(deps.scoreMargin)?deps.scoreMargin:0;

  class HoodMaxGeistRetreatTactic extends BaseTactic {
    scoreAfterBestPublicRetreatResponse(afterAttackState,playerId) {
      if(afterAttackState.winner!==undefined&&afterAttackState.winner!==null) {
        return this.getStateScore(afterAttackState,playerId);
      }
      const afterPass=this.simulateAction(afterAttackState,
        new PassTurnAction(playerId));
      if(!afterPass)return this.getStateScore(afterAttackState,playerId);
      const opponent=afterPass.players.find(item=>item.id!==playerId);
      let worst=this.getStateScore(afterPass,playerId);
      if(!opponent)return worst;
      for(let benchIndex=0;benchIndex<(opponent.bench??[]).length;benchIndex++) {
        const response=this.simulateAction(afterPass,
          new RetreatAction(opponent.id,benchIndex));
        if(response)worst=Math.min(worst,this.getStateScore(response,playerId));
      }
      return worst;
    }

    bestAttackScore(state,playerId) {
      const player=state.players.find(item=>item.id===playerId);
      const active=player?.active?.getPokemonCard?.();
      const attackBonus=this.options?.scores?.tactics?.attackBonus??0;
      let best=this.getStateScore(state,playerId)-attackBonus;
      for(const attack of active?.attacks??[]) {
        const afterAttack=this.simulateAction(state,
          new AttackAction(playerId,attack.name));
        if(!afterAttack)continue;
        const score=this.scoreAfterBestPublicRetreatResponse(afterAttack,playerId);
        if(score>best)best=score;
      }
      return best;
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
      let baselineScore=this.bestAttackScore(state,player.id);
      if(baseRetreat) {
        const afterBaseRetreat=this.simulateAction(state,baseRetreat);
        if(afterBaseRetreat) {
          baselineScore=Math.max(
            baselineScore,
            this.getStateScore(afterBaseRetreat,player.id),
            this.bestAttackScore(afterBaseRetreat,player.id)
          );
        }
      }

      let bestRetreat=null;
      let bestScore=baselineScore;
      for(const benchIndex of maxGeistBenchIndices) {
        const retreatAction=new RetreatAction(player.id,benchIndex);
        const afterRetreat=this.simulateAction(state,retreatAction);
        if(!afterRetreat)continue;
        const afterPlayer=afterRetreat.players.find(item=>item.id===player.id);
        if(afterPlayer?.active?.getPokemonCard?.()?.name!==
           'Shadow Rider Calyrex VMAX')continue;

        // Simulate the actual attack, then include the opponent's best legal
        // immediate retreat response. This prevents a free-retreat target from
        // being valued as though it must remain Active for the next turn.
        const afterAttack=this.simulateAction(afterRetreat,
          new AttackAction(player.id,'Max Geist'));
        if(!afterAttack)continue;
        const maxGeistScore=this.scoreAfterBestPublicRetreatResponse(
          afterAttack,player.id);
        if(maxGeistScore>bestScore+scoreMargin) {
          bestScore=maxGeistScore;
          bestRetreat=retreatAction;
        }
      }
      return bestRetreat??baseRetreat;
    }
  }

  return HoodMaxGeistRetreatTactic;
}

module.exports={hoodAwareMaxGeistRetreatTacticClass};
