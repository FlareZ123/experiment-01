'use strict';

const assert=require('node:assert/strict');
const {choose,exactNaturalGuzmaSighting}=
  require('./agent40-field-guzma-first-nine.cjs');

const VERSION='agent28-rank1-second-turn-guzma-wonder-tag-v1';

/**
 * Rank1 starts first, then Sentinel establishes Vileplume on global turn 2.
 * The first player normally sees seven opening cards plus its turn-3 draw.
 * A held Tapu Lele-GX that must start Active is unavailable to Bench; drawing
 * another Tapu Lele-GX creates a new Bench-accessible Wonder Tag.
 * @param {number} startingLele
 * @param {number} startingOtherBasic
 * @param {boolean} drawsLele
 */
function hasBenchPlayableLele(startingLele,startingOtherBasic,drawsLele){
  assert.ok(Number.isSafeInteger(startingLele)&&startingLele>=0);
  assert.ok(Number.isSafeInteger(startingOtherBasic)&&startingOtherBasic>=0);
  assert.ok(startingLele+startingOtherBasic>0,'Legal opening seven required');
  return startingLele-(startingOtherBasic===0?1:0)+Number(drawsLele)>0;
}

/**
 * Exact physical first-seven / six-Prize / one-next-draw enumeration.
 * Only a strategic opportunity predicate, not real opponent policy or success.
 * @param {{guzmaCopies?:1,leleCopies?:number,otherBasicCopies?:number}} [options]
 */
function exactOpeningResponse(options={}){
  const g=options.guzmaCopies??1;
  const l=options.leleCopies??2;
  const b=options.otherBasicCopies??12;
  const o=60-g-l-b;
  assert.equal(g,1,'Precisely one original rank1 Guzma');
  assert.ok(Number.isSafeInteger(l)&&l>=0&&l<=4);
  assert.ok(Number.isSafeInteger(b)&&b>=0&&b+l>=1);
  assert.ok(o>=0);
  const sizes=[g,l,b,o];
  let full=0n,valid=0n,direct=0n,wonder=0n;
  for(let hg=0;hg<=g;hg++){
    for(let hl=0;hl<=l;hl++){
      for(let hb=0;hb<=b;hb++){
        const ho=7-hg-hl-hb;
        if(ho<0||ho>o)continue;
        const hand=[hg,hl,hb,ho];
        const remaining=sizes.map((n,i)=>n-hand[i]);
        const handWays=sizes.reduce((w,n,i)=>w*choose(n,hand[i]),1n);
        for(let pg=0;pg<=Math.min(6,remaining[0]);pg++){
          for(let pl=0;pl<=Math.min(6-pg,remaining[1]);pl++){
            for(let pb=0;pb<=Math.min(6-pg-pl,remaining[2]);pb++){
              const po=6-pg-pl-pb;
              if(po<0||po>remaining[3])continue;
              const prizes=[pg,pl,pb,po];
              const prizeWays=remaining.reduce((w,n,i)=>w*choose(n,prizes[i]),1n);
              const deck=remaining.map((n,i)=>n-prizes[i]);
              for(let drawCategory=0;drawCategory<4;drawCategory++){
                const drawn=deck[drawCategory];
                if(!drawn)continue;
                const weight=handWays*prizeWays*BigInt(drawn);
                full+=weight;
                if(hl+hb===0)continue;
                valid+=weight;
                const natural=hg>0||drawCategory===0;
                // Prized Guzma cannot be obtained by an unrestricted deck search.
                const leleAccess=!natural&&pg===0&&
                  hasBenchPlayableLele(hl,hb,drawCategory===1);
                if(natural)direct+=weight;
                if(leleAccess)wonder+=weight;
              }
            }
          }
        }
      }
    }
  }
  const expectedFull=choose(60,7)*choose(53,6)*47n;
  const expectedValid=(choose(60,7)-choose(60-l-b,7))*choose(53,6)*47n;
  assert.equal(full,expectedFull);
  assert.equal(valid,expectedValid);
  assert.ok(direct+wonder<=valid);
  const pct=n=>100*Number(n)/Number(valid);
  return {
    version:VERSION,
    eligibleSourceState:'rank1 going first, initial seven/six Prizes, one normal turn-3 draw',
    cardCounts:{guzma:g,tapuLeleGx:l,otherBasic:b,other:o},
    conditionalOnBasicValidSeven:true,
    noOtherDrawOrBonusMulligans:true,
    initialHandsAndPrizesAndNextDraw:full.toString(),
    validOpeners:valid.toString(),
    directGuzma:{
      count:direct.toString(),percent:pct(direct)
    },
    additionalBenchPlayableWonderTag:{
      count:wonder.toString(),percent:pct(wonder)
    },
    combinedOpportunity:{
      count:(direct+wonder).toString(),percent:pct(direct+wonder)
    },
    caveat:'Access requires a free Bench space, Wonder Tag enabled and retained hand cards; source and opponent policies are unmodeled; no games.'
  };
}

/** Verify the genuine published rank1 source counts used for the calculation. */
function originalRank1Parameters(){
  const field=require('../../results/aichi-2026/full-decklists.json');
  const snapshot=require('../../results/aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json');
  const deck=field.decks.find(d=>d.rank===1);
  const basic=snapshot.ranks.find(d=>d.rank===1);
  assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
  const sum=name=>deck.cards.filter(c=>c.name===name).reduce((n,c)=>n+c.count,0);
  const actual={guzmaCopies:sum('Guzma'),leleCopies:sum('Tapu Lele-GX'),
    otherBasicCopies:basic.basics-sum('Tapu Lele-GX')};
  assert.deepEqual(actual,{guzmaCopies:1,leleCopies:2,otherBasicCopies:12});
  return actual;
}

if(require.main===module){
  console.log(JSON.stringify(exactOpeningResponse(originalRank1Parameters()),null,2));
}

module.exports={VERSION,hasBenchPlayableLele,exactOpeningResponse,originalRank1Parameters};
