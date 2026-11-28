'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,ENGINE_PIN,FEATURES,withPaperSourceFidelity
}=require('../../simulation/twinleaf/agent21-paper-source-fidelity-bundle.cjs');

class MegaLopunnyex {
  reduceEffect(){return 'native mega'}
}
class DialgaGX {
  reduceEffect(){return 'native dialga'}
}
class Kyurem {
  reduceEffect(){return 'native kyurem'}
}
class Girafarig {
  reduceEffect(){return 'native girafarig'}
}
class DealDamageEffect {}
class ApplyWeaknessEffect {}
class AfterDamageEffect {}
class ChoosePokemonPrompt {}
class ChooseCardsPrompt {}

const classes=[MegaLopunnyex,DialgaGX,Kyurem,Girafarig];
const originalDescriptors=()=>classes.map(C=>
  Object.getOwnPropertyDescriptor(C.prototype,'reduceEffect'));

function injected(){
  const effects={DealDamageEffect,ApplyWeaknessEffect,AfterDamageEffect};
  const prefabs={WAS_ATTACK_USED:()=>false};
  return {
    spikyHopper:{MegaLopunnyex,attacks:effects,prefabs,
      StateUtils:{getOpponent:()=>({})}},
    dialgaShred:{DialgaGX,effects,prefabs,
      StateUtils:{getOpponent:()=>({})}},
    kyuremTrifrost:{Kyurem,prefabs,ChoosePokemonPrompt,
      GameMessage:{CHOOSE_POKEMON_TO_DAMAGE:'damage'},
      PlayerType:{TOP_PLAYER:0},
      SlotType:{ACTIVE:1,BENCH:2}},
    girafarigGetLost:{Girafarig,prefabs,ChooseCardsPrompt,
      GameMessage:{CHOOSE_CARD_TO_DISCARD:'discard'}}
  };
}

test('manifest is pinned and includes exactly four focused features',()=>{
  assert.equal(VERSION,'agent21-paper-expanded-source-fidelity-bundle-v1');
  assert.equal(ENGINE_PIN,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(FEATURES.map(f=>f.key),[
    'spikyHopper','dialgaShred','kyuremTrifrost','girafarigGetLost']);
  assert.ok(Object.isFrozen(FEATURES));
});

test('all four independent card source reducers are active in one scope',()=>{
  const descriptors=originalDescriptors();
  let reached=false;
  const result=withPaperSourceFidelity(()=>{
    reached=true;
    const current=originalDescriptors();
    assert.ok(current.every((d,i)=>d.value!==descriptors[i].value));
    // A different native attack remains delegated to its original reducer.
    assert.equal(new MegaLopunnyex().reduceEffect({}, {}, {attack:null}),
      'native mega');
    assert.equal(new DialgaGX().reduceEffect({}, {}, {attack:null}),
      'native dialga');
    assert.equal(new Kyurem().reduceEffect({}, {}, {attack:null}),
      'native kyurem');
    assert.equal(new Girafarig().reduceEffect({}, {}, {attack:null}),
      'native girafarig');
    return 314;
  },injected());
  assert.equal(result,314);
  assert.equal(reached,true);
  assert.deepEqual(originalDescriptors(),descriptors);
});

test('work exception and accidental Promise restore every original descriptor',()=>{
  const before=originalDescriptors();
  assert.throws(()=>withPaperSourceFidelity(()=>{
    throw Error('case failed');
  },injected()),/case failed/);
  assert.deepEqual(originalDescriptors(),before);
  assert.throws(()=>withPaperSourceFidelity(
    ()=>Promise.resolve(1),injected()),/Do not await/);
  assert.deepEqual(originalDescriptors(),before);
});

test('partial installation error rolls back already-installed source hooks',()=>{
  const before=originalDescriptors();
  const dep=injected();
  dep.girafarigGetLost.prefabs={WAS_ATTACK_USED:null};
  assert.throws(()=>withPaperSourceFidelity(()=>42,dep),
    /expected function,got object/);
  assert.deepEqual(originalDescriptors(),before);
});

test('sequential operation re-installs and removes the exact same four hooks',()=>{
  const before=originalDescriptors();
  for(const turn of [1,2,3]){
    assert.equal(withPaperSourceFidelity(()=>turn*2,injected()),turn*2);
    assert.deepEqual(originalDescriptors(),before);
  }
});
