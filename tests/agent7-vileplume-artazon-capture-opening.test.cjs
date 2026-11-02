'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {ID,EXPECTED,makePool,evaluate,simulate,VALID_OPENING}=
  require('../scripts/agent7-vileplume-artazon-capture-opening.cjs');

/** Pure synthetic 60s; source authenticity is enforced separately on disk. */
function fixture(rank){
  const cards=[];
  const nameByGroup={
    B:'Bunnelby',O:'Oddish',P:'Pidgey',TC:'Tag Call',
    GH:'Guzma & Hala',A:'Artazon',C:'Capture Energy',
    TM:'Technical Machine: Evolution',Gloom:'Gloom',
    Pidgeotto:'Pidgeotto',VileplumeAOR:'Vileplume',
    Pidgeot:'Pidgeot ex'
  };
  for(const [g,count] of Object.entries(EXPECTED[rank])){
    cards.push({count,name:nameByGroup[g],
      printing:g==='VileplumeAOR'?{set:'AOR',number:'3'}:{}});
  }
  const basics=rank===2?'Lillipup':'Buneary';
  cards.push({name:basics,count:8});
  const total=cards.reduce((n,c)=>n+c.count,0);
  cards.push({name:'Noncritical filler',count:60-total});
  return {rank,cards};
}

/**
 * Specify the first seven, six Prize cards and one normal draw by category.
 * The remaining 46 cards follow the source's canonical category order.
 */
function deal(rank,initial,prizes,draw){
  assert.equal(initial.length,7);
  assert.equal(prizes.length,6);
  const pool=makePool(fixture(rank));
  const remaining=new Map();
  for(const id of pool)remaining.set(id,(remaining.get(id)??0)+1);
  const prefix=[...initial,...prizes,draw].map(x=>ID[x]);
  for(const id of prefix){
    assert.ok(remaining.get(id)>0,'fixture draws too many copies');
    remaining.set(id,remaining.get(id)-1);
  }
  const rest=[];
  for(const [id,count] of remaining.entries()){
    for(let j=0;j<count;j++)rest.push(id);
  }
  return Uint8Array.from([...prefix,...rest]);
}

test('identifies exact original source group counts for both ranks',()=>{
  for(const rank of [2,15]){
    const pool=makePool(fixture(rank));
    assert.equal(pool.length,60);
    for(const [group,count] of Object.entries(EXPECTED[rank])){
      assert.equal(pool.filter(n=>n===ID[group]).length,count);
    }
  }
  assert.ok(VALID_OPENING>0.86&&VALID_OPENING<0.87);
});

for(const rank of [2,15]){
  test('rank '+rank+' complete all-deck triple-tutor route qualifies',()=>{
    const setup=deal(rank,['B','GH','OTHER','OTHER','OTHER',
      'OTHER','OTHER'],Array(6).fill('OTHER'),'OTHER');
    const result=evaluate(setup);
    assert.equal(result.connector,true);
    assert.equal(result.ready,true);
  });
  test('rank '+rank+' starter only in first draw cannot start Active',()=>{
    const setup=deal(rank,['GH','OTHER','OTHER','OTHER','OTHER',
      'OTHER','OTHER'],Array(6).fill('OTHER'),'B');
    assert.equal(evaluate(setup).connector,false);
  });
  test('rank '+rank+' all Capture Energy prized stops named route',()=>{
    const captures=Array(EXPECTED[rank].C).fill('C');
    const setup=deal(rank,['B','GH','OTHER','OTHER','OTHER',
      'OTHER','OTHER'],[...captures,
      ...Array(6-captures.length).fill('OTHER')],'OTHER');
    assert.equal(evaluate(setup).ready,false);
  });
  test('rank '+rank+' both printed AOR Vileplume outside deck stop line',()=>{
    const setup=deal(rank,['B','GH','OTHER','OTHER','OTHER',
      'OTHER','OTHER'],['VileplumeAOR','VileplumeAOR',
      'OTHER','OTHER','OTHER','OTHER'],'OTHER');
    assert.equal(evaluate(setup).stages,false);
  });
  test('rank '+rank+' Tag Call with every Guzma & Hala prized fails',()=>{
    const setup=deal(rank,['B','TC','OTHER','OTHER','OTHER',
      'OTHER','OTHER'],[...Array(EXPECTED[rank].GH).fill('GH'),
      ...Array(6-EXPECTED[rank].GH).fill('OTHER')],'OTHER');
    const result=evaluate(setup);
    assert.equal(result.connector,true);
    assert.equal(result.missingGH,true);
    assert.equal(result.ready,false);
  });
  test('rank '+rank+' exact-seed simulation is deterministic',()=>{
    const pool=makePool(fixture(rank));
    const a=simulate(pool,1000,20261102+rank);
    const b=simulate(pool,1000,20261102+rank);
    assert.deepEqual(a,b);
  });
}
