'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choose,firstEightJoint,sourceRank20CoVisibility}=
  require('../simulation/twinleaf/agent47-rank20-first-eight-co-visibility.cjs');

test('exact rank20 registered full source printing contains 14 Basic and two Ultra Ball',()=>{
 const result=sourceRank20CoVisibility();
 assert.equal(result.rank,20);
 assert.equal(result.basicCount,14);
 assert.equal(result.connectorCount,2);
 assert.equal(result.payloadCount,1);
 assert.deepEqual(result.legalStarter,{
   numerator:'252032',denominator:'292581',
   probability:252032/292581
 });
 assert.deepEqual(result.jointUnconditional,{
   numerator:'120046087',denominator:'5117241690',
   probability:120046087/5117241690
 });
 assert.deepEqual(result.jointGivenLegalStarter,{
   numerator:'120046087',denominator:'4408039680',
   probability:120046087/4408039680
 });
});

test('first-seven Basic legality and next ordinary draw are distinct exact events',()=>{
 const all=firstEightJoint({deckSize:60,basicCount:14,connectorCount:2});
 const one=firstEightJoint({deckSize:60,basicCount:14,connectorCount:1});
 assert.ok(all.jointGivenLegalStarter.probability>
   one.jointGivenLegalStarter.probability);
 assert.ok(all.jointGivenLegalStarter.probability<
   all.legalStarter.probability);
 assert.equal(choose(60,0),1n);
 assert.equal(choose(60,60),1n);
 assert.equal(choose(60,7),386206920n);
});
