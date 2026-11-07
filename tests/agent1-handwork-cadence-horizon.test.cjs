'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  makeRank3HandiworkCadenceSchedule,
  distributionOfFutureOwnerStartsUnderSchedule
}=require('../simulation/evaluation/agent1-handwork-cadence-horizon.cjs');

/**
 * Independently enumerate every weighted mill outcome for a small schedule.
 * @param {number} remaining
 * @param {object[]} schedule
 * @returns {object}
 */
function literalDistribution(remaining,schedule){
  const counts=new Map();
  const recurse=(deck,starts,step,numerator)=>{
    if(step===schedule.length){
      assert.equal(deck,0);
      counts.set(starts,(counts.get(starts)??0n)+numerator);
      return;
    }
    const row=schedule[step];
    for(const outcome of row.opponentMillOutcomes){
      const consumed=row.ownerDeckLoss+outcome.opponentMill+1;
      if(deck>0&&consumed<=deck){
        recurse(deck-consumed,starts+1,step+1,
          numerator*BigInt(outcome.weight));
      }else{
        recurse(0,starts,step+1,numerator*BigInt(outcome.weight));
      }
    }
  };
  recurse(remaining,0,0,1n);
  const denominator=schedule.reduce((product,row)=>
    product*row.opponentMillOutcomes.reduce((sum,outcome)=>
      sum+BigInt(outcome.weight),0n),1n);
  return {
    commonDenominator:denominator.toString(),
    distribution:[...counts.entries()].sort((a,b)=>a[0]-b[0])
      .map(([futureOwnerStarts,numerator])=>({
        futureOwnerStarts,numerator:numerator.toString()
      }))
  };
}

/**
 * Reduce a nonnegative rational.
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator:string,denominator:string}}
 */
function reduceFraction(numerator,denominator){
  let a=numerator,b=denominator;
  while(b!==0n){
    const remainder=a%b;
    a=b;
    b=remainder;
  }
  const divisor=a===0n?denominator:a;
  return {
    numerator:(numerator/divisor).toString(),
    denominator:(denominator/divisor).toString()
  };
}

/**
 * @param {object} result
 * @param {number} minimum
 * @returns {{numerator:string,denominator:string}}
 */
function probabilityAtLeast(result,minimum){
  const numerator=result.distribution
    .filter(row=>row.futureOwnerStarts>=minimum)
    .reduce((sum,row)=>sum+BigInt(row.numerator),0n);
  return reduceFraction(numerator,BigInt(result.commonDenominator));
}

test('rank-3 Lusamine/VS Seeker-only example uses four initial Handiwork turns then an alternating recovery cadence',()=>{
  const rows=makeRank3HandiworkCadenceSchedule(12,{
    ownerDeckLoss:2,burrowPerTurn:1
  });
  assert.deepEqual(rows.map(row=>row.supporterAction),[
    'Handiwork','Handiwork','Handiwork','Handiwork',
    'filler Supporter','Lusamine 1','Handiwork','Lusamine 2',
    'Handiwork','Lusamine 1','Handiwork','Lusamine 2'
  ]);
  assert.deepEqual(rows.map(row=>row.handiworkPlayed),[
    true,true,true,true,false,false,true,false,true,false,true,false
  ]);
  assert.deepEqual(rows.slice(1,4).map(row=>row.itemAction),[
    'VS Seeker','VS Seeker','VS Seeker'
  ]);
  assert.deepEqual(rows[5].retrievedSupporters,[
    "Team Rocket's Handiwork",'filler Supporter'
  ]);
  assert.deepEqual(rows[7].retrievedSupporters,[
    "Team Rocket's Handiwork",'Lusamine 1'
  ]);
  assert.deepEqual(rows[9].retrievedSupporters,[
    "Team Rocket's Handiwork",'Lusamine 2'
  ]);
  assert.deepEqual(rows[0].opponentMillOutcomes,[
    {opponentMill:1,weight:1},
    {opponentMill:3,weight:2},
    {opponentMill:5,weight:1}
  ]);
  assert.deepEqual(rows[4].opponentMillOutcomes,[
    {opponentMill:1,weight:4}
  ]);
});

test('finite stochastic schedules match independent exhaustive outcome enumeration',()=>{
  for(let remaining=0;remaining<=8;remaining++)
    for(let ownerDeckLoss=0;ownerDeckLoss<=2;ownerDeckLoss++)
      for(let burrowPerTurn=0;burrowPerTurn<=2;burrowPerTurn++){
        const schedule=makeRank3HandiworkCadenceSchedule(remaining+1,{
          ownerDeckLoss,burrowPerTurn
        });
        const actual=distributionOfFutureOwnerStartsUnderSchedule(
          remaining,schedule
        );
        const expected=literalDistribution(remaining,schedule);
        assert.equal(actual.commonDenominator,expected.commonDenominator);
        assert.deepEqual(actual.distribution,expected.distribution);
      }
});

test('one-Burrow resource cadence gives exact rank-3 D=23 survival distributions',()=>{
  const turns=24;
  const filch=distributionOfFutureOwnerStartsUnderSchedule(23,
    makeRank3HandiworkCadenceSchedule(turns,{
      ownerDeckLoss:2,burrowPerTurn:1
    }));
  const pass=distributionOfFutureOwnerStartsUnderSchedule(23,
    makeRank3HandiworkCadenceSchedule(turns,{
      ownerDeckLoss:0,burrowPerTurn:1
    }));
  assert.deepEqual(filch.expectedFutureOwnerStarts,{
    numerator:'433',denominator:'128'
  });
  assert.deepEqual(pass.expectedFutureOwnerStarts,{
    numerator:'104657',denominator:'16384'
  });
  assert.deepEqual(probabilityAtLeast(filch,5),{
    numerator:'9',denominator:'256'
  });
  assert.deepEqual(probabilityAtLeast(pass,5),{
    numerator:'247',denominator:'256'
  });
});

test('two-Burrow resource cadence gives exact rank-3 D=23 survival distributions',()=>{
  const turns=24;
  const filch=distributionOfFutureOwnerStartsUnderSchedule(23,
    makeRank3HandiworkCadenceSchedule(turns,{
      ownerDeckLoss:2,burrowPerTurn:2
    }));
  const pass=distributionOfFutureOwnerStartsUnderSchedule(23,
    makeRank3HandiworkCadenceSchedule(turns,{
      ownerDeckLoss:0,burrowPerTurn:2
    }));
  assert.deepEqual(filch.expectedFutureOwnerStarts,{
    numerator:'749',denominator:'256'
  });
  assert.deepEqual(pass.expectedFutureOwnerStarts,{
    numerator:'4759',denominator:'1024'
  });
  assert.deepEqual(probabilityAtLeast(filch,5),{
    numerator:'0',denominator:'1'
  });
  assert.deepEqual(probabilityAtLeast(pass,5),{
    numerator:'163',denominator:'256'
  });
});

test('schedule must cover every possible future mandatory draw and reject invalid mill outcomes',()=>{
  const schedule=makeRank3HandiworkCadenceSchedule(24,{
    ownerDeckLoss:0,burrowPerTurn:1
  });
  assert.throws(()=>distributionOfFutureOwnerStartsUnderSchedule(
    23,schedule.slice(0,23)
  ),/remaining\+1 rows/);
  const invalid=schedule.map(row=>({...row,
    opponentMillOutcomes:[{opponentMill:1,weight:0}]
  }));
  assert.throws(()=>distributionOfFutureOwnerStartsUnderSchedule(
    23,invalid
  ),/positive safe integers/);
  assert.throws(()=>makeRank3HandiworkCadenceSchedule(5,{
    ownerDeckLoss:-1,burrowPerTurn:1
  }),/feasible/);
  assert.throws(()=>makeRank3HandiworkCadenceSchedule(5,{
    ownerDeckLoss:0,burrowPerTurn:3
  }),/0, 1, or 2/);
});

test('the exact weighted outcome mass is normalized for D=23',()=>{
  const result=distributionOfFutureOwnerStartsUnderSchedule(23,
    makeRank3HandiworkCadenceSchedule(24,{
      ownerDeckLoss:2,burrowPerTurn:2
    }));
  assert.equal(result.commonDenominator,String(4n**24n));
  assert.equal(result.distribution.reduce((sum,row)=>
    sum+BigInt(row.numerator),0n),BigInt(result.commonDenominator));
});

