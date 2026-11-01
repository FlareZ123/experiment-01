'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {coupledFirstDrawSupporter}=require(
  '../scripts/agent18-coupled-mulligan-supporter-supply.cjs');

test('two-player simultaneous reset and initial Supporter basics',()=>{
  const options={deckSize:9,handSize:3,prizes:2};
  const x=coupledFirstDrawSupporter(2,2,1,options);
  assert.ok(Math.abs(x.withoutBonus-97/147)<1e-12);
  assert.ok(Math.abs(x.withAllAvailableBonus-13519/17199)<1e-12);
  assert.ok(Math.abs(x.bonusOfferedProbability-7/13)<1e-12);
  assert.equal(x.maxBonusToPreserveOrdinaryDraw,3);
  assert.ok(Math.abs(
    coupledFirstDrawSupporter(2,2,2,options).withAllAvailableBonus-
    128803/179928)<1e-12);
  assert.ok(Math.abs(
    coupledFirstDrawSupporter(3,1,1,options).withAllAvailableBonus-
    50713/91584)<1e-12);
});

test('source-rank11 against four-Basic and rank1 opponent',()=>{
  const four=coupledFirstDrawSupporter(11,8,4);
  const fourteen=coupledFirstDrawSupporter(11,8,14);
  assert.ok(Math.abs(four.withAllAvailableBonus-
    0.7392484928336021)<1e-12);
  assert.ok(Math.abs(four.withoutBonus-
    0.6853139171585714)<1e-12);
  assert.ok(Math.abs(four.bonusOfferedProbability-
    0.5389161854673047)<1e-12);
  assert.ok(Math.abs(four.expectedBonusOffered-
    1.3489779482590685)<1e-12);
  assert.ok(Math.abs(four.cappedTailProbability-
    3.4924662497361585e-11)<1e-18);
  assert.ok(Math.abs(fourteen.withAllAvailableBonus-
    0.6914278331085708)<1e-12);
  assert.ok(Math.abs(fourteen.bonusOfferedProbability-
    0.1111927554290346)<1e-12);
  assert.ok(four.withAllAvailableBonus>
    fourteen.withAllAvailableBonus);
  assert.equal(four.qualifyingGames,0);
});

test('four-Basic source and stage-independent negative boundaries',()=>{
  const four=coupledFirstDrawSupporter(4,21,14);
  assert.ok(Math.abs(four.withAllAvailableBonus-
    0.9670273604527252)<1e-12);
  const noSupport=coupledFirstDrawSupporter(4,0,14);
  assert.equal(noSupport.withoutBonus,0);
  assert.equal(noSupport.withAllAvailableBonus,0);
  const always=coupledFirstDrawSupporter(4,4,60);
  assert.equal(always.bonusOfferedProbability,0);
  assert.ok(Math.abs(always.withAllAvailableBonus-
    always.withoutBonus)<1e-12);
  assert.throws(()=>coupledFirstDrawSupporter(0,4,12));
  assert.throws(()=>coupledFirstDrawSupporter(1,60,12));
});
