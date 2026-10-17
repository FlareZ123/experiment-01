'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));

/**
 * Compare attacks with an actual simulated Pass at the SAME end-of-turn
 * horizon. The pinned AttackTactic otherwise compares post-attack scores to
 * the score of the unadvanced turn, which is a biased baseline when delayed
 * effects resolve at turn end.
 *
 * This only ranks attacks written on the Active Pokemon. It does not grant
 * unseen-card information, solve subsequent opponent decisions, or validate
 * paper-rules mechanics. Equal scores retain the original strict threshold.
 *
 * @param {number|undefined} passScore Score after simulating PassTurnAction.
 * @param {number} attackBonus Existing pinned policy tolerance for attacking.
 * @param {string[]} names Printed attacks in card order.
 * @param {(name:string)=>number|undefined} evaluate One genuine speculative
 *   AttackAction evaluation per printed name.
 * @returns {string|null} Selected name, or null if no justified attack exists.
 */
function chooseAtPassHorizon(passScore,attackBonus,names,evaluate) {
  if(!Number.isFinite(passScore)) return null;
  if(!Number.isFinite(attackBonus) || !Array.isArray(names) ||
      typeof evaluate!=='function') {
    throw new TypeError('Invalid same-horizon attack scoring inputs');
  }
  let threshold=passScore-attackBonus;
  let best=null;
  for(const name of names) {
    const score=evaluate(name);
    if(Number.isFinite(score) && score>threshold) {
      threshold=score;
      best=name;
    }
  }
  return best;
}

/** @param {number|null} [targetTurn=null] Optional source-turn probe gate. @returns {Function} */
function makePassHorizonAttackTactic(targetTurn=null) {
  const {AttackTactic}=engine('simple-bot/simple-tactics/attack-tactic');
  const {AttackAction,PassTurnAction}=engine('game/store/actions/game-actions');
  const {SpecialCondition}=engine('game');
  return class PassHorizonAttackTactic extends AttackTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      if(targetTurn!==null && state.turn!==targetTurn) {
        return super.useTactic(state,player);
      }
      const active=player.active.getPokemonCard();
      if(!active || player.active.specialConditions.includes(SpecialCondition.ASLEEP) ||
          player.active.specialConditions.includes(SpecialCondition.PARALYZED)) {
        return undefined;
      }
      const pass=this.evaluateAction(state,player.id,new PassTurnAction(player.id));
      const chosen=chooseAtPassHorizon(
        pass,this.options.scores.tactics.attackBonus,
        active.attacks.map(attack=>attack.name),
        name=>this.evaluateAction(state,player.id,new AttackAction(player.id,name))
      );
      return chosen===null?undefined:new AttackAction(player.id,chosen);
    }
  };
}

/**
 * Replace the pinned printed AttackTactic with a same-horizon variant in
 * one bot's option list. Caller can select precisely one physical player,
 * preventing accidental two-policy confounding.
 * @param {object} options Pinned SimpleBotOptions.
 * @param {{targetTurn?:number|null}} [scope] Optional source-only turn gate.
 * @returns {object} New options with identical other tactic order.
 */
function withPassHorizonAttack(options,scope={}) {
  const targetTurn=scope.targetTurn??null;
  if(targetTurn!==null && (!Number.isSafeInteger(targetTurn) || targetTurn<1)) {
    throw new TypeError('Same-horizon target turn must be positive');
  }
  const {AttackTactic}=engine('simple-bot/simple-tactics/attack-tactic');
  const tactics=options.tactics;
  if(tactics.some(t=>t.name==='PassHorizonAttackTactic')) return options;
  const index=tactics.indexOf(AttackTactic);
  if(index<0) throw new Error('Pinned AttackTactic extension point missing');
  const updated=tactics.slice();
  updated[index]=makePassHorizonAttackTactic(targetTurn);
  return {...options,tactics:updated};
}

module.exports={chooseAtPassHorizon,makePassHorizonAttackTactic,withPassHorizonAttack};
