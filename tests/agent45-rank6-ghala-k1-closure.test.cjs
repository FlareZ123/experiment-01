'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {printingName,inferThreeNames}=require('../scripts/agent45-rank6-ghala-k1-closure.cjs');

const cards=[
 {name:'Thunder Mountain ♢',printing:{set:'LOT'},count:1},
 {name:'Wondrous Labyrinth ♢',printing:{set:'TEU'},count:1},
 {name:'Double Colorless Energy',printing:{set:'SUM'},count:1},
 {name:'Speed Lightning Energy',printing:{set:'RCL'},count:4},
 {name:'Handheld Fan',printing:{set:'TWM'},count:1},
 {name:'Tool Jammer',printing:{set:'BST'},count:1},
 {name:'Guzma & Hala',printing:{set:'CEC'},count:2},
 {name:'Iron Thorns ex',printing:{set:'TWM'},count:4},
 {name:'Other',printing:{set:'X'},count:45}
];
const policy={
 STADIUMS:['Thunder Mountain Prism Star LOT','Wondrous Labyrinth Prism Star TEU'],
 SPECIAL_ENERGY:['Double Colorless Energy SUM','Speed Lightning Energy RCL'],
 TOOLS:['Handheld Fan TWM','Stealthy Hood UNB']
};
const witness={
 postSearchHand:['Thunder Mountain Prism Star LOT','Double Colorless Energy SUM','Handheld Fan TWM'],
 absentImmediatelyBeforeSearch:['Thunder Mountain Prism Star LOT','Double Colorless Energy SUM'],
 physicalOwnerDeckCardsMoved:3,noOtherHandAcquisition:true
};
test('normalizes the Prism Star source name',()=>{
 assert.equal(printingName(cards[0]),'Thunder Mountain Prism Star LOT');
});
test('closes the one-per-category native paid search',()=>{
 assert.deepEqual(inferThreeNames(cards,policy,witness),{
  stadium:'Thunder Mountain Prism Star LOT',
  specialEnergy:'Double Colorless Energy SUM',tool:'Handheld Fan TWM',
  provenance:'conditional cross-report inference; direct K1 printed-name receipt unavailable'
 });
});
test('rejects an unaudited alternative hand gain',()=>{
 assert.throws(()=>inferThreeNames(cards,policy,{...witness,noOtherHandAcquisition:false}));
});
test('rejects incomplete native physical transfer',()=>{
 assert.throws(()=>inferThreeNames(cards,policy,{...witness,physicalOwnerDeckCardsMoved:2}));
});
test('rejects a second tool candidate in the original list',()=>{
 assert.throws(()=>inferThreeNames([...cards.slice(0,-1),
  {...cards[cards.length-1],count:44},
  {name:'Stealthy Hood',printing:{set:'UNB'},count:1}],policy,witness));
});
test('rejects an undocumented pre-search Stadium absence',()=>{
 assert.throws(()=>inferThreeNames(cards,policy,{
  ...witness,absentImmediatelyBeforeSearch:['Double Colorless Energy SUM']
 }));
});
test('rejects an undocumented pre-search Special Energy absence',()=>{
 assert.throws(()=>inferThreeNames(cards,policy,{
  ...witness,absentImmediatelyBeforeSearch:['Thunder Mountain Prism Star LOT']
 }));
});
test('rejects source deck count mismatch',()=>{
 assert.throws(()=>inferThreeNames(cards.slice(0,-1),policy,witness));
});
