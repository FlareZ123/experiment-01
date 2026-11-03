'use strict';

const assert = require('node:assert/strict');

const TARGETS = Object.freeze({
  trubbish: ['Trubbish', 'FST', '168'],
  arven: ['Arven', 'SVI', '166'],
  shake: ['Boost Shake', 'EVS', '142'],
  stone: ['Float Stone', 'BKT', '137'],
  garbodor: ['Garbodor', 'BKP', '57']
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const size = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= size; i++) {
    value = value * BigInt(n - size + i) / BigInt(i);
  }
  return value;
}

/**
 * Count exact disjoint hand/prize allocations for a narrow sufficient line.
 * t=Trubbish, a=Arven, s=Boost Shake, f=Float Stone, g=Garbodor.
 * The remaining cards are otherwise unconstrained.
 * A direct line holds T+S+F and has G in deck. The Arven line holds T+A,
 * and has S+F+G each still in the deck after six Prizes.
 * A real turn may be locked or strategically dominated. These are resource
 * opportunities only, never observed moves or game wins.
 *
 * @param {{t:number,a:number,s:number,f:number,g:number,other:number,
 *   handSize?:number,prizes?:number}} quantities
 * @returns {{denominator:string,direct:string,arven:string,union:string,
 *   directProbability:number,arvenProbability:number,unionProbability:number}}
 */
function exactResourceLineCounts(quantities) {
  const {t, a, s, f, g, other, handSize=7, prizes=6} = quantities;
  const groups=[t,a,s,f,g,other];
  assert.ok(groups.every(n=>Number.isSafeInteger(n)&&n>=0));
  const deckSize=groups.reduce((x,y)=>x+y,0);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=0&&
    Number.isSafeInteger(prizes)&&prizes>=0&&handSize+prizes<=deckSize);
  const postHand=deckSize-handSize;
  const prizeWays=choose(postHand,prizes);
  const denominator=choose(deckSize,handSize)*prizeWays;
  assert.ok(denominator>0n);
  let direct=0n, arven=0n, union=0n;
  const maxH=[t,a,s,f,g].map(n=>Math.min(n,handSize));
  for(let ht=1;ht<=maxH[0];ht++) {
    for(let ha=0;ha<=maxH[1];ha++) {
      for(let hs=0;hs<=maxH[2];hs++) {
        for(let hf=0;hf<=maxH[3];hf++) {
          for(let hg=0;hg<=maxH[4];hg++) {
            const ho=handSize-ht-ha-hs-hf-hg;
            if(ho<0||ho>other)continue;
            const handWays=choose(t,ht)*choose(a,ha)*choose(s,hs)*
              choose(f,hf)*choose(g,hg)*choose(other,ho);
            const remaining=[s-hs,f-hf,g-hg];
            const rg=remaining[2];
            // At least one Garbodor remains after all six Prizes.
            const goodG=prizeWays-choose(postHand-rg,prizes-rg);
            const directWays=hs>0&&hf>0?goodG:0n;
            let allThree=0n;
            if(ha>0) {
              // Inclusion-exclusion of the three bad events in which every
              // remaining Shake, Stone, or Garbodor is in the Prize cards.
              for(let mask=0;mask<8;mask++) {
                let r=0, selected=0;
                for(let i=0;i<3;i++)if(mask&(1<<i)){
                  r+=remaining[i];selected++;
                }
                const term=choose(postHand-r,prizes-r);
                allThree+=selected%2?-term:term;
              }
            }
            direct+=handWays*directWays;
            arven+=handWays*allThree;
            // Direct and Arven overlap: do not double count.
            union+=handWays*(directWays>0n?directWays:allThree);
          }
        }
      }
    }
  }
  assert.ok(direct>=0n&&arven>=0n&&union>=direct&&union>=arven&&
    union<=direct+arven&&union<=denominator);
  return {
    denominator:String(denominator),direct:String(direct),arven:String(arven),
    union:String(union),directProbability:Number(direct)/Number(denominator),
    arvenProbability:Number(arven)/Number(denominator),
    unionProbability:Number(union)/Number(denominator)
  };
}

/** @param {object[]} cards @param {[string,string,string]} key */
function countPrinting(cards,key){
  return cards.reduce((sum,card)=>sum+(
    card.name===key[0]&&card.printing?.set===key[1]&&
    String(card.printing?.number)===key[2]?card.count:0),0);
}

/**
 * @param {object} deck A fixed 60-card deck manifest (source or challenger).
 * @param {number} basicCount Externally verified number of starting Basics.
 * @returns {object} Exact source-resource opportunities and conditional rates.
 */
function analyzeFixedSixty(deck,basicCount){
  assert.ok(deck&&Array.isArray(deck.cards));
  assert.ok(deck.cards.every(c=>Number.isSafeInteger(c.count)&&c.count>0));
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.ok(Number.isSafeInteger(basicCount)&&basicCount>=1&&basicCount<=60);
  const counts=Object.fromEntries(Object.entries(TARGETS).map(
    ([key,identity])=>[key,countPrinting(deck.cards,identity)]));
  const t=counts.trubbish,a=counts.arven,s=counts.shake;
  const f=counts.stone,g=counts.garbodor;
  const other=60-t-a-s-f-g;
  const raw=exactResourceLineCounts({t,a,s,f,g,other});
  const validOpeningProbability=1-Number(choose(60-basicCount,7))/Number(choose(60,7));
  return {...raw,counts,basicCount,validOpeningProbability,
    directConditionalValid:raw.directProbability/validOpeningProbability,
    arvenConditionalValid:raw.arvenProbability/validOpeningProbability,
    unionConditionalValid:raw.unionProbability/validOpeningProbability,
    scope:'seven physical opening cards, then six random Prizes; no draw/search, '+
      'mulligan bonus, opposing lock, decision policy, or native-game evidence'};
}

module.exports={TARGETS,choose,exactResourceLineCounts,analyzeFixedSixty};
