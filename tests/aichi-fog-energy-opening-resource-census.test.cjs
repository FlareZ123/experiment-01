'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {fogEnergyOpportunity,fromCandidateManifests}=
  require('../scripts/aichi-fog-energy-opening-resource-census.cjs');

const champion=[14,11,0,4,31];
const newMoon=[17,3,3,4,33];
const prob=(inventory,draws,threshold)=>
  fogEnergyOpportunity(inventory,draws).thresholds[String(threshold)];

/** @param {object} f Exact rational output. @param {string} n Numerator.
 * @param {string} d Denominator.
 */
function exact(f,n,d){
  assert.equal(f.numerator,n);
  assert.equal(f.denominator,d);
}

test('printed source manifests preserve both unchanged 60s and typed Energy',()=>{
  const a=fromCandidateManifests();
  assert.equal(a.candidateCount,2);
  assert.deepEqual(a.tables.rank1Champion.inventory,champion);
  assert.deepEqual(a.tables.newMoonLockbreaker.inventory,newMoon);
  assert.equal(a.countsQualifiedCompetitiveWins,0);
});

test('exact resource probabilities match independent integer-combination audit',()=>{
  exact(prob(champion,1,2),'183871177','293869312');
  exact(prob(champion,1,3),'168622181','587738624');
  exact(prob(newMoon,1,2),'232213482223','609735383335');
  exact(prob(newMoon,1,3),'62756418916','609735383335');
  exact(prob(champion,3,2),'36080933','47129984');
  exact(prob(champion,3,3),'267850919','587738624');
  exact(prob(newMoon,3,2),'15367688019401','29877033783415');
  exact(prob(newMoon,3,3),'470041050379','2510675107850');
});

test('Item-lock channel retains direct Energy and forbids Fog search',()=>{
  const c=fogEnergyOpportunity(champion,1);
  const n=fogEnergyOpportunity(newMoon,1);
  exact(c.directOnlyThresholds[2],'2874711','6678848');
  exact(n.directOnlyThresholds[2],'92698039','551796727');
  exact(c.directOnlyThresholds[3],'454643','3339424');
  exact(n.directOnlyThresholds[3],'26035373','1103593454');
  for(const inventory of [champion,newMoon]){
    for(const draws of [1,2,3]){
      const r=fogEnergyOpportunity(inventory,draws);
      for(const threshold of [1,2,3,4]){
        assert.ok(r.directOnlyThresholds[threshold].probability<=
          r.thresholds[threshold].probability);
      }
    }
  }
});

test('source rank-1 has more restricted Fog-plus-Energy access for each draw',()=>{
  for(const drawCount of [1,2,3]){
    const a=fogEnergyOpportunity(champion,drawCount);
    const b=fogEnergyOpportunity(newMoon,drawCount);
    for(const threshold of [1,2,3,4]){
      assert.ok(a.thresholds[threshold].probability>
        b.thresholds[threshold].probability);
    }
  }
});

test('more draws cannot reduce inventory-resource opportunity',()=>{
  for(const inventory of [champion,newMoon]){
    let last=null;
    for(const draws of [1,2,3]){
      const curr=fogEnergyOpportunity(inventory,draws);
      if(last)for(const threshold of [1,2,3,4]){
        assert.ok(curr.thresholds[threshold].probability>=
          last.thresholds[threshold].probability);
      }
      last=curr;
    }
  }
});

test('Fog Crystal cannot tutor a Special Energy without Basic Psychic',()=>{
  const specialAndFog=[1,0,1,1,57];
  const specialOnly=[1,0,1,0,58];
  for(const draws of [1,2,3]){
    const a=fogEnergyOpportunity(specialAndFog,draws);
    const b=fogEnergyOpportunity(specialOnly,draws);
    assert.deepEqual(a.thresholds,b.thresholds,
      'Fog with no Basic Psychic search target adds zero Energy resources');
  }
});

test('no Energy or Energy-search targets means zero resource access',()=>{
  for(const threshold of Object.values(
    fogEnergyOpportunity([14,0,0,4,42],2).thresholds)){
    assert.equal(threshold.probability,0);
  }
});

test('invalid inventories, negative draws and oversized draw counts reject',()=>{
  assert.throws(()=>fogEnergyOpportunity([14,11,0,4,30],1));
  assert.throws(()=>fogEnergyOpportunity([14,11,0,4,31],4));
  assert.throws(()=>fogEnergyOpportunity([14,11,-1,4,32],1));
});
