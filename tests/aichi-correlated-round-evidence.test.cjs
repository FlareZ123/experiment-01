'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {assessFieldEvidence}=require('../scripts/aichi-anytime-field-evidence.cjs');
const {assessCorrelatedFieldEvidence}=
  require('../scripts/aichi-correlated-round-evidence.cjs');

const Q=0.995;

/**
 * An explicitly synthetic, provenance-complete 64-cell round.
 * @param {number} iteration
 * @param {'win'|'loss'|'draw'} outcome
 * @returns {object[]}
 */
function syntheticRound(iteration,outcome='win') {
  return Array.from({length:64},(_,i)=>{
    const first=i<32;
    return {
      rank:i%32+1,
      startingSeat:first?'first':'second',
      outcome,
      finished:true,
      winnerIndex:outcome==='win'?0:outcome==='loss'?1:3,
      status:'qualified-completed-game',
      gameId:'synthetic-correlated:'+iteration+':'+i,
      seed:200000+iteration*64+i,
      candidateDeckSha256:'a'.repeat(64),
      opponentDeckSha256:(i%32+1).toString(16).padStart(64,'0'),
      candidatePolicyRevision:'frozen-synthetic-v1',
      opponentPolicyRevision:'frozen-opponent-synthetic-v1',
      engineRevision:'synthetic-engine-v1',
      rulesetRevision:'synthetic-rules-v1',
      candidateEngineSlot:'A',
      turnEvidence:{
        firstTurnSlot:first?0:1,
        firstTurnPlayerId:first?101:202,
        firstTurnPlayerName:first?'research-A':'research-B',
        firstDrawLogName:first?'research-A':'research-B',
        verifiedByDrawLog:true
      }
    };
  });
}

test('perfectly correlated 64-cell null does not earn 64 independent wins',()=>{
  const ten=Array.from({length:10},(_,i)=>syntheticRound(i));
  assert.equal(assessFieldEvidence(ten).currentCrosses,true,
    'historical independent-game model is unsafe for this correlation model');
  const safe=assessCorrelatedFieldEvidence(ten);
  assert.equal(safe.rounds,10);
  assert.equal(safe.wins,640);
  assert.equal(safe.currentCrosses,false);
  assert.equal(safe.everCrossed,false);
  assert.ok(safe.eValue<1.1);
  assert.match(safe.model,/arbitrary-within-round/);
});

test('one-round null e-expectation handles perfectly dependent wins',()=>{
  const allWin=syntheticRound(0);
  const allLoss=syntheticRound(0,'loss');
  const robustWin=assessCorrelatedFieldEvidence([allWin]).eValue;
  const robustLoss=assessCorrelatedFieldEvidence([allLoss]).eValue;
  assert.ok(Q*robustWin+(1-Q)*robustLoss<=1+1e-12);
  const oldWin=assessFieldEvidence([allWin]).eValue;
  const oldLoss=assessFieldEvidence([allLoss]).eValue;
  assert.ok(Q*oldWin+(1-Q)*oldLoss>1.1,
    'independent-game e-value fails under valid all-or-nothing correlation');
});

test('round-level sequential evidence eventually crosses after enough fresh perfect rounds',()=>{
  const all=Array.from({length:610},(_,i)=>syntheticRound(i));
  const prior=assessCorrelatedFieldEvidence(all.slice(0,598));
  const later=assessCorrelatedFieldEvidence(all);
  assert.equal(prior.currentCrosses,false);
  assert.equal(later.currentCrosses,true);
  assert.ok(later.firstCrossedAtRound>598);
  assert.ok(later.firstCrossedAtRound<=610);
  assert.equal(later.games,39040);
  assert.equal(later.nonWins,0);
});

test('mixed completed outcomes contribute fractions, with draws counted as nonwins',()=>{
  const first=syntheticRound(0);
  first[0].outcome='draw';
  first[0].winnerIndex=3;
  const second=syntheticRound(1,'loss');
  const value=assessCorrelatedFieldEvidence([first,second]);
  assert.equal(value.games,128);
  assert.equal(value.wins,63);
  assert.equal(value.nonWins,65);
  assert.ok(Number.isFinite(value.logEValue));
  assert.equal(value.currentCrosses,false);
  assert.equal(assessCorrelatedFieldEvidence([]).eValue,1);
});

test('inherits mandatory qualification, provenance and actual-start checks',()=>{
  const incomplete=syntheticRound(0).slice(1);
  assert.throws(()=>assessCorrelatedFieldEvidence([incomplete]),/64/);
  const repeated=syntheticRound(0);
  assert.throws(()=>assessCorrelatedFieldEvidence([repeated,repeated]),/Repeated game ID/);
  const unqualified=syntheticRound(0);
  unqualified[0].status='completed-engine-game';
  assert.throws(()=>assessCorrelatedFieldEvidence([unqualified]),/unqualified/);
  const wrongStart=syntheticRound(0);
  wrongStart[0].turnEvidence.firstDrawLogName='research-B';
  assert.throws(()=>assessCorrelatedFieldEvidence([wrongStart]),/starting seat/);
  const drift=syntheticRound(1);
  drift[0].candidatePolicyRevision='different-policy';
  assert.throws(()=>assessCorrelatedFieldEvidence([syntheticRound(0),drift]),/Candidate deck/);
});

test('parameters and null horizon are preserved by the original validator',()=>{
  assert.throws(()=>assessCorrelatedFieldEvidence([],{alpha:1}),/Invalid/);
  assert.throws(()=>assessCorrelatedFieldEvidence([],{nullMean:0}),/Invalid/);
  const override=assessCorrelatedFieldEvidence([syntheticRound(0)],{
    nullMean:0.98,alpha:0.01
  });
  assert.equal(override.nullMean,0.98);
  assert.equal(override.alpha,0.01);
  assert.equal(override.threshold,100);
});
