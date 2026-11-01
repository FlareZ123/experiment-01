'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SOURCE_RANK6,supporterCycle,coinWays,millTail,
  depletionByNextOpponentDraw,prizeAccessibility,unopposedDeckoutRace}=
  require('../scripts/agent39-rank6-lusamine-handiwork-cycle.cjs');

test('original rank6 has two Lusamine, one Handiwork, three VS Seeker',()=>{
  assert.deepEqual(SOURCE_RANK6,{lusamine:2,handiwork:1,vsSeeker:3});
});

test('two-Lusamine cycle preserves unique cards and one Supporter/turn',()=>{
  const rows=supporterCycle(32);
  assert.deepEqual(rows.slice(0,4).map(r=>r.play),['L1','H','L2','H']);
  for(const row of rows){
    assert.deepEqual([...row.hand,...row.discard].sort(),['H','L1','L2']);
    assert.equal(new Set([...row.hand,...row.discard]).size,3);
    assert.equal(row.handiworkUses,Math.floor(row.turn/2));
    assert.equal(row.play,row.turn%2===0?'H':
      (row.turn%4===1?'L1':'L2'));
    assert.equal(row.hand.length,row.turn%2===0?1:2);
  }
});

test('exact coin polynomial normalizes and is symmetric for 0..20 plays',()=>{
  for(let uses=0;uses<=20;uses++){
    const ways=coinWays(uses);
    assert.equal(ways.reduce((a,b)=>a+b,0n),1n<<BigInt(2*uses));
    assert.equal(ways.length,2*uses+1);
    assert.equal(ways[0],1n);
    assert.equal(ways[2*uses],1n);
    assert.deepEqual(ways,[...ways].reverse());
  }
});

test('one Handiwork has printed 0/2/4 distribution',()=>{
  assert.deepEqual(coinWays(1),[1n,2n,1n]);
  assert.equal(millTail(1,1).probability,0.75);
  assert.equal(millTail(1,3).probability,0.25);
  assert.equal(millTail(1,5).probability,0);
  assert.equal(millTail(0,0).probability,1);
});

test('independent 4096-path enumeration agrees with 6-play exact tails',()=>{
  const uses=6;
  const counts=Array(2*uses+1).fill(0);
  for(let mask=0;mask<(1<<(2*uses));mask++){
    let n=mask,heads=0;
    for(let j=0;j<2*uses;j++){heads+=n&1;n>>=1;}
    counts[heads]++;
  }
  assert.deepEqual(counts.map(BigInt),coinWays(uses));
  assert.equal(millTail(uses,12).probability,
    counts.slice(6).reduce((a,b)=>a+b,0)/(1<<(2*uses)));
});

test('next draw depletion counts exactly 2k-1 earlier natural draws',()=>{
  assert.deepEqual(depletionByNextOpponentDraw(5,20),{
    ...millTail(5,11),opponentDrawsBefore:9,handiworkUses:5
  });
});

test('invalid horizons fail before allocation',()=>{
  assert.throws(()=>supporterCycle(-1),RangeError);
  assert.throws(()=>coinWays(129),RangeError);
  assert.throws(()=>millTail(2,-1),RangeError);
  assert.throws(()=>depletionByNextOpponentDraw(0,10),RangeError);
});

test('single Gladion can rescue at most one prized loop component',()=>{
  const r=prizeAccessibility();
  assert.equal(r.total,50063860n);
  assert.equal(r.direct,36288252n);
  assert.equal(r.oneGladionRecoverable,11459448n);
  assert.equal(r.blockedWithoutPrizeTaking,2316160n);
  assert.equal(r.direct+r.oneGladionRecoverable+
    r.blockedWithoutPrizeTaking,r.total);
  assert.ok(r.maximumAccessibleFraction>0.95);
  assert.ok(r.maximumAccessibleFraction<0.96);
});

test('independent turn-by-turn race matches every small full coin space',()=>{
  for(let owner=1;owner<=8;owner++){
    const uses=Math.floor(owner/2);
    const total=1<<(2*uses);
    for(let opponent=0;opponent<=24;opponent++){
      let wins=0;
      for(let bits=0;bits<total;bits++){
        let ownDeck=owner,oppDeck=opponent,coinIndex=0;
        while(true){
          if(ownDeck===0)break;
          ownDeck--;
          if((owner-ownDeck)%2===0){
            let heads=0;
            for(let j=0;j<2;j++)heads+=(bits>>coinIndex++)&1;
            oppDeck=Math.max(0,oppDeck-2*heads);
          }
          if(oppDeck===0){wins++;break;}
          oppDeck--;
        }
      }
      assert.equal(unopposedDeckoutRace(owner,opponent).probability,
        wins/total,'owner='+owner+' opponent='+opponent);
    }
  }
});

test('eight owner draws versus twenty opponent cards is a narrow race',()=>{
  const r=unopposedDeckoutRace(8,20);
  assert.equal(r.handiworkUses,4);
  assert.equal(r.opponentDrawsBefore,7);
  assert.equal(r.probability,9/256);
  assert.equal(unopposedDeckoutRace(12,20).probability,3302/4096);
});
