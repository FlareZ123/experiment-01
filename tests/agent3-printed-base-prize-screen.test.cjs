'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {
  VERSION,lookupPrintedVictim,printedBasePrizeCount,screenNativeKoBasePrizes
}=require('../simulation/evaluation/agent3-printed-base-prize-screen.cjs');

const RESOURCES=path.join(__dirname,'../resources');
const CASES=[
  ['Girafarig','LOT','94',90,1,'sm8-94'],
  ['Duskull','VIV','69',60,1,'swsh4-69'],
  ['Dialga-GX','UPR','100',180,2,'sm5-100'],
  ['Mewtwo & Mew-GX','UNM','71',270,3,'sm11-71'],
  ['Marshadow','UNB','81',80,1,'sm10-81'],
  ['Tapu Lele-GX','GRI','60',170,2,'sm2-60'],
  ['Trevenant & Dusknoir-GX','SMP','217',270,3,'smp-SM217']
];
test('seven actual original native KO printings independently match exact English cards',()=>{
  assert.equal(VERSION,'agent3-printed-base-prize-screen-v1');
  for(const [name,set,setNumber,hp,prizes,id] of CASES){
    const print=lookupPrintedVictim({name,set,setNumber},RESOURCES);
    assert.ok(print);
    assert.equal(print.id,id);
    assert.equal(Number(print.hp),hp);
    assert.equal(printedBasePrizeCount(print),prizes);
  }
});
test('same Duskull printing can be audited twice under independently registered trials',()=>{
  const print=lookupPrintedVictim({name:'Duskull',set:'VIV',setNumber:'69'},RESOURCES);
  assert.equal(printedBasePrizeCount(print),1);
});
test('base rule validates actual payout while preserving paper legality uncertainty',()=>{
  const victims=CASES.map(([name,set,setNumber,hp,nativePrizeCount],i)=>({
    prizeEventIndex:i,registeredTrialId:'some-original-trial',
    victimPrinting:{name,set,setNumber,fullName:name+' '+set,printedHp:hp},
    nativePrizeCount
  }));
  const screen=screenNativeKoBasePrizes(victims,RESOURCES);
  assert.equal(screen.length,7);
  assert.equal(screen.every(row=>
    row.independentPrintedHpAgrees===true &&
    row.independentPrintedBasePrizeScreenPass===true),true);
  assert.equal(screen.every(row=>
    row.allGamePrizeModifiersAudited===false&&
    row.competitiveGameQualified===false),true);
});
test('wrong native Prize payout fails the printing screen without inventing paper win',()=>{
  const [row]=screenNativeKoBasePrizes([{
    prizeEventIndex:0,registeredTrialId:'r',victimPrinting:{
      name:'Tapu Lele-GX',set:'GRI',setNumber:'60',printedHp:170,
      fullName:'Tapu Lele-GX GRI'
    },nativePrizeCount:1
  }],RESOURCES);
  assert.equal(row.paperPrintedBasePrizes,2);
  assert.equal(row.independentPrintedBasePrizeScreenPass,false);
});
test('wrong native HP or unknown printing remains unqualified',()=>{
  const unknown=screenNativeKoBasePrizes([{
    prizeEventIndex:1,registeredTrialId:'r',victimPrinting:{
      name:'Completely Missing',set:'LOT',setNumber:'999',printedHp:999
    },nativePrizeCount:1
  }],RESOURCES)[0];
  assert.equal(unknown.matchedEnglishCardDbId,null);
  assert.equal(unknown.independentPrintedBasePrizeScreenPass,false);
  const badHp=screenNativeKoBasePrizes([{
    prizeEventIndex:1,registeredTrialId:'r',victimPrinting:{
      name:'Girafarig',set:'LOT',setNumber:'94',printedHp:110
    },nativePrizeCount:1
  }],RESOURCES)[0];
  assert.equal(badHp.independentPrintedHpAgrees,false);
});
test('unknown rule wording and special evolved cards fail closed',()=>{
  assert.equal(printedBasePrizeCount({
    supertype:'Pokémon',subtypes:['Stage 2'],rules:[]
  }),null);
  assert.equal(printedBasePrizeCount({
    supertype:'Pokémon',subtypes:['Basic'],rules:[
      'Take a Prize card under an unknown effect'
    ]
  }),null);
  assert.equal(printedBasePrizeCount({
    supertype:'Trainer',subtypes:[],rules:[]
  }),null);
});
