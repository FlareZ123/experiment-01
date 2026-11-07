'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-rank3-lusamine-loop-stochastic-owner-horizon-v2';

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

const ACCESS_VERSION='agent1-rank3-post-rototiller-direct-mail-access-v1';

/**
 * Exact binomial coefficient for the small (0..60) card-count domain.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function chooseBigInt(n,k){
  if(k<0||n<k)return 0n;
  let value=1n;
  for(let i=1;i<=k;i++)
    value=value*BigInt(n-k+i)/BigInt(i);
  return value;
}

/**
 * Normalize a nonnegative exact probability fraction.
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{n:bigint,d:bigint}}
 */
function probabilityFraction(numerator,denominator){
  assert.ok(numerator>=0n&&denominator>0n);
  const divisor=gcdBigInt(numerator,denominator);
  return {n:numerator/divisor,d:denominator/divisor};
}

/**
 * Add two exact probability fractions.
 * @param {{n:bigint,d:bigint}} left
 * @param {{n:bigint,d:bigint}} right
 * @returns {{n:bigint,d:bigint}}
 */
function addProbabilityFractions(left,right){
  return probabilityFraction(
    left.n*right.d+right.n*left.d,left.d*right.d
  );
}

/**
 * Multiply two exact probability fractions.
 * @param {{n:bigint,d:bigint}} left
 * @param {{n:bigint,d:bigint}} right
 * @returns {{n:bigint,d:bigint}}
 */
function multiplyProbabilityFractions(left,right){
  return probabilityFraction(left.n*right.n,left.d*right.d);
}

/**
 * Subtract exact probability fractions where left >= right.
 * @param {{n:bigint,d:bigint}} left
 * @param {{n:bigint,d:bigint}} right
 * @returns {{n:bigint,d:bigint}}
 */
function subtractProbabilityFractions(left,right){
  const numerator=left.n*right.d-right.n*left.d;
  assert.ok(numerator>=0n,'probability subtraction must stay nonnegative');
  return probabilityFraction(numerator,left.d*right.d);
}

/**
 * Add a probability mass to a deck-state DP map.
 * @param {Map<string,{n:bigint,d:bigint}>} states
 * @param {number} deckSize
 * @param {number} otherTrainerCount
 * @param {{n:bigint,d:bigint}} mass
 */
function addMailState(states,deckSize,otherTrainerCount,mass){
  if(mass.n===0n)return;
  const key=deckSize+':'+otherTrainerCount;
  states.set(key,addProbabilityFractions(
    states.get(key)??probabilityFraction(0n,1n),mass
  ));
}

/**
 * Probability that one target card is found by k Trainers' Mail already in
 * hand. The deck contains exactly one target plus otherTrainerCount eligible
 * Trainer cards; every other card (including any Mail still in deck) is
 * ineligible for the Mail search. A missed Mail takes one eligible Trainer
 * when one appears among the top four; the other three cards are shuffled
 * back. If no eligible Trainer appears, the deck size is unchanged.
 *
 * @param {number} deckSize
 * @param {number} otherTrainerCount Excludes the target and Trainers' Mail.
 * @param {number} mailsInHand
 * @returns {{n:bigint,d:bigint}}
 */
function probabilityMailOnly(deckSize,otherTrainerCount,mailsInHand){
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=1&&deckSize<=60);
  assert.ok(Number.isSafeInteger(otherTrainerCount)&&
    otherTrainerCount>=0&&otherTrainerCount<=deckSize-1);
  assert.ok(Number.isSafeInteger(mailsInHand)&&
    mailsInHand>=0&&mailsInHand<=2);

  let states=new Map([
    [deckSize+':'+otherTrainerCount,probabilityFraction(1n,1n)]
  ]);
  let success=probabilityFraction(0n,1n);
  for(let attempt=0;attempt<mailsInHand;attempt++){
    const next=new Map();
    for(const [key,mass] of states){
      const [deck,trainers]=key.split(':').map(Number);
      if(deck<=4){
        success=addProbabilityFractions(success,mass);
        continue;
      }
      const hit=probabilityFraction(4n,BigInt(deck));
      success=addProbabilityFractions(success,
        multiplyProbabilityFractions(mass,hit));
      const miss=probabilityFraction(BigInt(deck-4),BigInt(deck));
      const noEligible=probabilityFraction(
        chooseBigInt(deck-1-trainers,4),
        chooseBigInt(deck-1,4)
      );
      const noPick=multiplyProbabilityFractions(miss,noEligible);
      const pick=subtractProbabilityFractions(miss,noPick);
      addMailState(next,deck,trainers,
        multiplyProbabilityFractions(mass,noPick));
      addMailState(next,deck-1,trainers-1,
        multiplyProbabilityFractions(mass,pick));
    }
    states=next;
  }
  return success;
}

/**
 * Exact conditional probability that the one Handiwork in deck reaches hand
 * through the next mandatory draw plus the rank-3 deck's two Trainers' Mail.
 *
 * deckSize is measured immediately after Rototiller's shuffle and before the
 * next turn draw. otherTrainerCount counts other eligible Trainer cards in
 * deck, excluding Handiwork and Trainers' Mail. The remaining Mail copies are
 * split between hand and deck; copies in discard/Prizes are unavailable.
 *
 * This is a direct draw/Mail channel only. It does not model Arven chains,
 * Forest Seal Stone, Teammates, Lillie's Determination, Rotom V, Tropical
 * Beach, Player's Ceremony, card locks, or the probability of being in this
 * post-Rototiller state. It measures access to hand, not whether Handiwork
 * can be played that turn after another Supporter has been used.
 *
 * @param {number} deckSize Cards in deck before the next mandatory draw.
 * @param {number} otherTrainerCount Other eligible Trainers in deck.
 * @param {number} mailsInDeck Trainers' Mail copies still in deck (0..2).
 * @param {number} mailsInHand Trainers' Mail copies already in hand (0..2).
 * @returns {object} Exact rational access probability and assumptions.
 */
function probabilityHandiworkAccessByNaturalDrawAndMail(
  deckSize,otherTrainerCount,mailsInDeck,mailsInHand
){
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=1&&deckSize<=60,
    'deckSize must be 1..60');
  assert.ok(Number.isSafeInteger(otherTrainerCount)&&
    otherTrainerCount>=0&&otherTrainerCount<=deckSize-1,
    'otherTrainerCount must exclude the target and be feasible');
  assert.ok(Number.isSafeInteger(mailsInDeck)&&
    mailsInDeck>=0&&mailsInDeck<=2,
    'mailsInDeck must be 0..2');
  assert.ok(Number.isSafeInteger(mailsInHand)&&
    mailsInHand>=0&&mailsInHand<=2,
    'mailsInHand must be 0..2');
  assert.ok(mailsInDeck+mailsInHand<=2,
    'the rank-3 list contains only two Trainers\' Mail');

  const nonTrainerCount=deckSize-1-otherTrainerCount-mailsInDeck;
  assert.ok(nonTrainerCount>=0,
    'target, other Trainers and Mail copies cannot exceed deckSize');
  let success=probabilityFraction(1n,BigInt(deckSize));

  if(otherTrainerCount>0){
    const branch=probabilityFraction(
      BigInt(otherTrainerCount),BigInt(deckSize)
    );
    success=addProbabilityFractions(success,
      multiplyProbabilityFractions(branch,
        probabilityMailOnly(deckSize-1,otherTrainerCount-1,mailsInHand)));
  }
  if(mailsInDeck>0){
    const branch=probabilityFraction(BigInt(mailsInDeck),BigInt(deckSize));
    success=addProbabilityFractions(success,
      multiplyProbabilityFractions(branch,
        probabilityMailOnly(deckSize-1,otherTrainerCount,mailsInHand+1)));
  }
  if(nonTrainerCount>0){
    const branch=probabilityFraction(BigInt(nonTrainerCount),BigInt(deckSize));
    success=addProbabilityFractions(success,
      multiplyProbabilityFractions(branch,
        probabilityMailOnly(deckSize-1,otherTrainerCount,mailsInHand)));
  }

  return {
    version:ACCESS_VERSION,
    deckSizeBeforeDraw:deckSize,
    otherTrainerCount,
    mailsInDeck,
    mailsInHand,
    targetCopiesInDeck:1,
    exactProbability:{
      numerator:success.n.toString(),
      denominator:success.d.toString()
    },
    probability:Number(success.n)/Number(success.d)
  };
}

/**
 * Build one illustrative Lusamine/VS Seeker-only Handiwork recovery schedule
 * from the published rank-3 Snorlax Stall inventory.
 *
 * The example assumes one Handiwork, three VS Seeker, two Lusamine, and one
 * other legal Supporter are accessible. Turns 1-4 use Handiwork; turns 2-4
 * first use one VS Seeker to recover it. Turn 5 uses a filler Supporter so
 * the first Lusamine has two eligible Supporters to recover. Turn 6 uses
 * Lusamine 1 to recover Handiwork and the filler. Thereafter Handiwork and
 * the two Lusamine copies alternate.
 *
 * Each Handiwork use has two independent coin flips: 0, 2, or 4 cards
 * milled with relative weights 1:2:1. Burrow mill is a separate scenario
 * input and is added to every turn's outcomes. Rototiller is not modeled.
 *
 * This is one conditional sequence, not a maximum, upper bound, lower bound,
 * or representative opponent policy. It deliberately omits Bunnelby's
 * Rototiller and the deck-to-hand search/draw lines that may enable further
 * Handiwork reuse. The all-turn iid Handiwork stress is not established as
 * achievable or impossible. The schedule starts at the first opponent turn
 * where the modeled Supporter/attack actions are legal; prepend or adjust
 * rows for turn order, first-turn restrictions, unavailable resources, or
 * disruption.
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
  distributionOfFutureOwnerStartsUnderSchedule,
  probabilityHandiworkAccessByNaturalDrawAndMail
};
