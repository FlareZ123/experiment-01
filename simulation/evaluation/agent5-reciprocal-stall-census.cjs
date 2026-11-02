'use strict';

const VERSION='agent5-reciprocal-stall-census-v2';

/**
 * Distinguish a settled Prize change from unchanged or missing Store evidence.
 * Unfinished prompt chains or episode-crossing replays cannot establish a
 * Prize movement, even if a future packet retains before/after arrays.
 * @param {object|undefined} attack Native attack-settlement row.
 * @returns {boolean|null} True for a Prize movement, null if unverified.
 */
function prizeMovement(attack){
  if(attack?.settledPromptChain!==true ||
      attack?.settlementCrossesClockReset===true)return null;
  const before=attack?.prizesBefore,after=attack?.prizesAfter;
  if(!Array.isArray(before)||!Array.isArray(after)||
      before.length!==2||after.length!==2)return null;
  return before.some((value,i)=>value!==after[i]);
}

/**
 * Audit consecutive opponent attack turns preceded by the other seat passing.
 * Read-only: accepted native root actions and settled public Prize arrays only.
 * This flags repeated attack/pass policy loops for review. It does not declare
 * the attacks strategically worthless, paper-invalid, or competitively timed.
 *
 * @param {object} row One original-Store bilateral-development trial row.
 * @param {{minPairs?:number,reviewPairs?:number}} [options]
 * @returns {object} Fully attributed, settled-Store-based loop census.
 */
function reciprocalStallCensus(row,options={}){
  const minPairs=options.minPairs??6;
  const reviewPairs=options.reviewPairs??10;
  if(!Number.isSafeInteger(minPairs)||minPairs<2||
      !Number.isSafeInteger(reviewPairs)||reviewPairs<minPairs)
    throw new RangeError('Reciprocal-stall thresholds must be integers >=2');
  const roots=Array.isArray(row?.rootActionLedger)?row.rootActionLedger:[];
  const ends=new Map(),bySeat={
    0:{passRoots:0,attackRoots:0},1:{passRoots:0,attackRoots:0}
  };
  for(const root of roots){
    if(root?.playerSlot!==0&&root?.playerSlot!==1)continue;
    if(root.action!=='AttackAction'&&root.action!=='PassTurnAction')continue;
    if(!Number.isSafeInteger(root.turnBefore))continue;
    ends.set(root.turnBefore,root);
    if(root.action==='AttackAction')bySeat[root.playerSlot].attackRoots++;
    else bySeat[root.playerSlot].passRoots++;
  }

  const settlements=new Map();
  for(const [seat,packet] of [
    [row?.candidateSeat,row?.candidateAttackSettlement],
    [row?.sourceSeat,row?.sourceAttackSettlement]
  ]){
    if(seat!==0&&seat!==1)continue;
    for(const attack of packet?.attacks??[]){
      settlements.set(seat+':'+attack.turnBefore+':'+attack.attackName,attack);
    }
  }
  const pairs=[];
  for(const [turn,root] of [...ends].sort((a,b)=>a[0]-b[0])){
    const previous=ends.get(turn-1);
    if(root.action!=='AttackAction'||previous?.action!=='PassTurnAction'||
        previous.playerSlot===root.playerSlot)continue;
    const attack=settlements.get(
      root.playerSlot+':'+turn+':'+root.attack);
    pairs.push({
      attackTurn:turn,passTurn:turn-1,passSeat:previous.playerSlot,
      attackSeat:root.playerSlot,attackName:root.attack??null,
      attackerActive:attack?.publicBoardBefore?.[root.playerSlot]
        ?.active?.name??null,
      prizeMovement:prizeMovement(attack),
      settledPromptChain:attack?.settledPromptChain===true
    });
  }
  const groups=[];
  for(const pair of pairs){
    const group=groups.at(-1),last=group?.at(-1);
    const lastKnownActive=group?.findLast(x=>x.attackerActive!==null)
      ?.attackerActive??null;
    if(last&&pair.attackTurn===last.attackTurn+2&&
        pair.passSeat===last.passSeat&&
        pair.attackSeat===last.attackSeat&&
        pair.attackName===last.attackName&&
        (pair.attackerActive===null||lastKnownActive===null||
          pair.attackerActive===lastKnownActive)){
      group.push(pair);
    }else groups.push([pair]);
  }
  const streaks=groups.filter(g=>g.length>=minPairs).map(group=>{
    const first=group[0],last=group.at(-1);
    const beforeFinal=group.slice(0,-1);
    const allBeforeFinalPrizeStable=
      beforeFinal.every(x=>x.prizeMovement===false);
    const confirmedNoPrizeCount=
      group.filter(x=>x.prizeMovement===false).length;
    const unresolvedPrizeCount=
      group.filter(x=>x.prizeMovement===null).length;
    return {
      passSeat:first.passSeat,attackSeat:first.attackSeat,
      attackName:first.attackName,attackerActive:first.attackerActive,
      firstPassTurn:first.passTurn,lastPassTurn:last.passTurn,
      firstAttackTurn:first.attackTurn,lastAttackTurn:last.attackTurn,
      consecutivePairs:group.length,confirmedNoPrizeCount,
      unresolvedPrizeCount,finalAttackPrizeMovement:last.prizeMovement,
      allBeforeFinalPrizeStable,
      sourcePasses:row?.sourceSeat===first.passSeat?group.length:0,
      requiresPolicyReview:group.length>=reviewPairs&&
        allBeforeFinalPrizeStable&&unresolvedPrizeCount===0
    };
  });
  return {
    version:VERSION,trialId:row?.trial?.id??null,
    sourceSeat:row?.sourceSeat??null,candidateSeat:row?.candidateSeat??null,
    gameFinished:row?.finished===true,
    actualOutcomeUnqualified:row?.qualifiesForCompetitiveInference!==true,
    bySeat,streaks,
    policyReviewTriggered:streaks.some(s=>s.requiresPolicyReview),
    interpretation:'Repeated opposing attack and pass roots are a game-policy review signal, not a competitive outcome or paper timing certificate.'
  };
}
module.exports={VERSION,prizeMovement,reciprocalStallCensus};
