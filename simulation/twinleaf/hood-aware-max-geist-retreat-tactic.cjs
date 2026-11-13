'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Return a candidate-only RetreatTactic subclass that evaluates an actual
 * retreat followed by Max Geist against the best attack available to the
 * current Active and the native RetreatTactic's preferred retreat line.
 *
 * Max Geist is considered only when the pinned Simulator accepts the attack
 * after a real RetreatAction. This deliberately avoids treating Energy counts
 * or a Bench VMAX as proof that the attack is available. The existing
 * StateScore is used consistently for both sides of the comparison.
 *
 * This is a one-turn tactical heuristic. It does not model the opponent's
 * response, future gust, or a complete prize-map search.
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
  const {AttackAction,RetreatAction}=actionTypes;
  if(typeof AttackAction!=='function'||typeof RetreatAction!=='function') {
    throw new TypeError('Pinned AttackAction and RetreatAction constructors are required');
  }
  const scoreMargin=Number.isFinite(deps.scoreMargin)?deps.scoreMargin:0;

  class HoodMaxGeistRetreatTactic extends BaseTactic {
    bestAttackScore(state,playerId) {
      const player=state.players.find(item=>item.id===playerId);
      const active=player?.active?.getPokemonCard?.();
      const attackBonus=this.options?.scores?.tactics?.attackBonus??0;
      let best=this.getStateScore(state,playerId)-attackBonus;
      for(const attack of active?.attacks??[]) {
        const score=this.evaluateAction(state,playerId,
          new AttackAction(playerId,attack.name));
        if(score!==undefined&&score>best)best=score;
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

        // evaluateAction uses the same pinned Simulator and StateScore as the
        // ordinary AttackTactic; an unpayable or otherwise invalid attack is
        // rejected and cannot trigger the retreat.
        const maxGeistScore=this.evaluateAction(afterRetreat,player.id,
          new AttackAction(player.id,'Max Geist'));
        if(maxGeistScore!==undefined&&maxGeistScore>bestScore+scoreMargin) {
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
