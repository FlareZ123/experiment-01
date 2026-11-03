'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const native=moduleName=>require(path.join(output,moduleName));
const {WAS_ATTACK_USED,DISCARD_TOP_X_CARDS_FROM_YOUR_DECK}=
  native('game/store/prefabs/prefabs');

const PRINTINGS=Object.freeze([
  {fullName:'M Charizard EX FLF',number:'69'},
  {fullName:'M Charizard EX4 FLF',number:'108'}
]);

/**
 * Correct the wrong-side Wild Blaze mill in two exact Flashfire printings.
 *
 * The pinned original FLF #69 reducer mills the opponent instead of its
 * owner. Gold #108 inherits that implementation in source, but actual native
 * tests show it has a DISTINCT runtime prototype chain. Changing #69's
 * prototype therefore leaves #108 broken. Patch both exact card prototype
 * objects independently, and preserve inherited-vs-own method state so
 * restoration leaves the native Store unchanged.
 *
 * All other events delegate to the prior reducer, preserving the ordinary
 * Mega Evolution end-turn rule and Charizard Spirit Link exemption.
 * This patch is opt-in and process-scoped; staged tests are not competitive
 * games, and the unpatched simulator remains paper-unsafe for either print.
 *
 * @returns {{restore:()=>void,evidence:()=>object}}
 */
function installFlf69WildBlazePaperHook(){
  const manager=initializeCards();
  const patches=PRINTINGS.map(print=>{
    const card=manager.getCardByName(print.fullName);
    assert.ok(card,'Missing pinned native printing '+print.fullName);
    assert.equal(card.name,'M Charizard-EX');
    assert.equal(card.set,'FLF');
    assert.equal(String(card.setNumber),print.number);
    assert.equal(card.attacks[0].name,'Wild Blaze');
    assert.equal(card.attacks[0].damage,300);
    assert.match(card.attacks[0].text,
      /Discard the top 5 cards of your deck/);
    const proto=Object.getPrototypeOf(card);
    const descriptor=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
    const original=proto.reduceEffect;
    assert.equal(typeof original,'function');
    return {print,proto,descriptor,original,installed:null};
  });
  assert.notStrictEqual(patches[0].proto,patches[1].proto,
    'Pinned independent native printing prototypes unexpectedly collapsed');
  const correctedByPrinting={'69':0,'108':0};

  for(const patch of patches){
    /** @this {object} */
    function paperReducer(store,state,effect){
      if(WAS_ATTACK_USED(effect,0,this)){
        DISCARD_TOP_X_CARDS_FROM_YOUR_DECK(
          store,state,effect.player,5,this,effect);
        correctedByPrinting[patch.print.number]++;
        return state;
      }
      return patch.original.call(this,store,state,effect);
    }
    patch.installed=paperReducer;
    Object.defineProperty(patch.proto,'reduceEffect',{
      configurable:true,writable:true,
      enumerable:patch.descriptor?.enumerable??false,
      value:paperReducer
    });
  }

  return {
    evidence:()=>({
      originalNativeFullName:'M Charizard EX FLF',
      coveredPrintingIds:['xy2-69','xy2-108'],
      correctedWildBlazeEffects:
        correctedByPrinting['69']+correctedByPrinting['108'],
      correctedByPrinting:{...correctedByPrinting},
      correction:'printed five-card OWN-deck discard',
      megaEvolutionReducerPreserved:true,
      competitiveQualified:false
    }),
    restore:()=>{
      for(const patch of [...patches].reverse()){
        assert.strictEqual(patch.proto.reduceEffect,patch.installed,
          'Flashfire patch ownership changed before restoration');
        if(patch.descriptor){
          Object.defineProperty(patch.proto,'reduceEffect',patch.descriptor);
        }else{
          assert.equal(delete patch.proto.reduceEffect,true);
        }
        assert.strictEqual(patch.proto.reduceEffect,patch.original,
          'Flashfire native reducer not restored');
      }
    }
  };
}

module.exports={installFlf69WildBlazePaperHook};
