'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeSameWorldTapeParity}=
  require('../simulation/twinleaf/native-same-world-tape-parity.cjs');
const {compareNativeOpponentHiddenHandBounded}=
  require('../simulation/twinleaf/agent23-native-tape-bounded-opponent-hand.cjs');

const energy=(id,name)=>({id,fullName:name,energyType:'BASIC'});
const trainer=(id,name)=>({id,fullName:name,trainerType:'ITEM'});
const fingerprint=world=>JSON.stringify(world);
const actorView=(world,seat)=>({
  turn:world.turn,ownCards:world.players[seat].hand.cards.map(x=>x.fullName),
  opposingHandCount:world.players[1-seat].hand.cards.length,
  opposingFaceDownPrizes:world.players[1-seat].prizes
    .reduce((n,p)=>n+p.cards.length,0)
});

/** @returns {object} Two concealed Energy, two unknown one-card Prizes. */
function sourceState(){
  return {turn:3,players:[
    {id:101,hand:{cards:[energy(1,'Own Psychic')]},deck:{cards:[]},
      prizes:[]},
    {id:202,hand:{cards:[energy(2,'Darkness'),energy(3,'Lightning')]},
      deck:{cards:[energy(4,'Grass')]},
      prizes:[{cards:[trainer(5,'Hidden Item A')]},
        {cards:[trainer(6,'Hidden Item B')]}]}
  ]};
}

/**
 * Make same-function native parity and scorer sink; the hidden-card
 * information is accessed only inside the synthetic test's decision.
 * @param {{scoreMode?:'hidden'|'constant'|'missing',
 *   unstableRng?:boolean}} [options]
 */
function prepare({scoreMode='hidden',unstableRng=false}={}){
  const root=sourceState(),sink={evaluations:[]},tape=[0.125];
  const decide=world=>{
    Math.random();
    const count=world.players[1].hand.cards.filter(x=>
      x.trainerType!==undefined).length;
    if(unstableRng&&count>0)Math.random();
    if(scoreMode!=='missing')sink.evaluations.push({
      tactic:'AttackTactic',actionType:'AttackAction',
      handIndex:null,finiteScore:true,
      score:scoreMode==='hidden'?count*50:75,
      undefinedScore:false,threw:false
    });
    return {type:'PassTurnAction'};
  };
  const actual=decide(root);
  const parity=verifyNativeSameWorldTapeParity({
    root,actualAction:actual,tape,cloneState:structuredClone,
    replayDecision:decide,actionSignature:x=>x,fingerprint
  });
  assert.equal(parity.sameWorldDecisionParityQualified,true);
  return {
    root,sink,args:{parity,root,seat:0,tape,cloneState:structuredClone,
      replayDecision:decide,actionSignature:x=>x,
      fingerprint,actorView,replayScoreTraceSink:sink}
  };
}

test('native score-only leak is detected despite all selected actions matching',()=>{
  const {root,args}=prepare(),original=fingerprint(root);
  const result=compareNativeOpponentHiddenHandBounded(args,{
    targetZone:'prizes',swapSize:2,limit:16
  });
  assert.equal(result.successfulExchangePaths,2);
  assert.equal(result.failedExchangePaths,0);
  assert.equal(result.actionReversals,0);
  assert.equal(result.selectedActionChanged,false);
  assert.equal(result.scoreTraceEnabled,true);
  assert.equal(result.scoreTraceBaselineFinite,true);
  assert.equal(result.scoreTraceComparisonCount,2);
  assert.equal(result.scoreTraceChanges,2);
  assert.equal(result.scoreOnlyChanges,2);
  assert.equal(result.scoreTraceExecutable,true);
  assert.equal(result.firstScoreTraceDifference.index,0);
  assert.equal(result.firstScoreTraceDifference.original.score,0);
  assert.equal(result.firstScoreTraceDifference.alternate.score,100);
  assert.deepEqual(result.cases.map(x=>x.scoreTraceChanged),[true,true]);
  assert.deepEqual(result.cases.map(x=>x.scoreTraceEvaluationCount),[1,1]);
  assert.equal(result.sourceRootUnchanged,true);
  assert.equal(result.actorObservationMatched,true);
  assert.equal(result.opponentHiddenInventoryConserved,true);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(fingerprint(root),original);
});

test('constant native candidate scores certify only compared fixture worlds',()=>{
  const {root,args}=prepare({scoreMode:'constant'});
  const original=fingerprint(root);
  const result=compareNativeOpponentHiddenHandBounded(args,{
    targetZone:'prizes',swapSize:2
  });
  assert.equal(result.successfulExchangePaths,2);
  assert.equal(result.scoreTraceBaselineFinite,true);
  assert.equal(result.scoreTraceComparisonCount,2);
  assert.equal(result.scoreTraceChanges,0);
  assert.equal(result.scoreOnlyChanges,0);
  assert.equal(result.firstScoreTraceDifference,null);
  assert.equal(result.scoreTraceExecutable,true);
  assert.deepEqual(result.cases.map(x=>x.scoreTraceChanged),[false,false]);
  assert.equal(fingerprint(root),original);
});

test('missing native numerical evaluations cannot certify score invariance',()=>{
  const {args}=prepare({scoreMode:'missing'});
  const result=compareNativeOpponentHiddenHandBounded(args,{
    targetZone:'prizes',swapSize:2
  });
  assert.equal(result.successfulExchangePaths,2);
  assert.equal(result.scoreTraceBaselineFinite,false);
  assert.equal(result.scoreTraceExecutable,false);
  assert.equal(result.scoreTraceComparisonCount,0);
  assert.equal(result.scoreTraceChanges,0);
  assert.equal(result.contrastExecutable,false);
  assert.match(result.error,/did not observe a finite candidate score/);
});

test('native RNG tape failures retain failed and successful scoring cases',()=>{
  const {args}=prepare({unstableRng:true});
  const result=compareNativeOpponentHiddenHandBounded(args,{
    targetZone:'prizes',swapSize:2
  });
  assert.equal(result.successfulExchangePaths,0);
  assert.equal(result.failedExchangePaths,2);
  assert.equal(result.scoreTraceExecutable,false);
  assert.equal(result.scoreTraceComparisonCount,0);
  assert.equal(result.contrastExecutable,false);
  assert.ok(result.cases.every(x=>/RNG replay exhausted/.test(x.error)));
});

test('opt-out never claims unseen numerical scorer parity',()=>{
  const {args}=prepare({scoreMode:'hidden'});
  delete args.replayScoreTraceSink;
  const result=compareNativeOpponentHiddenHandBounded(args,{
    targetZone:'prizes',swapSize:2
  });
  assert.equal(result.successfulExchangePaths,2);
  assert.equal(result.scoreTraceEnabled,false);
  assert.equal(result.scoreTraceBaselineFinite,null);
  assert.equal(result.scoreTraceExecutable,false);
  assert.equal(result.scoreTraceComparisonCount,0);
  assert.equal(result.scoreTraceChanges,0);
  assert.equal(result.firstScoreTraceDifference,null);
});
