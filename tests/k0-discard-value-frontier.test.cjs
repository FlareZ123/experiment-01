'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {k0DiscardValueFrontier}=require(
  '../simulation/twinleaf/k0-discard-value-frontier.cjs');

/**
 * Independent toy exhaustive enumerator: deal every unordered Prize subset
 * then greedily choose the best surviving actual deck discard selection.
 * @param {object} args
 */
function exhaustive(args){
  const {unknownPool,unknownPrizeCount:P,minDiscards:min,
    maxDiscards:max,utilityByPrinting:values,fallbackUtility:fallback}=args;
  let count=0,total=0,positive=0,forced=0,chosenCount=0,positiveCount=0,
    noPositive=0;
  const selected=new Map();
  const N=unknownPool.length;
  const visit=(from,chosen)=>{
    if(chosen.length===P){
      const prized=new Set(chosen);
      const available=unknownPool.map((name,index)=>({name,index,
        value:Object.hasOwn(values,name)?values[name]:fallback
      })).filter(row=>!prized.has(row.index))
        .sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)||
          a.index-b.index);
      const positives=available.filter(x=>x.value>0);
      const n=Math.max(min,Math.min(max,positives.length));
      for(const item of available.slice(0,n)){
        total+=item.value;
        if(item.value>0){positive+=item.value;positiveCount++;}
        if(item.value<0)forced+=item.value;
        chosenCount++;
        selected.set(item.name,(selected.get(item.name)??0)+1);
      }
      if(!positives.length)noPositive++;
      count++;return;
    }
    for(let i=from;i<=N-(P-chosen.length);i++)visit(i+1,[...chosen,i]);
  };
  visit(0,[]);
  return {
    expectedNetUtility:total/count,expectedPositiveUtility:positive/count,
    expectedForcedCost:forced/count,expectedDiscards:chosenCount/count,
    expectedPositiveDiscards:positiveCount/count,
    probabilityNoPositiveTarget:noPositive/count,
    expectedSelectedCopiesByPrinting:Object.fromEntries(
      [...selected].map(([name,c])=>[name,c/count]))
  };
}

function assertMatches(args){
  const actual=k0DiscardValueFrontier({...args,uniformUnknownAllocation:true});
  const expected=exhaustive(args);
  for(const key of ['expectedNetUtility','expectedPositiveUtility',
    'expectedForcedCost','expectedDiscards','expectedPositiveDiscards',
    'probabilityNoPositiveTarget'])
    assert.ok(Math.abs(actual[key]-expected[key])<1e-10,key);
  for(const name of new Set(args.unknownPool))
    assert.ok(Math.abs(actual.expectedSelectedCopiesByPrinting[name]-
      (expected.expectedSelectedCopiesByPrinting[name]??0))<1e-10,name);
  return actual;
}

test('exact four-card K0 forced/minimal frontier',()=>{
  const args={unknownPool:['best','good','weak','protected'],
    unknownPrizeCount:1,minDiscards:1,maxDiscards:2,
    utilityByPrinting:{best:8,good:3,weak:-2,protected:-9},
    fallbackUtility:-100};
  const result=assertMatches(args);
  assert.equal(result.expectedNetUtility,8.25);
  assert.equal(result.exactNetNumerator,'33');
  assert.equal(result.exactDenominator,'4');
  assert.equal(result.expectedDiscards,1.5);
  assert.equal(result.probabilityNoPositiveTarget,0);
});

test('forced discards can be costly even with an available positive target',()=>{
  assertMatches({unknownPool:['donor','singleton','singleton'],
    unknownPrizeCount:1,minDiscards:2,maxDiscards:2,
    utilityByPrinting:{donor:10,singleton:-30},
    fallbackUtility:-100});
});

test('all beneficial copies can be prized and K1 no-Prize is deterministic',()=>{
  const args={unknownPool:['payload','filler','filler'],
    unknownPrizeCount:1,minDiscards:1,maxDiscards:2,
    utilityByPrinting:{payload:4,filler:-2},fallbackUtility:-10};
  const result=assertMatches(args);
  assert.equal(result.probabilityNoPositiveTarget,1/3);
  assertMatches({...args,unknownPrizeCount:0});
});

test('six-slot joint Prize risk and duplicate-copy utility matches enumeration',()=>{
  assertMatches({unknownPool:['A','A','B','B','C','C','D','E'],
    unknownPrizeCount:6,minDiscards:1,maxDiscards:2,
    utilityByPrinting:{A:8,B:2,C:-1,D:-10,E:-12},
    fallbackUtility:-20});
});

test('exhaustively cross-check deterministic toy utility grids',()=>{
  const names=['A','B','A','C','D','A'];
  for(let P=0;P<=3;P++)for(let min=1;min<=names.length-P;min++)
    for(let max=min;max<=names.length-P;max++){
      assertMatches({unknownPool:names,unknownPrizeCount:P,
        minDiscards:min,maxDiscards:max,
        utilityByPrinting:{A:3,B:-2,C:0,D:7},fallbackUtility:-10});
    }
});

test('fail closed without uniform observation and correct deck limits',()=>{
  const args={unknownPool:['A','B'],unknownPrizeCount:1,
    minDiscards:1,maxDiscards:1,utilityByPrinting:{A:4},
    fallbackUtility:-1};
  assert.throws(()=>k0DiscardValueFrontier(args),/uniform/i);
  assert.throws(()=>k0DiscardValueFrontier({...args,
    uniformUnknownAllocation:true,maxDiscards:2}),/Invalid/);
  assert.throws(()=>k0DiscardValueFrontier({...args,
    uniformUnknownAllocation:true,utilityByPrinting:{A:1.4}}),/Invalid/);
});
