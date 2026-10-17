'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {BASICS,choose,exactPriorityEvents,fraction,run}=
  require('../scripts/aichi-bunnelby-bench-priority.cjs');

test('rank2 published 60 produces exact and stable target-displacement count',()=>{
  const report=run();
  assert.equal(report.sourceBasicCount,14);
  assert.equal(report.denominator,'20468966760');
  assert.equal(report.conditioned,'2496485964');
  assert.equal(report.nonStageDisplacement,'388364430');
  assert.equal(report.anyStageOmitted,'446631480');
  assert.equal(report.fullBenchExcluded,'904992');
  assert.ok(Math.abs(report.P_displacement_given_condition-
    0.15556443561082245)<1e-12);
  assert.ok(Math.abs(report.P_displacement-0.01897332848079724)<1e-12);
});

test('exact multivariate model matches independent physical-order toy enumeration',()=>{
  const toy=[
    {name:'Bunnelby',count:1,hp:60,damage:0,abilities:0,retreat:2,stage:false},
    {name:'Oddish',count:1,hp:50,damage:20,abilities:0,retreat:1,stage:true},
    {name:'Fan Rotom',count:1,hp:70,damage:70,abilities:1,retreat:1,stage:false},
    {name:'Relicanth',count:1,hp:100,damage:30,abilities:1,retreat:1,stage:false}
  ];
  const exact=exactPriorityEvents({
    cards:toy,otherCount:4,hand:3,viewed:4,benchLimit:3
  });
  const physical=['Bunnelby','Oddish','Fan Rotom','Relicanth',
    'other1','other2','other3','other4'];
  let total=0,conditioned=0,displaced=0,any=0,excluded=0;
  const scores={'Bunnelby':8,'Oddish':18,'Fan Rotom':45,'Relicanth':38};
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      if(j===i)continue;
      for(let k=0;k<8;k++){
        if(k===i||k===j)continue;
        for(let m=0;m<8;m++){
          if(m===i||m===j||m===k)continue;
          total++;
          const seen=[physical[i],physical[j],physical[k],physical[m]];
          if(!seen.slice(0,3).includes('Bunnelby'))continue;
          const basics=seen.filter(name=>name in scores);
          basics.splice(basics.indexOf('Bunnelby'),1);
          if(basics.length>3){excluded++;continue;}
          if(!basics.includes('Oddish'))continue;
          conditioned++;
          const firstTwo=[...basics].sort((a,b)=>scores[b]-scores[a]).slice(0,2);
          if(!firstTwo.includes('Oddish')){
            any++;
            if(firstTwo.some(name=>name!=='Oddish'))displaced++;
          }
        }
      }
    }
  }
  assert.equal(total,1680);
  assert.equal(fraction(exact.conditioned,exact.denominator),
    conditioned/total);
  assert.equal(fraction(exact.nonStageDisplacement,exact.denominator),
    displaced/total);
  assert.equal(fraction(exact.anyStageOmitted,exact.denominator),any/total);
  assert.equal(fraction(exact.fullBenchExcluded,exact.denominator),
    excluded/total);
});

test('published card scoring keeps no-Stage support Basics above Oddish',()=>{
  const byName=new Map(BASICS.map(card=>[card.name,
    .3*card.hp+.4*card.damage+card.abilities-5*card.retreat]));
  assert.equal(byName.get('Oddish'),18);
  assert.equal(byName.get('Pidgey'),18);
  assert.equal(byName.get('Fan Rotom'),45);
  assert.equal(byName.get('Relicanth'),38);
  assert.equal(byName.get('Girafarig'),50);
  assert.equal(choose(60,8),2558620845n);
});
