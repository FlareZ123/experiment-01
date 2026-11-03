'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const native=moduleName=>require(path.join(output,moduleName));
const {WAS_ATTACK_USED,DISCARD_TOP_X_CARDS_FROM_YOUR_DECK}=
  native('game/store/prefabs/prefabs');

/**
 * Patch only the original complete FLF #69 native implementation.
 *
 * Pinned upstream 'M Charizard EX FLF' correctly implements Mega Evolution
 * turn-ending but incorrectly moves five cards from the OPPONENT's deck.
 * Its duplicated auto-generated 'M Charizard-EX FLF 69' correctly targets
 * own deck on attack but has no Mega Evolution turn-ending reducer.
 *
 * Preserve the original reducer for all non-Wild-Blaze events, including
 * PlayPokemonEffect and Mega Evolution Spirit Link handling. The effect
 * below is the same native helper as the duplicate's printed Wild Blaze.
 *
 * This correction is opt-in, process-scoped and must be restored before
 * unrelated runs. It is a mechanics witness, not competitive validation.
 *
 * @returns {{restore:()=>void,evidence:()=>object}}
 */
function installFlf69WildBlazePaperHook(){
  const manager=initializeCards();
  const printed=manager.getCardByName('M Charizard EX FLF');
  assert.ok(printed,'Missing pinned original FLF69 native class');
  assert.equal(printed.name,'M Charizard-EX');
  assert.equal(printed.set,'FLF');
  assert.equal(String(printed.setNumber),'69');
  assert.equal(printed.attacks[0].name,'Wild Blaze');
  assert.equal(printed.attacks[0].damage,300);
  assert.match(printed.attacks[0].text,
    /Discard the top 5 cards of your deck/);
  const proto=Object.getPrototypeOf(printed);
  const original=proto.reduceEffect;
  assert.equal(typeof original,'function');
  let corrected=0;

  /** @this {object} */
  function paperReducer(store,state,effect){
    if(WAS_ATTACK_USED(effect,0,this)){
      DISCARD_TOP_X_CARDS_FROM_YOUR_DECK(store,state,effect.player,5,this,effect);
      corrected++;
      return state;
    }
    return original.call(this,store,state,effect);
  }
  proto.reduceEffect=paperReducer;
  return {
    evidence:()=>({
      originalNativeFullName:'M Charizard EX FLF',
      correctedWildBlazeEffects:corrected,
      correction:'printed five-card OWN-deck discard',
      megaEvolutionReducerPreserved:true,
      competitiveQualified:false
    }),
    restore:()=>{
      assert.strictEqual(proto.reduceEffect,paperReducer,
        'FLF69 patch ownership changed before restoration');
      proto.reduceEffect=original;
    }
  };
}

module.exports={installFlf69WildBlazePaperHook};
