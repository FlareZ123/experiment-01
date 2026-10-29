'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {energySupply,matchAttackCost,evaluateAttachedCost}=require(
  '../simulation/twinleaf/agent10-conditional-special-energy-cost.cjs'
);
const BASE={ownerPrizes:6,opponentPrizes:4,isEvolution:true,
  hasRuleBox:false,isPokemonGX:false,isPokemonEX:false,
  templeOfSinnoh:false};
const withState=change=>({...BASE,...change});
const cost=(need,attached,opts={})=>
  evaluateAttachedCost(need,attached,withState(opts));

test('Reversal supplies up to three independent colors only behind and on eligible Evolution',()=>{
  const energy='Reversal Energy PAL';
  const winning=cost(['Lightning','Psychic','Metal'],[energy]);
  assert.equal(winning.payable,true);
  assert.equal(winning.totalEnergyUnits,3);
  assert.equal(winning.missingIdealUnits,0);
  assert.equal(cost(['Lightning','Psychic','Metal','Colorless'],[energy])
    .missingIdealUnits,1);
  for(const flag of [{ownerPrizes:3},{ownerPrizes:4},
    {isEvolution:false},{hasRuleBox:true},{templeOfSinnoh:true}]){
    const supply=energySupply(energy,withState(flag));
    assert.deepEqual(supply.allowed,['Colorless']);
    assert.equal(supply.capacity,1);
    assert.equal(cost(['Lightning'],[energy],flag).payable,false);
  }
});

test('Counter Energy uses the exact GX/EX exclusion rather than all Rule Boxes',()=>{
  const energy='Counter Energy CIN';
  assert.equal(cost(['Lightning','Psychic'],[energy]).payable,true);
  assert.equal(cost(['Lightning','Psychic','Metal'],[energy])
    .missingIdealUnits,1);
  // A non-GX, non-EX Pokemon V still satisfies the Counter printing.
  assert.equal(cost(['Lightning','Psychic'],[energy],{
    hasRuleBox:true,isPokemonGX:false,isPokemonEX:false}).payable,true);
  for(const flags of [{isPokemonGX:true},{isPokemonEX:true},
    {ownerPrizes:3},{opponentPrizes:6},{templeOfSinnoh:true}]){
    assert.equal(cost(['Lightning','Psychic'],[energy],flags).payable,false);
    assert.equal(energySupply(energy,withState(flags)).capacity,1);
  }
});

test('Unit LPM pays one of three printed colors per attached card',()=>{
  const energy='Unit Energy LPM UPR';
  for(const type of ['Lightning','Psychic','Metal']){
    assert.equal(cost([type],[energy]).payable,true);
  }
  assert.equal(cost(['Darkness'],[energy]).payable,false);
  assert.equal(cost(['Psychic','Metal'],[energy]).payable,false);
  assert.equal(cost(['Psychic','Metal'],[energy,energy]).payable,true);
  assert.equal(cost(['Colorless'],[energy]).payable,true);
  assert.equal(cost(['Psychic'],[energy],{templeOfSinnoh:true}).payable,false);
});

test('mixed flexible allocation performs an augmenting match rather than greedy first match',()=>{
  const g={capacity:1,allowed:['Lightning','Psychic'],printing:'g'};
  const h={capacity:1,allowed:['Lightning'],printing:'h'};
  const result=matchAttackCost(['Lightning','Psychic'],[g,h]);
  assert.equal(result.payable,true);
  assert.equal(result.coveredColored,2);
  assert.equal(matchAttackCost(['Lightning','Psychic','Colorless'],[g,h])
    .missingIdealUnits,1);
});

test('Temple suppresses all named Specials while leaving Basic Energy unchanged',()=>{
  const energy=['Counter Energy CIN','Reversal Energy PAL',
    'Unit Energy LPM UPR','Double Colorless Energy SUM',
    'Speed Lightning Energy RCL','Telepath [P] Energy M3'];
  for(const printing of energy){
    const source=energySupply(printing,withState({templeOfSinnoh:true}));
    assert.equal(source.capacity,1);
    assert.deepEqual(source.allowed,['Colorless']);
  }
  assert.deepEqual(energySupply('Lightning Energy MEE',
    withState({templeOfSinnoh:true})).allowed,['Lightning']);
  assert.equal(cost(['Lightning','Colorless'],
    ['Lightning Energy MEE','Counter Energy CIN'],
    {templeOfSinnoh:true}).payable,true);
});

test('unsupported Special printings fail closed instead of being silently Colorless',()=>{
  assert.equal(cost(['Colorless'],['Double Dragon Energy ROS']),null);
  assert.equal(cost(['Colorless'],['Jet Energy PAL']),null);
  assert.equal(cost(['Lightning'],['Lightning Energy MEE','Mystery Energy PHF']),null);
});

test('exact cost matching agrees with exhaustive miniature assignment search',()=>{
  const allowed=[
    {capacity:1,allowed:['Lightning','Psychic']},
    {capacity:1,allowed:['Lightning']},
    {capacity:1,allowed:['Psychic']},
    {capacity:2,allowed:'*'},
    {capacity:1,allowed:['Colorless']}
  ];
  const symbols=['Lightning','Psychic','Colorless'];
  const brute=(needs,slots)=>{
    if(!needs.length)return true;
    const [need,...rest]=needs;
    for(let i=0;i<slots.length;i++){
      if((need==='Colorless'||slots[i]==='*'||slots[i].includes(need))&&
        brute(rest,[...slots.slice(0,i),...slots.slice(i+1)]))return true;
    }
    return false;
  };
  for(let mask=1;mask<(1<<allowed.length);mask++){
    const choices=allowed.filter((_,i)=>mask&(1<<i));
    const slots=choices.flatMap(source=>Array(source.capacity)
      .fill(source.allowed));
    for(const n1 of symbols)for(const n2 of symbols)for(const n3 of symbols){
      for(const needs of [[n1],[n1,n2],[n1,n2,n3]]){
        const actual=matchAttackCost(needs,choices);
        assert.equal(actual.payable,brute(needs,slots),
          'Mismatch for '+JSON.stringify({mask,needs}));
      }
    }
  }
});
