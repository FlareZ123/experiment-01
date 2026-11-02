'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceCategoryCounts,choose,countDirectSequence,main}=
  require('../simulation/evaluation/agent40-exeggutor-direct-two-turn-access.cjs');

test('direct resource model uses exactly Agent18 candidate v2 printings',()=>{
  assert.deepEqual(sourceCategoryCounts(),[2,2,10,2,3,41]);
  assert.equal(sourceCategoryCounts().reduce((a,b)=>a+b),60);
});

test('nine-card resource conjunction has an exact Basic-valid denominator',()=>{
  const count=countDirectSequence(sourceCategoryCounts(),7);
  assert.equal(count.favorable,340221072n);
  assert.equal(count.validOpenersDenominator,916872253440n);
  assert.equal(count.allOpenersDenominator,choose(60,7)*53n*52n);
  assert.equal(count.favorableWithoutBasicCondition,340221072n);
  const output=main();
  assert.equal(
    output.directResourceConjunction.conditionalOnLegalBasicOpening.reducedNumerator,
    '7087939');
  assert.equal(
    output.directResourceConjunction.conditionalOnLegalBasicOpening.reducedDenominator,
    '19101505280');
});

test('independent tiny physical-card exhaustive enumeration matches BigInt model',()=>{
  const labels=[0,1,2,3,4,4,5],groups=[1,1,1,1,2,1];
  let favorable=0n,allFav=0n,total=0n,valid=0n;
  for(let a=0;a<labels.length;a++){
    for(let b=a+1;b<labels.length;b++){
      for(let c=b+1;c<labels.length;c++){
        const opener=[a,b,c];
        const openerLabels=opener.map(i=>labels[i]);
        const validBasic=openerLabels.some(i=>i<=2);
        for(let d=0;d<labels.length;d++){
          if(opener.includes(d))continue;
          for(let e=0;e<labels.length;e++){
            if(opener.includes(e)||e===d)continue;
            total++;
            if(validBasic)valid++;
            const first=[...openerLabels,labels[d]],second=[...first,labels[e]];
            const firstWorks=[0,1,3,4].every(type=>first.includes(type));
            const works=firstWorks&&second.filter(type=>type===4).length>=2;
            if(works){
              allFav++;
              if(validBasic)favorable++;
            }
          }
        }
      }
    }
  }
  const observed=countDirectSequence(groups,3);
  assert.equal(total,observed.allOpenersDenominator);
  assert.equal(valid,observed.validOpenersDenominator);
  assert.equal(allFav,observed.favorableWithoutBasicCondition);
  assert.equal(favorable,observed.favorable);
});
