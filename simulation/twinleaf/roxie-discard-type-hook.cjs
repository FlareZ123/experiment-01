'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
const load=name=>require(path.join(output,name));

/**
 * Repair only the missing readonly type from pinned Roxie's Object.create
 * DiscardCardsEffect constructor bypass. This hook is research-side,
 * reversible, and uses the actual upstream type constant.
 *
 * @template T
 * @param {()=>T} run Synchronous staged scenario / headless experiment.
 * @returns {T}
 */
function withRoxieDiscardEffectType(run) {
  const bomb=load('sets/08-sun-and-moon/set-cosmic-eclipse/blow-away-bomb');
  const {AttackEffects,DiscardCardsEffect}=
    load('game/store/effects/attack-effects');
  const original=bomb.createTrainerDiscardCardsEffect;
  bomb.createTrainerDiscardCardsEffect=function typedRoxieDiscard(...args) {
    const effect=original(...args);
    if (!(effect instanceof DiscardCardsEffect) || effect.type !== undefined) {
      throw new Error('Pinned Roxie discard effect signature changed.');
    }
    effect.type=AttackEffects.DISCARD_CARD_EFFECT;
    return effect;
  };
  try {
    return run();
  } finally {
    bomb.createTrainerDiscardCardsEffect=original;
  }
}

module.exports={withRoxieDiscardEffectType};
