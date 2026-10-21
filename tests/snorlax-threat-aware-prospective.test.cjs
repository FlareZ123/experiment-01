'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  schedule,compareArms,ARMS
}=require('../simulation/twinleaf/snorlax-threat-aware-prospective.cjs');

test('independent frozen field schedule spans 24 physical deals and both seats',()=>{
  const rows=schedule();
  assert.equal(rows.length,24);
  assert.deepEqual([...new Set(rows.map(row=>row.rank))],[3,7]);
  assert.deepEqual([...new Set(rows.map(row=>row.sourceSeat))],[0,1]);
  assert.equal(new Set(rows.map(row=>[row.rank,row.sourceSeat,row.repeat].join(':'))).size,24);
  assert.equal(new Set(rows.map(row=>row.seed)).size,24);
  assert.ok(rows.every(row=>Number.isInteger(row.seed)&&row.seed>=0&&
    row.seed<=0xffffffff));
  assert.deepEqual(schedule(),rows);
});

test('three arms differ only in preservation and public-energy opt-in',()=>{
  assert.deepEqual(ARMS.map(x=>[x.id,x.preserve,x.publicEnergy]),[
    ['ordinary',false,false],
    ['unconditional',true,false],
    ['public-energy',true,true]
  ]);
});

test('paired root comparison uses public action identities and observed board',()=>{
  const active={seat:1,active:'Snorlax PGO',bench:[]};
  const first={turnBefore:2,playerSlot:1,action:'PlayCardAction',
    pendingPrompt:null,card:'Galarian Stunfisk'};
  const changed={...first,action:'PassTurnAction',card:null};
  const a={ok:true,sourceFirstTurnBoard:active,
    rootActionLedger:[first],rootActionSHA256:'a'};
  const b={ok:true,sourceFirstTurnBoard:active,
    rootActionLedger:[changed],rootActionSHA256:'b'};
  const result=compareArms(a,b);
  assert.equal(result.bothReturned,true);
  assert.equal(result.sameObservedFirstTurnBoard,true);
  assert.equal(result.sameNativeRootLedger,false);
  assert.equal(result.firstPublicRootDifference.ordinal,0);
});

test('failed or censored arms retain explicit noncomparison state',()=>{
  assert.deepEqual(compareArms({ok:false,error:'native rejection'},{ok:true}),{
    bothReturned:false,sameObservedFirstTurnBoard:null,
    sameNativeRootLedger:null,firstPublicRootDifference:null
  });
});
