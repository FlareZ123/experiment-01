'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactSecretBoxShield}=require(
  '../scripts/agent3-jellicent-secret-box-shield-access.cjs'
);

/** @param {number} actual @param {number} expected */
function near(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-11,`${actual} != ${expected}`);
}

test('ACE SPEC zero reproduces earlier first-player direct triple',()=>{
  near(exactSecretBoxShield({
    secretBox:0,arven:0,goingSecond:false
  }).conditionalValidBasic,0.02564641524124662);
});

test('one held Secret Box can assemble Boost, Hood and Stadium first turn',()=>{
  const r=exactSecretBoxShield({
    secretBox:1,arven:0,goingSecond:false
  });
  near(r.conditionalValidBasic,0.08328380590060198);
  near(r.individualPathProbabilities.heldBox,0.05966880042805775);
  assert.ok(r.numerator>0n&&r.denominator>r.numerator);
});

test('Arven alone is the independent Item plus Tool path',()=>{
  const r=exactSecretBoxShield({
    secretBox:0,arven:4,goingSecond:true
  });
  near(r.conditionalValidBasic,0.09466101256173264);
  near(r.individualPathProbabilities.arvenDirect,0.0764204646181317);
});

test('single Secret Box plus four Arven improves union beyond each path',()=>{
  const r=exactSecretBoxShield({
    secretBox:1,arven:4,goingSecond:true
  });
  near(r.conditionalValidBasic,0.2445093545497889);
  near(r.individualPathProbabilities.arvenBox,0.16017972898924113);
  near(r.individualPathProbabilities.arvenDirect,0.0764204646181317);
  assert.ok(r.conditionalValidBasic<0.31);
  near(exactSecretBoxShield({
    secretBox:1,arven:4,goingSecond:false
  }).conditionalValidBasic,0.08328380590060198);
});

test('slot-efficient 3-of pieces retain a large contingent opening',()=>{
  near(exactSecretBoxShield({
    secretBox:1,arven:4,goingSecond:true,
    boostShake:4,stealthyHood:3,silentLab:3,jellicent:3
  }).conditionalValidBasic,0.23457364262701783);
});

test('no essential resource blocks entire package',()=>{
  for(const key of ['boostShake','stealthyHood','silentLab','jellicent']){
    const r=exactSecretBoxShield({[key]:0,secretBox:1,goingSecond:true});
    assert.equal(r.numerator,0n,`missing essential ${key}`);
  }
  assert.throws(()=>exactSecretBoxShield({secretBox:2}),RangeError);
  assert.throws(()=>exactSecretBoxShield({frillish:5}),RangeError);
  assert.throws(()=>exactSecretBoxShield({totalBasics:3}),RangeError);
});
