'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {valueK0ComplementarySearch} =
  require('../simulation/twinleaf/agent22-k0-complementarity-search.cjs');

function value(pool,prizes,weights,lines,opts={}) {
  return valueK0ComplementarySearch({
    inventory:{pool,observedDeckPrintings:opts.known??[],
      deckCount:pool.length-prizes,prizeCount:prizes},
    ownHand:opts.hand??[],weights,lines,perCardCost:opts.cost??0,
    maxCards:opts.max??2,uniformUnknownAllocation:true});
}
function near(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-10,
    'Expected '+expected+'; got '+actual);
}
const ab={name:'A+B',requirements:{A:1,B:1},reward:12};

test('physical Prizes limit complementary two-card search exactly',()=>{
  const r=value(['A','B','F','F'],1,{},[ab],{cost:1});
  near(r.expectedOptimalUtility,4.5);
  near(r.probabilityLinePhysicallyCompletable,0.5);
  near(r.probabilityOptimalChoiceCompletesNewLine,0.5);
  near(r.expectedOptimalCardsChosen,1.5);
  assert.equal(r.exactPrizeDenominator,'4');
  assert.equal(r.enumeratedPrizeClassConfigurations,3);
});

test('one-card search cannot assemble two missing pieces',()=>{
  const r=value(['A','B','F','F'],1,{},[ab],{max:1,cost:1});
  near(r.expectedOptimalUtility,-1);
  near(r.probabilityLinePhysicallyCompletable,0);
});

test('held A reduces requirements with exact B-Prized branch',()=>{
  const r=value(['B','F','F'],1,{},[ab],{hand:['A'],cost:1});
  near(r.expectedOptimalUtility,7);
  near(r.probabilityLinePhysicallyCompletable,2/3);
  near(r.expectedOptimalCardsChosen,1);
});

test('additive greed misses a joint-search bundle despite enough targets',()=>{
  const r=value(['A','B','C','F'],0,{A:4,B:4,C:9},
    [{name:'A+B',requirements:{A:1,B:1},reward:20}],{max:2});
  near(r.expectedOptimalUtility,28);
  near(r.expectedAdditiveChoiceUtility,13);
  near(r.expectedAdditiveRegret,15);
  near(r.probabilityOptimalChoiceCompletesNewLine,1);
});

test('an already completed line cannot be counted twice',()=>{
  const r=value(['A','F'],0,{},[ab],{hand:['A','B'],cost:1});
  near(r.expectedOptimalUtility,-1);
  near(r.probabilityLinePhysicallyCompletable,0);
  near(r.probabilityOptimalChoiceCompletesNewLine,0);
});

test('a known filler is a mandatory fallback if only target is Prized',()=>{
  const r=value(['A'],1,{},[ab],{hand:['B'],known:['F'],cost:2});
  near(r.expectedOptimalUtility,-2);
  near(r.expectedOptimalCardsChosen,1);
});

test('multiset permutation does not change K0 expectation',()=>{
  const a=value(['A','B','F','A','C'],2,{A:2,C:4},[ab],{max:3,cost:1});
  const b=value(['C','A','F','B','A'],2,{A:2,C:4},[ab],{max:3,cost:1});
  near(a.expectedOptimalUtility,b.expectedOptimalUtility);
  near(a.expectedAdditiveRegret,b.expectedAdditiveRegret);
  assert.equal(a.exactPrizeDenominator,'10');
});

test('multiple mutually exclusive lines count their max, not their sum',()=>{
  const r=value(['A','B','C'],0,{},[
    {name:'AB',requirements:{A:1,B:1},reward:10},
    {name:'AC',requirements:{A:1,C:1},reward:8}],{max:3});
  near(r.expectedOptimalUtility,10);
  near(r.expectedOptimalCardsChosen,2);
});

test('validate no-deck, hidden allocation premise and invalid count',()=>{
  assert.throws(()=>value([],0,{},[ab]),/No physical card/);
  assert.throws(()=>valueK0ComplementarySearch({
    inventory:{pool:['A'],observedDeckPrintings:[],
      deckCount:0,prizeCount:1},ownHand:[],weights:{},lines:[ab],
      perCardCost:0,maxCards:2}),/true/);
  assert.throws(()=>value(['A'],0,{},[
    {name:'invalid',requirements:{A:-1},reward:5}]));
});

test('independent physical Prize-subset oracle verifies exact expectation',()=>{
  const pool=['A','A','B','C','F'];
  const weights={A:2,B:3,C:7};
  const lines=[{name:'AB',requirements:{A:1,B:1},reward:10}];
  const model=value(pool,2,weights,lines,{max:2,cost:1});
  const outcomes=[];
  function earned(cards) {
    const counts={};
    const solo=cards.reduce((s,name)=>{
      counts[name]=(counts[name]??0)+1;
      return s+(weights[name]??0)/counts[name];
    },0)-cards.length;
    return [solo,solo+(counts.A&&counts.B?10:0)];
  }
  for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
    const deck=pool.filter((_,k)=>k!==i&&k!==j);
    const picks=[];
    for(let a=0;a<deck.length;a++){
      picks.push([deck[a]]);
      for(let b=a+1;b<deck.length;b++)picks.push([deck[a],deck[b]]);
    }
    const pairs=picks.map(earned);
    const additive=pairs.reduce((p,x)=>x[0]>p[0]?x:p);
    outcomes.push({optimal:Math.max(...pairs.map(x=>x[1])),
      additive:additive[1]});
  }
  const mean=key=>outcomes.reduce((s,x)=>s+x[key],0)/outcomes.length;
  near(model.expectedOptimalUtility,mean('optimal'));
  near(model.expectedAdditiveChoiceUtility,mean('additive'));
  assert.equal(model.exactPrizeDenominator,'10');
});

test('original rank7 hypothetical target counts retain analytic Prize bound',()=>{
  const pool=[...Array(3).fill('VS Seeker PHF'),
    ...Array(3).fill('Counter Catcher PAR'),
    ...Array(2).fill('Capture Energy RCL'),
    ...Array(45).fill('Other')];
  const r=value(pool,6,{
    'VS Seeker PHF':4,'Counter Catcher PAR':9,
    'Capture Energy RCL':3},[
    {name:'hypothetical VS+Capture bridge',
      requirements:{'VS Seeker PHF':1,'Capture Energy RCL':1},
      reward:20}],{max:3,cost:1});
  near(r.probabilityLinePhysicallyCompletable,0.9882629975066952);
  near(r.expectedAdditiveRegret,17.7131979206777);
  assert.equal(r.exactPrizeDenominator,'22957480');
  assert.equal(r.enumeratedPrizeClassConfigurations,44);
});

test('optimistic and pessimistic additive-only ties expose regret bounds',()=>{
  const r=value(['A','F'],0,{},[
    {name:'single',requirements:{A:1},reward:10}],{max:1});
  near(r.expectedOptimalUtility,10);
  near(r.expectedAdditiveChoiceUtility,10);
  near(r.expectedAdditiveRegret,0);
  near(r.expectedWorstTiedAdditiveChoiceUtility,0);
  near(r.expectedWorstTiedAdditiveRegret,10);
});
