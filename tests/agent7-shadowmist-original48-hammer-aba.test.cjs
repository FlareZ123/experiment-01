'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,ENV_NAME,TARGET,runOriginalShadowMistHammerAB}=
  require('../simulation/evaluation/agent7-shadowmist-original48-hammer-aba.cjs');

function fixture(name){
  const ids=[TARGET,
    '6:100:A:new-moon-lockbreaker-v1',
    '6:101:B:champion-reference',
    '6:101:B:new-moon-lockbreaker-v1',
    '11:102:A:champion-reference',
    '11:102:A:new-moon-lockbreaker-v1',
    '11:103:B:champion-reference',
    '11:103:B:new-moon-lockbreaker-v1'];
  return {manifest:{version:'fixture',actualCommonRunnerOptIn:true},
    rawDevelopment:{rows:ids.map(id=>({
      trial:{id},sourceDealFingerprint:id+'-source',
      fullPhysicalDealFingerprint:id+'-all',
      actualStarterSeat:1,sourceSeat:1,
      rootActionLedger:[
        {actionOrdinal:0,turnBefore:2,playerSlot:0,
          action:'AttackAction',attack:'Shadow Mist'},
        {actionOrdinal:1,turnBefore:3,playerSlot:1,
          action:name==='treatment'?'PlayCardAction':'PassTurnAction',
          card:name==='treatment'?'Crushing Hammer':null}
      ]
    }))}};
}

test('same-deal eight-arm comparison captures first changed native action',()=>{
  const flags=[];
  const actual=runOriginalShadowMistHammerAB(name=>{
    flags.push([name,process.env[ENV_NAME]]);
    return fixture(name);
  });
  assert.deepEqual(flags,[['control','false'],['treatment','true']]);
  assert.equal(actual.version,VERSION);
  assert.equal(actual.paired.length,8);
  assert.equal(actual.target.firstDivergence.ordinal,1);
  assert.equal(actual.target.firstDivergence.control.action,'PassTurnAction');
  assert.equal(actual.target.firstDivergence.treatment.card,'Crushing Hammer');
  assert.equal(actual.competitiveGamesQualified,0);
});

test('temporary experiment flag is restored even after a native exception',()=>{
  const held=Object.hasOwn(process.env,ENV_NAME);
  const previous=process.env[ENV_NAME];
  process.env[ENV_NAME]='previous';
  try{
    assert.throws(()=>runOriginalShadowMistHammerAB(()=>{
      throw Error('native error');
    }),/native error/);
    assert.equal(process.env[ENV_NAME],'previous');
  }finally{
    if(held)process.env[ENV_NAME]=previous;
    else delete process.env[ENV_NAME];
  }
});

test('different initial physical deal is rejected before comparison',()=>{
  assert.throws(()=>runOriginalShadowMistHammerAB(name=>{
    const value=fixture(name);
    if(name==='treatment')
      value.rawDevelopment.rows[0].sourceDealFingerprint='different';
    return value;
  }),/physical deal/);
});
