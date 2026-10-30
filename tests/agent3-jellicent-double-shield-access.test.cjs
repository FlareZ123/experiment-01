'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactDoubleShield}=require('../scripts/agent3-jellicent-double-shield-access.cjs');

/** @param {number} actual @param {number} expected */
function close(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-11,`${actual} != ${expected}`);
}

test('going first cannot use ordinary Supporter connectors',()=>{
  const base=exactDoubleShield({goingSecond:false});
  const all=exactDoubleShield({
    arven:4,wally:4,guzmaHala:4,goingSecond:false
  });
  close(base.conditionalValidBasic,0.02564641524124662);
  close(base.conditionalValidBasic,all.conditionalValidBasic);
});

test('going second Arven pairs Boost Item and Hood Tool while holding Lab',()=>{
  const a=exactDoubleShield({goingSecond:true,arven:4});
  close(a.conditionalValidBasic,0.09466101256173264);
  assert.ok(a.numerator>0n&&a.denominator>a.numerator);
  close(exactDoubleShield({
    goingSecond:true,arven:4,wally:4
  }).conditionalValidBasic,0.10723182349077973);
});

test('Guzma Hala Stadium-plus-Tool payment assumption and all-connector access',()=>{
  close(exactDoubleShield({
    goingSecond:true,arven:4,guzmaHala:4
  }).conditionalValidBasic,0.1580058728676648);
  close(exactDoubleShield({
    goingSecond:true,arven:4,guzmaHala:4,wally:4
  }).conditionalValidBasic,0.1705766837967119);
});

test('meaningful marginal slot tradeoffs differ for Lab, Hood and Jellicent',()=>{
  const a=4,goingSecond=true;
  close(exactDoubleShield({arven:a,goingSecond,stealthyHood:3})
    .conditionalValidBasic,0.09064669777505095);
  close(exactDoubleShield({arven:a,goingSecond,silentLab:3})
    .conditionalValidBasic,0.07432593457518988);
  close(exactDoubleShield({arven:a,goingSecond,jellicent:3})
    .conditionalValidBasic,0.09417627791483332);
});

test('no Hood or Lab yields no double-protected opener',()=>{
  assert.equal(exactDoubleShield({stealthyHood:0}).numerator,0n);
  assert.equal(exactDoubleShield({silentLab:0}).numerator,0n);
  assert.throws(()=>exactDoubleShield({frillish:5}),RangeError);
  assert.throws(()=>exactDoubleShield({totalBasics:3}),RangeError);
});
