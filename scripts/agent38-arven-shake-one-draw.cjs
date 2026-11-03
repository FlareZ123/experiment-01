'use strict';

const assert = require('node:assert/strict');
const {choose, TARGETS} = require('./agent38-arven-shake-opening.cjs');

/** @param {object[]} cards @param {string[]} identity */
function countPrinting(cards, identity) {
  return cards.reduce((n, card) => n + (
    card.name === identity[0] &&
    card.printing?.set === identity[1] &&
    String(card.printing?.number) === identity[2] ? card.count : 0), 0);
}

/**
 * Exact ordered setup + single ordinary draw + random face-down Prizes.
 * The unordered n-card visible hand is paired with n equally possible final
 * drawn-card positions. A Basic-valid opening of n-1 cards has weight:
 * n if the n-card sample has >=2 Basics, n-1 if exactly 1 Basic, else 0.
 *
 * All categories are disjoint physical card counts.
 * @param {{t:number,a:number,s:number,f:number,g:number,b:number,o:number,
 *   seenSize?:number,prizes?:number}} q
 * @returns {object} Exact weighted rational counts plus numeric probabilities.
 */
function exactOneDrawCounts(q) {
  const {t,a,s,f,g,b,o,seenSize=8,prizes=6} = q;
  const groups=[t,a,s,f,g,b,o];
  assert.ok(groups.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.ok(Number.isSafeInteger(seenSize)&&seenSize>=2);
  assert.ok(Number.isSafeInteger(prizes)&&prizes>=0);
  const N=groups.reduce((x,y)=>x+y,0);
  assert.ok(seenSize+prizes<=N);
  const rest=N-seenSize;
  const prizeWays=choose(rest,prizes);
  const denominator=choose(N,seenSize)*prizeWays*BigInt(seenSize);
  assert.ok(denominator>0n);
  let basicValid=0n,direct=0n,arven=0n,union=0n;
  for(let ht=1;ht<=Math.min(t,seenSize);ht++){
    for(let ha=0;ha<=Math.min(a,seenSize-ht);ha++){
      for(let hs=0;hs<=Math.min(s,seenSize-ht-ha);hs++){
        for(let hf=0;hf<=Math.min(f,seenSize-ht-ha-hs);hf++){
          for(let hg=0;hg<=Math.min(g,seenSize-ht-ha-hs-hf);hg++){
            for(let hb=0;hb<=Math.min(b,seenSize-ht-ha-hs-hf-hg);hb++){
              const ho=seenSize-ht-ha-hs-hf-hg-hb;
              if(ho<0||ho>o)continue;
              const basicSelected=ht+hb;
              const validDrawPositions=basicSelected>=2?seenSize:
                basicSelected===1?seenSize-1:0;
              if(!validDrawPositions)continue;
              const handWays=choose(t,ht)*choose(a,ha)*
                choose(s,hs)*choose(f,hf)*choose(g,hg)*
                choose(b,hb)*choose(o,ho);
              const weight=handWays*BigInt(validDrawPositions);
              basicValid+=weight*prizeWays;
              const remaining=[s-hs,f-hf,g-hg];
              const deckHasG=prizeWays-
                choose(rest-remaining[2],prizes-remaining[2]);
              const directWays=hs>0&&hf>0?deckHasG:0n;
              let arvenWays=0n;
              if(ha>0){
                // Inclusion-exclusion: each of S, F, G must have at least one
                // unprized, undrawn physical copy in the deck.
                for(let mask=0;mask<8;mask++){
                  let r=0, selected=0;
                  for(let i=0;i<3;i++)if(mask&(1<<i)){
                    r+=remaining[i];selected++;
                  }
                  const term=choose(rest-r,prizes-r);
                  arvenWays+=selected%2?-term:term;
                }
              }
              // Direct and Arven share a hand/Prize outcome. For this
              // correctly constrained model the direct event implies the
              // Arven deck requirements when Arven is also held and there
              // are remaining S and F in deck, but the two events can
              // otherwise differ. Count the union explicitly.
              let bothWays=0n;
              if(directWays>0n&&ha>0){
                for(let mask=0;mask<8;mask++){
                  let r=0, selected=0;
                  // S/F may be in hand, but Arven still requires deck copies.
                  for(let i=0;i<3;i++)if(mask&(1<<i)){
                    r+=remaining[i];selected++;
                  }
                  const term=choose(rest-r,prizes-r);
                  bothWays+=selected%2?-term:term;
                }
              }
              direct+=weight*directWays;
              arven+=weight*arvenWays;
              union+=weight*(directWays+arvenWays-bothWays);
            }
          }
        }
      }
    }
  }
  assert.ok(basicValid>=0n&&basicValid<=denominator);
  assert.ok(union>=direct&&union>=arven&&union<=direct+arven);
  const numerical=n=>Number(n)/Number(denominator);
  return {
    denominator:String(denominator),validOpeningNumerator:String(basicValid),
    directNumerator:String(direct),arvenNumerator:String(arven),
    unionNumerator:String(union),
    basicValidProbability:numerical(basicValid),
    directAndValidProbability:numerical(direct),
    arvenAndValidProbability:numerical(arven),
    unionAndValidProbability:numerical(union),
    directConditionalValid:Number(direct)/Number(basicValid),
    arvenConditionalValid:Number(arven)/Number(basicValid),
    unionConditionalValid:Number(union)/Number(basicValid)
  };
}

/**
 * @param {object} deck Printable fixed 60-card roster.
 * @param {number} basicCount Number of printed Basic Pokémon in this roster.
 */
function analyzeOneDrawSixty(deck,basicCount){
  assert.ok(Array.isArray(deck?.cards));
  assert.ok(deck.cards.every(c=>Number.isSafeInteger(c.count)&&c.count>=1));
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  const counts=Object.fromEntries(Object.entries(TARGETS).map(
    ([key,printing])=>[key,countPrinting(deck.cards,printing)]));
  assert.ok(Number.isSafeInteger(basicCount)&&basicCount>=counts.trubbish&&basicCount<=60);
  const q={
    t:counts.trubbish,a:counts.arven,s:counts.shake,
    f:counts.stone,g:counts.garbodor,
    b:basicCount-counts.trubbish
  };
  q.o=60-Object.values(q).reduce((x,y)=>x+y,0);
  assert.ok(q.o>=0);
  return {...exactOneDrawCounts(q),counts,otherBasic:q.b,otherNonBasic:q.o,
    scope:'Valid initial seven plus one ordinary random draw, followed by '+
      'six initial random Prizes; no extra draws, search, opponent, or game play'};
}

module.exports={exactOneDrawCounts,analyzeOneDrawSixty};
