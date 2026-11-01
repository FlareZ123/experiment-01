'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {setupWeight,drawEvent,evaluate}=
  require('../scripts/agent3-rank26-coupled-mulligan-zone.cjs');

test('coupled mulligan distribution respects both-no-Basic reset',()=>{
  const s=evaluate();
  assert.ok(Math.abs(s.sourceOpeningBasicValid-0.8093533072892635)<1e-14);
  assert.ok(Math.abs(s.opponentOpeningBasicValid-0.3994996257446656)<1e-14);
  assert.ok(Math.abs(setupWeight(0)-0.45114866327974673)<1e-14);
  assert.ok(Math.abs(s.expectedOpponentMulligans-1.373846935894362)<1e-8);
  assert.ok(s.probabilityMassAbove46<4e-11);
});

test('single ordinary draw reconstructs direct DCE / Lightning root gate',()=>{
  assert.ok(Math.abs(drawEvent(1,true)+drawEvent(1,false)-
    0.027889226465574225)<1e-14);
  assert.equal(drawEvent(48,false),0);
});

test('bonus-draw rule exposes a state-dependent source choice',()=>{
  const p=evaluate().conditionalDirectRootByBonusPolicy;
  assert.ok(Math.abs(p.declineAllBonusDraws-0.027889226465574225)<1e-14);
  assert.ok(Math.abs(p.takeAllBonusDraws-0.03071278777571834)<1e-13);
  assert.ok(Math.abs(p.skipIfDceHeldOtherwiseTakeAll-
    0.03209995057141361)<1e-13);
  assert.ok(p.skipIfDceHeldOtherwiseTakeAll>p.takeAllBonusDraws);
});
