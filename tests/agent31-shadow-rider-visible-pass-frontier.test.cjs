'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {visibleFundedVmaxPass, auditPairedPasses} =
  require('../simulation/evaluation/agent31-shadow-rider-visible-pass-frontier.cjs');
function fixture() {
  const pass = {ordinal:137,turn:29,
    ownerHandAfterDecision:['Float Stone BKT','Carmine TWM'],
    publicBoardBeforePass:[
      {active:{name:'Mega Absol ex',toolCards:[]},
        bench:[{name:'Oranguru V',toolCards:[]},
          {name:'Latias ex',toolCards:[]}],stadium:[]},
      {active:{name:'Shadow Rider Calyrex VMAX',
        energyCards:['Psychic Energy MEE'],toolCards:[]},
        bench:[{name:'Shadow Rider Calyrex VMAX',
          energyCards:['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'],
          printedAttacks:[{name:'Max Geist',cost:[9,9,9]}]}],stadium:[]}
    ]};
  const row={trial:{id:'11:3:B:champion-reference'},
    sourceSeat:0,candidateSeat:1,
    sourceDealFingerprint:'source',fullPhysicalDealFingerprint:'full',
    rootActionLedger:[{actionOrdinal:137,turnBefore:29,playerSlot:1,
      action:'PassTurnAction'}],
    candidateRepliesAfterSourceAttacks:[{candidateReplyTurnFinalPass:pass}]};
  return {pass,row};
}
test('narrow owner-public pass geometry identifies a viable funded VMAX',()=>{
 const {pass,row}=fixture();
 assert.deepEqual(visibleFundedVmaxPass(row,pass),{
   trialId:row.trial.id,passRoot:137,globalTurn:29,
   stoneInOwnerHand:1,activePsychicCards:1,
   fundedBenchedVmaxIndex:0,fundedBenchedPsychicCards:3,
   opponentActive:'Mega Absol ex',
   visibility:'owner-hand-and-public-board-only',
   paperLegality:'unresolved-status-and-effect-review'
 });
});
test('missing Tool, occupied Active Tool or unfunded Bench reject',()=>{
 for(const scenario of ['no-stone','occupied','underfunded']){
  const {pass,row}=fixture();
  if(scenario==='no-stone')pass.ownerHandAfterDecision=[];
  if(scenario==='occupied')pass.publicBoardBeforePass[1].active.toolCards=['Muscle Band FFI'];
  if(scenario==='underfunded')pass.publicBoardBeforePass[1].bench[0].energyCards.pop();
  assert.equal(visibleFundedVmaxPass(row,pass),null,scenario);
 }
});
test('self-retreat already spent, banned opponent lock or stadium reject',()=>{
 for(const scenario of ['used-retreat','known-opponent-lock','stadium']){
  const {pass,row}=fixture();
  if(scenario==='used-retreat')row.rootActionLedger.unshift({actionOrdinal:136,
    turnBefore:29,playerSlot:1,action:'RetreatAction'});
  if(scenario==='known-opponent-lock')pass.publicBoardBeforePass[0].bench.push({name:'Garbodor',toolCards:[]});
  if(scenario==='stadium')pass.publicBoardBeforePass[1].stadium=['Jamming Tower TWM'];
  assert.equal(visibleFundedVmaxPass(row,pass),null,scenario);
 }
});
test('wrong physical seat, missing Store root or unsupported Energy cost reject',()=>{
 for(const scenario of ['wrong-seat','missing-root','wrong-cost']){
  const {pass,row}=fixture();
  if(scenario==='wrong-seat')row.rootActionLedger[0].playerSlot=0;
  if(scenario==='missing-root')row.rootActionLedger=[];
  if(scenario==='wrong-cost')pass.publicBoardBeforePass[1].bench[0].printedAttacks[0].cost=[5,9,9];
  assert.equal(visibleFundedVmaxPass(row,pass),null,scenario);
 }
});
test('repeated owner Pass opportunities count within one physical trial',()=>{
 const {pass,row}=fixture();
 row.candidateRepliesAfterSourceAttacks.push({candidateReplyTurnFinalPass:{
   ...pass,ordinal:144,turn:31}});
 row.rootActionLedger.push({actionOrdinal:144,turnBefore:31,playerSlot:1,action:'PassTurnAction'});
 const control={rows:[row]};
 const treatment={rows:[{...row,candidateRepliesAfterSourceAttacks:[]}]};
 const result=auditPairedPasses({rows:[{id:row.trial.id}],base:control,rescue:treatment});
 assert.equal(result.matchedRegisteredTrials,1);
 assert.equal(result.base.visibleFundedVmaxPasses,2);
 assert.equal(result.base.candidatePassRoots,2);
 assert.equal(result.base.unobservedCandidatePassRoots,0);
 assert.deepEqual(result.base.byOriginalRank['11'],{candidatePassRoots:2,capturedPasses:2,visiblePasses:2});
 assert.equal(result.base.distinctTrialsWithVisibleOpportunity,1);
 assert.equal(result.rescue.visibleFundedVmaxPasses,0);
});
test('paired unequal physical deals and duplicated IDs are rejected',()=>{
 const {row}=fixture();
 const different={...row,fullPhysicalDealFingerprint:'mismatch'};
 assert.throws(()=>auditPairedPasses({rows:[{id:row.trial.id}],
   base:{rows:[row]},rescue:{rows:[different]}}),/mismatch/);
 assert.throws(()=>auditPairedPasses({rows:[{id:row.trial.id},{id:row.trial.id}],
   base:{rows:[row,row]},rescue:{rows:[row,row]}}),/ids.has/);
});

test('duplicate candidate Pass sidecars cannot inflate sampled coverage',()=>{
 const {pass,row}=fixture();
 row.candidateRepliesAfterSourceAttacks.push({candidateReplyTurnFinalPass:pass});
 const archive={rows:[{id:row.trial.id}],base:{rows:[row]},rescue:{rows:[row]}};
 assert.throws(()=>auditPairedPasses(archive),/Duplicate Pass capture/);
});

test('a full five-Pokémon Bench does not block Retreat into a funded Bench Pokémon',()=>{
 const {pass,row}=fixture();
 const bench=pass.publicBoardBeforePass[1].bench;
 bench.push(
   {name:'Tapu Lele-GX',energyCards:[],toolCards:[]},
   {name:'Girafarig',energyCards:[],toolCards:[]},
   {name:'Tapu Lele-GX',energyCards:[],toolCards:[]},
   {name:"Lillie's Clefairy ex",energyCards:[],toolCards:[]}
 );
 assert.equal(bench.length,5);
 const match=visibleFundedVmaxPass(row,pass);
 assert.ok(match,'full Bench preserves the already occupied retreat destination');
 assert.equal(match.fundedBenchedVmaxIndex,0);
 assert.equal(match.fundedBenchedPsychicCards,3);
 // The provided Advanced Player's Rulebook A-03 explicitly allows retreat
 // with a full Bench, provided another Benched Pokémon exists.
});
