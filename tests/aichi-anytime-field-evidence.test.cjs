'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {assessFieldEvidence,countQualifiedWins}=require('../scripts/aichi-anytime-field-evidence.cjs');

/** @param {number} [loss] Index of a single nonwin cell. */
function round(loss=-1,iteration=0) {
  return Array.from({length:64},(_,i)=>({
    rank:(i%32)+1,startingSeat:i<32?'first':'second',
    outcome:i===loss?'loss':'win',
    finished:true,winnerIndex:i===loss?1:0,
    status:'qualified-completed-game',
    gameId:'confirmatory:'+iteration+':'+i,
    seed:10000+iteration*64+i,
    candidateDeckSha256:'a'.repeat(64),
    opponentDeckSha256:((i%32)+1).toString(16).padStart(64,'0'),
    candidatePolicyRevision:'candidate-policy-frozen-v1',
    opponentPolicyRevision:'opponent-policy-frozen-v1',
    engineRevision:'twinleafgg/test-revision',
    rulesetRevision:'expanded-paper/test-revision',
    candidateEngineSlot:'A',
    turnEvidence:{
      firstTurnSlot:i<32 ? 0 : 1,
      firstTurnPlayerId:i<32 ? 101 : 202,
      firstTurnPlayerName:i<32 ? 'research-A' : 'research-B',
      firstDrawLogName:i<32 ? 'research-A' : 'research-B',
      verifiedByDrawLog:true
    }
  }));
}
function completeRounds(count) {
  return Array.from({length:count},(_,i)=>round(-1,i));
}

test('all 64 rank-by-actual-seat cells are mandatory',()=>{
  assert.equal(countQualifiedWins(round()),64);
  assert.equal(countQualifiedWins([...round()].reverse()),64);
  assert.equal(countQualifiedWins(round(0)),63);
  assert.throws(()=>countQualifiedWins(round().slice(1)),/64/);
  const duplicate=round();duplicate[0]=duplicate[1];
  assert.throws(()=>countQualifiedWins(duplicate),/Repeated/);
  const invalid=round();invalid[0].startingSeat='slotA';
  assert.throws(()=>countQualifiedWins(invalid),/Invalid/);
  const draw=round();draw[0].outcome='draw';draw[0].winnerIndex=3;
  assert.equal(countQualifiedWins(draw),63);
});

test('10 complete perfect rounds cross, 9 do not',()=>{
  const full=completeRounds(10);
  const nine=assessFieldEvidence(full.slice(0,9));
  const ten=assessFieldEvidence(full);
  assert.equal(nine.games,576);
  assert.equal(nine.currentCrosses,false);
  assert.equal(ten.games,640);
  assert.equal(ten.currentCrosses,true);
  assert.equal(ten.firstCrossedAtRound,10);
  assert.equal(assessFieldEvidence([]).eValue,1);
});
test('one loss still yields a defined finite exponential mixture',()=>{
  const full=completeRounds(10);
  full[0]=round(0);
  const value=assessFieldEvidence(full);
  assert.equal(value.nonWins,1);
  assert.equal(value.currentCrosses,false);
  assert.ok(Number.isFinite(value.logEValue));
});

test('extreme heterogeneous null has one-round expected e-value at most one',()=>{
  const good=assessFieldEvidence([round()]).eValue;
  const bad=assessFieldEvidence([round(0)]).eValue;
  assert.ok(0.68*good+0.32*bad <= 1+1e-10);
  assert.ok(Math.abs((63+0.68)/64-0.995)<1e-12);
});
test('invalid experiment parameters and unfinished rounds are rejected',()=>{
  assert.throws(()=>assessFieldEvidence([],{nullMean:1}));
  assert.throws(()=>assessFieldEvidence([],{alpha:0}));
  assert.throws(()=>assessFieldEvidence([round().slice(1)]));
  const wrong=round();wrong[0].outcome='unfinished';
  assert.throws(()=>assessFieldEvidence([wrong]),/Invalid/);
});

test('a later crossing remains possible after one early loss',()=>{
  const rounds=completeRounds(36);
  rounds[0]=round(0);
  const before=assessFieldEvidence(rounds.slice(0,35));
  const after=assessFieldEvidence(rounds);
  assert.equal(before.currentCrosses,false);
  assert.equal(after.currentCrosses,true);
  assert.equal(after.firstCrossedAtRound,36);
  assert.equal(after.nonWins,1);
});

test('old engine diagnostics and missing provenance cannot enter confirmatory evidence',()=>{
  const diagnostic=round();
  diagnostic[0].status='completed-engine-game';
  assert.throws(()=>assessFieldEvidence([diagnostic]),/unqualified/);
  const missing=round();delete missing[2].candidateDeckSha256;
  assert.throws(()=>countQualifiedWins(missing),/unqualified/);
});

test('duplicated games and seeds fail closed within and across complete rounds',()=>{
  assert.throws(()=>assessFieldEvidence([round(),round()]),/Repeated game ID across rounds/);
  const seedCollision=round();seedCollision[0].seed=seedCollision[1].seed;
  assert.throws(()=>countQualifiedWins(seedCollision),/Repeated game seed within round/);
  const repeatedSeed=round(-1,1);repeatedSeed[0].seed=round()[0].seed;
  assert.throws(()=>assessFieldEvidence([round(),repeatedSeed]),/Repeated game seed across rounds/);
  const repeatedId=round(-1,1);repeatedId[0].gameId=round()[0].gameId;
  assert.throws(()=>assessFieldEvidence([round(),repeatedId]),/Repeated game ID across rounds/);
});

test('frozen deck/policy/engine provenance cannot drift between rounds',()=>{
  const changedCandidate=round(-1,1);
  changedCandidate[0].candidateDeckSha256='b'.repeat(64);
  assert.throws(()=>assessFieldEvidence([round(),changedCandidate]),/Candidate deck/);

  const changedOpponent=round(-1,1);
  changedOpponent[0].opponentDeckSha256='f'.repeat(64);
  assert.throws(()=>assessFieldEvidence([round(),changedOpponent]),/Opponent deck/);

  const changedPolicy=round(-1,1);
  changedPolicy[0].opponentPolicyRevision='changed-policy';
  assert.throws(()=>assessFieldEvidence([round(),changedPolicy]),/Opponent policy/);

  const changedEngine=round(-1,1);
  changedEngine[0].engineRevision='different-engine';
  assert.throws(()=>assessFieldEvidence([round(),changedEngine]),/Candidate deck, engine/);
});

test('actual first-turn evidence must match Store slot and first draw log',()=>{
  const swapped=round();
  swapped[0].candidateEngineSlot='B';
  assert.throws(()=>countQualifiedWins(swapped),/starting seat contradicts/);

  const fabricated=round();
  fabricated[1].turnEvidence.firstDrawLogName='research-B';
  assert.throws(()=>countQualifiedWins(fabricated),/starting seat contradicts/);

  const missing=round();delete missing[2].turnEvidence;
  assert.throws(()=>countQualifiedWins(missing),/unqualified/);

  const oppositeSlot=round();
  oppositeSlot[0].candidateEngineSlot='B';
  oppositeSlot[0].winnerIndex=1;
  oppositeSlot[0].turnEvidence={
    firstTurnSlot:1,firstTurnPlayerId:202,
    firstTurnPlayerName:'research-B',firstDrawLogName:'research-B',
    verifiedByDrawLog:true
  };
  assert.equal(countQualifiedWins(oppositeSlot),64);
});


test('finished winner index is required and outcome agrees with physical candidate slot',()=>{
  const noFinished=round();delete noFinished[0].finished;
  assert.throws(()=>countQualifiedWins(noFinished),/unqualified/);
  const unfinished=round();unfinished[0].finished=false;
  assert.throws(()=>countQualifiedWins(unfinished),/unqualified/);
  const missingWinner=round();delete missingWinner[0].winnerIndex;
  assert.throws(()=>countQualifiedWins(missingWinner),/unqualified/);
  const invalidWinner=round();invalidWinner[0].winnerIndex=2;
  assert.throws(()=>countQualifiedWins(invalidWinner),/unqualified/);

  const inverted=round();inverted[0].outcome='loss';
  assert.throws(()=>countQualifiedWins(inverted),/outcome contradicts/);
  const falseWin=round(0);falseWin[0].outcome='win';
  assert.throws(()=>countQualifiedWins(falseWin),/outcome contradicts/);
  const winnerDraw=round();winnerDraw[0].winnerIndex=3;
  assert.throws(()=>countQualifiedWins(winnerDraw),/outcome contradicts/);
  winnerDraw[0].outcome='draw';
  assert.equal(countQualifiedWins(winnerDraw),63);

  const slotBWin=round();
  slotBWin[0].candidateEngineSlot='B';
  slotBWin[0].turnEvidence={
    firstTurnSlot:1,firstTurnPlayerId:202,
    firstTurnPlayerName:'research-B',firstDrawLogName:'research-B',
    verifiedByDrawLog:true
  };
  slotBWin[0].winnerIndex=1;
  assert.equal(countQualifiedWins(slotBWin),64);
  slotBWin[0].winnerIndex=0;
  slotBWin[0].outcome='loss';
  assert.equal(countQualifiedWins(slotBWin),63);
  slotBWin[0].outcome='win';
  assert.throws(()=>countQualifiedWins(slotBWin),/outcome contradicts/);
});
