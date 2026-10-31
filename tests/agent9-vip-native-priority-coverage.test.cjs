'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {firstTurnDirectVip,run}=
  require('../scripts/agent9-vip-native-priority-coverage.cjs');

test('source first-root direct-VIP odds cover all nine Crobat+VIP originals',()=>{
  const r=run();
  assert.equal(r.evaluatedCrobatVipSources,9);
  assert.equal(r.competitiveQualifiedGames,0);
  assert.equal(r.completeFullField,false);
  assert.deepEqual(r.rows.map(x=>x.rank),[4,5,8,11,16,19,22,26,30]);
  const expected={
    4:['12.7174686720','2.5332069856','19.9191132363'],
    5:['33.7591002849','3.5729501175','10.5836651076'],
    8:['23.6953909364','2.4480479315','10.3313253539'],
    11:['42.5721550606','4.5439041286','10.6734181583'],
    16:['23.8079142249','4.6341651311','19.4648094215'],
    19:['24.2949266049','2.6910326402','11.0765209706'],
    22:['23.9155887831','2.5431981287','10.6340602851'],
    26:['33.9013819892','3.6366474503','10.7271362905'],
    30:['34.4006393670','3.8437372887','11.1734472364']
  };
  for(const row of r.rows){
    assert.deepEqual([row.firstTurnDirectVipPercent,
      row.directVipAndRetainableCrobatPercent,
      row.conditionalCrobatConflictAmongDirectVipPercent],expected[row.rank]);
    assert.equal(row.firstTurnDrawAppliesBothSeats,true);
  }
});

test('direct VIP valid-first-seven plus first draw matches tiny deck exhaustive',()=>{
  const cards=['B','B','B','V','V','X','X','X','X','X'];
  let valid=0,firstTurnVip=0;
  for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)for(let k=j+1;k<10;k++){
    const hand=[cards[i],cards[j],cards[k]];
    if(!hand.includes('B'))continue;
    for(let next=0;next<10;next++){
      if([i,j,k].includes(next))continue;
      valid++;
      if(hand.includes('V')||cards[next]==='V')firstTurnVip++;
    }
  }
  const x=firstTurnDirectVip({basicCount:3,vipCount:2,total:10,opening:3});
  assert.equal(x.denominator,BigInt(valid));
  assert.equal(x.numerator,BigInt(firstTurnVip));
});

test('first-turn both-seat draw protects against pre-turn seven-only labels',()=>{
  const r=run();
  for(const row of r.rows){
    assert.ok(Number(row.firstTurnDirectVipPercent)>=
      Number(row.directVipAndRetainableCrobatPercent));
    assert.ok(Number(row.conditionalCrobatConflictAmongDirectVipPercent)<20);
  }
});
