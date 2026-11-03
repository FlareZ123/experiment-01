'use strict';
const assert=require('node:assert/strict');
const {sourceCounts,choose}=require('./agent2-rank26-cologne-counter-frontier.cjs');
const {bonusExactly,bonusAtLeast}=require('../../scripts/aichi_bonus_draws.cjs');
const {mulliganProbability}=require('../../scripts/aichi_opening_audit.cjs');

/**
 * Conditional on rank26's Basic-valid initial seven. Six random Prizes,
 * one ordinary first-turn draw, and k elective opposing-mulligan bonus
 * draws precede any Trainer plays. Access uses held Cologne, every held
 * Order Pad coin, and one held Trainers' Mail TOP FOUR in that priority.
 * This is a physical-card availability model, not proof of legal play.
 *
 * @param {number} k Opponent mulligan bonus cards, 0..46.
 * @returns {{direct:number,padIncrement:number,mailIncrement:number,total:number}}
 */
function fixed(k){
 assert.ok(Number.isInteger(k)&&k>=0&&k<=46);
 const n=k+1;
 const openValid=1-mulliganProbability(12);
 const initialDen=choose(60,7);
 const drawDen=choose(53,n);
 const out={direct:0,padIncrement:0,mailIncrement:0,total:0};
 for(let b=1;b<=7;b++)
  for(let m=0;m<=4;m++)
   for(let p=0;p<=3;p++)
    for(let c=0;c<=1;c++){
     const other=7-b-m-p-c;
     if(other<0||other>40)continue;
     const opening=choose(12,b)*choose(4,m)*choose(3,p)*
       choose(1,c)*choose(40,other)/initialDen/openValid;
     if(c){
      out.direct+=opening;continue;
     }
     const nonSpecialRemaining=52-b-other;
     for(let mailDraw=0;mailDraw<=4-m;mailDraw++)
      for(let padDraw=0;padDraw<=3-p;padDraw++)
       for(let cologneDraw=0;cologneDraw<=1;cologneDraw++){
        const otherDraw=n-mailDraw-padDraw-cologneDraw;
        if(otherDraw<0||otherDraw>nonSpecialRemaining)continue;
        const draw=choose(4-m,mailDraw)*choose(3-p,padDraw)*
          choose(1,cologneDraw)*
          choose(nonSpecialRemaining,otherDraw)/drawDen;
        const weight=opening*draw;
        if(cologneDraw){
         out.direct+=weight;continue;
        }
        // 53-n positions still contain six face-down Prize cards.
        // Cologne is search-visible in 47-n live deck positions.
        const liveDeck=47-n;
        const remaining=53-n;
        const headsChance=1-0.5**(p+padDraw);
        out.padIncrement+=weight*liveDeck/remaining*headsChance;
        if(m+mailDraw>0)
         out.mailIncrement+=weight*Math.min(4,liveDeck)/remaining*
           (1-headsChance);
       }
    }
 out.total=out.direct+out.padIncrement+out.mailIncrement;
 assert.ok(out.total>=0&&out.total<=1+1e-10);
 return out;
}

/**
 * Exact simultaneous mulligan distribution on frozen rank26 v Apex
 * candidates. Both source and candidate contain exactly 12 Basics.
 * @param {number} opponentBasics Apex opening Basic count, default 12.
 * @returns {object}
 */
function withBonus(opponentBasics=12){
 assert.ok(Number.isInteger(opponentBasics)&&opponentBasics>=1&&
   opponentBasics<=60);
 const own=mulliganProbability(12),opp=mulliganProbability(opponentBasics);
 const result={direct:0,padIncrement:0,mailIncrement:0,total:0};
 let mass=0;
 for(let k=0;k<=46;k++){
  const q=k===46?bonusAtLeast(opp,own,46):
    bonusExactly(opp,own,k);
  mass+=q;
  const row=fixed(k);
  for(const key of Object.keys(result))result[key]+=q*row[key];
 }
 assert.ok(Math.abs(mass-1)<1e-10);
 return {sourceRank:26,sourceBasicCopies:12,opponentBasics,
  sourceCologneCopies:1,sourcePadCopies:3,sourceMailCopies:4,
  noBonus:fixed(0),withAllOfferedBonuses:result,
  firstTurnOnly:true,qualifiedGames:0};
}

/**
 * Verify published source inventory before returning any probability.
 * @param {{decks:{rank:number,cards:{name:string,count:number}[]}[]}} manifest
 * @param {number} opponentBasics
 * @returns {object}
 */
function originalRank26(manifest,opponentBasics=12){
 const source=manifest.decks.find(d=>Number(d.rank)===26);
 assert.ok(source);
 sourceCounts(source);
 return withBonus(opponentBasics);
}
module.exports={fixed,withBonus,originalRank26};
