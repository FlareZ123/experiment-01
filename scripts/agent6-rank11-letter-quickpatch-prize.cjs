'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent6-rank11-letter-opportunity.cjs');

/**
 * Exact source-dealt opening prerequisite for one paper-conceivable sequence:
 * Letter obtains two Darkness, Quick Ball discards one to search Mega Absol,
 * then Dark Patch attaches the discarded Energy to Benched Mega Absol.
 * Require a different opening Basic; Mega can be eighth draw or search target.
 * All three Items and no Darkness must occur in initial seven plus draw.
 * Neither actual play, opponent lock nor tactical merit is modeled.
 */
function rank11LetterQuickPatchWindow(){
  const groups=[4,4,3]; // Letter, Quick Ball, Dark Patch
  /** @param {number} excluded */
  const countSeven=excluded=>
    choose(49-excluded,7)-choose(41-excluded,7);
  /** @param {(excluded:number)=>bigint} fn */
  const exclusive=fn=>groups.reduce===null?0n:
    Array.from({length:8},(_,mask)=>{
      const excluded=groups.reduce((s,n,i)=>s+((mask>>i)&1?n:0),0);
      const sign=(mask.toString(2).match(/1/g)||[]).length%2? -1n:1n;
      return sign*fn(excluded);
    }).reduce((a,b)=>a+b,0n);
  const total=exclusive(x=>countSeven(x)*BigInt(45-x));
  const megaEighth=exclusive(x=>countSeven(x)*3n);
  const noMegaEighth=total-megaEighth;
  assert.ok(noMegaEighth>=0n);
  const legalSeven=choose(60,7)-choose(49,7);
  const denominator=legalSeven*53n;
  const prizeDen=choose(52,6);
  const prizeAllMega=choose(49,3); // exactly three Mega among remaining52
  const possibleNumerator=megaEighth*prizeDen+
    noMegaEighth*(prizeDen-prizeAllMega);
  const possibleDenominator=denominator*prizeDen;
  return {schema:'agent6-r11-letter-quick-patch-prize-window-v1',
    totalPrerequisiteNumerator:String(total),
    eighthMegaNumerator:String(megaEighth),
    noEighthMegaNumerator:String(noMegaEighth),
    prerequisiteDenominator:String(denominator),
    prizeAllThreeMegaNumerator:String(prizeAllMega),
    prizeDenominator:String(prizeDen),
    possibleNumerator:String(possibleNumerator),
    possibleDenominator:String(possibleDenominator),
    prerequisiteProbability:Number(total)/Number(denominator),
    withAvailableMegaProbability:
      Number(possibleNumerator)/Number(possibleDenominator),
    nativeActionsPlayed:0,competitiveQualifiedGames:0};
}
module.exports={rank11LetterQuickPatchWindow};
