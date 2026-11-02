'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/aichi-opening-basics.cjs');
const {maximumLegalHistoryLikelihood}=require('../scripts/agent26-prism-joint-mulligan-envelope.cjs');
const D=Number(choose(60,7));
const THORNS=1-Number(choose(56,7))/D;
const equal=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(1,Math.abs(b)),String(a)+' != '+String(b));

test('zero failed hands has exact legal and visible-Thorns caps',()=>{
  equal(maximumLegalHistoryLikelihood([]).probabilityUpper,1);
  equal(maximumLegalHistoryLikelihood([],{maxActiveCopies:4}).probabilityUpper,THORNS);
});

test('Prism singleton: genuine revealed 7 limits unknown Active chance by 4x',()=>{
  const hand=['Crushing Hammer','Camping Gear','Echoing Horn','Wondrous Labyrinth ♢',
    'Guzma & Hala','Guzma','Speed Lightning Energy'];
  const out=maximumLegalHistoryLikelihood([hand],{maxActiveCopies:4});
  const old=4**7/D*THORNS;
  equal(out.probabilityUpper,old/4);
  assert.equal(out.observedCounts['Wondrous Labyrinth ♢'],1);
  assert.equal(out.residualBasicCount,35);
  const unrestricted=maximumLegalHistoryLikelihood([hand],{
    copyCaps:{'Wondrous Labyrinth ♢':4},maxActiveCopies:4});
  equal(unrestricted.probabilityUpper,old);
});

test('repeated same-name public cards honor joint count limits',()=>{
  const hand=['Thunder Mountain ♢','Spiky Energy',"Trainers' Mail",'Gladion',
    "Trainers' Mail",'Guzma & Hala','Tag Call'];
  const result=maximumLegalHistoryLikelihood([hand],{maxActiveCopies:4});
  equal(result.probabilityUpper,Number(choose(4,2))*4**4/D*THORNS);
  assert.equal(result.observedCounts["Trainers' Mail"],4);
  assert.equal(result.observedCounts['Thunder Mountain ♢'],1);
});

test('impossible duplicate Prism symbol returns zero upper',()=>{
  const out=maximumLegalHistoryLikelihood([[
    'Thunder Mountain ♢','Thunder Mountain ♢','A','B','C','D','E']]);
  assert.equal(out.probabilityUpper,0);
  assert.equal(out.numerator,'0');
});

test('capacity coupling across many distinct mulligans beats naive independent copy maxima',()=>{
  const hands=Array.from({length:3},(_,j)=>
    Array.from({length:7},(_,i)=>'Public card '+(j*7+i)));
  const strict=maximumLegalHistoryLikelihood(hands,{maxActiveCopies:4});
  const naive=Math.pow(4**7/D,3)*THORNS;
  assert.ok(strict.probabilityUpper<naive);
  assert.ok(Object.values(strict.observedCounts).reduce((a,b)=>a+b,0)<=56);
  assert.equal(Object.keys(strict.observedCounts).length,21);
});

test('bounded two-card exhaustive enumeration agrees with dynamic program',()=>{
  const h1=['Alpha','Beta','Alpha','Beta','Alpha','Beta','Alpha'];
  const h2=['Alpha','Beta','Alpha','Beta','Alpha','Beta','Alpha'];
  const options={copyCaps:{Alpha:6,Beta:6}};
  const out=maximumLegalHistoryLikelihood([h1,h2],options);
  let best=0n;
  for(let a=4;a<=6;a++)for(let b=3;b<=6;b++){
    const candidate=choose(a,4)**2n*choose(b,3)**2n*
      (choose(60,7)-choose(a+b,7));
    if(candidate>best)best=candidate;
  }
  assert.equal(out.numerator,best.toString());
  assert.equal(out.denominator,(choose(60,7)**3n).toString());
});

test('Basic Energy does not inherit ordinary 4-copy limit',()=>{
  const hand=Array(7).fill('Lightning Energy');
  const res=maximumLegalHistoryLikelihood([hand],{maxActiveCopies:4});
  assert.ok(res.probabilityUpper>0);
  assert.ok(res.observedCounts['Lightning Energy']>4);
});

test('more distinct publicly seen names than sixty physical slots is impossible',()=>{
  const nine=Array.from({length:9},(_,j)=>
    Array.from({length:7},(_,i)=>'Different card '+(j*7+i)));
  const out=maximumLegalHistoryLikelihood(nine,{maxActiveCopies:4});
  assert.equal(out.probabilityUpper,0);
  assert.equal(out.numerator,'0');
});
