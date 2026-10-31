'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/agent9-crobat-vip-cohold.cjs');
const {coholdAfterDraws}=
  require('../scripts/agent9-thorns-mulligan-vip.cjs');
const {coupledBonusExposure,run}=
  require('../scripts/agent9-coupled-setup-mulligan-vip.cjs');

const own={basicCount:11,vipCount:4,crobatCount:1};
const near=(actual,expected,tol=1e-11)=>
  assert.ok(Math.abs(actual-expected)<tol,
    String(actual)+' versus '+String(expected));

test('real rank11 versus rank6 coupled geometric source count',()=>{
  const x=run();
  assert.equal(x.sourceRank,11);
  assert.equal(x.opponentRank,6);
  near(x.ownOpeningBasicSuccess,0.7775788585041408);
  near(x.opponentOpeningBasicSuccess,0.3994996257446656);
  near(x.expectedNetBonus,1.3489779482590685);
  near(x.netZeroBonusProbability,0.4610838145326953);
  near(x.coupledGoingFirst,0.05154149976002411);
  near(x.coupledGoingSecond,0.06433697273772747);
  assert.ok(x.truncatedTailProbability<6e-11);
  assert.ok(x.coupledGoingFirst<x.firstHandValidConditionalGoingFirst);
  assert.ok(x.coupledGoingSecond<x.firstHandValidConditionalGoingSecond);
  assert.equal(x.darkAssetAvailableUnderUnbrokenInitialization,false);
  assert.equal(x.gameWinRateQualified,false);
});

test('independent double-mulligan enumeration reproduces exact net distribution',()=>{
  const pA=1-Number(choose(49,7))/Number(choose(60,7));
  const pB=1-Number(choose(56,7))/Number(choose(60,7));
  const qA=1-pA,qB=1-pB;
  let probabilities=Array(9).fill(0),first=0,second=0;
  for(let a=0;a<=80;a++)for(let b=0;b<=80;b++){
    const w=pA*qA**a*pB*qB**b;
    const d=Math.max(b-a,0);
    if(d<=8)probabilities[d]+=w;
    if(d<=45){
      const x=coholdAfterDraws({...own,draws:d});
      const y=coholdAfterDraws({...own,draws:d+1});
      first+=w*Number(x.numerator)/Number(x.denominator);
      second+=w*Number(y.numerator)/Number(y.denominator);
    }
  }
  const x=coupledBonusExposure(own,4);
  for(const {bonus,probability} of x.distribution)
    near(probabilities[bonus],probability,1e-12);
  near(first,x.coupledGoingFirst,1e-12);
  near(second,x.coupledGoingSecond,1e-12);
  near(probabilities.slice(0,9).reduce((a,b)=>a+b),0.9915,0.01);
});

test('opponent with all Basics cannot offer any mulligan bonus',()=>{
  const x=coupledBonusExposure(own,60,5);
  near(x.opponentOpeningBasicSuccess,1);
  near(x.netZeroBonusProbability,1);
  near(x.expectedNetBonus,0);
  near(x.coupledGoingFirst,x.noBonusGoingFirst);
  near(x.coupledGoingSecond,x.noBonusGoingSecond);
});
