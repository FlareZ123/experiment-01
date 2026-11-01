'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {inspectPrintings}=
  require('../simulation/evaluation/agent29-whismur-native-printing-census.cjs');

test('a missing pinned Whismur printing stays explicitly unverified',()=>{
  const card={fullName:'Latias ex SSP',attacks:[],
    abilities:[{name:'Skyliner'}]};
  const manager={
    getCardByName(name){return name===card.fullName?card:undefined;},
    getAllCards(){return [card];}
  };
  const result=inspectPrintings(manager);
  const whismur=result.exact.find(x=>x.printing==='Whismur CES');
  assert.equal(whismur.found,false);
  assert.equal(whismur.actualFullName,null);
  assert.deepEqual(result.candidateWhismurPrints,[]);
  assert.equal(result.actualOriginalStoreGameAttempted,false);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('read-only candidate inventory can expose native attack name without certifying reducer',()=>{
  const cards=[
    {fullName:'Whismur CES',attacks:[{name:'Bawl'}],abilities:[]},
    {fullName:'Whismur STS',attacks:[{name:'Disarming Voice'}],abilities:[]},
    {fullName:'Gengar & Mimikyu GX TEU',
      attacks:[{name:'Horror House-GX'}],abilities:[]}
  ];
  const manager={
    getCardByName(name){return cards.find(c=>c.fullName===name);},
    getAllCards(){return [...cards];}
  };
  const result=inspectPrintings(manager);
  assert.deepEqual(result.candidateWhismurPrints,
    ['Whismur CES','Whismur STS']);
  assert.equal(result.exact[0].found,true);
  assert.deepEqual(result.exact[0].attacks,['Bawl']);
  assert.equal(result.exact[2].found,true);
  assert.equal(result.canCertifyPaperAttackExecution,false);
});
