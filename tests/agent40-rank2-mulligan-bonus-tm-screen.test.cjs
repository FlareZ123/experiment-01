'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ID,VALID_OPENING,evaluate:baselineEvaluate,generator}=
  require('../scripts/agent7-vileplume-artazon-capture-opening.cjs');
const {
  VERSION,evaluateBonusLayout,sampleOpeningBonusScreen,
  legalSevenProbability,possibleRank2Bonuses,summarizeBonusCaps,
  originalRank2Pool
}=require('../simulation/evaluation/agent40-rank2-mulligan-bonus-tm-screen.cjs');

function makeControlled(){
  const remaining=Array.from(originalRank2Pool());
  function take(id){
    const i=remaining.indexOf(id);
    assert.ok(i>=0);
    return remaining.splice(i,1)[0];
  }
  const opener=[take(ID.B)];
  while(opener.length<7)opener.push(take(ID.OTHER));
  const prizes=[take(ID.Gloom)];
  while(prizes.length<6)prizes.push(take(ID.OTHER));
  const ordinaryDraw=take(ID.OTHER);
  const firstBonus=take(ID.GH);
  const secondBonus=take(ID.Gloom);
  const cards=Uint8Array.from([
    ...opener,...prizes,ordinaryDraw,firstBonus,secondBonus,...remaining
  ]);
  assert.equal(cards.length,60);
  return cards;
}

test('exact source rank2 60 and pinned baseline m0 original deck access',()=>{
  const pool=originalRank2Pool();
  assert.equal(pool.length,60);
  assert.equal(pool.filter(x=>x===ID.B).length,2);
  assert.equal(pool.filter(x=>x===ID.GH).length,4);
  assert.equal(VERSION.includes('agent40-'),true);
  const rand=generator(40261102);
  const a=Uint8Array.from(pool);
  for(let trial=0;trial<200;trial++){
    const swaps=[];
    for(let j=0;j<60;j++){
      const k=j+Math.floor(rand()*(60-j));
      const x=a[j];a[j]=a[k];a[k]=x;
      swaps.push(k);
    }
    assert.equal(evaluateBonusLayout(a,0)[0],
      baselineEvaluate(a).ready,
      'Zero bonuses must exactly reproduce Agent7 original setup screen');
    for(let j=59;j>=0;j--){
      const k=swaps[j],x=a[j];a[j]=a[k];a[k]=x;
    }
  }
});

test('one bonus can expose G&H and another can strand the last Gloom',()=>{
  const cards=makeControlled();
  assert.deepEqual(evaluateBonusLayout(cards,2),[false,true,false]);
});

test('a bonus-drawn Bunnelby cannot become the initial Active',()=>{
  const cards=makeControlled();
  const first=cards.indexOf(ID.B);
  assert.ok(first<7);
  assert.equal(cards[14],ID.GH,'Known first optional bonus slot');
  const tmp=cards[first];cards[first]=cards[14];cards[14]=tmp;
  assert.equal(cards[14],ID.B,'Bunnelby is now bonus-drawn');
  assert.equal(cards.slice(0,7).includes(ID.B),false,
    'Original seven has no starting eligible Bunnelby');
  assert.deepEqual(evaluateBonusLayout(cards,2),[false,false,false]);
});

test('two Prized Gloom terminate this exact double-stage search line',()=>{
  const cards=makeControlled();
  const last=cards.indexOf(ID.Gloom,14);
  assert.equal(last,15);
  const replace=cards.indexOf(ID.OTHER,16);
  const tmp=cards[8];cards[8]=cards[last];cards[last]=tmp;
  assert.equal(cards[7],ID.Gloom);
  assert.equal(cards[8],ID.Gloom);
  assert.deepEqual(evaluateBonusLayout(cards,2),[false,false,false]);
  assert.ok(replace>=16);
});

test('source manifest simulation is reproducible and m0 matches original oracle',()=>{
  const pool=originalRank2Pool();
  const r1=sampleOpeningBonusScreen(pool,5000,1729,6);
  const r2=sampleOpeningBonusScreen(pool,5000,1729,6);
  assert.deepEqual(r1,r2);
  assert.equal(r1.samples,5000);
  assert.equal(r1.maxBonus,6);
  assert.equal(r1.ready.length,7);
  assert.equal(r1.validSevenProbability,VALID_OPENING);
  assert.ok(r1.conditionalReady.every(p=>p>=0&&p<=1));
});

test('simultaneous both-invalid mulligans restart without awarding bonus',()=>{
  const p6=legalSevenProbability(4);
  const p1=legalSevenProbability(14);
  assert.ok(p6>0.39&&p6<0.41);
  assert.equal(p1,VALID_OPENING);
  const six=possibleRank2Bonuses(4,25);
  const one=possibleRank2Bonuses(14,25);
  assert.ok(Math.abs(six.weight.reduce((a,b)=>a+b,0)+six.tail-1)<1e-12);
  assert.ok(Math.abs(one.weight.reduce((a,b)=>a+b,0)+one.tail-1)<1e-12);
  assert.ok(six.rank2GetsAnyBonus>one.rank2GetsAnyBonus);
  assert.ok(six.rank2GetsAnyBonus>0.56&&six.rank2GetsAnyBonus<0.57);
});

test('bonus caps use a single conditional readiness profile and exact tail',()=>{
  const rate=[0.2,0.3,0.1,0.0];
  const s=summarizeBonusCaps(rate,4);
  assert.equal(s.readinessByBlindBonusCap.length,4);
  assert.equal(s.sampledBestCap,1);
  assert.equal(s.readinessByBlindBonusCap[0],rate[0]);
  assert.ok(s.readyWithAllBonusesLower<=
    s.readyWithAllBonusesUpper);
  assert.ok(s.readyWithAllBonusesUpper-s.readyWithAllBonusesLower<0.25);
});
