'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Repair the source-identified deck/discard-origin Telepath attachment failure
 * in the pinned Store without modifying vendor source. This is a deliberately
 * narrow opt-in research adapter: card effects that pre-move Energy before
 * emitting AttachEnergyEffect are outside its current provenance scope.
 *
 * @returns {()=>void} Restore the exact original Store prototype method.
 */
function installTelepathSourceOriginHook() {
  const {Store}=require(path.join(output,'game/store/store'));
  const {AttachEnergyEffect}=
    require(path.join(output,'game/store/effects/play-card-effects'));
  const proto=Store.prototype;
  const prior=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  if(!prior || typeof prior.value!=='function')
    throw new TypeError('Pinned Store.reduceEffect was not found');

  Object.defineProperty(proto,'reduceEffect',{
    ...prior,
    value:function(state,effect) {
      if(!(effect instanceof AttachEnergyEffect) ||
        effect.energyCard?.fullName!=='Telepath [P] Energy M3' ||
        effect.player.hand.cards.includes(effect.energyCard)) {
        return prior.value.call(this,state,effect);
      }
      const {energyCard,player,target}=effect;
      const origin=[player.deck,player.discard].find(
        zone=>zone.cards.includes(energyCard));
      if(!origin) return prior.value.call(this,state,effect);

      // The attached-from-hand-only search must not execute while resolving
      // a deck/discard-origin AttachEnergyEffect. Other effect types still go
      // through the card's exact original reducer.
      const priorCard=Object.getOwnPropertyDescriptor(energyCard,'reduceEffect');
      const originalCardReducer=energyCard.reduceEffect;
      Object.defineProperty(energyCard,'reduceEffect',{
        configurable:true,writable:true,
        value:function(store,sourceState,inner) {
          if(inner instanceof AttachEnergyEffect && inner.energyCard===this)
            return sourceState;
          return originalCardReducer.call(this,store,sourceState,inner);
        }
      });

      let outcome;
      try { outcome=prior.value.call(this,state,effect); }
      finally {
        if(priorCard)Object.defineProperty(energyCard,'reduceEffect',priorCard);
        else delete energyCard.reduceEffect;
      }
      // The pinned reducer appends a non-hand card only to energies.cards.
      // Finish the physical move from the actual source into target.cards.
      if(effect.preventDefault!==true &&
         target.energies.cards.includes(energyCard) &&
         origin.cards.includes(energyCard)) {
        origin.moveCardTo(energyCard,target);
      }
      return outcome;
    }
  });
  return ()=>Object.defineProperty(proto,'reduceEffect',prior);
}

module.exports={installTelepathSourceOriginHook};
