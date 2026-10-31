'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent3-rank26-donk-prize-witness-upper.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

/**
 * Exact conditional probability that two disjoint named card families are
 * present by the first \`opening + draws\` physical draws, conditioning on
 * at least one Basic in the original opening. No mulligan bonus or card
 * effect draw is included. Prize placement is marginalized by exchangeability.
 *
 * Inclusion-exclusion over missing held families avoids a large sample Monte
 * Carlo and never assumes the two Supporters are simultaneously playable.
 *
 * @param {{total:number,basic:number,first:number,second:number,
 * opening:number,draws:number}} config
 */
function conditionalJointHold(config){
  const {total,basic,first,second,opening,draws}=config;
  for(const x of [total,basic,first,second,opening,draws])
    assert.ok(Number.isSafeInteger(x)&&x>=0);
  assert.ok(total===60&&opening===7&&draws<=2);
  assert.ok(basic>0&&first>0&&second>0&&
    basic+first+second<=total);
  const valid=choose(total,opening)-choose(total-basic,opening);
  const totalFuture=choose(total-opening,draws);
  let numerator=0n;
  for(const [missing,sign] of [
    [0,1n],[first,-1n],[second,-1n],[first+second,1n]
  ]){
    const n=total-missing;
    numerator+=sign*(choose(n,opening)-choose(n-basic,opening))*
      choose(n-opening,draws);
  }
  const denominator=valid*totalFuture;
  assert.ok(numerator>=0n&&numerator<=denominator);
  const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
  const d=gcd(numerator,denominator);
  return {numerator:(numerator/d).toString(),
    denominator:(denominator/d).toString(),
    probability:Number(numerator)/Number(denominator),
    assumption:'Basic-valid first seven, uniform card order, ordinary draws only',
    evaluatedEvent:'Both distinct Supporter families physically held before any use',
    simultaneousSupporterPlayPermitted:false};
}

/** Fixed published Iron Thorns ranks as authentic first-seven baselines. */
function originalThornsSupporterOverlap(){
  const rows=[];
  for(const rank of [6,24,29]){
    const source=field.decks.find(d=>d.rank===rank);
    assert.ok(source);
    const n=name=>source.cards.filter(card=>card.name===name)
      .reduce((sum,card)=>sum+card.count,0);
    const total=source.cards.reduce((sum,c)=>sum+c.count,0);
    assert.equal(total,60);
    const basic=n('Iron Thorns ex');
    assert.equal(basic,4);
    assert.deepEqual(source.cards.filter(c=>c.category==='Pokémon')
      .map(c=>c.name),['Iron Thorns ex']);
    const first=n('Plumeria'),second=n('Team Flare Grunt');
    assert.equal(first,4);assert.equal(second,2);
    rows.push({rank,source60:total,sourcePrintings:{
      plumeria:'Plumeria BUS',flare:'Team Flare Grunt XY'},
      copies:{basic,plumeria:first,flare:second},
      firstSeven:conditionalJointHold({total,basic,first,second,
        opening:7,draws:0}),
      sevenPlusOne:conditionalJointHold({total,basic,first,second,
        opening:7,draws:1}),
      sevenPlusTwo:conditionalJointHold({total,basic,first,second,
        opening:7,draws:2})
    });
  }
  return {schema:'agent4-original-iron-thorns-contested-supporter-access-v1',
    rows,qualifications:{sourceFieldAuthenticated:29,
      enemyEnergyExposedUnverified:true,playingSupporterUnverified:true,
      discardCostAffordableUnverified:true,nativeActionUnverified:true,
      matchupGameWinRateUnverified:true}};
}
module.exports={conditionalJointHold,originalThornsSupporterOverlap};
if(require.main===module)
  process.stdout.write(JSON.stringify(originalThornsSupporterOverlap(),null,2)+'\n');
