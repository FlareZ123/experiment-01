'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent3-rank26-donk-prize-witness-upper.cjs');
const {union}=require('./agent3-rank26-direct-root-lightning-dce.cjs');

const chooseNumber=(n,k)=>Number(choose(n,k));
const sourceValid=1-chooseNumber(48,7)/chooseNumber(60,7);
const opponentValid=1-chooseNumber(56,7)/chooseNumber(60,7);
const opponentInvalid=1-opponentValid;
const stopBothInvalid=1-(1-sourceValid)*opponentInvalid;
const denominator=(chooseNumber(60,7)-chooseNumber(48,7))*
  chooseNumber(53,6);
const initiallyHeld=Number(union(0,1))/denominator;
const initiallyAbsent=Number(union(0,0))/denominator;

/**
 * Coupled paper setup resets both decks when both players mulligan.
 * Once one player has a valid seven, that player keeps it while the
 * other reshuffles until a valid hand. Source bonus draws are optional.
 * @param {number} opponentMulligans
 * @returns {number}
 */
function setupWeight(opponentMulligans){
  assert.ok(Number.isInteger(opponentMulligans)&&opponentMulligans>=0);
  if(opponentMulligans===0)return opponentValid/stopBothInvalid;
  return sourceValid*opponentValid*
    (opponentInvalid**opponentMulligans)/stopBothInvalid;
}

/**
 * Probability of an eligible direct-source root after k ordinary plus
 * optional mulligan-bonus draws from the 47-card post-Prize deck.
 * Two Lightning must still be in deck. DCE must now be in hand.
 * @param {number} draws
 * @param {boolean} heldDce
 * @returns {number}
 */
function drawEvent(draws,heldDce){
  assert.ok(Number.isInteger(draws)&&draws>=1);
  if(draws>47)return 0;
  const denom=chooseNumber(47,draws);
  return heldDce
    ?initiallyHeld*chooseNumber(45,draws)/denom
    :initiallyAbsent*chooseNumber(44,draws-1)/denom;
}

/**
 * Compare paper-legal policies for choosing *number* of mulligan
 * bonus draws; no hypothetical deck peeking or source play is modeled.
 */
function evaluate(){
  const zeroBonus=drawEvent(1,true)+drawEvent(1,false);
  let allBonus=0,handAware=0,expectedMulligans=0;
  for(let m=0;m<=46;m++){
    const p=setupWeight(m);
    expectedMulligans+=p*m;
    allBonus+=p*(drawEvent(m+1,true)+drawEvent(m+1,false));
    handAware+=p*drawEvent(m+1,false);
  }
  // Under the owner-information-only illustrative policy, skip optional
  // bonus draws when DCE was already in the opening seven; otherwise
  // take all available bonuses before the single ordinary draw.
  handAware+=drawEvent(1,true);
  const probabilityMassAbove46=
    sourceValid*(opponentInvalid**47)/stopBothInvalid;
  assert.ok(Math.abs((setupWeight(0)+
    Array.from({length:46},(_,i)=>setupWeight(i+1))
      .reduce((a,b)=>a+b,0)+probabilityMassAbove46)-1)<1e-12);
  return {
    schema:'rank26-coupled-setup-mulligan-direct-zone-gate-v1',
    sourceBasicCopies:12,opponentBasicCopies:4,
    sourceOpeningBasicValid:sourceValid,
    opponentOpeningBasicValid:opponentValid,
    opponentMulliganZeroProbability:setupWeight(0),
    expectedOpponentMulligans:expectedMulligans,
    probabilityMassAbove46,
    conditionalDirectRootByBonusPolicy:{
      declineAllBonusDraws:zeroBonus,
      takeAllBonusDraws:allBonus,
      skipIfDceHeldOtherwiseTakeAll:handAware
    },
    rank26SourceGoesFirst:true,
    requiresAllTwoLightningRemainInDeck:true,
    caveat:'Card-location probability only, conditional on source final valid seven, six actual Prizes and source going first. Excludes source search, hand Lightning discard, ability draws, extra deck shuffles, whole first-turn execution and actual opponent play.'
  };
}
module.exports={setupWeight,drawEvent,evaluate};
if(require.main===module)
  process.stdout.write(JSON.stringify(evaluate(),null,2)+'\n');
