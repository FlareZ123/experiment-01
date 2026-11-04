'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {selectStoneRecipient,FSS}=
  require('../simulation/twinleaf/forest-stone-v-recipient-policy.cjs');

const defs={toolType:7,vTags:[101],ownerPlayerType:0};
const stone={fullName:FSS,trainerType:7};
const floatStone={fullName:'Float Stone BKT',trainerType:7};

/**
 * @param {object[]} hand Physical hand order.
 * @param {number[]} tags Pokemon's public tags.
 * @param {boolean} usedVSTAR Whether one VSTAR power was spent.
 * @returns {object}
 */
function owner(hand,tags=[],usedVSTAR=false){
  return {usedVSTAR,hand:{cards:hand},
    forEachPokemon(playerType,fn){
      assert.equal(playerType,defs.ownerPlayerType);
      fn({tools:[]},{fullName:'Public Active',tags},
        {player:0,slot:0,index:0});
    }
  };
}

test('first held unusable Stone prevents considering physically held Float Stone',()=>{
  const held=selectStoneRecipient(owner([stone,floatStone]),defs);
  assert.deepEqual(held,{kind:'hold',reason:'no-free-v-recipient'});
  const reverse=selectStoneRecipient(owner([floatStone,stone]),defs);
  assert.deepEqual(reverse,{kind:'delegate'});
});

test('spent VSTAR causes Stone-first hold despite a free V target and another Tool',()=>{
  const x=selectStoneRecipient(owner([stone,floatStone],[101],true),defs);
  assert.deepEqual(x,{kind:'hold',reason:'vstar-already-spent'});
});

test('an untooled V correctly receives Stone if the VSTAR power is unused',()=>{
  const x=selectStoneRecipient(owner([stone,floatStone],[101]),defs);
  assert.equal(x.kind,'attach');
  assert.equal(x.handIndex,0);
  assert.equal(x.recipient,'Public Active');
});
