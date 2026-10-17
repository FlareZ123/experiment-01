'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {choose,mulliganProbability}=require('./aichi_opening_audit.cjs');
const {bonusAtLeast,bonusExactly}=require('./aichi_bonus_draws.cjs');
const {sourceCologneWindow}=require('./aichi-meloetta-cologne-window.cjs');

const ZONES=['U','P','D','R'];

/**
 * Exact fixed-draw enumeration over a distinguished non-Basic Cologne and
 * three distinct non-Basic Order Pads, conditional on a valid Basic opening.
 * U is 7 initial cards; P is 6 Prizes; D is one normal turn draw plus accepted
 * bonus draws; R is the remaining unobserved deck.
 *
 * If the Cologne is already held, access is direct. Otherwise, an Order Pad
 * held during the window can attempt a fair coin and search the remaining
 * deck for Cologne. Each Pad is one independent coin opportunity.
 *
 * @param {number} ownBasics Source rank-26 total Basic Pokémon.
 * @param {number} extraDraws Opponent-mulligan extra draws accepted, 0..46.
 * @returns {{direct:number,padAdditional:number,combined:number,total:number}}
 */
function fixedWindow(ownBasics,extraDraws) {
  if(!Number.isInteger(ownBasics)||ownBasics<1||ownBasics>56||
     !Number.isInteger(extraDraws)||extraDraws<0||extraDraws>46) {
    throw new RangeError('Invalid source starting Basic/draw capacities');
  }
  const afterPrize=1+extraDraws;
  const initial={U:7,P:6,D:afterPrize,R:47-afterPrize};
  const factorial60Four=60*59*58*57;
  const validProbability=1-mulliganProbability(ownBasics);
  let direct=0,padAdditional=0,total=0;

  for(const c of ZONES) for(const p1 of ZONES)
    for(const p2 of ZONES) for(const p3 of ZONES) {
      const selected=[c,p1,p2,p3];
      const slots={...initial};
      let ways=1;
      for(const zone of selected) {
        ways*=slots[zone];
        slots[zone]-=1;
      }
      if(!ways) continue;
      const initialSpecialCount=7-slots.U;
      // The four labelled cards are non-Basic, so the remaining 56 cards
      // contain exactly ownBasics Basic Pokémon.
      const initialOtherCount=7-initialSpecialCount;
      const legalGivenPlacement=1-
        choose(56-ownBasics,initialOtherCount)/choose(56,initialOtherCount);
      const probability=(ways/factorial60Four)*
        legalGivenPlacement/validProbability;
      total+=probability;

      if(c==='U'||c==='D') {
        direct+=probability;
      } else if(c==='R') {
        const available=[p1,p2,p3].filter(zone=>zone==='U'||zone==='D').length;
        padAdditional+=probability*(1-0.5**available);
      }
      // A Prized Cologne cannot be searched, and a consumed Pad cannot be
      // used; no other draw or search routes are modeled.
    }
  return {direct,padAdditional,combined:direct+padAdditional,total};
}

/**
 * Integrate independent two-player simultaneous mulligans. Accept every
 * offered bonus to a cap of 46, preserving one normal firstturn draw. This
 * is connector availability before other cards are consumed or Item locks.
 * @param {number} ownBasics
 * @param {number} opponentBasics
 * @returns {object}
 */
function orderPadOpening(ownBasics,opponentBasics) {
  const pOwn=mulliganProbability(ownBasics);
  const pOpp=mulliganProbability(opponentBasics);
  let direct=0,padAdditional=0;
  for(let k=0;k<46;k++) {
    const prob=bonusExactly(pOpp,pOwn,k);
    const part=fixedWindow(ownBasics,k);
    direct+=prob*part.direct;
    padAdditional+=prob*part.padAdditional;
  }
  const tail=bonusAtLeast(pOpp,pOwn,46);
  const end=fixedWindow(ownBasics,46);
  direct+=tail*end.direct;
  padAdditional+=tail*end.padAdditional;
  return {
    ownBasics,opponentBasics,
    directCologne:direct,
    extraIfPadHeads:padAdditional,
    directOrPadHeads:direct+padAdditional,
    firstturnModel:'valid seven, six Prizes, up to 46 bonuses, one draw, three Order Pads'
  };
}

/** @param {string} root @returns {object} */
function sourceOrderPadBridge(root) {
  const direct=sourceCologneWindow(root);
  const manifest=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank26=manifest.decks.find(d=>d.rank===26);
  const pads=rank26?.cards.filter(c=>c.name==='Order Pad')
    .reduce((total,c)=>total+c.count,0);
  if(pads!==3) throw new Error('Expected exactly three rank-26 Order Pads');
  const result=orderPadOpening(direct.ownBasics,direct.opponentBasics);
  if(Math.abs(result.directCologne-direct.firstTurnWithAllPossibleBonuses)>1e-10) {
    throw new Error('Two independent direct-access derivations disagree');
  }
  return {sourceRanks:[26,6,24,29],orderPadCopies:pads,...result};
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(sourceOrderPadBridge(
    path.resolve(__dirname,'..')),null,2)+'\n');
}

module.exports={fixedWindow,orderPadOpening,sourceOrderPadBridge};
