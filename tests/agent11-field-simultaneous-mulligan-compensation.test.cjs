'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const m=require('../scripts/agent11-field-simultaneous-mulligan-compensation.cjs');
const counts=[14,14,11,13,11,4,12,10,11,15,11,15,11,14,14,11,
  13,16,16,14,14,12,4,12,15,4,16,15,13];
const make=()=>({
  audit:{fully_resolved:29,decks:m.EXPECTED_RANKS.map((rank,i)=>
    ({rank,basic_count_known:counts[i],unresolved_pokemon:[],archetype:'source'}))},
  candidate:{
    canonical_id_count_sha256:'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4',
    counts:{total:60,'Pokémon':19},
    entries:[{type:'Pokémon',name_en:'Dusclops',count:2},
      {type:'Pokémon',name_en:'Other Basic',count:17}]
  }
});
function close(a,b) {assert.ok(Math.abs(a-b)<1e-8,a+' versus '+b);}
test('initial Basic probabilities are exact',()=>{
  assert.equal(m.combination(60,7),386206920n);
  close(m.validOpening(14),0.8614093191287199);
  close(m.validOpening(17),0.9165625670301298);
});
test('source rank6 reproduces earlier champion-Thorns study',()=>{
  const r=m.matchup(14,4);
  close(r.candidateExpectedMaximumBonus,1.41235256);
  close(r.sourceExpectedMaximumBonus,0.07010960);
  close(r.candidateAtLeastOneBonus,0.5642343175);
});
test('original 29 source ranks form a locked cross-candidate comparison',()=>{
  const x=make();
  const result=m.field(x.audit,x.candidate);
  assert.equal(result.ranks.length,29);
  close(result.average.referenceCandidateBonus,0.30401790);
  close(result.average.lockbreakerCandidateBonus,0.31636864);
  close(result.average.referenceOpponentBonus,0.13066138);
  close(result.average.lockbreakerOpponentBonus,0.07315681);
  close(result.average.extraCandidateBonus,0.01235074);
  close(result.average.changeInOpponentBonus,-0.05750457);
});
test('mismatched field and challenger print identity must reject',()=>{
  const x=make();
  x.audit.decks.pop();
  assert.throws(()=>m.field(x.audit,x.candidate));
  const y=make();
  y.candidate.canonical_id_count_sha256='modified';
  assert.throws(()=>m.field(y.audit,y.candidate));
});
