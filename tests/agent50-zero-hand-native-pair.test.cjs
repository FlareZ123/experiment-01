'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compareNativePair}=
  require('../simulation/evaluation/agent50-zero-hand-native-pair.cjs');

/** @param {boolean} enabled */
function packet(enabled){
  return {
    sourceRank:11,sourceSeed:1244180408,sourceSeat:0,candidateSeat:1,
    retrospectivelySelected:true,firstTurnSlot:0,sourceLineCompleted:true,
    competitiveQualifiedGames:0,preferGengarPoltergeist:true,
    sourceTurn49QuickBalls:false,preferZeroHandPrintedDamage:enabled,
    attackerPolicyVersion:'agent13-actor-only-copied-attack-choice-v2-live-state'+
      '+agent13-gengar-poltergeist-first-v1'+
      (enabled?'+agent50-zero-hand-poltergeist-v1':''),
    decisions:{rejected:0,accepted:2,
      selections:[enabled?{
        seat:1,turn:8,printing:'Gengar & Mimikyu-GX TEU',
        attack:'Printed Impact',publicOpponentHandCount:0,
        zeroHandAlternativeApplied:true,
        withoutZeroHandOption:{sourceIndex:0,attackIndex:0}
      }:{
        seat:1,turn:8,printing:'Gengar & Mimikyu-GX TEU',
        attack:'Poltergeist'
      }]},
    candidateChoices:[],declarations:[],deckHashes:['same','both'],
    firstCopyPrecedingRootCount:42,
    firstCopyPrecedingRootSha256:'SAME_REAL_PREFIX',
    nativeActionCount:123,prizesRemaining:[3,5],winnerSeat:0,
    finished:true,endReason:'engine-test',sourceRank11ActionsAfterFirstCopy:[]
  };
}

test('matched retrospective native attacker pair is reported unqualified',()=>{
  const r=compareNativePair(packet(false),packet(true));
  assert.equal(r.sameNativePrefixBeforeFirstCopy,true);
  assert.equal(r.confirmedPublicZeroHandAlternatives,1);
  assert.equal(r.firstDifferentSelection?.baseline?.attack,'Poltergeist');
  assert.equal(r.firstDifferentSelection?.treatment?.attack,'Printed Impact');
  assert.equal(r.qualifiedCompetitiveGames,0);
});

test('unchanged native copy decision is a valid negative observation',()=>{
  const a=packet(false),b=packet(true);
  b.decisions.selections=[{...a.decisions.selections[0],
    publicOpponentHandCount:3,zeroHandAlternativeApplied:false,
    withoutZeroHandOption:{sourceIndex:0,attackIndex:0}}];
  const r=compareNativePair(a,b);
  assert.equal(r.confirmedPublicZeroHandAlternatives,0);
  assert.equal(r.firstDifferentSelection,null);
  assert.equal(r.qualifiedCompetitiveGames,0);
});

test('mismatched source prefix, printing or unauthenticated Store fail closed',()=>{
  const a=packet(false),b=packet(true);
  b.firstCopyPrecedingRootSha256='CHANGED_BEFORE_FIRST_COPY';
  assert.throws(()=>compareNativePair(a,b),/before any copy/);
  b.firstCopyPrecedingRootSha256=a.firstCopyPrecedingRootSha256;
  b.deckHashes=['different'];
  assert.throws(()=>compareNativePair(a,b));
  b.deckHashes=a.deckHashes;
  b.decisions.rejected=1;
  assert.throws(()=>compareNativePair(a,b));
  b.decisions.rejected=0;
  b.decisions.selections[0].publicOpponentHandCount=2;
  assert.throws(()=>compareNativePair(a,b));
});
