'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,direct,hoodWithAdventureBag,run}=
  require('../scripts/new-moon-hood-access.cjs');

test('BigInt combinatorial denominator and invalid targets',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(52,2),1326n);
  assert.equal(choose(6,2),15n);
  assert.equal(choose(4,0),1n);
  assert.equal(choose(2,3),0n);
  assert.throws(()=>direct(-1),/must/);
  assert.throws(()=>direct(44),/must/);
});

test('conditioned legal-seven first eight direct non-Basic targets',()=>{
  assert.deepEqual(direct(1),{numerator:3752617n,denominator:29041933n});
  assert.deepEqual(direct(2),{numerator:416435n,denominator:1708349n});
  assert.deepEqual(direct(3),{numerator:10021633n,denominator:29041933n});
  assert.deepEqual(direct(4),{numerator:479458943n,denominator:1103593454n});
});

test('two Hoods plus existing Adventure Bag discounts jointly Prized Hoods',()=>{
  assert.deepEqual(hoodWithAdventureBag(),{
    numerator:169801946n,denominator:493712861n
  });
  const result=run();
  assert.equal(result.assumptions.basicPokemon,17);
  assert.equal(result.assumptions.bonusMulliganDraws,0);
  assert.equal(result.hoodWithExistingAdventureBag.exact,
    '169801946/493712861');
  assert.ok(result.hoodWithExistingAdventureBag.probability >
    result.directTwo.probability);
  assert.ok(result.hoodWithExistingAdventureBag.probability <
    result.directThree.probability);
});
