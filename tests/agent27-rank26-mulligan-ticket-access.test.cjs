'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  avoid,ticketCompressorVisibility,offeredBonusProbability,
  rank26TicketAgainstBasics,sourceRank26Field
}=require('../scripts/agent27-rank26-mulligan-ticket-access.cjs');
const {ticketCompressor}=require('../scripts/aichi-meloetta-ticket-compressor.cjs');
const {mulliganProbability,opponentDrawOpportunities}=
  require('../scripts/aichi_opening_audit.cjs');

/** Iterate all unordered physical-card subsets of fixed size. */
function combinations(items,k,visit,start=0,picked=[]) {
  if(picked.length===k) { visit(picked); return; }
  for(let i=start;i<=items.length-(k-picked.length);i++) {
    picked.push(items[i]);combinations(items,k,visit,i+1,picked);picked.pop();
  }
}

/** Exhaust every physical hand, Prize set and post-Prize draw set. */
function miniaturePhysicalProbability(n,b,h,q,c,k) {
  const cards=['E','T',...Array(c).fill('C'),...Array(b).fill('B'),
    ...Array(n-b-c-2).fill('O')].map((name,id)=>({name,id}));
  let good=0,total=0;
  combinations(cards,h,hand=>{
    if(!hand.some(card=>card.name==='B'))return;
    const inHand=new Set(hand.map(card=>card.id));
    const rest=cards.filter(card=>!inHand.has(card.id));
    combinations(rest,q,prizes=>{
      const prized=new Set(prizes.map(card=>card.id));
      const restAfterPrizes=rest.filter(card=>!prized.has(card.id));
      combinations(restAfterPrizes,k,draws=>{
        total++;
        const seen=hand.concat(draws);
        if(prizes.some(card=>card.name==='E')&&
          seen.some(card=>card.name==='T')&&
          seen.some(card=>card.name==='C')) good++;
      });
    });
  });
  return good/total;
}

/** Small deterministic random stream used solely for a physical-deal cross-check. */
function seededRandom(seed) {
  let state=seed>>>0;
  return ()=>{
    state=(Math.imul(1664525,state)+1013904223)>>>0;
    return state/4294967296;
  };
}
function shuffle(array,random) {
  const copy=array.slice();
  for(let i=copy.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
/** Genuine simultaneous redraw logic for two physical lists. */
function simulateJointMulliganOpportunity(samples,bOpp,seed) {
  const random=seededRandom(seed);
  const own=[...Array(12).fill('B'),'E','T',...Array(4).fill('C'),
    ...Array(42).fill('O')];
  const opp=[...Array(bOpp).fill('B'),...Array(60-bOpp).fill('O')];
  const valid=cards=>cards.slice(0,7).includes('B');
  let success=0,offersTotal=0;
  for(let trial=0;trial<samples;trial++) {
    let ownDeal,oppDeal;
    do {
      ownDeal=shuffle(own,random);oppDeal=shuffle(opp,random);
    }while(!valid(ownDeal)&&!valid(oppDeal));
    let bonus=0;
    if(!valid(ownDeal)) {
      do { ownDeal=shuffle(own,random); } while(!valid(ownDeal));
    }else if(!valid(oppDeal)) {
      do { bonus++;oppDeal=shuffle(opp,random); } while(!valid(oppDeal));
    }
    offersTotal+=bonus;
    const seen=ownDeal.slice(0,7).concat(ownDeal.slice(13,14+Math.min(46,bonus)));
    if(ownDeal.slice(7,13).includes('E')&&seen.includes('T')&&seen.includes('C')) success++;
  }
  return {probability:success/samples,meanOffers:offersTotal/samples,success,offersTotal,samples};
}

test('source rank26 physical direct-first-eight visibility matches existing exact model',()=>{
  const args={deckSize:60,ownBasics:12,handSize:7,prizes:6,compressors:4,laterDraws:1};
  const expected=ticketCompressor(60,12,7,6,4).directRoute;
  assert.ok(Math.abs(ticketCompressorVisibility(args)-expected)<1e-12);
  assert.ok(Math.abs(expected-0.005061833451668316)<1e-12);
  assert.equal(avoid(4,2,2),1/6);
  assert.equal(avoid(4,3,2),0);
});

test('independent exhaustive mini-deals validate separated hand, Prize and later draws',()=>{
  for(let k=0;k<=4;k++) {
    const analytical=ticketCompressorVisibility({deckSize:10,ownBasics:2,
      handSize:2,prizes:2,compressors:2,laterDraws:k});
    const enumerated=miniaturePhysicalProbability(10,2,2,2,2,k);
    assert.ok(Math.abs(analytical-enumerated)<1e-12,
      `k=${k}: analytical=${analytical} physical=${enumerated}`);
  }
});

test('joint mulligans preserve simultaneous dual-invalid reset and finite mass',()=>{
  const pOwn=mulliganProbability(12),pOpp=mulliganProbability(4);
  let mass=0,weightedOffers=0;
  for(let m=0;m<=100;m++) {
    const pr=offeredBonusProbability(pOpp,pOwn,m);
    mass+=pr;weightedOffers+=m*pr;
  }
  assert.ok(Math.abs(mass-1)<1e-12);
  assert.ok(Math.abs(weightedOffers-opponentDrawOpportunities(pOpp,pOwn))<1e-12);
  assert.ok(Math.abs(offeredBonusProbability(pOpp,pOwn,0)-
    (1-pOpp)/(1-pOpp*pOwn))<1e-12);
});

test('source rank26 outcomes bounded: bonuses raise visibility but are no attack evidence',()=>{
  const normal=rank26TicketAgainstBasics(14),thorns=rank26TicketAgainstBasics(4);
  assert.ok(Math.abs(thorns.withAllOffersVisibility-0.007162495094102818)<1e-11);
  assert.ok(Math.abs(normal.withAllOffersVisibility-0.005248806326583711)<1e-11);
  assert.ok(thorns.relativeIncrease>0.41&&thorns.relativeIncrease<0.42);
  assert.ok(thorns.probabilitySomeBonus<0.55);
  assert.ok(thorns.cappedTailProbability<1e-9);
});

test('independent two-physical-deck simultaneous redraw simulation',()=>{
  const empirical=simulateJointMulliganOpportunity(200000,4,20261030);
  const model=rank26TicketAgainstBasics(4);
  if(process.env.AGENT27_VERBOSE==='1') console.log(JSON.stringify({empirical,model}));
  assert.ok(Math.abs(empirical.probability-model.withAllOffersVisibility)<0.0009,
    `native-style setup=${empirical.probability} exact=${model.withAllOffersVisibility}`);
  assert.ok(Math.abs(empirical.meanOffers-model.expectedOffers)<0.025,
    `offered bonus mean=${empirical.meanOffers} model=${model.expectedOffers}`);
});

test('all 29 registered full sources retain field identity and 60-card rank26 inventory',()=>{
  const result=sourceRank26Field();
  assert.equal(result.publishedSourceRanks,29);
  assert.deepEqual(result.missingRanks,[23,25,28]);
  assert.equal(result.qualifiesGameWinRate,false);
  assert.ok(Math.abs(result.observedPublishedRankMeanVisibility-0.005489613151370346)<1e-11);
  assert.deepEqual(result.opponents.filter(row=>row.opponentBasics===4).map(row=>row.rank),[6,24,29]);
});
