'use strict';

/**
 * Original rank31 Roxie -> Koffing -> Radiant first-turn opportunity.
 * An unmodified source printing has one clean non-Koffing/non-Radiant/non-
 * Lele Basic Active from the initial seven and two free Bench spaces.
 *
 * BEFORE playing Roxie:
 * - preserve one Koffing in hand (possibly fetched with one held Fog Crystal)
 * - hold Roxie or fetch it with Lele Wonder Tag (Lele held or fetched with
 *   another held Fog Crystal), each missing target must survive six Prizes
 * - optionally fetch the original Radiant with a SPARE held Fog Crystal
 *
 * AFTER Roxie discards Koffing and draws 3:
 * - if Radiant was not previously available, it may arrive directly by
 *   ordinary Roxie draw, or the 3 cards may contain a fresh Fog Crystal
 *   that retrieves Radiant from the still-shuffled deck.
 *
 * Every source search physically removes a card and thus adjusts the deck
 * denominator for Roxie's three draws. Sampling six Prizes simultaneously
 * includes all-prized target failure and Fog copies removed by Prizing.
 * This is an upper-access/possible-route screen, never selected gameplay.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./agent15-rank31-roxie-firstdraw.cjs');
const {inventory,countWonderTagChain}=
  require('./agent15-rank31-roxie-wondertag-fog-chain.cjs');

const COUNTS=[3,1,1,4,4,10,37];

/** @param {bigint} a @param {bigint} b */
function gcd(a,b) {
  while(b!==0n){const r=a%b;a=b;b=r;}
  return a;
}

/**
 * @param {number[]} counts Authentic seven-class original source inventory
 * @returns {object} Exact weights and mathematically normalized probabilities
 */
function countPostRoxieThreeDraws(counts) {
  assert.deepEqual(counts,COUNTS);
  const x=new Array(7).fill(0);
  const prizeTotal=choose(52,6);
  let validSeven=0n;
  let beforeRoxie=0n;
  let postCandidateWeight=0n;
  const remainingDrawClasses=new Map();

  /** @param {number} i @param {number} left @param {bigint} ways */
  function visit(i,left,ways){
    if(i===7){
      if(left!==0||x[0]+x[1]+x[2]+x[5]===0)return;
      validSeven+=ways;
      if(x[5]===0)return; // physical clean non-special starting Active
      for(let draw=0;draw<7;draw++){
        if(x[draw]===counts[draw])continue;
        const hand=x.map((n,j)=>n+Number(j===draw));
        const [k,rad,lele,fog,roxie]=hand;
        const missK=k===0;
        const missLele=roxie===0&&lele===0;
        const needsBeforeRoxie=Number(missK)+Number(missLele);
        if(fog<needsBeforeRoxie)continue;
        const rem=hand.map((h,j)=>counts[j]-h);
        const factor=ways*BigInt(counts[draw]-x[draw]);
        const other=rem[5]+rem[6];
        for(let pK=0;pK<=Math.min(rem[0],6);pK++){
          const wk=choose(rem[0],pK);
          for(let pRad=0;pRad<=Math.min(rem[1],6-pK);pRad++){
            const wr=wk*choose(rem[1],pRad);
            for(let pLele=0;pLele<=Math.min(rem[2],6-pK-pRad);pLele++){
              const wl=wr*choose(rem[2],pLele);
              for(let pFog=0;pFog<=Math.min(rem[3],6-pK-pRad-pLele);pFog++){
                const wf=wl*choose(rem[3],pFog);
                for(let pRox=0;pRox<=Math.min(rem[4],6-pK-pRad-pLele-pFog);pRox++){
                  const rest=6-pK-pRad-pLele-pFog-pRox;
                  if(rest>other)continue;
                  const prizeWays=wf*choose(rem[4],pRox)*choose(other,rest);
                  if(prizeWays===0n)continue;
                  if(missK&&rem[0]-pK===0)continue;
                  if(missLele&&rem[2]-pLele===0)continue;
                  if(roxie===0&&rem[4]-pRox===0)continue;
                  if(rad===0&&rem[1]-pRad===0)continue;
                  const weight=factor*prizeWays;
                  const spareHeldFog=fog-needsBeforeRoxie;
                  if(rad>0||spareHeldFog>0){
                    beforeRoxie+=weight;
                    continue;
                  }
                  // Roxie is now available and Koffing is physically payable.
                  // Koffing, Lele and Roxie fetched from the deck all leave it
                  // before the draw, decreasing the starting 46 remaining.
                  const searched=Number(missK)+Number(missLele)+Number(roxie===0);
                  const size=46-searched;
                  const fogRemaining=rem[3]-pFog;
                  const key=size+':'+fogRemaining;
                  remainingDrawClasses.set(key,
                    (remainingDrawClasses.get(key)??0n)+weight);
                  postCandidateWeight+=weight;
                }
              }
            }
          }
        }
      }
      return;
    }
    for(let take=0;take<=Math.min(left,counts[i]);take++){
      x[i]=take;
      visit(i+1,left-take,ways*choose(counts[i],take));
    }
  }
  visit(0,7,1n);
  const base=countWonderTagChain(counts);
  assert.equal(validSeven.toString(),base.validSeven);
  assert.equal(beforeRoxie.toString(),
    base.events.completeSourceAccess.numerator);
  const den=validSeven*53n*prizeTotal;
  const drawLCM=[43,44,45,46].reduce((value,size)=>{
    const d=choose(size,3);
    return value/gcd(value,d)*d;
  },1n);
  let postScaled=0n;
  const drawBreakdown=[];
  for(const [key,weight] of [...remainingDrawClasses.entries()].sort()){
    const [size,fogRemaining]=key.split(':').map(Number);
    const options=choose(size,3);
    // Radiant is a singleton still in the deck; any fresh Fog from Roxie's
    // draw may search it after Roxie, before the source turn ends.
    const good=options-choose(size-1-fogRemaining,3);
    const scaled=weight*good*(drawLCM/options);
    postScaled+=scaled;
    drawBreakdown.push({
      deckCards:size,fogStillInDeck:fogRemaining,baseWeight:weight.toString(),
      favorableThreeCardSubsets:good.toString(),allThreeCardSubsets:options.toString()
    });
  }
  const rawPostNum=postScaled;
  const rawPostDen=den*drawLCM;
  const totalNum=beforeRoxie*drawLCM+postScaled;
  const common=gcd(totalNum,rawPostDen);
  return {
    validSeven:validSeven.toString(),
    originalPrizeDenominator:den.toString(),
    drawDenominatorLCM:drawLCM.toString(),
    sourceOptions:{
      beforeRoxie:{
        numerator:beforeRoxie.toString(),denominator:den.toString(),
        percent:Number(beforeRoxie)/Number(den)*100
      },
      postRoxieOnly:{
        numerator:rawPostNum.toString(),denominator:rawPostDen.toString(),
        percent:Number(rawPostNum)/Number(rawPostDen)*100
      },
      combined:{
        numerator:(totalNum/common).toString(),
        denominator:(rawPostDen/common).toString(),
        percent:Number(totalNum)/Number(rawPostDen)*100
      }
    },
    additionalDrawOpportunityWeight:postCandidateWeight.toString(),
    drawBreakdown
  };
}

function main(){
  const manifest=JSON.parse(fs.readFileSync(
    path.join(__dirname,'..','results','aichi-2026','full-decklists.json'),'utf8'));
  const deck=manifest.decks.find(d=>d.rank===31);
  assert(deck,'Missing original rank31 source');
  console.log(JSON.stringify({
    sourceRank:31,
    scope:'clean initial Active, held Fog and Wonder Tag before Roxie, Roxie draw three after Koffing',
    result:countPostRoxieThreeDraws(inventory(deck))
  },null,2));
}
if(require.main===module)main();
module.exports={countPostRoxieThreeDraws};
