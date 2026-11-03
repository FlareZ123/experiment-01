'use strict';
const assert = require('node:assert/strict');

const VERSION = 'agent22-k0-bundle-complementarity-v1';

/** Exact binomial coefficient for an integer sample space. */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    v = v * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return v;
}

/**
 * Ex ante value of seeing the owner's deck via an unrestricted search and
 * selecting 1..maxCards cards after learning what is Prized. A completed
 * line's reward is incremental over already-completed hand requirements.
 * Search, payment and line execution are NOT simulated.
 *
 * @param {{inventory:{pool:string[],observedDeckPrintings:string[],deckCount:number,prizeCount:number},
 * ownHand:string[],weights:Record<string,number>,lines:{name:string,requirements:Record<string,number>,reward:number}[],
 * perCardCost:number,maxCards:number,uniformUnknownAllocation:true}} input
 * @returns {object} Exact Prize-marginalized policy values, not game win rates.
 */
function valueK0ComplementarySearch(input) {
  assert.equal(input?.uniformUnknownAllocation, true);
  const {pool, observedDeckPrintings:known, deckCount, prizeCount} = input.inventory;
  assert.ok(Array.isArray(pool) && Array.isArray(known) && Array.isArray(input.ownHand));
  assert.ok([...pool, ...known, ...input.ownHand].every(x => typeof x === 'string' && x.length > 0));
  assert.ok(Number.isInteger(deckCount) && deckCount >= 0 &&
    Number.isInteger(prizeCount) && prizeCount >= 0 && prizeCount <= 6 &&
    pool.length === deckCount + prizeCount && pool.length <= 60);
  assert.ok(Number.isInteger(input.maxCards) && input.maxCards >= 1 && input.maxCards <= 3);
  assert.ok(Number.isFinite(input.perCardCost) && input.perCardCost >= 0);
  assert.ok(input.weights && typeof input.weights === 'object' && !Array.isArray(input.weights));
  assert.ok(Object.values(input.weights).every(w => Number.isFinite(w) && w >= 0));
  assert.ok(Array.isArray(input.lines) && input.lines.length <= 6);
  for (const line of input.lines) {
    assert.ok(typeof line.name === 'string' && line.name.length > 0);
    assert.ok(Number.isFinite(line.reward) && line.reward >= 0);
    assert.ok(line.requirements && typeof line.requirements === 'object' &&
      !Array.isArray(line.requirements));
    assert.ok(Object.keys(line.requirements).every(x => x.length > 0));
    assert.ok(Object.values(line.requirements).every(v => Number.isInteger(v) && v >= 1 && v <= 60));
  }
  const names = [...new Set([...Object.keys(input.weights),
    ...input.lines.flatMap(x => Object.keys(x.requirements))])].sort();
  assert.ok(names.length <= 7, 'At most seven relevant printings per exact audit');
  assert.ok(deckCount + known.length > 0, 'No physical card to search');
  const count = (arr, name) => arr.reduce((n, x) => n + (x === name ? 1 : 0), 0);
  const groups = names.map(name => ({name, unknown:count(pool,name),
    known:count(known,name), held:count(input.ownHand,name),
    weight:input.weights[name] ?? 0}));
  const fillerUnknown = pool.length - groups.reduce((n,g) => n + g.unknown,0);
  const fillerKnown = known.length - groups.reduce((n,g) => n + g.known,0);
  const denominator = choose(pool.length, prizeCount);
  const baselineLine = Math.max(0,...input.lines.filter(line =>
    Object.entries(line.requirements).every(([name,n]) => count(input.ownHand,name) >= n))
    .map(line => line.reward));
  const prized = Array(groups.length).fill(0);
  let waysCheck = 0n, configurations = 0, optimumEV = 0, additiveEV = 0,
    regretEV = 0, worstTieRegretEV = 0, worstTieAdditiveEV = 0, feasibleLineProbability = 0, selectedLineProbability = 0,
    optimumCardsEV = 0, additiveCardsEV = 0;

  function evaluate(assigned, ways) {
    const multiplicity = ways * choose(fillerUnknown,prizeCount-assigned);
    if (multiplicity === 0n) return;
    waysCheck += multiplicity;
    configurations++;
    const available = groups.map((g,i) => g.known + g.unknown - prized[i]);
    const fillerAvailable = fillerKnown + fillerUnknown - (prizeCount-assigned);
    const afterLine = picks => Math.max(0,...input.lines.filter(line =>
      Object.entries(line.requirements).every(([name,n]) => {
        const i = names.indexOf(name);
        return groups[i].held + picks[i] >= n;
      })).map(line => line.reward));
    // A line is newly completable when ≤maxCards missing printed copies are
    // physically available in this post-search deck configuration.
    const feasible = input.lines.some(line => {
      if (line.reward <= baselineLine) return false;
      let missing = 0;
      for (const [name,n] of Object.entries(line.requirements)) {
        const i = names.indexOf(name);
        const required = Math.max(0,n-groups[i].held);
        if (required > available[i]) return false;
        missing += required;
      }
      return missing <= input.maxCards;
    });
    let optimum = null, additive = null, additiveWorst = null;
    const picks = Array(groups.length).fill(0);
    function visit(i, used, standalone) {
      if (i < groups.length) {
        const g=groups[i];
        for (let n=0;n<=Math.min(available[i],input.maxCards-used);n++) {
          picks[i]=n;
          let gain=0;
          for(let k=0;k<n;k++) gain+=g.weight/(1+g.held+k);
          visit(i+1,used+n,standalone+gain);
        }
        return;
      }
      for(let filler=0;filler<=Math.min(fillerAvailable,input.maxCards-used);filler++) {
        const chosen=used+filler;
        if(chosen===0)continue;
        const solo=standalone-input.perCardCost*chosen;
        const lineDelta=afterLine(picks)-baselineLine;
        const combined=solo+lineDelta;
        const candidate={solo,combined,chosen,lineDelta};
        // Ties prefer fewer cards, conserving scarce resources.
        if(optimum===null || combined>optimum.combined+1e-10 ||
          (Math.abs(combined-optimum.combined)<=1e-10 && chosen<optimum.chosen))
          optimum=candidate;
        if(additive===null || solo>additive.solo+1e-10 ||
          (Math.abs(solo-additive.solo)<=1e-10 && chosen<additive.chosen)) {
          additive=candidate;
          additiveWorst=candidate;
        } else if(Math.abs(solo-additive.solo)<=1e-10 && chosen===additive.chosen) {
          // An additive scorer has no preference among these bundles.
          // Bound its regret over every tied, equally economical selection.
          if(combined>additive.combined+1e-10)additive=candidate;
          if(combined<additiveWorst.combined-1e-10)additiveWorst=candidate;
        }
      }
    }
    visit(0,0,0);
    assert.ok(optimum && additive && additiveWorst);
    const p=Number(multiplicity)/Number(denominator);
    optimumEV+=p*optimum.combined;
    additiveEV+=p*additive.combined;
    worstTieAdditiveEV+=p*additiveWorst.combined;
    worstTieRegretEV+=p*(optimum.combined-additiveWorst.combined);
    regretEV+=p*(optimum.combined-additive.combined);
    feasibleLineProbability+=p*Number(feasible);
    selectedLineProbability+=p*Number(optimum.lineDelta>0);
    optimumCardsEV+=p*optimum.chosen;
    additiveCardsEV+=p*additive.chosen;
  }
  function assign(i,used,ways) {
    if (i === groups.length) {evaluate(used,ways);return;}
    for(let n=0;n<=Math.min(groups[i].unknown,prizeCount-used);n++) {
      prized[i]=n;
      assign(i+1,used+n,ways*choose(groups[i].unknown,n));
    }
  }
  assign(0,0,1n);
  assert.equal(waysCheck,denominator,'Prize categories must partition every physical allocation');
  assert.ok(regretEV>=-1e-8 && worstTieRegretEV>=regretEV-1e-8);
  return {version:VERSION,expectedOptimalUtility:optimumEV,
    expectedAdditiveChoiceUtility:additiveEV,
    expectedAdditiveRegret:regretEV,
    expectedWorstTiedAdditiveChoiceUtility:worstTieAdditiveEV,
    expectedWorstTiedAdditiveRegret:worstTieRegretEV,
    probabilityLinePhysicallyCompletable:feasibleLineProbability,
    probabilityOptimalChoiceCompletesNewLine:selectedLineProbability,
    expectedOptimalCardsChosen:optimumCardsEV,
    expectedAdditiveCardsChosen:additiveCardsEV,
    enumeratedPrizeClassConfigurations:configurations,
    exactPrizeDenominator:denominator.toString(),
    relevantPrintings:names,
    incrementalOverPreexistingLine:true,
    postSearchChoiceAssumesDeckVisible:true,
    executableLineAndWinRateQualified:false};
}

module.exports={VERSION,valueK0ComplementarySearch};
