'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {auditNativeFirstTurnPrintedCoverage}=
  require('../simulation/twinleaf/agent2-native-firstturn-catalog.cjs');

const ROOT=path.resolve(__dirname,'..');
test('mock native coverage distinguishes print presence from real attack effects',()=>{
  const calls=[];
  const manager={getCardByName(name){
    calls.push(name);
    return name==='Sableye LOT'?{
      attacks:[{name:'Quick Hunt',canUseOnFirstTurn:true,text:'Search deck for a card.'}]
    }:null;
  }};
  const report=auditNativeFirstTurnPrintedCoverage(manager,ROOT);
  assert.equal(report.distinctFirstTurnFamilies,29);
  assert.equal(report.originalSourceMatchingFirstTurnPrintings,0);
  assert.equal(report.sourceOriginalSixties,29);
  assert.equal(report.nWithAnyNativeAttack,1);
  const one=report.familyCoverage.find(x=>x.card==='Sableye'&&
    x.attack==='Quick Hunt');
  assert.ok(one.atLeastOneNativeAttack);
  assert.ok(one.printCoverage.some(x=>x.printName==='Sableye LOT'&&
    x.nativeAttackRegistered));
  assert.equal(report.supportedGameMechanics,'not certified');
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(calls.includes('Whismur CES'));
});
test('real compiled pinned CardManager registrations are enumerated read-only',()=>{
  const manager=require('../simulation/twinleaf/headless.cjs')
    .initializeCards();
  const before=manager.getAllCards().length;
  const report=auditNativeFirstTurnPrintedCoverage(manager,ROOT);
  assert.equal(manager.getAllCards().length,before);
  assert.equal(report.distinctFirstTurnFamilies,29);
  assert.equal(report.sourceOriginalSixties,29);
  assert.equal(report.originalSourceMatchingFirstTurnPrintings,0);
  assert.ok(report.nWithAnyNativeAttack>=0);
  assert.ok(report.nWithAnyNativeAttack<=29);
  for(const family of report.familyCoverage){
    assert.ok(family.printCoverage.length>0);
    for(const p of family.printCoverage){
      assert.ok(p.codeResolved);
      assert.equal(p.fullNativeAttackEffectsVerified,false);
    }
  }
  const key=report.familyCoverage.filter(x=>x.atLeastOneNativeAttack)
    .map(x=>x.card+' '+x.attack);
  // Console diagnostics are a full source registry feature gap report;
  // there is no claim of correct native printed attack resolutions.
  process.stdout.write(JSON.stringify({
    version:report.version,nWithAnyNativeAttack:report.nWithAnyNativeAttack,
    nativeRegisteredNames:key,missingNames:report.familyCoverage.filter(x=>
      !x.atLeastOneNativeAttack).map(x=>x.card+' '+x.attack)
  })+'\n');
});
