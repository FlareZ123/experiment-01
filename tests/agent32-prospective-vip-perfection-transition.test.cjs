'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registered,audit}=require(
  '../simulation/evaluation/agent32-prospective-vip-perfection-transition.cjs');

test('prospective Mewtwo transition pairs sixteen frozen unique physical deals for both seats',()=>{
  const rows=registered();
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(x=>x.seed)).size,16);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))].sort((a,b)=>a-b),
    [1,3,5,6,9,11,13,26]);
  assert.equal(rows.filter(x=>x.candidateSlot==='A').length,8);
  assert.equal(rows.filter(x=>x.candidateSlot==='B').length,8);
});

test('actual native Retreat and paid Perfection roots are counted separately from plans',()=>{
  const example={
    trial:registered()[0],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{ownerRootIntents:[
        {intent:{plan:'agent35-known-donor-benched-perfection-transition-v1',
          kind:'attach-basic-energy'}},
        {intent:{plan:'agent35-known-donor-benched-perfection-transition-v1',
          kind:'paid-retreat'}}]},
      chooseAttack:{selections:[{attack:'Poltergeist'}]}
    }},
    rootActionLedger:[
      {action:'PlayCardAction'},
      {action:'RetreatAction'},
      {action:'UseAbilityAction',ability:'Perfection'},
      {action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt'}
    ]
  };
  const found=audit(example);
  assert.equal(found.pivotBasicEnergyPlans,1);
  assert.equal(found.pivotRetreatPlans,1);
  assert.equal(found.actualNativeRetreatActions,1);
  assert.equal(found.actualNativePerfectionActions,1);
  assert.equal(found.nativeCopiedAttackChoices[0].attack,'Poltergeist');
});

test('pure unexecuted plans cannot manufacture actual Retreat or Perfection',()=>{
  const found=audit({
    trial:registered()[1],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{ownerRootIntents:[
        {intent:{plan:'agent35-known-donor-benched-perfection-transition-v1',
          kind:'paid-retreat'}}]}
    }},
    rootActionLedger:[{action:'PassTurnAction'}]
  });
  assert.equal(found.pivotRetreatPlans,1);
  assert.equal(found.actualNativeRetreatActions,0);
  assert.equal(found.actualNativePerfectionActions,0);
});
