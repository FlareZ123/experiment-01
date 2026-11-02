'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {binom,dualConnectorHands,singleDonorEitherConnector,analyze}=require('../scripts/agent49-rank13-dual-connector-openers.cjs');
test('small toy exact counts',()=>{
  const toy={n:8,a:2,v:1,d:1,q:1,t:1,r:2};
  assert.equal(dualConnectorHands(toy,4),2n);
  assert.equal(dualConnectorHands(toy,3),0n);
  assert.ok(singleDonorEitherConnector(toy,4)>2n);
  assert.equal(binom(60,7),386206920n);
});
test('rank13 actual printed source and exact Basic-valid seven hands',()=>{
  const x=analyze();
  assert.deepEqual(x.groups,{n:60,a:7,v:4,d:3,q:3,t:4,r:39});
  assert.equal(x.validBasicHands,'300306336');
  assert.equal(x.originalSalamenceEitherItemNoVHands,'8943039');
  assert.equal(x.dualItemDonorNoVHands,'3736131');
  assert.equal(x.dualItemTwoDonorsNoVHands,'248388');
  assert.ok(Math.abs(x.dualTwoDonorsFractionOfValidBasicOpeners-0.0008271154159065095)<1e-14);
  assert.ok(Math.abs(x.dualFractionOfValidBasicOpeners-0.012441066178503806)<1e-14);
  assert.ok(Math.abs(x.originalSalamenceEitherItemFraction-0.029779721330954537)<1e-14);
  const p=x.twoDonorBothSearchableAfterPrizes;
  assert.deepEqual(p.byHeldStar.map(row=>row.hands),['216006','31626','756','0']);
  assert.equal(p.totalTwoDonorHands,'248388');
  assert.ok(Math.abs(p.probabilityBothTargetPrintingsInDeck-
    0.9974757997185592)<1e-14);
  assert.ok(p.availablePrizePairings.length>10);
  assert.equal(x.competitiveQualifiedGames,0);
});
