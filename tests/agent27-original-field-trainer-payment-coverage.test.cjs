'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditOriginalTrainerPayments,loadAudit}=
  require('../scripts/agent27-original-field-trainer-payment-coverage.cjs');

test('original 29 source Trainer inventory is conserved and cost coverage bounded',()=>{
  const a=loadAudit();
  assert.equal(a.originalSourceDecks,29);
  assert.deepEqual(a.missingOriginalRanks,[23,25,28]);
  assert.equal(a.totalTrainerCopies,1035);
  assert.equal(a.coveredCopies,231);
  assert.deepEqual(a.modeTotals,{
    mandatoryDiscard:143,optionalEnhancedDiscard:13,
    knownNoDiscard:75,unknownPayment:804
  });
  assert.equal(a.sourceRows.reduce((sum,x)=>sum+x.trainerCopies,0),1035);
  assert.equal(a.printingRows.reduce((sum,x)=>sum+x.copies,0),1035);
  assert.match(a.sourceManifestSha256,/^[a-f0-9]{64}$/);
  assert.equal(a.qualifiedCompetitiveGames,0);
});

test('source printings remain distinct and exact-cost groups match roster',()=>{
  const a=loadAudit();
  const by=new Map(a.printingRows.map(x=>[x.printing,x]));
  for(const [printing,copies,mode] of [
    ['Quick Ball FST',72,'mandatoryDiscard'],
    ['Ultra Ball MEG',24,'mandatoryDiscard'],
    ['Mysterious Treasure FLI',37,'mandatoryDiscard'],
    ['Secret Box TWM',10,'mandatoryDiscard'],
    ['Guzma & Hala CEC',13,'optionalEnhancedDiscard'],
    ['Battle VIP Pass FST',42,'knownNoDiscard'],
    ["Trainers' Mail ROS",29,'knownNoDiscard'],
    ["Professor's Letter BKT",4,'knownNoDiscard']
  ]){
    assert.equal(by.get(printing)?.copies,copies,printing);
    assert.equal(by.get(printing)?.mode,mode,printing);
  }
  assert.equal(by.get('VS Seeker PHF')?.mode,'unknownPayment');
  assert.equal(a.sourceRows.filter(r=>
    r.mandatoryDiscard+r.optionalEnhancedDiscard+r.knownNoDiscard>0).length,28);
});

test('incomplete deck and duplicate rank fail closed',()=>{
  const sample={missing_full_lists:[],decks:[{
    rank:3,archetype:'sample',
    cards:[{category:'Trainer',name:'Quick Ball',count:59,
      printing:{set:'FST'}}]
  }]};
  assert.throws(()=>auditOriginalTrainerPayments(sample),/60/);
  const one={rank:3,archetype:'test',cards:[
    {category:'Trainer',name:'Quick Ball',count:60,
      printing:{set:'FST'}}
  ]};
  assert.throws(()=>auditOriginalTrainerPayments({
    missing_full_lists:[],decks:[one,{...one}]
  }),/AssertionError/);
});
