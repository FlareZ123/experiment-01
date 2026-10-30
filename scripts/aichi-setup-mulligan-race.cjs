"use strict";

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (k<0 || k>n) return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) out=out*BigInt(n-i+1)/BigInt(i);
  return out;
}

/** Exact probability that a shuffled opening hand contains at least one Basic. */
function openingValid(total,basic,hand=7) {
  if(!Number.isSafeInteger(total)||!Number.isSafeInteger(basic)||
     !Number.isSafeInteger(hand)||total<1||basic<1||basic>total||
     hand<1||hand>total) throw new RangeError('Invalid deck or Basic/hand count');
  return Number(choose(total,hand)-choose(total-basic,hand))/
    Number(choose(total,hand));
}

/**
 * The official setup procedure repeats both hands when both are invalid;
 * after exactly one player is valid, it keeps that hand and retries only
 * the invalid player. Bonus counts are maximum optional draws, not claims
 * that a player chooses to take them.
 * @param {number} basicA Basic count in deck A.
 * @param {number} basicB Basic count in deck B.
 * @param {number} [total] Deck cards.
 * @param {number} [hand] Starting hand cards.
 */
function mulliganRace(basicA,basicB,total=60,hand=7) {
  const pA=openingValid(total,basicA,hand);
  const pB=openingValid(total,basicB,hand);
  const qA=1-pA,qB=1-pB;
  const d=1-qA*qB;
  const bonusA=pA*qB/d;
  const bonusB=qA*pB/d;
  return {
    pA,pB,
    bothValid:pA*pB/d,
    aBonusProbability:bonusA,bBonusProbability:bonusB,
    aExpectedBonus:bonusA/pB,bExpectedBonus:bonusB/pA,
    // Conditional on a nonzero bonus: a geometric number of failures,
    // including the first mulligan, before the other deck finds a Basic.
    aAtLeast:(k)=>k<=0?1:bonusA*(qB**(k-1)),
    bAtLeast:(k)=>k<=0?1:bonusB*(qA**(k-1))
  };
}

/**
 * Conditional chance that the valid opening hand plus k bonus draws
 * contains at least one target card. Targets may include Basic Pokemon.
 * Prize identities are random and remain concealed: marginalizing their
 * random removal makes the k extra draws a uniform sample from the
 * (total-hand) cards absent from the initial hand.
 * @param {{total:number,hand:number,basic:number,targets:number,targetBasics:number,extra:number}} args
 */
function targetAccess(args) {
  const {total,hand,basic,targets,targetBasics,extra}=args;
  if(!Number.isSafeInteger(targets)||!Number.isSafeInteger(targetBasics)||
     !Number.isSafeInteger(extra)||targets<1||targets>total||
     targetBasics<0||targetBasics>Math.min(basic,targets)||extra<0||
     extra>total-hand) throw new RangeError('Invalid target composition/draw count');
  const valid=choose(total,hand)-choose(total-basic,hand);
  const noTargetButValid=choose(total-targets,hand)-
    choose(total-targets-basic+targetBasics,hand);
  const noTargetExtra=Number(choose(total-hand-targets,extra))/
    Number(choose(total-hand,extra));
  return 1-Number(noTargetButValid)/Number(valid)*noTargetExtra;
}

/**
 * Marginalize the full two-player setup race, keeping six Prize cards
 * unavailable for optional bonus draws. Tail probabilities are folded into
 * the physical draw cap; the event of reaching it is reported separately.
 * @param {{total?:number,hand?:number,prizes?:number,ownerBasics:number,rivalBasics:number,targets:number,targetBasics:number}} args
 */
function expectedTargetAccess(args) {
  const total=args.total??60,hand=args.hand??7,prizes=args.prizes??6;
  const {ownerBasics,rivalBasics,targets,targetBasics}=args;
  if(!Number.isSafeInteger(prizes)||prizes<0||prizes>=total-hand)
    throw new RangeError('Invalid Prize count');
  const cap=total-hand-prizes;
  const race=mulliganRace(rivalBasics,ownerBasics,total,hand);
  const baseline=targetAccess({total,hand,basic:ownerBasics,targets,
    targetBasics,extra:0});
  let blended=(1-race.bBonusProbability)*baseline;
  const q=1-race.pA;
  for(let k=1;k<cap;k++) {
    const weight=race.bBonusProbability*race.pA*(q**(k-1));
    blended+=weight*targetAccess({total,hand,basic:ownerBasics,
      targets,targetBasics,extra:k});
  }
  const cappedTail=race.bBonusProbability*q**(cap-1);
  blended+=cappedTail*targetAccess({total,hand,basic:ownerBasics,
    targets,targetBasics,extra:cap});
  return {baseline,withAllOptionalBonusDraws:blended,
    uplift:blended-baseline,bonusProbability:race.bBonusProbability,
    expectedOfferedBonus:race.bExpectedBonus,cappedTail};
}

module.exports={choose,openingValid,mulliganRace,targetAccess,expectedTargetAccess};
