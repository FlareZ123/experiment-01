'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {enumerateDonorChoices,analyzeAichiThornsDonorOptions,choose,
  THUNDER,WONDROUS}=require('../simulation/evaluation/aichi-thorns-physical-energy-donor-census.cjs');

/** Independent small pure cost function matching verified LCC rules. */
function canPay(cards,stadiums){
  const data={'Speed Lightning Energy':[1,1],
    'Capture Energy':[1,0],'Spiky Energy':[1,0],
    'Double Colorless Energy':[2,0]};
  if(cards.some(x=>!data[x]))return null;
  const total=cards.reduce((s,x)=>s+data[x][0],0);
  const lightning=cards.reduce((s,x)=>s+data[x][1],0);
  const req=stadiums.includes(THUNDER)?2:
    3+Number(stadiums.includes(WONDROUS));
  return total>=req&&(stadiums.includes(THUNDER)||lightning>=1);
}
const toPhysical=(groups)=>groups.flatMap(([name,n])=>Array(n).fill(name));
const rank6=toPhysical([['Speed Lightning Energy',4],
  ['Capture Energy',2],['Spiky Energy',1],['Double Colorless Energy',1]]);
const rank24=toPhysical([['Speed Lightning Energy',4],
  ['Double Colorless Energy',3],['Capture Energy',1]]);

function tally(names,n,stadium=[]){
  const {beforeUnpayable,allDonorsUnsafe,mixedDonorSafety,allDonorsSafe,
    payableBeforeDonation,totalPhysicalSubsets}=enumerateDonorChoices(
      names,canPay,stadium,n);
  return {beforeUnpayable,allDonorsUnsafe,mixedDonorSafety,allDonorsSafe,
    payableBeforeDonation,totalPhysicalSubsets};
}

test('exhaustive three-card original source styles, no Stadium',()=>{
  assert.deepEqual(tally(rank6,3),{
    beforeUnpayable:4,allDonorsUnsafe:34,mixedDonorSafety:18,
    allDonorsSafe:0,payableBeforeDonation:52,totalPhysicalSubsets:56});
  assert.deepEqual(tally(rank24,3),{
    beforeUnpayable:4,allDonorsUnsafe:10,mixedDonorSafety:42,
    allDonorsSafe:0,payableBeforeDonation:52,totalPhysicalSubsets:56});
});

test('Thunder Mountain permits all three-card donor transfers',()=>{
  for(const roster of [rank6,rank24])
    assert.deepEqual(tally(roster,3,[THUNDER]),{
      beforeUnpayable:0,allDonorsUnsafe:0,mixedDonorSafety:0,
      allDonorsSafe:56,payableBeforeDonation:56,totalPhysicalSubsets:56});
});

test('Wondrous Labyrinth makes three-card donor payment forced',()=>{
  assert.deepEqual(tally(rank6,3,[WONDROUS]),{
    beforeUnpayable:38,allDonorsUnsafe:18,mixedDonorSafety:0,
    allDonorsSafe:0,payableBeforeDonation:18,totalPhysicalSubsets:56});
  assert.deepEqual(tally(rank24,3,[WONDROUS]),{
    beforeUnpayable:14,allDonorsUnsafe:42,mixedDonorSafety:0,
    allDonorsSafe:0,payableBeforeDonation:42,totalPhysicalSubsets:56});
});

test('four- and five-card subsets partition all physical copies',()=>{
  for(const roster of [rank6,rank24]){
    for(const n of [4,5]){
      for(const context of [[],[THUNDER],[WONDROUS]]){
        const x=tally(roster,n,context);
        assert.equal(x.totalPhysicalSubsets,choose(8,n));
        assert.equal(x.beforeUnpayable+x.allDonorsUnsafe+
          x.mixedDonorSafety+x.allDonorsSafe,choose(8,n));
      }
    }
  }
  assert.equal(tally(rank6,4).mixedDonorSafety,16);
  assert.equal(tally(rank24,4).mixedDonorSafety,16);
});

test('source extraction and unmodeled payment fail closed',()=>{
  const source=(r,counts)=>({rank:r,player:'fixture',cards:[
    {name:'Iron Thorns ex',count:4}, {name:'Mock Item',count:48},
    ...counts.map(([name,count])=>({name,count}))]});
  const ranks=[source(6,[['Speed Lightning Energy',4],
    ['Capture Energy',2],['Spiky Energy',1],['Double Colorless Energy',1]]),
    source(24,[['Speed Lightning Energy',4],
      ['Capture Energy',1],['Double Colorless Energy',3]]),
    source(29,[['Speed Lightning Energy',4],
      ['Capture Energy',2],['Spiky Energy',1],['Double Colorless Energy',1]])];
  const out=analyzeAichiThornsDonorOptions({decks:ranks},canPay);
  assert.deepEqual(out.rosters.map(x=>x.strata.length),[12,12,12]);
  assert.deepEqual(out.rosters.map(x=>x.strata.find(s=>
    s.subsetSize===3&&s.stadiums.length===0).mixedDonorSafety),[18,42,18]);
  assert.equal(out.qualifiedForGameInference,false);
  assert.throws(()=>enumerateDonorChoices(
    ['Speed Lightning Energy','UNKNOWN'],canPay,[],1),
    /UNMODELED_PRINTED_COST/);
  const broken={decks:ranks.map(x=>({...x,cards:x.cards.slice()}))};
  broken.decks[0].cards[1]={name:'Mock Item',count:47};
  assert.throws(()=>analyzeAichiThornsDonorOptions(broken,canPay),
    /SOURCE_DECK_NOT_FIXED_60_OR_8_ENERGY_6/);
});

test('uniform physical donor is an analytic neutral comparator only',()=>{
  const a=enumerateDonorChoices(rank6,canPay,[],3);
  const b=enumerateDonorChoices(rank24,canPay,[],3);
  assert.equal(a.avoidableUnsafeDonorChoices,30);
  assert.equal(b.avoidableUnsafeDonorChoices,54);
  assert.equal(a.uniformRandomDonorAvoidableFailureRate,30/(52*3));
  assert.equal(b.uniformRandomDonorAvoidableFailureRate,54/(52*3));
  assert.equal(enumerateDonorChoices(rank24,canPay,[THUNDER],3)
    .uniformRandomDonorAvoidableFailureRate,0);
});
