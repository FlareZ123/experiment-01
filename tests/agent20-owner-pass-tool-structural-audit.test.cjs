'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  namedToolCatalog,classifyOwnerPassTool,censusOriginalSourcePassTools
}=require('../simulation/evaluation/agent20-owner-pass-tool-structural-audit.cjs');

const tools=namedToolCatalog([
  {name:'Float Stone',supertype:'Trainer',subtypes:['Pokémon Tool']},
  {name:'Tool Jammer',supertype:'Trainer',subtypes:['Pokémon Tool']},
  {name:'Tool Jammer Jr',supertype:'Trainer',subtypes:['Pokémon Tool']},
  {name:'Quick Ball',supertype:'Trainer',subtypes:['Item']},
  {name:'Professor\'s Letter',supertype:'Trainer',subtypes:['Item']}
]);

const pass=(ordinal,hand,toolAttached=false)=>({
  ordinal,turn:ordinal+2,ownerHandAtPass:hand,
  publicBoardBeforePass:[
    {active:{name:'Iron Thorns ex',
      toolCards:toolAttached?['Float Stone BKT']:[]},
    bench:[{name:'Other Basic',toolCards:['Other Tool']}]},
    {active:{name:'Mega Absol ex',toolCards:[]},bench:[]}
  ],
  preDecisionNoninterferenceVerified:false
});

test('Tool catalog respects exact subtype and longest name match',()=>{
  assert.equal(tools.size,3);
  const observation=classifyOwnerPassTool(
    pass(4,['Quick Ball FST','Tool Jammer Jr ABC','Tool Jammer BST']),
    0,tools);
  assert.deepEqual(observation.heldTools,[
    {printing:'Tool Jammer Jr ABC',cardName:'Tool Jammer Jr'},
    {printing:'Tool Jammer BST',cardName:'Tool Jammer'}
  ]);
  assert.equal(observation.structuralToolOpportunity,true);
  assert.equal(observation.freeOwnRecipients.length,1);
  assert.equal(observation.freeOwnRecipients[0].slot,'active');
  assert.equal(observation.printedEligibility,'unverified');
});

test('full-Tool Active and Bench cannot satisfy recipient requirement',()=>{
  const observation=classifyOwnerPassTool(
    pass(1,['Float Stone BKT'],true),0,tools);
  assert.equal(observation.physicallyHeldNamedToolCopies,1);
  assert.deepEqual(observation.freeOwnRecipients,[]);
  assert.equal(observation.structuralToolOpportunity,false);
});

test('eight original attempts preserve zero-pass abort and repeated identical Tool',()=>{
  const attempts=[
    {id:'rank6-first',sourceSeat:0,status:'cap',
      ownerPassObservations:[
        pass(17,['Tool Jammer BST','Quick Ball FST']),
        pass(24,['Tool Jammer BST','Quick Ball FST']),
        pass(30,['Quick Ball FST'])
      ]},
    {id:'rank11-first',sourceSeat:1,status:'cap',
      ownerPassObservations:[pass(37,['Float Stone BKT'])]},
    {id:'rank11-abort',sourceSeat:1,status:'engine-error',
      ownerPassObservations:null},
    ...Array.from({length:5},(_,i)=>({
      id:'other-'+i,sourceSeat:i%2,status:'cap',
      ownerPassObservations:[]
    }))
  ];
  const report=censusOriginalSourcePassTools({
    originalAttemptCount:8,exactInitialFullDealAndRootTapeMatches:8,
    originalSourcePassesWithOwnedHandAndPublicBoard:4,
    attempts
  },tools);
  assert.equal(report.originalAttemptCount,8);
  assert.equal(report.originalSourcePassSnapshots,4);
  assert.equal(report.sourcePassSnapshotsWithHeldToolAndFreeRecipient,3);
  assert.equal(report.uniqueAttemptIdsWithToolOpportunity,2);
  assert.deepEqual(report.repeatedToolPrintings,[
    {printing:'Float Stone BKT',rootSightings:1},
    {printing:'Tool Jammer BST',rootSightings:2}
  ]);
  assert.equal(report.attempts[2].observedOriginalSourcePasses,0);
  assert.equal(report.independentCompetitiveGames,0);
  assert.equal(report.positivePaperLegalityCertified,false);
});

test('mismatched native parity or source denominator rejects fabricated observations',()=>{
  const eight=Array.from({length:8},(_,i)=>({
    id:'row-'+i,sourceSeat:i%2,ownerPassObservations:[]
  }));
  const archive={
    originalAttemptCount:8,exactInitialFullDealAndRootTapeMatches:8,
    originalSourcePassesWithOwnedHandAndPublicBoard:0,
    attempts:eight
  };
  assert.doesNotThrow(()=>censusOriginalSourcePassTools(archive,tools));
  assert.throws(()=>censusOriginalSourcePassTools({
    ...archive,exactInitialFullDealAndRootTapeMatches:7
  },tools),/7 !== 8/);
  assert.throws(()=>censusOriginalSourcePassTools({
    ...archive,originalSourcePassesWithOwnedHandAndPublicBoard:1
  },tools),/0 !== 1/);
  assert.throws(()=>censusOriginalSourcePassTools({
    ...archive,attempts:[...eight.slice(0,7),eight[0]]
  },tools));
});
