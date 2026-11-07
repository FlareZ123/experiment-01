'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-rank3-handiwork-resource-cadence-owner-horizon-v1';

/**
 * Validate a card count or count-like scenario input.
 * @param {number} value
 * @param {string} name
 */
function assertCardCount(value,name){
  assert.ok(Number.isSafeInteger(value)&&value>=0&&value<=60,
    name+' must be a feasible nonnegative card count');
}

/**
 * Greatest common divisor for exact probability fractions.
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function gcdBigInt(a,b){
  while(b!==0n){
    const remainder=a%b;
    a=b;
    b=remainder;
  }
  return a<0n?-a:a;
}

/**
 * Build an optimistic, resource-feasible Team Rocket's Handiwork cadence
 * from the published rank-3 Snorlax Stall inventory.
 *
 * The witness sequence assumes one Handiwork, three VS Seeker, two Lusamine,
 * and one other legal Supporter are accessible. Turns 1-4 use Handiwork;
 * turns 2-4 first use one VS Seeker to recover it. Turn 5 uses a filler
 * Supporter so the first Lusamine has two eligible Supporters to recover.
 * Turn 6 uses Lusamine 1 to recover Handiwork and the filler. Thereafter
 * Handiwork and the two Lusamine copies alternate.
 *
 * Each Handiwork use has two independent coin flips: 0, 2, or 4 cards
 * milled with relative weights 1:2:1. Burrow mill is a separate scenario
 * input and is added to every turn's outcomes.
 *
 * This is a resource-availability upper-pressure witness, not a claim that
 * the opponent can assemble or choose the sequence in an actual game.
 * The schedule starts at the first opponent turn where the modeled
 * Supporter/attack actions are legal; prepend or adjust rows for turn order,
 * first-turn restrictions, unavailable resources, or disruption.
 *
 * @param {number} turns Number of opponent turns to describe.
 * @param {{ownerDeckLoss?:number,burrowPerTurn?:number}} [options]
 * @returns {object[]} Per-turn owner-loss and weighted opponent-mill schedule.
 */
function makeRank3HandiworkCadenceSchedule(turns,options={}){
  assert.ok(Number.isSafeInteger(turns)&&turns>=0&&turns<=61,
    'turns must be an integer from 0 through 61');
  const ownerDeckLoss=options.ownerDeckLoss??0;
  const burrowPerTurn=options.burrowPerTurn??0;
  assertCardCount(ownerDeckLoss,'ownerDeckLoss');
  assert.ok(Number.isSafeInteger(burrowPerTurn)&&
    burrowPerTurn>=0&&burrowPerTurn<=2,
    'burrowPerTurn must be 0, 1, or 2');

  const rows=[];
  for(let index=0;index<turns;index++){
    let supporterAction;
    let itemAction=null;
    let retrievedSupporters=[];
    if(index<4){
      supporterAction='Handiwork';
      if(index>0){
        itemAction='VS Seeker';
        retrievedSupporters=["Team Rocket's Handiwork"];
      }
    }else if(index===4){
      supporterAction='filler Supporter';
    }else if(index===5){
      supporterAction='Lusamine 1';
      retrievedSupporters=["Team Rocket's Handiwork",'filler Supporter'];
    }else if(index%2===0){
      supporterAction='Handiwork';
    }else{
      const lusamineCopy=((index-5)/2)%2===0?1:2;
      const otherCopy=lusamineCopy===1?2:1;
      supporterAction='Lusamine '+lusamineCopy;
      retrievedSupporters=[
        "Team Rocket's Handiwork",
        'Lusamine '+otherCopy
      ];
    }

    const handiworkPlayed=supporterAction==='Handiwork';
    const opponentMillOutcomes=handiworkPlayed?
      [
        {opponentMill:burrowPerTurn,weight:1},
        {opponentMill:burrowPerTurn+2,weight:2},
        {opponentMill:burrowPerTurn+4,weight:1}
      ]:
      [{opponentMill:burrowPerTurn,weight:4}];

    rows.push({
      opponentTurn:index+1,
      ownerDeckLoss,
      supporterAction,
      itemAction,
      retrievedSupporters,
      handiworkPlayed,
      burrowCardsMilled:burrowPerTurn,
      opponentMillOutcomes
    });
  }
  return rows;
}

/**
 * Exact future-owner-turn distribution under a finite per-turn schedule.
 *
 * The owner has already completed the mandatory draw for the current turn.
 * Each row applies owner-side deck loss, then one weighted opponent-mill
 * outcome, then the mandatory draw that starts the next owner turn.
 * If the deck reaches zero before that draw, no next owner turn starts.
 *
 * The schedule must contain remaining+1 rows. Each row's positive integer
 * weights define its exact outcome probabilities. Rows after deckout still
 * contribute their total weight so every path shares one exact denominator.
 *
 * This function models only deck-out survival under supplied public/scenario
 * counts. It does not select actions, estimate tactical value, or determine
 * a game's winner.
 *
 * @param {number} remaining Owner deck count after the current mandatory draw.
 * @param {{ownerDeckLoss:number,opponentMillOutcomes:{opponentMill:number,weight:number}[]}[]} schedule
 * @returns {object} Exact rational distribution and expected future starts.
 */
function distributionOfFutureOwnerStartsUnderSchedule(remaining,schedule){
  assertCardCount(remaining,'remaining');
  assert.ok(Array.isArray(schedule)&&schedule.length>=remaining+1,
    'schedule must contain at least remaining+1 rows');

  const rows=schedule.slice(0,remaining+1).map((row,index)=>{
    assert.ok(row&&typeof row==='object',
      'schedule rows must be scenario objects');
    assertCardCount(row.ownerDeckLoss,
      'schedule['+index+'].ownerDeckLoss');
    assert.ok(Array.isArray(row.opponentMillOutcomes)&&
      row.opponentMillOutcomes.length>0,
      'schedule['+index+'].opponentMillOutcomes must be nonempty');
    let totalWeight=0;
    const outcomes=row.opponentMillOutcomes.map((outcome,outcomeIndex)=>{
      assert.ok(outcome&&typeof outcome==='object',
        'mill outcomes must be objects');
      assertCardCount(outcome.opponentMill,
        'schedule['+index+'].opponentMillOutcomes['+outcomeIndex+'].opponentMill');
      assert.ok(Number.isSafeInteger(outcome.weight)&&outcome.weight>0,
        'mill outcome weights must be positive safe integers');
      assert.ok(Number.isSafeInteger(totalWeight+outcome.weight),
        'mill outcome total weight must be a safe integer');
      totalWeight+=outcome.weight;
      return {
        opponentMill:outcome.opponentMill,
        weight:outcome.weight
      };
    });
    return {
      ownerDeckLoss:row.ownerDeckLoss,
      outcomes,
      totalWeight
    };
  });

  let states=new Map([[remaining+':0',1n]]);
  let commonDenominator=1n;
  for(let step=0;step<rows.length;step++){
    const row=rows[step];
    const totalWeightBig=BigInt(row.totalWeight);
    commonDenominator*=totalWeightBig;
    const next=new Map();
    const add=(deck,starts,numerator)=>{
      const key=deck+':'+starts;
      next.set(key,(next.get(key)??0n)+numerator);
    };

    for(const [key,numerator] of states){
      const [deck,starts]=key.split(':').map(Number);
      if(deck===0){
        add(0,starts,numerator*totalWeightBig);
        continue;
      }
      for(const outcome of row.outcomes){
        const cardsConsumed=row.ownerDeckLoss+
          outcome.opponentMill+1;
        const weightedNumerator=numerator*BigInt(outcome.weight);
        if(cardsConsumed<=deck){
          add(deck-cardsConsumed,starts+1,weightedNumerator);
        }else{
          add(0,starts,weightedNumerator);
        }
      }
    }
    states=next;
  }

  const countsByStarts=new Map();
  for(const [key,numerator] of states){
    const [deck,starts]=key.split(':').map(Number);
    assert.equal(deck,0,
      'remaining+1 mandatory-draw cycles must reach the absorbing deckout state');
    countsByStarts.set(starts,
      (countsByStarts.get(starts)??0n)+numerator);
  }

  let probabilityMass=0n;
  let expectedNumerator=0n;
  const distribution=[...countsByStarts.entries()]
    .sort((a,b)=>a[0]-b[0])
    .map(([futureOwnerStarts,numerator])=>{
      probabilityMass+=numerator;
      expectedNumerator+=BigInt(futureOwnerStarts)*numerator;
      return {
        futureOwnerStarts,
        numerator:numerator.toString()
      };
    });
  assert.equal(probabilityMass,commonDenominator,
    'exact outcome numerators must sum to the common denominator');

  const divisor=gcdBigInt(expectedNumerator,commonDenominator);
  return {
    version:VERSION,
    remaining,
    fixedHorizonCycles:rows.length,
    commonDenominator:commonDenominator.toString(),
    distribution,
    expectedFutureOwnerStarts:{
      numerator:(expectedNumerator/divisor).toString(),
      denominator:(commonDenominator/divisor).toString()
    }
  };
}

module.exports={
  VERSION,
  makeRank3HandiworkCadenceSchedule,
  distributionOfFutureOwnerStartsUnderSchedule
};
