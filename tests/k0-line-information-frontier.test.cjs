'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {k0LineInformationFrontier}=require('../simulation/twinleaf/k0-line-information-frontier.cjs');

/** Exhaustively enumerate labelled physical Prize subsets without using the model formula. */
function brute(input){
  const n=input.unknownPool.length;
  const numerators=input.plans.map(()=>0);
  let after=0,afterRestricted=0,denominator=0;
  const allowed=new Set(input.postObservationPlanIds??input.plans.map(x=>x.id));
  for(let mask=0;mask<(1<<n);mask++){
    let prized=0;
    for(let i=0;i<n;i++)prized+=(mask>>i)&1;
    if(prized!==input.unknownPrizeCount)continue;
    denominator++;
    const available=new Map();
    input.unknownPool.forEach((printing,i)=>{
      if(!((mask>>i)&1))
        available.set(printing,(available.get(printing)??0)+1);
    });
    let best=0,bestRestricted=0;
    input.plans.forEach((plan,i)=>{
      const need=new Map();
      plan.requirements.forEach(req=>
        need.set(req.printing,(need.get(req.printing)??0)+req.count));
      const fulfilled=[...need].every(([name,count])=>
        (available.get(name)??0)>=count);
      const utility=fulfilled?plan.availableUtility:plan.missingUtility;
      numerators[i]+=utility;
      best=Math.max(best,utility);
      if(allowed.has(plan.id))bestRestricted=Math.max(bestRestricted,utility);
    });
    after+=best;
    afterRestricted+=bestRestricted;
  }
  return {denominator,after,afterRestricted,pre:Math.max(0,...numerators)};
}

test('two singleton alternative lines: full 60 with six unknown Prizes',()=>{
  const input={
    unknownPool:['Thunder-A','Fallback-B',...Array(58).fill('Other')],
    unknownPrizeCount:6,uniformUnknownAllocation:true,
    plans:['Thunder-A','Fallback-B'].map(id=>({
      id,requirements:[{printing:id,count:1}],
      availableUtility:10,missingUtility:-10
    }))
  };
  const value=k0LineInformationFrontier(input);
  assert.equal(value.preSearchPlanId,'Thunder-A');
  assert.equal(value.preSearchExpectedUtility,8);
  assert.ok(Math.abs(value.afterSearchExpectedUtility-10*117/118)<1e-12);
  assert.ok(Math.abs(value.informationValue- (10*117/118-8))<1e-12);
  assert.equal(value.evaluatedJointPrizeCases,4);
});

test('a reliable fallback line makes K1 choices valuable',()=>{
  const v=k0LineInformationFrontier({
    unknownPool:['A','B'],unknownPrizeCount:1,uniformUnknownAllocation:true,
    plans:[
      {id:'risky',requirements:[{printing:'A',count:1}],
        availableUtility:10,missingUtility:-20},
      {id:'safe',requirements:[],availableUtility:3,missingUtility:3}
    ]
  });
  assert.equal(v.preSearchPlanId,'safe');
  assert.equal(v.preSearchExpectedUtility,3);
  assert.equal(v.afterSearchExpectedUtility,6.5);
  assert.equal(v.informationValue,3.5);
});

test('no observation benefit if the same option dominates all allocations',()=>{
  const v=k0LineInformationFrontier({
    unknownPool:['A','B'],unknownPrizeCount:1,uniformUnknownAllocation:true,
    plans:[{id:'stable',requirements:[],availableUtility:4,missingUtility:-999}]
  });
  assert.equal(v.informationValue,0);
  assert.equal(v.preSearchExpectedUtility,4);
});

test('physical multiplicity and duplicate requirement counts are respected',()=>{
  const input={
    unknownPool:['A','A','B'],unknownPrizeCount:1,
    uniformUnknownAllocation:true,
    plans:[{id:'pair',requirements:[{printing:'A',count:1},
      {printing:'A',count:1}],availableUtility:9,missingUtility:-1}]
  };
  const v=k0LineInformationFrontier(input);
  assert.equal(v.preSearchExpectedUtility,7/3);
  assert.equal(v.afterSearchExpectedUtility,3);
  assert.equal(v.informationValue,2/3);
});

test('impossible requirements do not silently become playable',()=>{
  const v=k0LineInformationFrontier({
    unknownPool:['A','B'],unknownPrizeCount:1,uniformUnknownAllocation:true,
    plans:[{id:'unavailable',requirements:[{printing:'A',count:2}],
      availableUtility:100,missingUtility:-4}]
  });
  assert.equal(v.preSearchPlanId,null);
  assert.equal(v.preSearchExpectedUtility,0);
  assert.equal(v.afterSearchExpectedUtility,0);
});

test('reject epistemic assumptions, repeated ids and invalid bounds',()=>{
  const input={unknownPool:['A'],unknownPrizeCount:0,
    plans:[{id:'one',requirements:[],availableUtility:1,missingUtility:-1}]};
  assert.throws(()=>k0LineInformationFrontier(input),/Uniform unknown/);
  assert.throws(()=>k0LineInformationFrontier({
    ...input,uniformUnknownAllocation:true,unknownPrizeCount:2}),/Invalid/);
  assert.throws(()=>k0LineInformationFrontier({
    ...input,uniformUnknownAllocation:true,plans:[...input.plans,...input.plans]
  }),/unique/);
});

test('owner-authenticated partial deck knowledge changes only physically justified feasibility',()=>{
  const input={
    unknownPool:['B','C'],unknownPrizeCount:1,
    observedDeckPrintings:['A'],uniformUnknownAllocation:true,
    plans:[
      {id:'A',requirements:[{printing:'A',count:1}],
        availableUtility:8,missingUtility:-50},
      {id:'B',requirements:[{printing:'B',count:1}],
        availableUtility:20,missingUtility:-20}
    ]
  };
  const actual=k0LineInformationFrontier(input);
  assert.equal(actual.knownDeckCardCount,1);
  assert.equal(actual.preSearchPlanId,'A');
  assert.equal(actual.preSearchExpectedUtility,8);
  assert.equal(actual.afterSearchExpectedUtility,14);
  assert.equal(actual.informationValue,6);
  assert.equal(actual.exactDenominator,'2');
  // The same *unknown* physical pool without authenticated knowledge of A
  // could never treat plan A as guaranteed available.
  const unobserved=k0LineInformationFrontier({
    ...input,observedDeckPrintings:[]
  });
  assert.equal(unobserved.preSearchPlanId,null);
  assert.equal(unobserved.preSearchExpectedUtility,0);
  assert.equal(unobserved.informationValue,10);
});

test('duplicate verified deck copies count toward joint requirements',()=>{
  const actual=k0LineInformationFrontier({
    unknownPool:['B'],unknownPrizeCount:1,
    observedDeckPrintings:['A','A'],uniformUnknownAllocation:true,
    plans:[{id:'two',requirements:[{printing:'A',count:2}],
      availableUtility:13,missingUtility:-12}]
  });
  assert.equal(actual.preSearchExpectedUtility,13);
  assert.equal(actual.afterSearchExpectedUtility,13);
  assert.equal(actual.informationValue,0);
});

test('empty unknown allocation retains deterministic certified deck requirements',()=>{
  const actual=k0LineInformationFrontier({
    unknownPool:[],unknownPrizeCount:0,
    observedDeckPrintings:['A'],uniformUnknownAllocation:true,
    plans:[{id:'one',requirements:[{printing:'A',count:1}],
      availableUtility:5,missingUtility:-1}]
  });
  assert.equal(actual.exactDenominator,'1');
  assert.equal(actual.preSearchExpectedUtility,5);
  assert.equal(actual.afterSearchExpectedUtility,5);
  assert.equal(actual.informationValue,0);
});

test('known-printing input is bounded and must contain only real printing names',()=>{
  const input={unknownPool:['A'],unknownPrizeCount:0,
    uniformUnknownAllocation:true,
    plans:[{id:'one',requirements:[],availableUtility:1,missingUtility:-1}]};
  assert.throws(()=>k0LineInformationFrontier({
    ...input,observedDeckPrintings:[0]
  }),/Invalid/);
  assert.throws(()=>k0LineInformationFrontier({
    ...input,observedDeckPrintings:Array(60).fill('A')
  }),/Invalid/);
});

test('observing after consuming a shared connector may destroy its only useful fallback',()=>{
  const input={
    unknownPool:['A','B'],unknownPrizeCount:1,
    uniformUnknownAllocation:true,
    plans:[
      {id:'risky',requirements:[{printing:'A',count:1}],
        availableUtility:10,missingUtility:-20},
      {id:'safe',requirements:[],availableUtility:3,missingUtility:3}
    ]
  };
  const free=k0LineInformationFrontier(input);
  assert.equal(free.preSearchExpectedUtility,3);
  assert.equal(free.informationValue,3.5);
  assert.equal(free.modelPrefersObservation,true);
  const priced=k0LineInformationFrontier({...input,observationCost:2});
  assert.equal(priced.netObservationExpectedUtility,4.5);
  assert.equal(priced.netObservationAdvantage,1.5);
  const spent=k0LineInformationFrontier({
    ...input,observationCost:3,postObservationPlanIds:['risky']
  });
  assert.equal(spent.restrictedAfterExpectedUtility,5);
  assert.equal(spent.netObservationExpectedUtility,2);
  assert.equal(spent.netObservationAdvantage,-1);
  assert.equal(spent.modelPrefersObservation,false);
  // Raw free K1 information upper bound survives as an independent metric.
  assert.equal(spent.informationValue,3.5);
});

test('observation may leave no legal follow-up plan while still spending its cost',()=>{
  const priced=k0LineInformationFrontier({
    unknownPool:['A'],unknownPrizeCount:0,
    uniformUnknownAllocation:true,
    observationCost:7,postObservationPlanIds:[],
    plans:[{id:'only',requirements:[],availableUtility:9,missingUtility:0}]
  });
  assert.equal(priced.preSearchExpectedUtility,9);
  assert.equal(priced.restrictedAfterExpectedUtility,0);
  assert.equal(priced.netObservationExpectedUtility,-7);
  assert.equal(priced.netObservationAdvantage,-16);
  assert.equal(priced.modelPrefersObservation,false);
});

test('reject negative costs and post-search plans absent from the original menu',()=>{
  const input={unknownPool:['A'],unknownPrizeCount:0,
    uniformUnknownAllocation:true,
    plans:[{id:'only',requirements:[],availableUtility:1,missingUtility:0}]};
  assert.throws(()=>k0LineInformationFrontier({...input,observationCost:-1}),
    /Invalid/);
  assert.throws(()=>k0LineInformationFrontier({
    ...input,postObservationPlanIds:['other']
  }),/Unknown post-observation/);
  assert.throws(()=>k0LineInformationFrontier({
    ...input,postObservationPlanIds:['only','only']
  }),/Invalid/);
});

test('independent exhaustive small-deck benchmark, 160 deterministic instances',()=>{
  let seed=343;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let trial=0;trial<160;trial++){
    const n=3+rand()%6;
    const pool=Array.from({length:n},()=>['A','B','C'][rand()%3]);
    const P=rand()%Math.min(4,n+1);
    const plans=Array.from({length:2+rand()%3},(_,i)=>({
      id:'line'+i,
      requirements:Array.from({length:rand()%3},()=>({
        printing:['A','B','C','D'][rand()%4],count:1+rand()%2
      })),
      availableUtility:(rand()%18)-7,
      missingUtility:(rand()%18)-9
    }));
    const observationCost=rand()%7;
    const postObservationPlanIds=plans.filter(()=>rand()%2===0)
      .map(plan=>plan.id);
    const input={unknownPool:pool,unknownPrizeCount:P,
      plans,observationCost,postObservationPlanIds,
      uniformUnknownAllocation:true};
    const actual=k0LineInformationFrontier(input);
    const expected=brute(input);
    assert.equal(BigInt(actual.exactDenominator),BigInt(expected.denominator));
    assert.equal(BigInt(actual.preSearchExpectedNumerator),BigInt(expected.pre));
    assert.equal(BigInt(actual.afterSearchExpectedNumerator),BigInt(expected.after));
    assert.equal(BigInt(actual.restrictedAfterExpectedNumerator),
      BigInt(expected.afterRestricted));
    assert.equal(BigInt(actual.netObservationExpectedNumerator),
      BigInt(expected.afterRestricted-observationCost*expected.denominator));
    assert.equal(BigInt(actual.netObservationAdvantageNumerator),
      BigInt(expected.afterRestricted-observationCost*expected.denominator-expected.pre));
    assert.ok(BigInt(actual.informationValueNumerator)>=0n);
  }
});
