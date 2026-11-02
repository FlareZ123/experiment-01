'use strict';

/**
 * Agent40: original rank2 Bunnelby/G&H/Artazon/Capture double-TM
 * opening access under genuine *simultaneous* both-player mulligan rules.
 *
 * This counts physical resource location, NOT a selected legal action chain,
 * actual opponent decisions, source-competent play, or match wins.
 * Each voluntarily accepted mulligan card is drawn after the six Prize cards
 * and before the normal first-turn draw. Source Bunnelby must start in the
 * original seven cards; four stage successors must remain in owner's deck.
 */
const assert=require('node:assert/strict');
const path=require('node:path');
const {ID,makePool,loadSource,choose,VALID_OPENING,generator}=
  require('../../scripts/agent7-vileplume-artazon-capture-opening.cjs');

const VERSION='agent40-rank2-opponent-mulligan-bonus-stage-survival-v1';
const REQUIRED_RESOURCES=[ID.O,ID.P,ID.A,ID.C,ID.TM];
const REQUIRED_STAGES=[ID.Gloom,ID.Pidgeotto,ID.VileplumeAOR,ID.Pidgeot];
const ID_COUNT=Math.max(...Object.values(ID))+1;

/**
 * Check the same originally drawn physical 60 for every optional bonus count.
 * Positions: original 7 hand, 6 Prizes, then m bonus cards and first normal
 * draw; their relative random order is exchangeable when Prize identities
 * are hidden. The first of these later cards can be regarded as the ordinary
 * draw for this location-only test. No extra card can repair an invalid
 * original seven, and Bunnelby must already be in that initial seven.
 *
 * @param {Uint8Array} cards Complete randomized original rank2 category 60.
 * @param {number} maxBonus Maximum separately evaluated bonus count.
 * @returns {boolean[]} Ready indicators, one for each accepted-bonus count.
 */
function evaluateBonusLayout(cards,maxBonus){
  assert.equal(cards.length,60);
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const total=new Int16Array(ID_COUNT);
  const hand=new Int16Array(ID_COUNT),prizes=new Int16Array(ID_COUNT);
  for(const id of cards)total[id]++;
  for(let j=0;j<7;j++)hand[cards[j]]++;
  for(let j=7;j<13;j++)prizes[cards[j]]++;
  const starter=hand[ID.B]>0;
  const resources=REQUIRED_RESOURCES.every(id=>total[id]-prizes[id]>0);
  const outcome=[];
  for(let m=0;m<=maxBonus;m++){
    hand[cards[13+m]]++;
    const connector=hand[ID.GH]+hand[ID.TC]>0;
    const gh=hand[ID.GH]>0||
      (hand[ID.TC]>0&&total[ID.GH]-prizes[ID.GH]-hand[ID.GH]>0);
    const stages=REQUIRED_STAGES.every(id=>
      total[id]-prizes[id]-hand[id]>0);
    outcome.push(starter&&connector&&gh&&resources&&stages);
  }
  return outcome;
}

/**
 * Independent reproducible physical partial shuffles with paired bonuses.
 * We sample an entire (13+1+maxBonus) prefix, so every per-m state comes
 * from the SAME shuffled source 60; no independent-seed comparison error.
 *
 * @param {Uint8Array} sourcePool The manifest-validated rank2 60 categories.
 * @param {number} samples Number of uniformly randomized source deals.
 * @param {number} seed Nonzero 32-bit xorshift seed.
 * @param {number} maxBonus Maximum voluntary bonuses evaluated.
 * @returns {object} Counts and valid-seven-conditional access estimates.
 */
function sampleOpeningBonusScreen(sourcePool,samples,seed,maxBonus=16){
  assert.equal(sourcePool?.length,60);
  assert.ok(Number.isSafeInteger(samples)&&samples>0);
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const cards=Uint8Array.from(sourcePool);
  const total=new Int16Array(ID_COUNT);
  for(const id of cards)total[id]++;
  assert.equal(total[ID.B],2);
  assert.equal(total[ID.GH],4);
  const rnd=generator(seed);
  const swaps=new Uint8Array(14+maxBonus);
  const ready=Array(maxBonus+1).fill(0);
  const connector=Array(maxBonus+1).fill(0);
  const stages=Array(maxBonus+1).fill(0);
  const hand=new Int16Array(ID_COUNT);
  const prizes=new Int16Array(ID_COUNT);
  for(let trial=0;trial<samples;trial++){
    for(let j=0;j<swaps.length;j++){
      const k=j+Math.floor(rnd()*(60-j));
      swaps[j]=k;
      const v=cards[j];cards[j]=cards[k];cards[k]=v;
    }
    hand.fill(0);prizes.fill(0);
    for(let j=0;j<7;j++)hand[cards[j]]++;
    for(let j=7;j<13;j++)prizes[cards[j]]++;
    const starter=hand[ID.B]>0;
    const resourceAccess=REQUIRED_RESOURCES.every(id=>
      total[id]-prizes[id]>0);
    if(starter&&resourceAccess){
      for(let m=0;m<=maxBonus;m++){
        hand[cards[13+m]]++;
        const hasConnector=hand[ID.GH]+hand[ID.TC]>0;
        if(hasConnector)connector[m]++;
        const hasGuzma=hand[ID.GH]>0||
          (hand[ID.TC]>0&&
            total[ID.GH]-prizes[ID.GH]-hand[ID.GH]>0);
        const stagesInDeck=REQUIRED_STAGES.every(id=>
          total[id]-prizes[id]-hand[id]>0);
        if(stagesInDeck)stages[m]++;
        if(hasConnector&&hasGuzma&&stagesInDeck)ready[m]++;
      }
    }
    for(let j=swaps.length-1;j>=0;j--){
      const k=swaps[j],v=cards[j];cards[j]=cards[k];cards[k]=v;
    }
  }
  const probability=ready.map(v=>v/samples/VALID_OPENING);
  return {version:VERSION,samples,seed,maxBonus,ready,connector,stages,
    validSevenProbability:VALID_OPENING,
    conditionalReady:probability,
    outcomeScope:'physical-card-opportunity-only'};
}

/**
 * Probability a player's independent uniformly shuffled initial seven
 * contains at least one of the stated Basic Pokémon copies.
 * @param {number} basics Registered eligible Basic Pokémon count.
 * @returns {number}
 */
function legalSevenProbability(basics){
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=60);
  return 1-Number(choose(60-basics,7))/Number(choose(60,7));
}

/**
 * Completed simultaneous mulligan setup: both invalid seven means both
 * restart, so no bonus accrues. Once precisely one opener is valid, that
 * player may take one bonus per failed opener of the other player.
 *
 * The result describes the distribution of cards the rank2 player could
 * optionally draw, not what any player actually chooses to draw.
 *
 * @param {number} opponentBasics Opposing registered Basic count.
 * @param {number} maxBonus Tail cutoff used for exact capped policy value.
 * @returns {{weight:number[],tail:number,rank2Legal:number,opponentLegal:number}}
 */
function possibleRank2Bonuses(opponentBasics,maxBonus){
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0);
  const a=VALID_OPENING,b=legalSevenProbability(opponentBasics);
  const norm=1-(1-a)*(1-b);
  const weight=[b/norm];
  const positive=a*(1-b)/norm;
  for(let m=1;m<=maxBonus;m++)
    weight.push(positive*b*(1-b)**(m-1));
  const tail=positive*(1-b)**maxBonus;
  assert.ok(Math.abs(weight.reduce((s,p)=>s+p,0)+tail-1)<1e-11);
  return {weight,tail,rank2Legal:a,opponentLegal:b,
    rank2GetsAnyBonus:positive,
    simultaneousBothInvalidRestart:(1-a)*(1-b)};
}

/**
 * A blind optional-bonus cap k accepts min(k,m) of m available bonus draws.
 * Values are exact given the supplied conditional opening estimates and
 * the analytical opponent-mulligan distribution. Unlimited bonus outcome
 * has a rigorous tail interval because sampling ends at maxBonus.
 *
 * @param {number[]} conditionalReady Source screen for m=0..maxBonus.
 * @param {number} opponentBasics Opposing Basic count.
 * @returns {object}
 */
function summarizeBonusCaps(conditionalReady,opponentBasics){
  assert.ok(Array.isArray(conditionalReady)&&conditionalReady.length>0);
  const maxBonus=conditionalReady.length-1;
  const dist=possibleRank2Bonuses(opponentBasics,maxBonus);
  const caps=conditionalReady.map((_,cap)=>
    dist.weight.reduce((sum,w,m)=>
      sum+w*conditionalReady[Math.min(m,cap)],0)+
    dist.tail*conditionalReady[cap]);
  const unlimitedLower=dist.weight.reduce((sum,w,m)=>
    sum+w*conditionalReady[m],0);
  const bestCap=caps.indexOf(Math.max(...caps));
  return {opponentBasics,
    distribution:{...dist},
    readyWithAllBonusesLower:unlimitedLower,
    readyWithAllBonusesUpper:unlimitedLower+dist.tail,
    readinessByBlindBonusCap:caps,
    sampledBestCap:bestCap,
    sampledBestCapRate:caps[bestCap]};
}

/** @returns {Uint8Array} Pinned exact original rank2 printed 60. */
function originalRank2Pool(){
  const source=loadSource(path.resolve(__dirname,'../..'));
  const rank2=source.decks.find(x=>x.rank===2);
  assert.ok(rank2);
  return makePool(rank2);
}

if(require.main===module){
  const samples=Number(process.argv[2]??1000000);
  const maxBonus=Number(process.argv[3]??16);
  const seed=Number(process.argv[4]??2102664725);
  const screen=sampleOpeningBonusScreen(
    originalRank2Pool(),samples,seed,maxBonus);
  process.stdout.write(JSON.stringify({screen,
    matchups:{
      originalRank6IronThorns:summarizeBonusCaps(
        screen.conditionalReady,4),
      originalRank1ShadowRider:summarizeBonusCaps(
        screen.conditionalReady,14)
    },
    competitiveQualifiedGames:0})+'\n');
}
module.exports={VERSION,REQUIRED_RESOURCES,REQUIRED_STAGES,
  evaluateBonusLayout,sampleOpeningBonusScreen,legalSevenProbability,
  possibleRank2Bonuses,summarizeBonusCaps,originalRank2Pool};
