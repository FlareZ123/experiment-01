'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./aichi-rank6-tagcall-firstdraw-access.cjs');

const VERSION='agent6-rank6-previous-turn-k1-speed-prerequisite-exact-v1';

/**
 * Exact location prerequisite for one narrowly defined source-first line:
 * first eight physically seen cards hold Tag Call and unique DCE, no
 * Guzma & Hala, a valid Basic among the original seven, the singleton
 * Thunder in Prizes, G&H still in the searchable deck, and at least one
 * Speed Lightning still in that deck. No player's action feasibility,
 * opponent bonuses, discard acceptability, or wins are represented.
 *
 * The original seven, six Prizes, then next draw have the same unordered
 * eight-card set as a uniform eight-card sample, conditional on which
 * member is the last draw. Every valid eight-set is counted once for
 * each of its 8 potential draw cards; a set with exactly one Basic has
 * only 7 valid choices because that sole Basic cannot be the draw.
 *
 * @param {{basic:number,tag:number,hala:number,thunder:number,dce:number,speed:number,other:number}} counts
 * @param {{openingHand:number,prizes:number}} setup
 * @returns {{favorable:bigint,valid:bigint,bySeenSpeedDeckCount:Record<string,bigint>}}
 */
function exactPreviousTurnK1Gate(counts,setup){
  const category=Object.values(counts);
  assert.equal(category.length,7);
  assert.ok(category.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.equal(counts.thunder,1);
  assert.equal(counts.dce,1);
  assert.ok(setup.openingHand>=1&&Number.isSafeInteger(setup.openingHand));
  assert.ok(setup.prizes>=1&&Number.isSafeInteger(setup.prizes));
  const total=category.reduce((x,y)=>x+y,0);
  const held=setup.openingHand+1;
  assert.ok(total>=held+setup.prizes);
  const unseen=total-held;
  const seenDrawChoices=BigInt(held)*choose(total,held)-
    BigInt(total-setup.openingHand)*
    choose(total-counts.basic,setup.openingHand);
  const valid=seenDrawChoices*choose(unseen,setup.prizes);
  let favorable=0n;
  const bySeenSpeedDeckCount={};
  const speedBucket=n=>{
    const key=String(n);
    if(bySeenSpeedDeckCount[key]===undefined)
      bySeenSpeedDeckCount[key]=0n;
    return key;
  };
  for(let b=1;b<=Math.min(counts.basic,held);b++){
    for(let t=1;t<=Math.min(counts.tag,held-b);t++){
      for(let s=0;s<=Math.min(counts.speed,held-b-t-1);s++){
        const o=held-b-t-1-s;
        if(o<0||o>counts.other)continue;
        const handWays=choose(counts.basic,b)*choose(counts.tag,t)*
          choose(counts.dce,1)*choose(counts.speed,s)*
          choose(counts.other,o);
        const validDraws=BigInt(b===1?held-1:held);
        // Hala and the one Stadium are outside the first eight.
        const restSpeed=counts.speed-s,restHala=counts.hala;
        const remainingOther=unseen-1-restSpeed-restHala;
        if(restSpeed<1||restHala<1||remainingOther<0)continue;
        for(let hPrize=0;hPrize<restHala;hPrize++){
          for(let sPrize=0;sPrize<restSpeed;sPrize++){
            const otherPrize=setup.prizes-1-hPrize-sPrize;
            const prizeWays=choose(1,1)*
              choose(restHala,hPrize)*
              choose(restSpeed,sPrize)*
              choose(remainingOther,otherPrize);
            const weight=handWays*validDraws*prizeWays;
            favorable+=weight;
            const key=speedBucket(restSpeed-sPrize);
            bySeenSpeedDeckCount[key]+=weight;
          }
        }
      }
    }
  }
  assert.equal(Object.values(bySeenSpeedDeckCount)
    .reduce((sum,value)=>sum+value,0n),favorable);
  return {favorable,valid,bySeenSpeedDeckCount};
}

/** Read and verify precisely the original published rank6 physical sixty. */
function originalRank6Inventory(){
  const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=field.decks.find(x=>x.rank===6);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  assert.deepEqual(deck.cards.filter(c=>c.category==='Pokémon')
    .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]]);
  const n=name=>deck.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  const basics=4,tag=n('Tag Call'),hala=n('Guzma & Hala'),
    thunder=n('Thunder Mountain ♢'),dce=n('Double Colorless Energy'),
    speed=n('Speed Lightning Energy');
  assert.deepEqual([basics,tag,hala,thunder,dce,speed],
    [4,2,2,1,1,4]);
  return {basic:basics,tag,hala,thunder,dce,speed,
    other:60-(basics+tag+hala+thunder+dce+speed)};
}

function calculateOriginal(){
  const counts=originalRank6Inventory();
  const result=exactPreviousTurnK1Gate(counts,
    {openingHand:7,prizes:6});
  assert.equal(result.valid,166478632771651200n);
  return {version:VERSION,
    source:'results/aichi-2026/full-decklists.json rank6',
    counts,originalFirstSevenBasicValid:true,
    setup:{openingHand:7,prizes:6,ordinaryDraw:1},
    favorable:String(result.favorable),valid:String(result.valid),
    probability:Number(result.favorable)/Number(result.valid),
    bySeenSpeedDeckCount:Object.fromEntries(
      Object.entries(result.bySeenSpeedDeckCount)
        .map(([k,v])=>[k,String(v)])),
    interpretation:'necessary location conditions only, not sufficient playable attack or competitive game'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(calculateOriginal(),null,2)+'\n');
module.exports={VERSION,exactPreviousTurnK1Gate,
  originalRank6Inventory,calculateOriginal};
