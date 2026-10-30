'use strict';

/**
 * Exact structural exposure to a source-first single-Active knockout, not
 * an estimate of Meloetta Donk execution or actual game wins.
 *
 * Candidate initial seven is conditioned Basic-valid. If it contains
 * exactly one Basic and it is selected Active, there is no second Pokémon
 * to promote after that lone Pokémon is Knocked Out before candidate turn.
 * Model source mulligans as repeated independent seven-card hands with a
 * sourceBasics-of-60 Basic composition; take *all* permitted candidate
 * bonus cards after six Prizes. Bonus draws are uniformly distributed
 * subsets of the 53 cards remaining after the initial seven. If another
 * Basic is found, the candidate may Bench it before game start.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}

/**
 * @param {{candidateBasics?:number,frillish?:number,sourceBasics?:number}} [args]
 * @returns {{sourceValidSeven:number,expectedSourceMulligans:number,
 * candidateValidSeven:number,soleBasicGivenValidSeven:number,
 * soleFrillishGivenValidSeven:number,frillishGivenValidSeven:number,
 * postBonusSoleBasic:number,postBonusSoleFrillish:number,
 * omittedSourceMulliganTail:number}}
 */
function exactLoneBasicRisk(args={}){
  const candidateBasics=args.candidateBasics??12,
    frillish=args.frillish??4,sourceBasics=args.sourceBasics??12;
  if(![candidateBasics,frillish,sourceBasics].every(Number.isInteger)||
     candidateBasics<1||candidateBasics>60||frillish<0||
     frillish>candidateBasics||sourceBasics<1||sourceBasics>60)
    throw new RangeError('Invalid 60-card Basic composition');
  const all=choose(60,7);
  const candidateValid=all-choose(60-candidateBasics,7);
  const sourceValid=1-Number(choose(60-sourceBasics,7))/Number(all);
  const candidateProbValid=Number(candidateValid)/Number(all);
  const numSolo=BigInt(candidateBasics)*choose(60-candidateBasics,6);
  const numSoloFrillish=BigInt(frillish)*choose(60-candidateBasics,6);
  const numFrillishSeen=all-choose(60-frillish,7);
  let survive=0;
  let geom=sourceValid;
  for(let m=0;m<=47;m++){
    const afterNonbasic=choose(54-candidateBasics,m);
    const survival=Number(afterNonbasic)/Number(choose(53,m));
    survive+=geom*survival;
    geom*=1-sourceValid;
  }
  return {
    sourceValidSeven:sourceValid,
    expectedSourceMulligans:(1-sourceValid)/sourceValid,
    candidateValidSeven:candidateProbValid,
    soleBasicGivenValidSeven:Number(numSolo)/Number(candidateValid),
    soleFrillishGivenValidSeven:Number(numSoloFrillish)/Number(candidateValid),
    frillishGivenValidSeven:Number(numFrillishSeen)/Number(candidateValid),
    postBonusSoleBasic:Number(numSolo)/Number(candidateValid)*survive,
    postBonusSoleFrillish:Number(numSoloFrillish)/Number(candidateValid)*survive,
    omittedSourceMulliganTail:geom/sourceValid
  };
}

module.exports={choose,exactLoneBasicRisk};
