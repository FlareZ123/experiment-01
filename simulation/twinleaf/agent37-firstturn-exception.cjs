'use strict';

const VERSION='agent37-public-printing-first-player-exception-v1';

/**
 * A first-player attack exception is printed on the face-up attack and
 * separately implemented in the pinned engine. Both signals must agree:
 * an engine-only permission may be incorrect, and text alone may lack native
 * support. This is an actor-visible filter, never an independent native
 * legality or game-strength certificate.
 *
 * @param {{canUseOnFirstTurn?:boolean,text?:string}|null} attack
 * @returns {boolean}
 */
function hasFirstPlayerPrintedAttackException(attack){
  return attack?.canUseOnFirstTurn===true&&
    typeof attack.text==='string'&&
    /(?:^|[.!?]\s+)if you go first, you can use this attack (?:on|during) your first turn(?:\.|$)/i
      .test(attack.text);
}

module.exports={VERSION,hasFirstPlayerPrintedAttackException};
