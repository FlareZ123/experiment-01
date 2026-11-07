'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  futureOwnerStartsUnderSchedule,
  compareStationaryDrawToDeadline,
  distributionOfFutureOwnerStarts
}=require('../simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs');
const {
  futureOwnerStarts:stationaryOwnerStarts
}=require('../simulation/evaluation/agent2-owner-deck-attrition-horizon.cjs');

/** @param {number} remaining @param {object[]} schedule @param {object} tail */
function literalOwnerStarts(remaining,schedule,tail){
  let deck=remaining,starts=0,turn=0;
  while(deck>0){
    const row=schedule[turn]??tail;
    deck=Math.max(0,deck-row.ownerDeckLoss);
    deck=Math.max(0,deck-row.opponentMill);
    if(deck===0)return starts;
    deck--;
    starts++;
    turn++;
  }
  return starts;
}

/** @returns {object[]} All nine draw/mill pairs from zero through two. */
function smallRows(){
  const rows=[];
  for(let ownerDeckLoss=0;ownerDeckLoss<=2;ownerDeckLoss++)
    for(let opponentMill=0;opponentMill<=2;opponentMill++)
      rows.push({ownerDeckLoss,opponentMill});
  return rows;
}

/** @param {number} length @returns {object[][]} */
function allSchedules(length){
  const rows=smallRows();
  let schedules=[[]];
  for(let i=0;i<length;i++)
    schedules=schedules.flatMap(prefix=>
      rows.map(row=>[...prefix,row]));
  return schedules;
}

test('stationary tails reproduce Agent2 closed-form horizons for 4,941 cases',()=>{
  for(let deck=0;deck<=60;deck++)
    for(let draw=0;draw<=8;draw++)
      for(let mill=0;mill<=8;mill++){
        const result=futureOwnerStartsUnderSchedule(deck,[],{
          ownerDeckLoss:draw,opponentMill:mill
        });
        assert.equal(result.futureOwnerStarts,
          stationaryOwnerStarts(deck,draw,mill),
          JSON.stringify({deck,draw,mill}));
      }
});

test('finite schedules match a literal mandatory-draw recurrence',()=>{
  let checked=0;
  const tails=smallRows();
  for(let deck=0;deck<=20;deck++)
    for(let length=0;length<=2;length++)
      for(const schedule of allSchedules(length))
        for(const tail of tails){
          const result=futureOwnerStartsUnderSchedule(deck,schedule,tail);
          assert.equal(result.futureOwnerStarts,
            literalOwnerStarts(deck,schedule,tail),
            JSON.stringify({deck,schedule,tail}));
          checked++;
        }
  assert.equal(checked,17199);
});

test('one Filch followed by passing has a different budget from repeated Filch',()=>{
  const repeatFilch=futureOwnerStartsUnderSchedule(23,[],{
    ownerDeckLoss:2,opponentMill:0
  });
  const repeatPass=futureOwnerStartsUnderSchedule(23,[],{
    ownerDeckLoss:0,opponentMill:0
  });
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(23,[{
    ownerDeckLoss:2,opponentMill:0
  }],{ownerDeckLoss:0,opponentMill:0});
  assert.equal(repeatFilch.futureOwnerStarts,7);
  assert.equal(repeatPass.futureOwnerStarts,23);
  assert.equal(oneFilchThenPass.futureOwnerStarts,21);
});

test('sustained double-Burrow pressure changes the repeated-draw horizon',()=>{
  const repeatedFilch=futureOwnerStartsUnderSchedule(23,[],{
    ownerDeckLoss:2,opponentMill:2
  });
  const repeatedPass=futureOwnerStartsUnderSchedule(23,[],{
    ownerDeckLoss:0,opponentMill:2
  });
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(23,[{
    ownerDeckLoss:2,opponentMill:2
  }],{ownerDeckLoss:0,opponentMill:2});
  assert.equal(repeatedFilch.futureOwnerStarts,4);
  assert.equal(repeatedPass.futureOwnerStarts,7);
  assert.equal(oneFilchThenPass.futureOwnerStarts,7);

  const criticalFilch=futureOwnerStartsUnderSchedule(4,[],{
    ownerDeckLoss:2,opponentMill:2
  });
  const criticalPass=futureOwnerStartsUnderSchedule(4,[],{
    ownerDeckLoss:0,opponentMill:2
  });
  assert.equal(criticalFilch.futureOwnerStarts,0);
  assert.equal(criticalPass.futureOwnerStarts,1);
});

test('a one-turn double-Burrow burst is represented without assuming it repeats',()=>{
  const repeatedFilchAfterBurst=futureOwnerStartsUnderSchedule(15,[{
    ownerDeckLoss:2,opponentMill:2
  }],{ownerDeckLoss:2,opponentMill:0});
  const passAfterBurst=futureOwnerStartsUnderSchedule(15,[{
    ownerDeckLoss:0,opponentMill:2
  }],{ownerDeckLoss:0,opponentMill:0});
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(15,[{
    ownerDeckLoss:2,opponentMill:2
  }],{ownerDeckLoss:0,opponentMill:0});
  assert.equal(repeatedFilchAfterBurst.futureOwnerStarts,4);
  assert.equal(passAfterBurst.futureOwnerStarts,13);
  assert.equal(oneFilchThenPass.futureOwnerStarts,11);
  assert.deepEqual(repeatedFilchAfterBurst.ledger,[{
    scheduledOwnerTurn:1,
    ownerDeckLossRequested:2,
    ownerDeckLossApplied:2,
    opponentMillRequested:2,
    opponentCardsMilled:2,
    mandatoryDrawForNextOwnerTurn:1,
    deckAfterMandatoryDraw:10,
    nextOwnerTurnStarts:true
  }]);
});

test('empty deck before the next mandatory draw does not create a future turn',()=>{
  const result=futureOwnerStartsUnderSchedule(4,[{
    ownerDeckLoss:2,opponentMill:2
  }]);
  assert.equal(result.futureOwnerStarts,0);
  assert.equal(result.scheduleTerminatedBeforeNextOwnerTurn,true);
  assert.equal(result.ledger[0].mandatoryDrawForNextOwnerTurn,0);
  assert.equal(result.ledger[0].nextOwnerTurnStarts,false);
});

test('invalid counts and malformed schedules are rejected',()=>{
  assert.throws(()=>futureOwnerStartsUnderSchedule(-1,[]),/feasible/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[{
    ownerDeckLoss:2,opponentMill:61
  }]),/feasible/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[null]),/scenario objects/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[],{
    ownerDeckLoss:0,opponentMill:-1
  }),/feasible/);
});


test('draw deadline classification separates safe, pass-required and unreachable plans',()=>{
  const passRequired=compareStationaryDrawToDeadline(23,2,2,5);
  assert.equal(passRequired.drawHorizon,4);
  assert.equal(passRequired.passHorizon,7);
  assert.equal(passRequired.drawCanReachDeadline,false);
  assert.equal(passRequired.passCanReachDeadline,true);
  assert.equal(passRequired.classification,
    'pass-required-to-reach-deadline');

  const unreachable=compareStationaryDrawToDeadline(23,2,2,8);
  assert.equal(unreachable.drawCanReachDeadline,false);
  assert.equal(unreachable.passCanReachDeadline,false);
  assert.equal(unreachable.classification,'neither-policy-reaches-deadline');

  const safe=compareStationaryDrawToDeadline(23,2,2,3);
  assert.equal(safe.drawCanReachDeadline,true);
  assert.equal(safe.passCanReachDeadline,true);
  assert.equal(safe.classification,'draw-horizon-sufficient');

  assert.throws(()=>compareStationaryDrawToDeadline(23,2,2,61),/feasible/);
});


test('the rank-3 native Burrow trace is reproduced by its public deck-loss schedule',()=>{
  const ownerLosses=[2,2,2,2,2,2,3,2,2,2,2];
  const schedule=ownerLosses.map(ownerDeckLoss=>({
    ownerDeckLoss,opponentMill:1
  }));
  const result=futureOwnerStartsUnderSchedule(44,schedule);
  assert.equal(result.futureOwnerStarts,10);
  assert.equal(result.scheduleTerminatedBeforeNextOwnerTurn,true);
  assert.deepEqual(result.ledger.map(row=>row.deckAfterMandatoryDraw),[
    40,36,32,28,24,20,15,11,7,3,0
  ]);
  assert.equal(result.ledger[6].ownerDeckLossApplied,3,
    'the turn-15 receipt contains one extra unclassified owner-deck decrement');
});


test('stochastic Handiwork outcomes produce an exact normalized distribution',()=>{
  const result=distributionOfFutureOwnerStarts(4,2,[
    {opponentMill:0,weight:1},
    {opponentMill:2,weight:2},
    {opponentMill:4,weight:1}
  ]);
  assert.equal(result.commonDenominator,'1024');
  assert.deepEqual(result.distribution,[
    {futureOwnerStarts:0,numerator:'768'},
    {futureOwnerStarts:1,numerator:'256'}
  ]);
  assert.deepEqual(result.expectedFutureOwnerStarts,{
    numerator:'1',denominator:'4'
  });
});

test('repeated Handiwork distribution gives exact horizon and deadline probabilities',()=>{
  const result=distributionOfFutureOwnerStarts(23,2,[
    {opponentMill:0,weight:1},
    {opponentMill:2,weight:2},
    {opponentMill:4,weight:1}
  ]);
  assert.deepEqual(result.expectedFutureOwnerStarts,{
    numerator:'69675',denominator:'16384'
  });
  const denominator=BigInt(result.commonDenominator);
  const atLeastFive=result.distribution
    .filter(row=>row.futureOwnerStarts>=5)
    .reduce((sum,row)=>sum+BigInt(row.numerator),0n);
  const gcd=(a,b)=>{
    while(b!==0n){const r=a%b;a=b;b=r;}
    return a;
  };
  const divisor=gcd(atLeastFive,denominator);
  assert.equal((atLeastFive/divisor).toString(),'193');
  assert.equal((denominator/divisor).toString(),'512');

  const pass=distributionOfFutureOwnerStarts(23,0,[
    {opponentMill:0,weight:1},
    {opponentMill:2,weight:2},
    {opponentMill:4,weight:1}
  ]);
  assert.deepEqual(pass.expectedFutureOwnerStarts,{
    numerator:'523879358914293',denominator:'70368744177664'
  });
  const passDenominator=BigInt(pass.commonDenominator);
  const passAtLeastFive=pass.distribution
    .filter(row=>row.futureOwnerStarts>=5)
    .reduce((sum,row)=>sum+BigInt(row.numerator),0n);
  const passDivisor=gcd(passAtLeastFive,passDenominator);
  assert.equal((passAtLeastFive/passDivisor).toString(),'1023');
  assert.equal((passDenominator/passDivisor).toString(),'1024');
});

test('single-outcome stochastic tails equal stationary horizons for 1,525 cases',()=>{
  for(let deck=0;deck<=60;deck++)
    for(let ownerLoss=0;ownerLoss<=4;ownerLoss++)
      for(let mill=0;mill<=4;mill++){
        const result=distributionOfFutureOwnerStarts(deck,ownerLoss,[
          {opponentMill:mill,weight:1}
        ]);
        const horizon=futureOwnerStartsUnderSchedule(deck,[],{
          ownerDeckLoss:ownerLoss,opponentMill:mill
        }).futureOwnerStarts;
        assert.deepEqual(result.distribution,[{
          futureOwnerStarts:horizon,numerator:'1'
        }],JSON.stringify({deck,ownerLoss,mill}));
      }
});

test('stochastic mill inputs reject empty outcomes and invalid weights',()=>{
  assert.throws(()=>distributionOfFutureOwnerStarts(10,2,[]),/nonempty/);
  assert.throws(()=>distributionOfFutureOwnerStarts(10,2,[{
    opponentMill:2,weight:0
  }]),/positive safe integer/);
  assert.throws(()=>distributionOfFutureOwnerStarts(10,2,[{
    opponentMill:61,weight:1
  }]),/feasible/);
});


test('one Handiwork burst uses its 0/2/4 outcomes before a no-mill tail',()=>{
  const outcomes=[
    {opponentMill:0,weight:1},
    {opponentMill:2,weight:2},
    {opponentMill:4,weight:1}
  ];
  const filchHorizons=outcomes.map(outcome=>
    futureOwnerStartsUnderSchedule(23,[{
      ownerDeckLoss:2,opponentMill:outcome.opponentMill
    }],{ownerDeckLoss:0,opponentMill:0}).futureOwnerStarts
  );
  const passHorizons=outcomes.map(outcome=>
    futureOwnerStartsUnderSchedule(23,[{
      ownerDeckLoss:0,opponentMill:outcome.opponentMill
    }],{ownerDeckLoss:0,opponentMill:0}).futureOwnerStarts
  );
  assert.deepEqual(filchHorizons,[21,19,17]);
  assert.deepEqual(passHorizons,[23,21,19]);
  assert.equal((filchHorizons[0]+2*filchHorizons[1]+filchHorizons[2])/4,19);
  assert.equal((passHorizons[0]+2*passHorizons[1]+passHorizons[2])/4,21);
});
