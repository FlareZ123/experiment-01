'use strict';

const assert = require('node:assert/strict');
const candidate = require('../../results/als/agent18-exeggutor-vileplume-native-v2.json');
const {choose,prizeSurvivalCount,sourceCounts,main:baseMain,fraction} =
  require('./agent32-gh-prize-search-window.cjs');

const VERSION='agent32-rank2-exeggutor-gh-artazon-prize-window-v1';
const CATEGORIES=Object.freeze([
  'Bunnelby','Exeggcute','Oddish','Guzma & Hala','Tag Call',
  'Jet Energy','Technical Machine: Evolution','Exeggutor',
  'Gloom','Vileplume','Artazon','Other'
]);

/** @returns {{counts:number[],totalBasics:number}} */
function sourceArtazonCounts(){
  const base=sourceCounts();
  const artazon=candidate.cards.reduce((sum,row)=>
    sum+(row.name==='Artazon'&&row.printing?.set==='PAL'?row.count:0),0);
  assert.equal(artazon,2,'Source Artazon PAL171 printing changed');
  assert.equal(base.counts[10],35);
  return {counts:[...base.counts.slice(0,10),artazon,
    base.counts[10]-artazon],totalBasics:base.totalBasics};
}

/**
 * Enumerate one physically strict G&H + TM + Jet first-turn search route.
 * The owner must see at least two of the three required Basic species and
 * one Jet by the first draw of their first turn going second. G&H or Tag
 * Call must be available, and all required search targets must survive the
 * six Prizes and initial eight owner cards. If exactly one Basic species is
 * missing, either a held or deck-searchable Artazon must fetch it.
 *
 * This models real source deck membership, not ability legality, opponent
 * interference, hand discard quality, guaranteed attack selection or wins.
 * Grouped eight-card hands have equal probability even though six Prizes
 * are set before the first normal draw. Every qualifying eight holds at
 * least two Basics, so any predecessor seven is a legal initial opening.
 *
 * @param {number[]} counts Twelve disjoint physical category counts.
 * @param {number} basicTotal Actual physical Basic count.
 * @param {number} [opening=7]
 * @param {number} [prizes=6]
 * @returns {object} All exact integer masses and disjoint route partitions.
 */
function countArtazonSearchWindow(counts,basicTotal,opening=7,prizes=6){
  assert.equal(counts.length,CATEGORIES.length);
  assert.ok(counts.every(x=>Number.isSafeInteger(x)&&x>=0));
  const total=counts.reduce((a,b)=>a+b,0);
  assert.ok(Number.isSafeInteger(basicTotal)&&basicTotal>=3);
  assert.ok(Number.isSafeInteger(opening)&&opening>=2);
  assert.ok(Number.isSafeInteger(prizes)&&prizes>=0&&
    opening+1+prizes<total);
  const seen=opening+1,remaining=total-seen;
  const picks=new Array(counts.length).fill(0);
  const values=[0n,0n],stateCounts=[0,0],
    held=[0n,0n],viaTag=[0n,0n];
  /** @param {number} index @param {number} left */
  function walk(index,left){
    if(index===counts.length){
      if(left!==0)return;
      const [b,e,o,gh,tag,jet,tm,egg,gloom,vile,artazon]=picks;
      const species=[b,e,o].filter(x=>x>0).length;
      if(species<2||jet<1||(gh===0&&tag===0))return;
      const group=species===3?0:1;
      const required=[counts[5]-jet,counts[6]-tm,counts[7]-egg,
        counts[8]-gloom,counts[9]-vile];
      if(gh===0)required.push(counts[3]);
      if(group===1){
        // Artazon can fetch exactly one absent non-Rule-Box Basic.
        const missing=[b,e,o].findIndex(n=>n===0);
        assert.ok(missing>=0);
        required.push(counts[missing]);
        if(artazon===0)required.push(counts[10]);
      }
      if(required.some(n=>n<=0))return;
      let handWays=1n;
      for(let i=0;i<counts.length;i++)handWays*=choose(counts[i],picks[i]);
      const favorable=handWays*prizeSurvivalCount(remaining,prizes,required);
      values[group]+=favorable;
      if(gh>0)held[group]+=favorable;
      else viaTag[group]+=favorable;
      stateCounts[group]++;
      return;
    }
    for(let n=0;n<=Math.min(counts[index],left);n++){
      picks[index]=n;walk(index+1,left-n);
    }
  }
  walk(0,seen);
  const allDeals=choose(total,seen)*choose(remaining,prizes);
  const allSeven=choose(total,opening);
  const validSeven=allSeven-choose(total-basicTotal,opening);
  return {values,held,viaTag,stateCounts,allDeals,allSeven,validSeven,
    totalFavorable:values[0]+values[1]};
}

/** @returns {object} */
function main(){
  const {counts,totalBasics}=sourceArtazonCounts();
  const d=countArtazonSearchWindow(counts,totalBasics);
  const conditional=n=>fraction(n*d.allSeven,d.allDeals*d.validSeven);
  const base=baseMain();
  assert.equal(conditional(d.values[0]).numerator,
    base.conditionalBasicValidSeven.numerator);
  assert.equal(conditional(d.values[0]).denominator,
    base.conditionalBasicValidSeven.denominator);
  return {
    schema:VERSION,roster:'results/als/agent18-exeggutor-vileplume-native-v2.json',
    categories:CATEGORIES,counts,totalBasics,
    groupedFirstEightStates:d.stateCounts,
    threeBasicsHeld:{
      conditional:conditional(d.values[0]),
      heldGuzmaHala:conditional(d.held[0]),
      tagOnly:conditional(d.viaTag[0])
    },
    twoBasicsArtazon:{
      conditional:conditional(d.values[1]),
      heldGuzmaHala:conditional(d.held[1]),
      tagOnly:conditional(d.viaTag[1])
    },
    combined:{
      unconditional:fraction(d.totalFavorable,d.allDeals),
      conditionalBasicValidSeven:conditional(d.totalFavorable)
    },
    scope:'Hand/deck/Prize resource-access conjunction only, going second. '+
      'Opponent may interfere; G&H costs, source legal actions, and turn-2 '+
      'Blockade are not demonstrated by this calculation.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,CATEGORIES,sourceArtazonCounts,
  countArtazonSearchWindow,main};
