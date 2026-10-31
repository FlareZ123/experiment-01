'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,run:sourceCensus,openingCohold}=
  require('./agent9-crobat-vip-cohold.cjs');
const {coholdAfterDraws,geometricBonusExposure}=
  require('./agent9-thorns-mulligan-vip.cjs');

const VERSION='agent9-coupled-mulligan-setup-r6-r11-v1';

/**
 * Two original 60-card decks independently redraw until each has a Basic.
 * When both mulligan together, the failed setup is shared and awards no
 * opponent bonus. For own failures A and opponent failures B, the bonus
 * offered to A is max(B-A,0). A valid final hand is independent of A/B.
 *
 * @param {object} own Original published source inventory B/V/K.
 * @param {number} opponentBasics Number of Basics in opponent original 60.
 * @param {number} [maxNetBonus] Maximum net offered bonus draws to sum.
 */
function coupledBonusExposure(own,opponentBasics,maxNetBonus=45){
  assert.ok(Number.isSafeInteger(opponentBasics)&&
    opponentBasics>=1&&opponentBasics<=60);
  assert.ok(Number.isSafeInteger(maxNetBonus)&&maxNetBonus>=0&&
    maxNetBonus+1<=53);
  const C=choose(60,7);
  const pOwn=1-Number(choose(60-own.basicCount,7))/Number(C);
  const pOpp=1-Number(choose(60-opponentBasics,7))/Number(C);
  const qOwn=1-pOwn,qOpp=1-pOpp;
  const jointNormalization=1-qOwn*qOpp;
  const positiveMultiplier=pOwn*pOpp/jointNormalization;
  const positiveMass=pOwn*qOpp/jointNormalization;
  const zeroMass=1-positiveMass;
  const expectedNetBonus=positiveMass/pOpp;
  const asP=x=>Number(x.numerator)/Number(x.denominator);
  const originalFirst=asP(coholdAfterDraws({...own,draws:0}));
  const originalSecond=asP(coholdAfterDraws({...own,draws:1}));
  let first=zeroMass*originalFirst;
  let second=zeroMass*originalSecond;
  const distribution=[{bonus:0,probability:zeroMass}];
  for(let k=1;k<=maxNetBonus;k++){
    const weight=positiveMultiplier*Math.pow(qOpp,k);
    first+=weight*asP(coholdAfterDraws({...own,draws:k}));
    second+=weight*asP(coholdAfterDraws({...own,draws:k+1}));
    if(k<=6)distribution.push({bonus:k,probability:weight});
  }
  const truncatedTail=positiveMultiplier*
    Math.pow(qOpp,maxNetBonus+1)/(1-qOpp);
  const simpler=geometricBonusExposure(own,opponentBasics,maxNetBonus);
  return {version:VERSION,ownBasicCount:own.basicCount,
    opponentBasicCount:opponentBasics,ownOpeningBasicSuccess:pOwn,
    opponentOpeningBasicSuccess:pOpp,netZeroBonusProbability:zeroMass,
    expectedNetBonus,distribution,
    noBonusGoingFirst:originalFirst,noBonusGoingSecond:originalSecond,
    coupledGoingFirst:first,coupledGoingSecond:second,
    firstHandValidConditionalGoingFirst:simpler.coholdGoingFirst,
    firstHandValidConditionalGoingSecond:simpler.coholdGoingSecond,
    maxNetBonus,truncatedTailProbability:truncatedTail,
    allBonusDrawsAccepted:true,retainedCrobatDarkAssetUsable:'unverified',
    gameWinRateQualified:false};
}

function run(root=path.resolve(__dirname,'..')){
  const field=require(path.join(root,
    'results/aichi-2026/full-decklists.json'));
  const rank6=field.decks.find(x=>x.rank===6);
  assert.ok(rank6,'Rank6 original 60 is required');
  assert.deepEqual(rank6.cards.filter(x=>x.category==='Pokémon')
    .map(x=>[x.count,x.name,x.printing.set,x.printing.number]),
    [[4,'Iron Thorns ex','TWM','77']]);
  const rank11=sourceCensus(root).rows.find(x=>x.rank===11);
  assert.ok(rank11);
  const args={basicCount:rank11.basicCount,
    vipCount:rank11.vipCount,crobatCount:rank11.crobatCount};
  const model=coupledBonusExposure(args,4);
  const noBonus=openingCohold(args);
  assert.ok(Math.abs(model.noBonusGoingFirst-
    Number(noBonus.goingFirst.numerator)/
    Number(noBonus.goingFirst.denominator))<1e-12);
  return {sourceRank:11,opponentRank:6,...model,
    darkAssetAvailableUnderUnbrokenInitialization:false};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={VERSION,coupledBonusExposure,run};
