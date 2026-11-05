'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sourceT5GhalaPrizeEnvelope}=
  require('../simulation/evaluation/agent7-rank6-ghala-turn5-prize-envelope.cjs');

test('original rank6 turn-five two-singleton Prize loss has exact fraction',()=>{
  const x=sourceT5GhalaPrizeEnvelope();
  assert.equal(x.exposedNonPrizeCards+x.unknownPrizeCards+
    x.residualDeckCards,60);
  assert.equal(x.otherUnseenSpecialEnergyCopies,6);
  assert.equal(x.unfavorablePrizeFraction,'5/376');
  assert.equal(x.nominalResourceAccessFraction,'371/376');
  assert.ok(Math.abs(x.nominalResourceAccessProbability-
    371/376)<1e-12);
  assert.equal(x.attestedNativeAttack,false);
  assert.equal(x.competitiveGamesQualified,0);
  console.log('AGENT7_RANK6_T5_GHALA_PRIZE_ENVELOPE '+JSON.stringify(x));
});
