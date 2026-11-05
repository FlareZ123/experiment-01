'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {residualActiveFunding,rankVoltTransferDonors}=
  require('../simulation/twinleaf/agent23-volt-transfer-readiness.cjs');

const DCE='Double Colorless Energy';
const SPEED='Speed Lightning Energy';
const CAPTURE='Capture Energy';
const SPIKY='Spiky Energy';

test('two-Energy counterexample: keep DCE on Active under Thunder',()=>{
  const donors=rankVoltTransferDonors([DCE,SPEED],{
    thunderMountainActive:true});
  assert.equal(donors[0].transferredName,SPEED);
  assert.equal(donors[0].nextAttackPayableUnderAssumptions,true);
  assert.equal(donors[1].transferredName,DCE);
  assert.equal(donors[1].nextAttackPayableUnderAssumptions,false);
});

test('with an additional Capture, transfer Capture to retain DCE and Lightning',()=>{
  const donors=rankVoltTransferDonors([SPEED,CAPTURE,DCE],{
    thunderMountainActive:true});
  assert.equal(donors[0].transferredName,CAPTURE);
  assert.equal(donors[0].readyWithThunder,true);
  assert.equal(donors[0].readyWithoutThunder,true);
});

test('without Thunder, Lightning plus DCE fully pays printed Volt Cyclone',()=>{
  assert.equal(residualActiveFunding([SPEED,CAPTURE,DCE],1,{
    thunderMountainActive:false}).nextAttackPayableUnderAssumptions,true);
  assert.equal(residualActiveFunding([SPEED,CAPTURE,DCE],2,{
    thunderMountainActive:false}).nextAttackPayableUnderAssumptions,false);
});

test('only DCE requires a future pivot or new Energy after mandatory move',()=>{
  const [donor]=rankVoltTransferDonors([DCE],{
    thunderMountainActive:true});
  assert.deepEqual(donor.remainingNames,[]);
  assert.equal(donor.totalUnits,0);
  assert.equal(donor.nextAttackPayableUnderAssumptions,false);
});

test('two Colorless singles suffice under Thunder but fail without it',()=>{
  assert.equal(residualActiveFunding([SPEED,CAPTURE,SPIKY],2,{
    thunderMountainActive:true}).nextAttackPayableUnderAssumptions,true);
  assert.equal(residualActiveFunding([SPEED,CAPTURE,SPIKY],2,{
    thunderMountainActive:false}).nextAttackPayableUnderAssumptions,false);
});

test('reject energy not present in the fixed original rank6 card-name pool',()=>{
  assert.throws(()=>rankVoltTransferDonors([DCE,'Unknown Energy'],{
    thunderMountainActive:true}),/Unknown attached Energy/);
  assert.throws(()=>residualActiveFunding([DCE],1,{
    thunderMountainActive:true}),/assertion/i);
});
