'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {FLOAT,selectFloatStoneAfterFssHold}=
  require('../simulation/twinleaf/agent2-fss-held-try-float-owner.cjs');

const FSS={trainerType:7,fullName:'Forest Seal Stone SIT'};
const floatStone={trainerType:7,fullName:FLOAT};
const enums={toolType:7,vTags:[42],selfType:2,cardPlayer:2,activeSlot:1};

/** @param {object} [opts] @returns {object} Owner-only physical fixture. */
function owner(opts={}){
  const active={
    fullName:opts.activeName??'Snorlax PGO',tags:[],
    retreat:opts.activeFree?[]:[1,1,1,1]
  };
  const bench={fullName:'Other Basic Pokémon',tags:opts.vBench?[42]:[],
    retreat:[1]};
  const actor={
    usedVSTAR:Boolean(opts.usedVSTAR),
    hand:{cards:opts.hand??[FSS,floatStone]},
    active:{tools:opts.activeTooled?['Some Tool']:[],
      getPokemonCard:()=>active},
    bench:opts.emptyBench?[]:[{tools:[],
      getPokemonCard:()=>bench}],
    forEachPokemon(self,fn){
      assert.equal(self,2);
      fn(actor.active,active,{player:2,slot:1,index:0});
      if(!opts.emptyBench)fn(actor.bench[0],bench,
        {player:2,slot:2,index:0});
    }
  };
  return actor;
}
test('pure fallback recovers alternate Float from Stone-first dead owner hand',()=>{
  const p=owner();
  const original=JSON.stringify(p.hand.cards);
  const result=selectFloatStoneAfterFssHold(p,enums);
  assert.deepEqual(result,{kind:'propose',handIndex:1,
    target:{player:2,slot:1,index:0},
    reason:'no-free-v-recipient',activeName:'Snorlax PGO'});
  assert.equal(JSON.stringify(p.hand.cards),original);
});

test('spent VSTAR opens Float alternative even when own V recipient is free',()=>{
  const r=selectFloatStoneAfterFssHold(
    owner({usedVSTAR:true,vBench:true}),enums);
  assert.equal(r.kind,'propose');
  assert.equal(r.reason,'vstar-already-spent');
});

test('unspent eligible V reserves Stone and leaves existing action intact',()=>{
  assert.deepEqual(selectFloatStoneAfterFssHold(owner({vBench:true}),enums),
    {kind:'delegate'});
});

test('does not force alternate Tool when no useful mobility conditions hold',()=>{
  for(const opts of [{activeFree:true},{activeTooled:true},
    {emptyBench:true},{hand:[FSS]},{hand:[floatStone,FSS]}])
    assert.deepEqual(selectFloatStoneAfterFssHold(owner(opts),enums),
      {kind:'delegate'});
});
