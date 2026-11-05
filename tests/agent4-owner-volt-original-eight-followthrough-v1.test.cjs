'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {IDS}=require('../simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs');
const {
 withCommonOwnerVoltPaper,run
}=require('../simulation/evaluation/agent4-owner-volt-original-eight-followthrough-v1.cjs');

test('32 exact original native IDs, owner prompt proposal and live physical settlement counts',()=>{
 const observed=[],headless={runMatch:request=>{
   observed.push(request);return {native:true};
 }};
 const before=headless.runMatch;
 const hooks={
   owner:next=>({result:next(),audit:{
     ownerPromptChoices:1,sourceOwnerPhysicalSeatCounts:[0,1]}}),
   paper:next=>({result:next(),audit:{
     livePaperVerifiedPhysicalEffect:1,livePaperInvalidVetoed:0}})
 };
 const result=withCommonOwnerVoltPaper(()=>{
   for(const phase of [0,1,2,3])
     for(const id of IDS)headless.runMatch({label:'original:'+id});
   return '32 matched';
 },headless,hooks);
 assert.strictEqual(headless.runMatch,before);
 assert.equal(observed.length,32);
 assert.equal(result.result,'32 matched');
 assert.equal(result.audit.exact32OriginalRequests,true);
 assert.equal(result.audit.actualOwnerSelections,32);
 assert.equal(result.audit.actuallyPaperVerifiedPhysicalTransfers,32);
 assert.deepEqual(result.audit.nativeOwnerSourceSeats,[0,32]);
 assert.equal(result.audit.gameCompetitiveQualified,false);
});
test('missing original ID preserves strict rejection and restores original adapter',()=>{
 const headless={runMatch:()=>({native:true})},before=headless.runMatch;
 assert.throws(()=>withCommonOwnerVoltPaper(()=>
   headless.runMatch({label:'not-registered'}),headless),/Unregistered/);
 assert.strictEqual(headless.runMatch,before);
});
test('post-execution owner prompt error never bypasses fail-closed restoration',()=>{
 const err=new Error('native owner prompt failed');
 const headless={runMatch:()=>{throw err;}},before=headless.runMatch;
 assert.throws(()=>withCommonOwnerVoltPaper(()=>
   headless.runMatch({label:IDS[0]}),headless),e=>e===err);
 assert.strictEqual(headless.runMatch,before);
});
test('readout surfaces real source attack next candidate action without claiming game result',()=>{
 const headless={runMatch:()=>({})};
 const fakeAudit={exact32OriginalRequests:true,
   nativeRequests:Array.from({length:32},(_,i)=>({
     id:IDS[i%8],phase:['legacy','A','B-Mail','A-repeat'][
       Math.floor(i/8)],nativeStatus:'returned'
   })),
   actualOwnerSelections:1,actuallyPaperVerifiedPhysicalTransfers:1,
   nativeOwnerSourceSeats:[0,1]};
 const result=run({
   headless,
   wrapper:()=>({audit:fakeAudit,result:{
     gates:{legacyPhysicalStart:true},
     sourceAndCandidateOpportunityRows:[{
       id:'6:100:A:new-moon-lockbreaker-v1',sourceSeat:1,
       baseline:{source:{selectedAttackNames:[]}},
       sourceMailTreatment:{
         source:{selectedAttackNames:[{turn:17,attack:'Volt Cyclone'}]},
         sourceAttackCandidateFirstReplies:[{
           firstCandidateSubsequentRoot:{action:'PlayCardAction',turn:18}
         }]
       },
       statusBaseline:'nonterminal-unqualified',
       statusTreatment:'nonterminal-unqualified'
     },...Array.from({length:7},(_,i)=>({id:'other'+i}))]
   }})
 });
 assert.equal(result.allOriginal8Retained,true);
 assert.ok(result.gates.legacyPhysicalStart);
 assert.equal(result.competitiveGamesQualified,0);
 assert.equal(result.winRate,null);
 assert.equal(result.sourceMailTarget.nativeMailTreatment.selectedAttackNames[0]
   .attack,'Volt Cyclone');
});
