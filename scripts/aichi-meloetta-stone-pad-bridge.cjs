'use strict';

const path=require('node:path');
const fs=require('node:fs');
const {choose,mulliganProbability}=require('./aichi_opening_audit.cjs');
const {bonusExactly,bonusAtLeast}=require('./aichi_bonus_draws.cjs');
const {sourceOrderPadBridge}=require('./aichi-meloetta-order-pad-bridge.cjs');

const DENOMINATOR=60*59*58*57*56*55;

/** @param {number} size @param {number} count @returns {number} */
function falling(size,count) {
  let product=1;
  for(let i=0;i<count;i++) product*=size-i;
  return product;
}

/**
 * Count direct Cologne, three fair Order Pad searches, and a Forest Seal
 * Stone + Crobat V bridge without overlap.
 *
 * Six distinguished physical cards are assigned exactly to opening seven
 * (zone 0), six Prizes (zone 1), bonus-plus-turn draws (zone 2), or
 * unobserved live deck (zone 3). Crobat is one of ownBasics Basic Pokémon;
 * the other five distinguished cards are non-Basic. Conditional legality
 * of the initial seven is integrated for every assignment.
 *
 * Priority is direct > successful Pad > Stone bridge; the Stone component
 * therefore measures its incremental visibility beyond the Pad baseline.
 * Holding the Stone and Crobat does not establish a playable winning line.
 *
 * @param {number} ownBasics Total Basics, including singleton Crobat V.
 * @param {number} bonusDraws Accepted opposing mulligan draws, 0 to 46.
 * @returns {{direct:number,padAdditional:number,stoneAdditional:number,combined:number,totalMass:number}}
 */
function fixedWindow(ownBasics,bonusDraws) {
  if(!Number.isInteger(ownBasics)||ownBasics<1||ownBasics>55||
     !Number.isInteger(bonusDraws)||bonusDraws<0||bonusDraws>46) {
    throw new RangeError('Invalid Basic count or first-turn draw count');
  }
  const caps=[7,6,1+bonusDraws,46-bonusDraws];
  const validOpening=1-mulliganProbability(ownBasics);
  let direct=0,padAdditional=0,stoneAdditional=0,totalMass=0;

  // Labels, in order: Cologne; Stone; Crobat V; Order Pads 1, 2, 3.
  for(let code=0;code<4096;code++) {
    let digits=code;
    const slots=caps.slice();
    const position=[];
    let ways=1;
    for(let index=0;index<6;index++) {
      const zone=digits%4;
      digits=Math.floor(digits/4);
      position.push(zone);
      ways*=slots[zone];
      slots[zone]--;
    }
    if(ways===0) continue;
    const initialDistinguished=7-slots[0];
    const openingLegal=position[2]===0 ? 1 :
      1-choose(55-ownBasics,7-initialDistinguished)/
        choose(54,7-initialDistinguished);
    const weight=ways/DENOMINATOR*openingLegal/validOpening;
    totalMass+=weight;

    const observed=zone=>zone===0||zone===2;
    if(observed(position[0])) {
      direct+=weight;
    } else if(position[0]===3) {
      const padCount=position.slice(3).filter(observed).length;
      const padSuccess=1-0.5**padCount;
      padAdditional+=weight*padSuccess;
      if(observed(position[1])&&observed(position[2])) {
        stoneAdditional+=weight*(1-padSuccess);
      }
    }
  }
  return {direct,padAdditional,stoneAdditional,
    combined:direct+padAdditional+stoneAdditional,totalMass};
}

/**
 * Integrate the rank-26 and four-Basic Iron Thorns mulligan protocol, accepting
 * up to 46 bonus draws so the ordinary first-turn draw remains possible.
 * @param {number} ownBasics
 * @param {number} opponentBasics
 * @returns {object}
 */
function openingWindow(ownBasics,opponentBasics) {
  const ownMulligan=mulliganProbability(ownBasics);
  const opponentMulligan=mulliganProbability(opponentBasics);
  const totals={direct:0,padAdditional:0,stoneAdditional:0,combined:0};
  for(let k=0;k<=46;k++) {
    const weight=k===46
      ? bonusAtLeast(opponentMulligan,ownMulligan,46)
      : bonusExactly(opponentMulligan,ownMulligan,k);
    const sample=fixedWindow(ownBasics,k);
    for(const key of Object.keys(totals)) totals[key]+=weight*sample[key];
  }
  return {ownBasics,opponentBasics,...totals,
    sourceModel:'valid initial seven, six inaccessible Prizes, all usable opposing mulligan bonuses, one ordinary draw; direct, Pad heads, then Stone+Crobat'};
}

/** @param {string} root @returns {object} */
function sourceStonePadBridge(root) {
  const baseline=sourceOrderPadBridge(root);
  const manifest=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank26=manifest.decks.find(d=>d.rank===26);
  for(const [name,set,number] of [
    ['Crobat V','DAA','104'],['Forest Seal Stone','SIT','156']
  ]) {
    const cards=rank26.cards.filter(c=>c.name===name);
    if(cards.length!==1||cards[0].count!==1||
       cards[0].printing.set!==set||cards[0].printing.number!==number) {
      throw new Error('Rank-26 source singleton/printing changed: '+name);
    }
  }
  const result=openingWindow(baseline.ownBasics,baseline.opponentBasics);
  if(Math.abs(result.direct-baseline.directCologne)>1e-10||
     Math.abs(result.direct+result.padAdditional-baseline.directOrPadHeads)>1e-10) {
    throw new Error('Cologne/Pad access did not reproduce existing model');
  }
  return {sourceRanks:[26,6,24,29],
    sourceCrobat:'Crobat V DAA 104',
    sourceStone:'Forest Seal Stone SIT 156',
    ...result};
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(sourceStonePadBridge(
    path.resolve(__dirname,'..')),null,2)+'\n');
}

module.exports={fixedWindow,openingWindow,sourceStonePadBridge};
