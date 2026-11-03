'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {rank11CoheldReport}=require('../scripts/agent6-rank11-letter-carmine-contention.cjs');
test('original rank11 printed source, 1+1 ordinary draws',()=>{
 const r=rank11CoheldReport();
 assert.equal(r.allLegalOpenings.coheldNumerator,'854166676');
 assert.equal(r.allLegalOpenings.starvedLetterNumerator,'2411940300');
 assert.equal(r.allLegalOpenings.denominator,'15916235808');
 assert.equal(r.openingMegaAbsol.coheldNumerator,'336012516');
 assert.equal(r.openingMegaAbsol.starvedLetterNumerator,'996551388');
 assert.ok(Math.abs(r.allLegalOpenings.coheldProbability-
  0.053666374782576985)<1e-14);
 assert.ok(Math.abs(r.openingMegaAbsol.coheldProbability-
  0.021111305465272734)<1e-14);
 assert.equal(r.allLegalOpenings.paperActionsObserved,0);
});
