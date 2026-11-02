'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {directDrawAccess,otherBasics,other}=
  require('../scripts/agent13-dual-mew-draw-only-access.cjs');
test('exact source six disjoint populations and 11 opening Basics',()=>{
  assert.equal(otherBasics,3);
  assert.equal(other,42);
});
test('first-seven direct full seven-piece hand and valid Basic conditioning',()=>{
  const r=directDrawAccess(0);
  assert.equal(r.favorableAssignments,432n);
  assert.equal(r.allAssignments,386206920n);
  assert.ok(Math.abs(r.percent-0.00014385310871363032)<1e-13);
});
test('six, ten, fifteen ordinary-draw exposure exact numerators',()=>{
  const expectations=new Map([
    [6,[9072914998052n,8866337641761600n,0.131600679657073]],
    [10,[54946646872601929n,7530687207013370400n,0.9383441296593121]],
    [15,[86191392936143585936n,2413927553811740366400n,4.591929622219996]]
  ]);
  for(const [n,[num,den,pct]] of expectations){
    const result=directDrawAccess(n);
    assert.equal(result.favorableAssignments,num);
    assert.equal(result.allAssignments,den);
    assert.ok(Math.abs(result.percent-pct)<1e-10);
  }
});
test('ordinary draws must fit after initial seven and six Prizes',()=>{
  assert.throws(()=>directDrawAccess(-1));
  assert.throws(()=>directDrawAccess(48));
});
