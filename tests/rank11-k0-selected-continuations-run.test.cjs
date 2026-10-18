'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/rank11-k0-selected-continuations-v1-20261018.json');
const {sha256}=require('../simulation/evaluation/rank11-conditional-k0-screen-run.cjs');
const {execute,verifyContinuationRegistration}=
  require('../simulation/evaluation/rank11-k0-selected-continuations-run.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PRINTS=['Oranguru V ASR 133','Float Stone BKT 137'];
const decks={deckA:['FST-168','ASR-133'],deckB:['CRE-74','CRE-75'],
  engineRevision:PIN};
function K0(){return {verifiedByDrawLog:true,actualFirstPlayerSeat:0,
  sourceFirst:true,eligibleK0:true,sourceOwnHandPrintings:PRINTS,
  sourceOpponentHandSize:7};}
function play(request){return {
  seed:request.seed,engine:'twinleafgg/'+PIN,
  firstTurnSlot:0,verifiedByDrawLog:true,
  deckHashes:[sha256(decks.deckA),sha256(decks.deckB)],
  decisionTrace:[
    {turnBefore:1,playerSlot:0,action:'PlayItemAction',
      decisionHandBefore:{ownHandPrintings:PRINTS,opponentHandSize:7}},
    {turnBefore:2,playerSlot:1,action:'PassTurnAction'}
  ],
  rank11AutonomousPolicy:{
    opportunityDetected:true,attemptedActions:11,
    completeAtDecisionBoundary:true,aborted:null
  },
  actions:45,turns:3
};}
test('five K0 seeds were fixed by prior screen and cannot be altered',()=>{
  assert.equal(verifyContinuationRegistration(),true);
  assert.throws(()=>verifyContinuationRegistration({...registration,
    selected:[...registration.selected].reverse()}),/registration drift/i);
});
test('all five source K0 continuations preserve independent physical-hand replay',()=>{
  const seen=[];
  const result=execute({engineDecks:decks,checkBlobs:false,
    screenOne:(seed,i)=>{seen.push([seed,i]);return K0();},
    play});
  assert.deepEqual(seen,registration.selected.map(x=>[x.seed,x.index]));
  assert.equal(result.attempted,5);
  assert.equal(result.completeLockWitnesses,5);
  assert.equal(result.replayMismatches,0);
  assert.equal(result.exceptions,0);
  assert.ok(result.records.every(x=>x.status==='lock-witness' &&
    x.qualifiedCompetitiveGame===false &&
    x.firstCandidateResponse[0].action==='PassTurnAction'));
  assert.equal(result.qualifiedCompetitiveGames,0);
});
test('lost K0 eligibility is a recorded failed continuation, never omitted',()=>{
  const r=execute({engineDecks:decks,checkBlobs:false,
    screenOne:(seed,index)=>index===registration.selected[0].index?
      {...K0(),eligibleK0:false}:K0(),play});
  assert.equal(r.attempted,5);
  assert.equal(r.exceptions,1);
  assert.equal(r.completeLockWitnesses,4);
  assert.equal(r.records[0].status,'continuation-exception');
});
