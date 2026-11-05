'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {runOriginalShadowMistPlumeriaAB,VERSION}=
  require('../simulation/evaluation/agent7-shadowmist-original48-plumeria-aba.cjs');
const {ENV_NAME,TARGET}=
  require('../simulation/evaluation/agent7-shadowmist-original48-hammer-aba.cjs');

test('separate Plumeria treatment never activates Hammer in either comparator arm',()=>{
  const flags=[],original=process.env[ENV_NAME];
  const had=Object.hasOwn(process.env,ENV_NAME);
  try{
    process.env[ENV_NAME]='historical';
    const result=runOriginalShadowMistPlumeriaAB({
      execute:()=>{flags.push(process.env[ENV_NAME]);return {ok:true};},
      compare:runner=>{
        runner('control');
        runner('treatment');
        return {historicalRegisteredTrialCount:8,targetTrial:TARGET,
          target:{firstDivergence:{ordinal:22}}};
      }
    });
    assert.equal(result.version,VERSION);
    assert.deepEqual(flags,['false','false']);
    assert.equal(result.firstChangedSourceAction.ordinal,22);
    assert.equal(process.env[ENV_NAME],'historical');
    assert.equal(result.nativePaperCompetitiveGames,0);
  }finally{
    if(had)process.env[ENV_NAME]=original;
    else delete process.env[ENV_NAME];
  }
});
