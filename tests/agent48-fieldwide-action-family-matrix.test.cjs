'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const corpus=require('../results/aichi-2026/full-decklists.json');
const {FAMILIES,belongs,matrix,markdown}=
  require('../scripts/agent48-fieldwide-action-family-matrix.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const snapshot=matrix(corpus);

const family=id=>snapshot.families.find(row=>row.id===id);

test('per-rank original print count and complete named-family audit',()=>{
  assert.equal(snapshot.originalSources,29);
  assert.deepEqual(snapshot.missingRanks,[23,25,28]);
  assert.equal(snapshot.decks.length,29);
  assert.equal(snapshot.families.length,21);
  assert.deepEqual(snapshot.decks.map(x=>x.rank),[
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,26,27,29,30,31,32
  ]);
  for(const row of snapshot.decks){
    assert.equal(new Set(Object.keys(row.families)).size,FAMILIES.length);
    const physicalSum=Object.values(row.families)
      .reduce((sum,n)=>sum+n,0);
    assert.ok(physicalSum<=60);
    const source=corpus.decks.find(d=>d.rank===row.rank);
    for(const f of FAMILIES)
      assert.equal(row.families[f.id],source.cards.filter(c=>
        belongs(c,f.id)).reduce((sum,c)=>sum+c.count,0));
    const noRoot=FAMILIES.filter(f=>f.route==='absent');
    assert.equal(row.absentActorCopies,noRoot.reduce((sum,f)=>
      sum+row.families[f.id],0));
  }
});

test('fieldwide printed family counts match original exact sixties',()=>{
  const sample={
    vip:[15,42],quick:[21,72],carmine:[12,15],
    guzma:[25,48],seeker:[23,59],compressor:[17,33],
    lillie:[16,19],marnie:[13,16],iono:[10,11],
    ultra:[14,24],mysterious:[10,37],
    forest:[12,13],blower:[9,11],special:[24,118]
  };
  for(const [id,[sourceCount,copies]] of Object.entries(sample)){
    assert.equal(family(id)?.sourceCount,sourceCount,id+' source count');
    assert.equal(family(id)?.copies,copies,id+' copy count');
  }
  assert.equal(snapshot.decks.filter(row=>
    ['guzma','seeker','compressor','lillie','vip']
      .some(id=>row.families[id]>0)).length,29);
});

test('all published special-only source ranks retain distinct Energy group',()=>{
  const specialOnly=snapshot.decks.filter(row=>
    row.families.basic===0&&row.families.special>0).map(row=>row.rank);
  assert.deepEqual(specialOnly,[4,5,6,7,17,24,29]);
  assert.equal(family('basic').route,'baseline');
  assert.equal(family('special').route,'opt-in-partial');
  assert.equal(family('seeker').route,'opt-in-narrow');
  assert.equal(family('guzma').route,'opt-in-narrow');
  assert.equal(family('compressor').route,'separate-source-adapter');
});

const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  specialEnergies:new Set(),basicEnergyTypes:{},
  colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:0}
};
const view=(hand,discard=[])=>({
  decisionKind:'owner-root',globalTurn:4,
  ownHand:hand,
  ownTurnResources:{
    itemPlayLocked:false,pokemonPlayLocked:false,
    supporterPlayedTurn:0,supporterPlayLocked:false,
    energyPlayLocked:false,specialEnergyPlayLocked:false,
    energyPlayedTurn:0,stadiumPlayLocked:false,stadiumPlayedTurn:0
  },
  ownPublic:{
    active:{name:'Regidrago V',energies:[],attacks:[],
      specialConditions:[],publicRestrictions:{}},
    bench:[null,null,null,null,null],
    deckCount:35,prizeCount:6,discard,stadium:[],
    publicTurnRestrictions:{attackLockTurnsRemaining:0},
    resolvingSupporter:[]
  },
  opponentPublic:{stadium:[],handCount:4,prizeCount:6,deckCount:35}
});

test('actual frozen actor pass on held eligible-family Items absent from vocabulary',()=>{
  const seeker=view(['VS Seeker PHF'],["Lillie's Determination M1L"]);
  assert.equal(chooseActorRootIntent(seeker,catalog).kind,'pass');
  const vip=view(['Battle VIP Pass FST']);
  assert.equal(chooseActorRootIntent(vip,catalog).kind,'pass');
  const ultra=view(['Ultra Ball SVI','Switch SVI','Switch SVI']);
  assert.equal(chooseActorRootIntent(ultra,catalog).kind,'pass');
});

test('actual frozen actor distinguishes Basic attachment and opt-in low-hand draw',()=>{
  assert.equal(chooseActorRootIntent(view(['Psychic Energy MEE']),catalog)
    .kind,'attach-basic-energy');
  const lowhand=view(["Lillie's Determination M1L"]);
  assert.equal(chooseActorRootIntent(lowhand,catalog).kind,'pass');
  const chosen=chooseActorRootIntent(lowhand,catalog,{lowHandLillieRoot:true});
  assert.equal(chosen.kind,'play-lowhand-lillie');
  assert.equal(chosen.printing,"Lillie's Determination M1L");
});

test('matrix remains explicitly unqualified and human table has complete field',()=>{
  assert.equal(snapshot.semantics.qualifiedGames,0);
  const text=markdown(snapshot);
  assert.ok(text.includes('29; missing registered 60s: 23, 25, 28.'));
  for(const f of FAMILIES)assert.ok(text.includes(f.name));
  assert.ok(text.includes('not a legal-play'));
});
