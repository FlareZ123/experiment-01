'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  makeRank3HandiworkCadenceSchedule,
  distributionOfFutureOwnerStartsUnderSchedule,
  probabilityHandiworkAccessByNaturalDrawAndMail,
  probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy
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



test('post-Rototiller natural draw plus Trainers Mail gives exact conditional direct-access probabilities',()=>{
  const cases=[
    {
      deckSize:40,otherTrainerCount:15,mailsInDeck:0,mailsInHand:1,
      expected:{numerator:'1',denominator:'8'}
    },
    {
      deckSize:40,otherTrainerCount:15,mailsInDeck:0,mailsInHand:2,
      expected:{numerator:'35236091',denominator:'162527976'}
    },
    {
      deckSize:40,otherTrainerCount:15,mailsInDeck:1,mailsInHand:1,
      expected:{numerator:'62095963',denominator:'487583928'}
    },
    {
      deckSize:40,otherTrainerCount:0,mailsInDeck:2,mailsInHand:0,
      expected:{numerator:'47',denominator:'1560'}
    },
    {
      deckSize:40,otherTrainerCount:15,mailsInDeck:0,mailsInHand:0,
      expected:{numerator:'1',denominator:'40'}
    }
  ];
  for(const scenario of cases){
    const result=probabilityHandiworkAccessByNaturalDrawAndMail(
      scenario.deckSize,scenario.otherTrainerCount,
      scenario.mailsInDeck,scenario.mailsInHand
    );
    assert.deepEqual(result.exactProbability,scenario.expected);
    assert.ok(result.probability>=0&&result.probability<=1);
    assert.equal(result.targetCopiesInDeck,1);
  }
});

test('one available Trainers Mail plus natural draw is exactly five over D',()=>{
  for(const deckSize of [8,20,30,40,50]){
    const maximumOtherTrainers=deckSize-1;
    for(const otherTrainerCount of [0,Math.floor(maximumOtherTrainers/2),maximumOtherTrainers]){
      const result=probabilityHandiworkAccessByNaturalDrawAndMail(
        deckSize,otherTrainerCount,0,1
      );
      assert.equal(
        BigInt(result.exactProbability.numerator)*BigInt(deckSize),
        5n*BigInt(result.exactProbability.denominator)
      );
    }
  }
});

test('the exact Mail access model rejects impossible zone counts',()=>{
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawAndMail(
    40,0,2,1
  ),/only two Trainers/);
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawAndMail(
    10,9,2,0
  ),/cannot exceed deckSize/);
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawAndMail(
    0,0,0,0
  ),/deckSize must be 1..60/);
});


/**
 * Reduce a nonnegative exact rational for the independent card-subset oracle.
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{n:bigint,d:bigint}}
 */
function oracleFraction(numerator,denominator){
  let a=numerator,b=denominator;
  while(b!==0n){
    const remainder=a%b;
    a=b;
    b=remainder;
  }
  const divisor=a===0n?denominator:a;
  return {n:numerator/divisor,d:denominator/divisor};
}

/**
 * @param {{n:bigint,d:bigint}} left
 * @param {{n:bigint,d:bigint}} right
 * @returns {{n:bigint,d:bigint}}
 */
function addOracleFractions(left,right){
  return oracleFraction(
    left.n*right.d+right.n*left.d,left.d*right.d
  );
}

/**
 * @param {{n:bigint,d:bigint}} value
 * @param {bigint} divisor
 * @returns {{n:bigint,d:bigint}}
 */
function divideOracleFraction(value,divisor){
  return oracleFraction(value.n,value.d*divisor);
}

/**
 * Enumerate all subsets of a small deck without using the production
 * hypergeometric state transition.
 * @param {number} size
 * @param {number} count
 * @returns {number[][]}
 */
function indexCombinations(size,count){
  const rows=[];
  const visit=(next,chosen)=>{
    if(chosen.length===count){
      rows.push([...chosen]);
      return;
    }
    for(let index=next;index<=size-(count-chosen.length);index++){
      chosen.push(index);
      visit(index+1,chosen);
      chosen.pop();
    }
  };
  visit(0,[]);
  return rows;
}

/**
 * Literal subset oracle for a sequence of Trainers' Mail actions.
 * A successful target or usable seal is selected; otherwise one other
 * eligible Trainer is selected when the revealed four contain one.
 * @param {string[]} deck
 * @param {number} mailsInHand
 * @param {boolean} useForestSealStone
 * @returns {{n:bigint,d:bigint}}
 */
function bruteMailStarAlchemyAccess(deck,mailsInHand,useForestSealStone){
  if(mailsInHand===0)return {n:0n,d:1n};
  const revealSize=Math.min(4,deck.length);
  const subsets=indexCombinations(deck.length,revealSize);
  let total={n:0n,d:1n};
  for(const subset of subsets){
    const revealed=subset.map(index=>deck[index]);
    let branch;
    if(revealed.includes('target')||
       (useForestSealStone&&revealed.includes('seal'))){
      branch={n:1n,d:1n};
    }else{
      const selectedOther=subset.find(index=>deck[index]==='other');
      const nextDeck=selectedOther===undefined
        ?deck
        :deck.filter((card,index)=>index!==selectedOther);
      branch=bruteMailStarAlchemyAccess(
        nextDeck,mailsInHand-1,useForestSealStone
      );
    }
    total=addOracleFractions(total,
      divideOracleFraction(branch,BigInt(subsets.length)));
  }
  return total;
}

/**
 * Literal natural-draw enumeration followed by the subset oracle.
 * @param {string[]} deck
 * @param {number} mailsInHand
 * @param {boolean} useForestSealStone
 * @returns {{n:bigint,d:bigint}}
 */
function bruteNaturalDrawMailStarAlchemyAccess(
  deck,mailsInHand,useForestSealStone
){
  let total={n:0n,d:1n};
  for(let index=0;index<deck.length;index++){
    const card=deck[index];
    let branch;
    if(card==='target'||(useForestSealStone&&card==='seal')){
      branch={n:1n,d:1n};
    }else{
      const nextDeck=deck.filter((_,i)=>i!==index);
      branch=bruteMailStarAlchemyAccess(
        nextDeck,mailsInHand+(card==='mail'?1:0),useForestSealStone
      );
    }
    total=addOracleFractions(total,
      divideOracleFraction(branch,BigInt(deck.length)));
  }
  return total;
}

test('post-Rototiller Star Alchemy exact access matches exhaustive labelled-card draw and top-four enumeration',()=>{
  for(const deckSize of [5,6,7,8,9]){
    for(const forestSealStoneInDeck of [false,true]){
      const sealCount=forestSealStoneInDeck?1:0;
      for(let mailsInDeck=0;mailsInDeck<=2;mailsInDeck++){
        for(let mailsInHand=0;mailsInHand<=2-mailsInDeck;mailsInHand++){
          const maximumOtherTrainers=Math.min(
            3,deckSize-1-sealCount-mailsInDeck
          );
          for(let otherTrainerCount=0;
              otherTrainerCount<=maximumOtherTrainers;
              otherTrainerCount++){
            const fillerCount=deckSize-1-sealCount-
              mailsInDeck-otherTrainerCount;
            const deck=[
              'target',
              ...Array(otherTrainerCount).fill('other'),
              ...Array(mailsInDeck).fill('mail'),
              ...(forestSealStoneInDeck?['seal']:[]),
              ...Array(fillerCount).fill('filler')
            ];
            const expected=bruteNaturalDrawMailStarAlchemyAccess(
              deck,mailsInHand,forestSealStoneInDeck
            );
            const actual=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
              deckSize,otherTrainerCount,mailsInDeck,mailsInHand,
              forestSealStoneInDeck
            );
            assert.deepEqual(actual.exactProbability,{
              numerator:expected.n.toString(),
              denominator:expected.d.toString()
            },JSON.stringify({
              deckSize,otherTrainerCount,mailsInDeck,mailsInHand,
              forestSealStoneInDeck
            }));
          }
        }
      }
    }
  }
});

test('Star Alchemy materially expands direct access when its usable Stone is in deck',()=>{
  const oneMail=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,15,0,1,true
  );
  assert.deepEqual(oneMail.exactProbability,{
    numerator:'37',denominator:'156'
  });
  const twoMails=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,15,0,2,true
  );
  assert.deepEqual(twoMails.exactProbability,{
    numerator:'3525213607',denominator:'9020302668'
  });
  const oneMailInDeck=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,15,1,0,true
  );
  assert.deepEqual(oneMailInDeck.exactProbability,{
    numerator:'407',denominator:'7410'
  });
  const twoMailsInDeck=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,15,2,0,true
  );
  assert.deepEqual(twoMailsInDeck.exactProbability,{
    numerator:'887',denominator:'14820'
  });
});

test('one in-hand Mail plus a usable in-deck Forest Seal Stone is independent of other Trainer density',()=>{
  const probabilities=[];
  for(const otherTrainerCount of [0,8,16,37]){
    const result=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
      40,otherTrainerCount,0,1,true
    );
    probabilities.push(result.exactProbability);
  }
  for(const probability of probabilities){
    assert.deepEqual(probability,{numerator:'37',denominator:'156'});
  }
});

test('Star Alchemy access preserves the prior Mail-only model when no usable Stone is present',()=>{
  for(const [deckSize,otherTrainerCount,mailsInDeck,mailsInHand] of [
    [8,2,0,1],[20,7,1,1],[40,15,2,0],[50,30,0,2]
  ]){
    const oldModel=probabilityHandiworkAccessByNaturalDrawAndMail(
      deckSize,otherTrainerCount,mailsInDeck,mailsInHand
    );
    const newModel=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
      deckSize,otherTrainerCount,mailsInDeck,mailsInHand,false
    );
    assert.deepEqual(newModel.exactProbability,oldModel.exactProbability);
  }
});

test('a ready Forest Seal Stone gives immediate access and impossible zone states are rejected',()=>{
  const ready=probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    39,15,0,1,false,true
  );
  assert.deepEqual(ready.exactProbability,{numerator:'1',denominator:'1'});
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,0,2,1,true
  ),/only two Trainers/);
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    10,9,0,0,true
  ),/cannot exceed deckSize/);
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    0,0,0,0,false
  ),/deckSize must be 1..60/);
  assert.throws(()=>probabilityHandiworkAccessByNaturalDrawMailAndStarAlchemy(
    40,15,0,1,true,true
  ),/cannot be both in deck and ready/);
});
