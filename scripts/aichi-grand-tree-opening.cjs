'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n) return 0n;
  let a=1n;
  const m=Math.min(k,n-k);
  for(let i=1;i<=m;i++) a=a*BigInt(n-m+i)/BigInt(i);
  return a;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
/** @param {bigint} numerator @param {bigint} denominator */
function rational(numerator,denominator){
  assert.ok(denominator>0n&&numerator>=0n);
  const d=gcd(numerator,denominator);
  return {numerator:String(numerator/d),denominator:String(denominator/d),
    percent:Number(numerator)*100/Number(denominator)};
}

/**
 * Exact physical event among valid opening sevens: hand contains Grand Tree
 * and Oddish; after six unknown Prizes, at least one Gloom and one selected
 * Stage 2 is in the deck. Other 12 Basic Pokemon determine mulligan filtering.
 *
 * @param {number} stage2Copies 2=AOR only, 3=all Vileplume chains.
 * @returns {object}
 */
function quantify(stage2Copies){
  const totalBasics=14,otherBasics=totalBasics-2;
  const others=60-1-2-2-stage2Copies-otherBasics;
  const denominator=(choose(60,7)-choose(60-totalBasics,7))*choose(53,6);
  let ways=0n,handWays=0n;
  for(let tree=0;tree<=1;tree++)
    for(let oddish=0;oddish<=2;oddish++)
      for(let gloom=0;gloom<=2;gloom++)
        for(let stage2=0;stage2<=stage2Copies;stage2++)
          for(let basics=0;basics<=otherBasics;basics++){
            const other=7-tree-oddish-gloom-stage2-basics;
            if(other<0||other>others||tree!==1||oddish===0)continue;
            const n=choose(1,tree)*choose(2,oddish)*choose(2,gloom)*
              choose(stage2Copies,stage2)*choose(otherBasics,basics)*choose(others,other);
            handWays+=n;
            const remGloom=2-gloom,remStage2=stage2Copies-stage2;
            const eligible=choose(53,6)-choose(53-remGloom,6-remGloom)-
              choose(53-remStage2,6-remStage2)+
              choose(53-remGloom-remStage2,6-remGloom-remStage2);
            ways+=n*eligible;
          }
  return {stage2Copies,openingHandOnly:rational(handWays,
      choose(60,7)-choose(60-totalBasics,7)),
    stillInDeckAfterSixPrizes:rational(ways,denominator)};
}
/** @returns {object} */
function run(){
  const file=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  const basics={
    2:['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
      'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'],
    15:['Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom',
      'Budew','Eldegoss V','Tatsugiri']
  };
  const source=[];
  for(const rank of [2,15]){
    const deck=manifest.decks.find(d=>d.rank===rank);
    assert.ok(deck,'Missing published rank '+rank);
    const count=name=>deck.cards.filter(c=>c.name===name)
      .reduce((a,c)=>a+c.count,0);
    const totalBasics=deck.cards.filter(c=>basics[rank].includes(c.name))
      .reduce((a,c)=>a+c.count,0);
    const otherVileplume=rank===2?'Vileplume-GX':'Vileplume';
    const stage2=count('Vileplume')+count('Vileplume-GX');
    assert.deepEqual([count('Grand Tree'),count('Oddish'),count('Gloom'),stage2,totalBasics],
      [1,2,2,3,14],'Source card quantities changed for rank '+rank);
    source.push({rank,player:deck.player,grandTree:1,oddish:2,gloom:2,
      stage2Total:3,otherStage2:otherVileplume,eligibleBasicCount:totalBasics});
  }
  const aorOnly=quantify(2),allStage2=quantify(3);
  assert.equal(aorOnly.stillInDeckAfterSixPrizes.numerator,'545905');
  assert.equal(aorOnly.stillInDeckAfterSixPrizes.denominator,'22178816');
  assert.ok(Math.abs(aorOnly.stillInDeckAfterSixPrizes.percent-2.4613802648437137)<1e-10);
  assert.equal(allStage2.stillInDeckAfterSixPrizes.numerator,'297823067');
  assert.equal(allStage2.stillInDeckAfterSixPrizes.denominator,'11754772480');
  return {kind:'exact-restricted-opening-resource-opportunity',source,aorOnly,allStage2,
    caveat:'Direct opening seven and six unknown Prizes only; no card search, first draw, opponent interaction, Stadium selection or competitive match odds'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={choose,rational,quantify,run};
