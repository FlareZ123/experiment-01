'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const VERSION='agent2-openers-v1';

/**
 * Exact integer binomial coefficient for the small numbers of cards involved.
 * @param {number} n Population
 * @param {number} k Draws
 * @returns {number}
 */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
    n<0||k<0||k>n)return 0;
  k=Math.min(k,n-k);
  let c=1;
  for(let i=1;i<=k;i++)c=c*(n-k+i)/i;
  return Math.round(c);
}

/**
 * Number of opening Basics after the hand is conditioned to be valid.
 * This is physical first-seven opening evidence, before turn-one actions.
 * @param {number} nBasic Basic Pokémon among 60 cards
 * @returns {{pValid:number,pAtLeastTwoGivenValid:number,pExactlyOneGivenValid:number}}
 */
function basicOpeningDistribution(nBasic){
  assert.ok(Number.isInteger(nBasic)&&nBasic>=1&&nBasic<=60);
  const denominator=choose(60,7);
  const none=choose(60-nBasic,7)/denominator;
  const one=nBasic*choose(60-nBasic,6)/denominator;
  const valid=1-none;
  return {
    pValid:valid,
    pAtLeastTwoGivenValid:(1-none-one)/valid,
    pExactlyOneGivenValid:one/valid
  };
}

/**
 * On the second player's first turn they see seven opening cards plus the
 * normal turn draw. Prize six selection is uniformly exchangeable with any
 * one remaining card and is properly marginalized here.
 *
 * A matching frontliner must be among the original seven to be selected as
 * Active without any search/switch. The Energy may be in the first seven or
 * the first turn's eighth observed card.
 *
 * @param {number} frontliners Basic first-turn attackers in the deck
 * @param {number} otherBasics Other Basic Pokémon in the deck
 * @param {number} usableEnergy Energy cards satisfying [C] attack cost
 * @returns {number} Conditional probability given a legal starting hand
 */
function directColorlessAttackerReady(frontliners,otherBasics,usableEnergy){
  assert.ok([frontliners,otherBasics,usableEnergy].every(x=>
    Number.isInteger(x)&&x>=0)&&frontliners>=1&&
    frontliners+otherBasics+usableEnergy<=60);
  const filler=60-frontliners-otherBasics-usableEnergy;
  const validHands=choose(60,7)-choose(60-frontliners-otherBasics,7);
  assert.ok(validHands>0);
  let validAttackHands=0;
  for(let w=1;w<=Math.min(frontliners,7);w++){
    for(let b=0;b<=Math.min(otherBasics,7-w);b++){
      for(let e=0;e<=Math.min(usableEnergy,7-w-b);e++){
        const f=7-w-b-e;
        const hands=choose(frontliners,w)*choose(otherBasics,b)*
          choose(usableEnergy,e)*choose(filler,f);
        if(!hands)continue;
        validAttackHands+=hands*(e>0?1:(usableEnergy-e)/53);
      }
    }
  }
  return validAttackHands/validHands;
}

/**
 * Probability of a free Hisuian Voltorb attack producing at least
 * 'recipients' meaningful Basic Energy attachments to distinct *other*
 * Basic Pokémon placed from the player's first eight seen cards, with enough
 * Basic Energy still in the live deck after six face-down Prize cards.
 * No search or switch actions, Pokémon redraws, Ability usage, external
 * setup, Prizes taken, or opponent interaction are included.
 *
 * @param {number} frontliners Directly started Hisuian Voltorb copies
 * @param {number} otherBasics Other eligible Basic receiver cards
 * @param {number} basicEnergy Basic Energy in the 60
 * @param {1|2} recipients Required distinct Benched receivers
 * @returns {number} Conditional probability given legal 7-card opening
 */
function directVoltorbAttachment(frontliners,otherBasics,basicEnergy,recipients){
  assert.ok([frontliners,otherBasics,basicEnergy].every(x=>
    Number.isInteger(x)&&x>=0));
  assert.ok(frontliners>=1&&frontliners+otherBasics+basicEnergy<=60);
  assert.ok(recipients===1||recipients===2);
  const filler=60-frontliners-otherBasics-basicEnergy;
  const validHands=choose(60,7)-choose(60-frontliners-otherBasics,7);
  assert.ok(validHands>0);
  const prizesDenominator=choose(52,6);
  let successful=0;
  for(let w=1;w<=Math.min(frontliners,7);w++){
    for(let b=0;b<=Math.min(otherBasics,7-w);b++){
      for(let e=0;e<=Math.min(basicEnergy,7-w-b);e++){
        const f=7-w-b-e;
        const hands=choose(frontliners,w)*choose(otherBasics,b)*
          choose(basicEnergy,e)*choose(filler,f);
        if(!hands)continue;
        const draws=[
          {type:'frontliner',remaining:frontliners-w},
          {type:'receiver',remaining:otherBasics-b},
          {type:'energy',remaining:basicEnergy-e},
          {type:'filler',remaining:filler-f}
        ];
        for(const draw of draws){
          if(draw.remaining===0)continue;
          if(b+(draw.type==='receiver'?1:0)<recipients)continue;
          const energyRemaining=basicEnergy-e-
            (draw.type==='energy'?1:0);
          let afterPrizes=0;
          for(let p=0;p<=Math.min(6,energyRemaining);p++){
            if(energyRemaining-p<recipients)continue;
            afterPrizes+=choose(energyRemaining,p)*
              choose(52-energyRemaining,6-p)/prizesDenominator;
          }
          successful+=hands*draw.remaining/53*afterPrizes;
        }
      }
    }
  }
  return successful/validHands;
}

/**
 * Chance to directly choose one of W Energy-free Budew starters from the
 * opening seven in a legal 60-card deck containing another O Basics.
 * @param {number} frontliners Count of the targeted Energy-free Basic
 * @param {number} otherBasics Count of all other Basics
 * @returns {number}
 */
function directFreeFrontliner(frontliners,otherBasics){
  assert.ok(frontliners>=1&&otherBasics>=0&&
    frontliners+otherBasics<=60);
  return (choose(60,7)-choose(60-frontliners,7))/
    (choose(60,7)-choose(60-frontliners-otherBasics,7));
}

/**
 * Stronger Cresselia CRE Crescent Glow feasibility: Cresselia must be an
 * actual opening-seven Basic; the first eight must include a Psychic Energy
 * to pay [P], and a DIFFERENT targeted Basic (e.g. Shadow Rider Calyrex V)
 * to receive three Psychic Energy from the post-Prize live deck.
 *
 * This exact hypergeometric result considers zero hand search and no support
 * draw beyond the player's turn-one ordinary draw, conditional on a legal
 * initial seven-card hand. The three accelerated cards come exclusively from
 * the deck, so prizes are marginalized *after* the eighth observed card.
 * `otherBasics` excludes the specifically desired target copies.
 * The printed attack could instead attach to Cresselia itself; this model
 * deliberately counts only the more strategic distinct-target ALS.
 *
 * @param {number} cresselia Four-copy-cap Basic attacker count
 * @param {number} targetBasic Other target Basic print count
 * @param {number} otherBasics All additional Basic cards in 60
 * @param {number} psychicEnergy Usable Basic Psychic Energy cards in 60
 * @returns {number} Exact conditionally valid opening probability
 */
function directCresseliaThreePsychicToTarget(
    cresselia,targetBasic,otherBasics,psychicEnergy){
  assert.ok([cresselia,targetBasic,otherBasics,psychicEnergy].every(x=>
    Number.isSafeInteger(x)&&x>=0));
  assert.ok(cresselia>=1&&targetBasic>=1&&
    cresselia+targetBasic+otherBasics+psychicEnergy<=60);
  const filler=60-cresselia-targetBasic-otherBasics-psychicEnergy;
  const legal=choose(60,7)-
    choose(60-cresselia-targetBasic-otherBasics,7);
  assert.ok(legal>0);
  const prizeDenominator=choose(52,6);
  let success=0;
  for(let w=1;w<=Math.min(cresselia,7);w++){
    for(let t=0;t<=Math.min(targetBasic,7-w);t++){
      for(let b=0;b<=Math.min(otherBasics,7-w-t);b++){
        for(let e=0;e<=Math.min(psychicEnergy,7-w-t-b);e++){
          const f=7-w-t-b-e;
          const ways=choose(cresselia,w)*choose(targetBasic,t)*
            choose(otherBasics,b)*choose(psychicEnergy,e)*choose(filler,f);
          if(!ways)continue;
          const options=[
            {kind:'cresselia',remaining:cresselia-w},
            {kind:'target',remaining:targetBasic-t},
            {kind:'other',remaining:otherBasics-b},
            {kind:'energy',remaining:psychicEnergy-e},
            {kind:'filler',remaining:filler-f}
          ];
          for(const draw of options){
            if(draw.remaining===0)continue;
            if(t+(draw.kind==='target'?1:0)<1||
               e+(draw.kind==='energy'?1:0)<1)continue;
            const liveEnergy=psychicEnergy-e-
              (draw.kind==='energy'?1:0);
            let prizesCompatible=0;
            for(let p=0;p<=Math.min(6,liveEnergy-3);p++){
              prizesCompatible+=choose(liveEnergy,p)*
                choose(52-liveEnergy,6-p)/prizeDenominator;
            }
            success+=ways*(draw.remaining/53)*prizesCompatible;
          }
        }
      }
    }
  }
  return success/legal;
}

// The existing exact-printing Basic census is reused as authoritative here.
// It handles English promo-number aliases and multiple set gallery namespaces.
const {fromRepository}=require('./aichi-opening-basics.cjs');

/**
 * @param {boolean} [emit] Whether to print human-readable JSON to stdout
 * @returns {object} Field Basic opening probabilities and toy opener lines
 */
function main(emit=true){
  const source=fromRepository(ROOT);
  const rows=source.rows.map(row=>({
    rank:row.rank,archetype:row.archetype,
    pokemonCount:row.pokemonCount,
    basicPokemonCount:row.basicCount,
    stageOrVMAXCount:row.evolutionCount,
    pValid:1-row.initialMulliganProbability,
    pAtLeastTwoGivenValid:1-row.solitaryBasicGivenValidProbability,
    pExactlyOneGivenValid:row.solitaryBasicGivenValidProbability
  }));
  assert.equal(rows.length,29);
  const nonzeroRanks=rows.map(r=>r.rank).sort((a,b)=>a-b);
  const missing=[];
  for(let i=1;i<=32;i++)if(!nonzeroRanks.includes(i))missing.push(i);
  assert.deepEqual(missing,[23,25,28]);
  const result={
    schema:VERSION,
    scope:'Aichi Open League 2026 May 10, original source printed 60s only',
    missingOriginalRankSixties:missing,
    exactPublishedOriginalSixties:29,
    originalRankOpeningRows:rows,
    sourceMeaning:'Physical first 7 before player may elect Bench; legal hand conditioned on one Basic, no searches',
    simpleIllustrative60:{
      frontlinerCopies:4,otherBasicCopies:8,basicEnergyCount:8,
      remainderFillerCount:40,
      directWhismurBawlShayminGiftIllumisePerfumeWhenSecond:
        directColorlessAttackerReady(4,8,8),
      directBudewFreeItchyPollenWhenSecond:directFreeFrontliner(4,8),
      directVoltorbOneBenchedEnergyWhenSecond:
        directVoltorbAttachment(4,8,8,1),
      directVoltorbTwoBenchedEnergiesWhenSecond:
        directVoltorbAttachment(4,8,8,2)
    },
    cresseliaCREThreePsychicToShadowRiderVIllustration:{
      note:'Replacing non-Shadow-Rider-V Basics with Cresselia; 3 Shadow Rider V, 11 Basic Psychic, total Basic count fixed at 14; direct no-search second turn only',
      activeFourCopies:directCresseliaThreePsychicToTarget(4,3,7,11),
      activeTwoCopies:directCresseliaThreePsychicToTarget(2,3,9,11),
      activeOneCopy:directCresseliaThreePsychicToTarget(1,3,10,11)
    },
    defaultPolicyChanged:false,
    simulationWins:0,
    competitiveQualified:false,
    limitations:'Toy deck only; no first-turn search/switch; no chosen lead competence; opponent actions or Bench decisions unmodeled; no native Twinleaf attacks tested.'
  };
  if(emit)process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={
  VERSION,choose,basicOpeningDistribution,directColorlessAttackerReady,
  directVoltorbAttachment,directFreeFrontliner,
  directCresseliaThreePsychicToTarget,main
};
