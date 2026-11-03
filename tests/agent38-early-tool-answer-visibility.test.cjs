'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {seenAnswerConditionalValidOpening,sevenSourceToolAnswerVisibility}=
  require('../scripts/agent38-early-tool-answer-visibility.cjs');
const {toolCounterFieldCensus}=
  require('../scripts/agent38-garbotoxin-tool-counter-census.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('exhaustive independent physical toy with ordered opening/draw stages',()=>{
  const physical=['basic','basic','answer','answer','other','other','other','other'];
  let eligible=0,seen=0;
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)
    for(let k=j+1;k<8;k++){
      const opening=[i,j,k],set=new Set(opening);
      if(!opening.some(x=>physical[x]==='basic'))continue;
      for(let d1=0;d1<8;d1++){
        if(set.has(d1))continue;
        for(let d2=d1+1;d2<8;d2++){
          if(set.has(d2))continue;
          eligible++;
          if([...opening,d1,d2].some(x=>physical[x]==='answer'))seen++;
        }
      }
    }
  const exact=seenAnswerConditionalValidOpening({
    deckSize:8,basicCount:2,answerCount:2,openingSize:3,ordinaryDraws:2
  });
  assert.equal(exact.numerator,String(seen));
  assert.equal(exact.denominator,String(eligible));
});

test('zero answers and all-answers-in-draw edge cases',()=>{
  const zero=seenAnswerConditionalValidOpening({
    deckSize:8,basicCount:2,answerCount:0,openingSize:3,ordinaryDraws:2
  });
  assert.equal(zero.answerSeenProbability,0);
  const forced=seenAnswerConditionalValidOpening({
    deckSize:8,basicCount:2,answerCount:6,openingSize:3,ordinaryDraws:2
  });
  assert.equal(forced.answerSeenProbability,1);
});

test('seven exact source ranks direct counter visibility under Basic-valid openings',()=>{
  const rows=sevenSourceToolAnswerVisibility(field,toolCounterFieldCensus);
  const expected=new Map([
    [1,[14,1,0.1445028731]],
    [5,[11,2,0.2673837906]],
    [6,[4,2,0.2589457793]],
    [7,[12,4,0.4714353024]],
    [11,[11,0,0]],
    [29,[4,3,0.3648146031]],
    [30,[16,3,0.3818521787]]
  ]);
  assert.equal(rows.length,expected.size);
  for(const row of rows){
    const [b,c,p]=expected.get(row.rank);
    assert.equal(row.basicCount,b);
    assert.equal(row.directAnswerCount,c);
    assert.ok(Math.abs(row.answerSeenProbability-p)<1e-9);
  }
});

test('disjoint physical Basic/Trainer classes and feasible horizon enforced',()=>{
  assert.throws(()=>seenAnswerConditionalValidOpening({
    deckSize:8,basicCount:4,answerCount:5,openingSize:3,ordinaryDraws:2
  }));
  assert.throws(()=>seenAnswerConditionalValidOpening({
    deckSize:8,basicCount:2,answerCount:1,openingSize:8,ordinaryDraws:1
  }));
});
