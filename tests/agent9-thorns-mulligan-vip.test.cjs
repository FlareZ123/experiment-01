'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {coholdAfterDraws,geometricBonusExposure,run}=
  require('../scripts/agent9-thorns-mulligan-vip.cjs');

function exhaustive(cards){
  let valid=0,success=0;
  for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)for(let k=j+1;k<10;k++){
    const hand=[cards[i],cards[j],cards[k]];
    const c=hand.filter(x=>x==='C').length;
    const o=hand.filter(x=>x==='O').length;
    const v=hand.filter(x=>x==='V').length;
    if(c+o===0)continue;
    const retained=c-(o===0?1:0);
    const remaining=cards.filter((_,idx)=>idx!==i&&idx!==j&&idx!==k);
    for(let a=0;a<remaining.length;a++)for(let b=a+1;b<remaining.length;b++){
      valid++;
      const draw=[remaining[a],remaining[b]];
      if(retained+draw.filter(x=>x==='C').length>=1 &&
         v+draw.filter(x=>x==='V').length>=1)success++;
    }
  }
  return {valid,success};
}

for(const deck of [
  ['C','O','O','V','V','X','X','X','X','X'],
  ['C','C','O','V','V','X','X','X','X','X']
])test('exact two-draw cohold agrees with exhaustive physical toy',()=>{
  const K=deck.filter(x=>x==='C').length;
  const B=deck.filter(x=>x==='C'||x==='O').length;
  const V=deck.filter(x=>x==='V').length;
  const actual=coholdAfterDraws({basicCount:B,vipCount:V,
    crobatCount:K,total:10,opening:3,draws:2});
  const expected=exhaustive(deck);
  assert.equal(actual.numerator,BigInt(expected.success));
  assert.equal(actual.denominator,BigInt(expected.valid));
});

test('rank6 raw geometric bonus and rank11 direct-hand opportunity reproduce',()=>{
  const result=run();
  assert.equal(result.sourceRank,11);
  assert.equal(result.opponentRank,6);
  assert.equal(result.darkAssetAvailabilityUnderUnbrokenInitialization,false);
  assert.ok(Math.abs(result.expectedMulligans-1.503131256095683)<1e-12);
  assert.ok(Math.abs(result.coholdGoingFirst-0.05353895146403526)<1e-12);
  assert.ok(Math.abs(result.coholdGoingSecond-0.06649651778313305)<1e-12);
  assert.ok(result.truncationTailProbability<7e-11);
  assert.equal(geometricBonusExposure({basicCount:11,vipCount:4,
    crobatCount:1},4).samples.length,6);
});

test('printed passive Initialization disables Dark Asset on non-Future Crobat V',()=>{
  const thorns=require('../resources/cards/en/sv6.json')
    .find(card=>card.id==='sv6-77');
  const crobat=require('../resources/cards/en/swsh3.json')
    .find(card=>card.id==='swsh3-104');
  assert.ok(thorns);
  assert.ok(crobat);
  assert.match(thorns.abilities[0].text,/As long as this Pokémon is in the Active Spot/);
  assert.match(thorns.abilities[0].text,/Pokémon with a Rule Box/);
  assert.match(thorns.abilities[0].text,/except for Future Pokémon/);
  assert.equal(thorns.abilities[0].name,'Initialization');
  assert.equal(crobat.abilities[0].name,'Dark Asset');
  assert.ok(crobat.subtypes.includes('V'));
  assert.ok(!crobat.subtypes.includes('Future'));
});
