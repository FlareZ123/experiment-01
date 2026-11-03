'use strict';

const assert = require('node:assert/strict');
const {
  BASIC_NAMES, choose, openingCounts, sourceRank5
} = require('./agent41-rank5-quickball-duplicate-openings.cjs');

const VERSION = 'agent13-rank5-quickball-first-paid-donor-exact-v1';
const QB = 'Quick Ball';
const DCE = 'Double Colorless Energy';
const cmp = (a,b) => a < b ? -1 : a > b ? 1 : 0;

/**
 * Exact opening-seven donor distribution implied by the current
 * agent8 Quick Ball duplicate gate followed by agent47's default
 * chooseActorHandDiscard() one-card prompt heuristic.
 *
 * Preconditions of this structural model: opening physical seven; the
 * first Quick Ball in hand is played; every remaining other hand card is
 * an individually legal one-card discard choice; and the native chooser
 * sees the same remaining hand. It does not assert that a Bench slot,
 * searchable Basic, legal live native root, or strategically useful target
 * is actually present. Opponent mulligan compensation is excluded.
 *
 * The root gate requires at least one non-Quick-Ball duplicate. At the
 * subsequent prompt, the default chooser prefers any duplicated printing
 * (which it can discard without erasing its last copy) and takes the
 * lexicographically first such exact printing. After spending one QB,
 * QB itself qualifies as a duplicated prompt donor only when the opening
 * contained at least THREE copies.
 *
 * @param {Array<{name:string,count:number,category:string,
 *   printing:{set:string,number:string}}>} cards Registered printed list.
 * @param {number} [handSize] Opening hand size (normally seven).
 * @returns {object} Physical-subset counts, not game-win probabilities.
 */
function openingFirstPaidDonor(cards, handSize=7) {
  assert.ok(Array.isArray(cards));
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=1&&handSize<=7);
  const groups = new Map();
  for (const card of cards) {
    assert.ok(typeof card.name==='string'&&card.name.length>0);
    assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
    assert.ok(['Pokémon','Trainer','Energy'].includes(card.category));
    assert.ok(typeof card.printing?.set==='string'&&
      typeof card.printing?.number==='string');
    const id = [card.name,card.printing.set,card.printing.number].join('|');
    const existing=groups.get(id);
    if (existing) {
      assert.equal(existing.category,card.category);
      existing.count+=card.count;
    } else {
      groups.set(id,{name:card.name,count:card.count,
        category:card.category,label:card.name+' '+card.printing.set});
    }
  }
  const ordered=[...groups.values()].sort((a,b)=>cmp(a.label,b.label));
  assert.equal(new Set(ordered.map(x=>x.label)).size,ordered.length,
    'Full-name alias needs independent identity resolution');
  const totalCards=ordered.reduce((s,x)=>s+x.count,0);
  assert.ok(totalCards>=handSize&&totalCards<=60);
  // State: [cards drawn, at least one QB, at least one Basic,
  // at least one non-QB duplicate, first remaining-hand duplicate index].
  let states=new Map([['0,0,0,0,-1',1]]);
  for (let index=0;index<ordered.length;index++) {
    const row=ordered[index],next=new Map();
    for (const [key,ways] of states) {
      const [n,q,b,other,first]=key.split(',').map(Number);
      for (let taken=0;taken<=Math.min(row.count,handSize-n);taken++) {
        const eligibleAtPrompt=row.name===QB?taken>=3:taken>=2;
        const newFirst=first<0&&eligibleAtPrompt?index:first;
        const nextKey=[
          n+taken,
          Number(Boolean(q||(row.name===QB&&taken>0))),
          Number(Boolean(b||(BASIC_NAMES.has(row.name)&&taken>0))),
          Number(Boolean(other||(row.name!==QB&&taken>=2))),
          newFirst
        ].join(',');
        next.set(nextKey,(next.get(nextKey)??0)+ways*choose(row.count,taken));
      }
    }
    states=next;
  }
  let all=0,basicValid=0,qbValid=0,rootEligible=0;
  const byDonor=new Map(),byCategory=new Map();
  for (const [key,ways] of states) {
    const [n,q,b,other,first]=key.split(',').map(Number);
    if(n!==handSize)continue;
    all+=ways;
    if(!b)continue;
    basicValid+=ways;
    if(!q)continue;
    qbValid+=ways;
    if(!other)continue;
    assert.ok(first>=0);
    rootEligible+=ways;
    const donor=ordered[first];
    byDonor.set(donor.label,(byDonor.get(donor.label)??0)+ways);
    byCategory.set(donor.category,(byCategory.get(donor.category)??0)+ways);
  }
  assert.equal(all,choose(totalCards,handSize));
  const previous=openingCounts(cards,handSize);
  assert.equal(basicValid,previous.basicValidSets);
  assert.equal(qbValid,previous.quickBallValidSets);
  assert.equal(rootEligible,previous.quickBallDuplicateValidSets);
  const dceDonor=[...byDonor].filter(([name])=>name.startsWith(DCE+' '))
    .reduce((n,[,v])=>n+v,0);
  const onlyDce=previous.quickBallOnlyDceDuplicateValidSets;
  assert.ok(dceDonor>=onlyDce);
  return {
    version:VERSION,handSize,totalCards,printingGroups:ordered.length,
    allPhysicalOpeningSevens:all,basicValidOpeningSevens:basicValid,
    basicAndQuickBallSevens:qbValid,
    structuralRootEligibleSevens:rootEligible,
    expectedDefaultPromptDonorByPrinting:Object.fromEntries(byDonor),
    expectedDefaultPromptDonorByCategory:Object.fromEntries(byCategory),
    defaultDceDonorSevens:dceDonor,
    onlyDceNonQuickBallDuplicateSevens:onlyDce,
    dceChosenDespiteAnotherNonQuickBallDuplicateSevens:dceDonor-onlyDce,
    dceShareAmongStructurallyEligible:
      rootEligible===0?0:dceDonor/rootEligible,
    actualNativeRootSelected:false,
    paperPaymentAndTargetCertified:false,
    optimalityAndGamePerformanceCertified:false
  };
}

/** Original authenticated Aichi rank-5 source 60; no invented deck. */
function originalRank5FirstPaidDonor() {
  const source=sourceRank5();
  return openingFirstPaidDonor(source.cards,7);
}

if(require.main===module)
  process.stdout.write(JSON.stringify(originalRank5FirstPaidDonor(),null,2)+'\n');

module.exports={VERSION,openingFirstPaidDonor,originalRank5FirstPaidDonor};
