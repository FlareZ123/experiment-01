'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent3-rank26-donk-prize-witness-upper.cjs');
const {drawEvent}=require('./agent3-rank26-coupled-mulligan-zone.cjs');
const {offeredBonusProbability,sourceRank26Field}=
  require('./agent27-rank26-mulligan-ticket-access.cjs');

const c=(n,k)=>Number(choose(n,k));
const sourceValid=1-c(48,7)/c(60,7);
const sourceInvalid=1-sourceValid;
const sourceRootNoBonus=drawEvent(1,true)+drawEvent(1,false);

/**
 * Joint physically favorable rank26 source-first opening condition:
 * source can hold DCE with both Lightning still in deck after its normal
 * draw, and the opposing player has exactly one Basic after *their*
 * optional setup bonus draws. Both draws obey the simultaneous
 * double-mulligan restart rule. This is no attack/win-rate metric.
 *
 * @param {number} opposingBasics Original opponent 60 Basic count.
 * @param {'none'|'all'|'hand-aware'} [sourceBonusPolicy]
 * @returns {object}
 */
function joint(opposingBasics,sourceBonusPolicy='hand-aware'){
  assert.ok(Number.isSafeInteger(opposingBasics)&&opposingBasics>=1&&
    opposingBasics<=54);
  assert.ok(['none','all','hand-aware'].includes(sourceBonusPolicy));
  const oppInvalid=c(60-opposingBasics,7)/c(60,7);
  const oppValid=1-oppInvalid;
  const denominator=1-sourceInvalid*oppInvalid;
  const exactlyOneConditional=opposingBasics*c(60-opposingBasics,6)/
    (c(60,7)-c(60-opposingBasics,7));
  /** @param {number} offers */
  const directSource=offers=>sourceBonusPolicy==='none'?
    sourceRootNoBonus:sourceBonusPolicy==='all'?
    drawEvent(offers+1,true)+drawEvent(offers+1,false):
    drawEvent(1,true)+drawEvent(offers+1,false);
  // Both original hands valid: neither player is offered bonus cards.
  const bothValid=sourceValid*oppValid/denominator*
    exactlyOneConditional*sourceRootNoBonus;
  // Source originally valid, opponent has >=1 mulligans. Original
  // opponent eventually keeps a single-Basic hand. Source receives
  // the optional bonus draws and its own mandatory turn draw.
  let sourceGetsBonuses=0;
  for(let m=1;m<=46;m++){
    const w=offeredBonusProbability(oppInvalid,sourceInvalid,m);
    sourceGetsBonuses+=w*exactlyOneConditional*directSource(m);
  }
  // Opponent originally valid, source has >=1 mulligans. Opponent
  // selects all optional extra cards at setup. Once an initial seven
  // has exactly one Basic, avoid b-1 remaining Basics in those draws.
  let opponentGetsBonuses=0;
  for(let n=1;n<=46;n++){
    const w=offeredBonusProbability(sourceInvalid,oppInvalid,n);
    const avoidExtra= n<=54-opposingBasics?
      c(54-opposingBasics,n)/c(53,n):0;
    opponentGetsBonuses+=w*exactlyOneConditional*
      avoidExtra*sourceRootNoBonus;
  }
  // The omitted >46 mulligan tails are strictly less than
  // (max(one-player failure chance))^47 / (1-qS*qO).
  const excludedTailBound=(oppInvalid**47+sourceInvalid**47)/
    denominator;
  return {
    opposingBasics,sourceBonusPolicy,
    opponentOneBasicGivenValidSeven:exactlyOneConditional,
    sourceDirectRootNoBonus:sourceRootNoBonus,
    simultaneousMulliganNormalization:denominator,
    components:{bothInitiallyValid:bothValid,
      onlyOpponentInitiallyInvalid:sourceGetsBonuses,
      onlySourceInitiallyInvalid:opponentGetsBonuses},
    conditionalJointSetupAndSourceRoot:
      bothValid+sourceGetsBonuses+opponentGetsBonuses,
    excludedTailBound,
    sourceFirstAssumed:true,opponentTakesAllItsBonusDraws:true,
    caveat:'Intersection of favorable source resource locations and opponent having exactly one Basic in preturn setup. Neither attack nor win nor usable-card acquisition is implied; assumes both players take stated optional bonus policies and no setup effects spawn additional Basics.'
  };
}

/** All authenticated exact original Top32 opponent Basics, no proxies. */
function field(){
  const manifest=sourceRank26Field();
  return {
    schema:'rank26-firstturn-direct-energy-and-opponent-lone-basic-v1',
    publishedOriginalOpponentLists:manifest.publishedSourceRanks,
    missingRanks:manifest.missingRanks,
    scenarios:manifest.opponents.map(o=>({
      rank:o.rank,archetype:o.archetype,
      ...joint(o.opponentBasics??o.basicCount,'hand-aware')
    }))
  };
}
module.exports={joint,field};
if(require.main===module)
  process.stdout.write(JSON.stringify(field(),null,2)+'\n');
