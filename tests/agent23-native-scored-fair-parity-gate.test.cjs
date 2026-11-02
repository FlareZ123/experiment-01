'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyNativeScoredFairParity}=
  require('../simulation/evaluation/agent23-native-scored-fair-parity-gate.cjs');

function packet(){
  return {
    attempts:4,independentlyQualifiedCompetitiveGames:0,
    rows:Array.from({length:4},(_,i)=>({
      trialId:'frozen-'+i,
      samePlayback:true,actualExecutionAuthenticated:true,
      noninterferenceVerified:true,
      classification:'authentic-tape-same-world-parity-only',
      sameWorldParityQualified:true,competitiveGameQualified:false,
      diagnostic:{
        nativeTapeFiniteScores:1,
        nativeSameWorldTape:{
          sameWorldDecisionParityQualified:true,
          physicalCloneMatched:true,sourceRootUnchanged:true,
          selectedActionMatched:true,tapeDraws:40,consumed:40,
          replayError:null
        }
      }
    }))
  };
}

test('four genuine finite-scored same-root decisions pass source exactness gate',()=>{
  assert.equal(verifyNativeScoredFairParity(packet()).scoredParityQualified,4);
});

test('missing finite-score exposure cannot be silently called a replay pass',()=>{
  const p=packet();
  p.rows[2].diagnostic.nativeTapeFiniteScores=0;
  assert.throws(()=>verifyNativeScoredFairParity(p),/did not reproduce/);
});

test('matching RNG with different selected action still vetoes scored source',()=>{
  const p=packet();
  p.rows[0].diagnostic.nativeSameWorldTape.selectedActionMatched=false;
  assert.throws(()=>verifyNativeScoredFairParity(p),/did not reproduce/);
});

test('one swallowed RNG overrun vetoes all-four historical certification',()=>{
  const p=packet();
  p.rows[1].diagnostic.nativeSameWorldTape.consumed=null;
  p.rows[1].diagnostic.nativeSameWorldTape.replayError='swallowed';
  assert.throws(()=>verifyNativeScoredFairParity(p),/did not reproduce/);
});

test('original Store mismatch invalidates source-parity receipt',()=>{
  const p=packet();
  p.rows[3].noninterferenceVerified=false;
  assert.throws(()=>verifyNativeScoredFairParity(p),/original-Store/);
});
