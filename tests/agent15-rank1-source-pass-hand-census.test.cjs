'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerPassHandCensus,runRank1MirrorOwnerPassHandCensus,TARGET}=
  require('../simulation/twinleaf/agent15-rank1-source-pass-hand-census.cjs');
class AddPlayerAction {}
class PassTurnAction {constructor(id){this.clientId=id;}}
class Store {
  constructor(players){this.state={players,turn:16};this.roots=[];}
  dispatch(action){this.roots.push(action.constructor.name);return this.state;}
}
function data(seat=0){
  const active={getPokemonCard:()=>({fullName:'Tapu Lele-GX GRI'}),
    energies:{cards:[{fullName:'Psychic Energy MEE'}]}};
  const b={getPokemonCard:()=>({fullName:'Latias ex SSP'})};
  const owner={id:10,active,bench:[b],energyPlayedTurn:14,
    cannotPlayEnergyCards:false,cannotPlaySpecialEnergyCards:false,
    hand:{cards:[{fullName:'Psychic Energy MEE',energyType:0},
      {fullName:'Arven SVI',superType:1}]}};
  const other={id:20,hand:{cards:[{fullName:'Secret Box'}]},
    active:{getPokemonCard:()=>({fullName:'Other'}),energies:{cards:[]}},
    bench:[],energyPlayedTurn:16};
  return {owner,other,store:new Store(seat===0?[owner,other]:[other,owner])};
}
const deps={Store,EnergyType:{BASIC:0}};

test('the source Pass after the policy decision records only owner-hand available Energy',()=>{
  const f=data();
  const original=Store.prototype.dispatch;
  const r=withOwnerPassHandCensus(()=>{
    f.store.dispatch(new AddPlayerAction());
    f.store.dispatch(new PassTurnAction(10));
    return 'ok';
  },deps);
  assert.equal(r.result,'ok');
  assert.equal(r.audit.originalStores,1);
  assert.equal(r.audit.ownerPasses.length,1);
  const p=r.audit.ownerPasses[0];
  assert.deepEqual(p.ownerHandAfterOwnDecision.map(x=>x.name),['Psychic Energy MEE','Arven SVI']);
  assert.deepEqual(p.heldBasicEnergyNames,['Psychic Energy MEE']);
  assert.equal(p.preliminaryUnspentHandEnergyOpportunity,true);
  assert.equal(p.opportunityIsPaperOrStoreCertified,false);
  assert.equal(r.audit.ownerPrivateCardsUsedByBot,false);
  assert.deepEqual(f.store.roots,['AddPlayerAction','PassTurnAction']);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('source seat, used quota, clone Store and no held Energy prevent spurious positive',()=>{
  const f=data();const clone=data();f.owner.energyPlayedTurn=16;
  const r=withOwnerPassHandCensus(()=>{
    f.store.dispatch(new AddPlayerAction());
    clone.store.dispatch(new PassTurnAction(10));
    f.store.dispatch(new PassTurnAction(20));
    f.store.dispatch(new PassTurnAction(10));
  },deps);
  assert.equal(r.audit.ownerPasses.length,1);
  assert.equal(r.audit.ownerPasses[0].normalEnergyQuotaUsed,true);
  assert.equal(r.audit.ownerPasses[0].preliminaryUnspentHandEnergyOpportunity,false);
});

test('prototype always restores on failed game',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withOwnerPassHandCensus(()=>{
    data().store.dispatch(new AddPlayerAction());
    throw Error('expected failure');
  },deps),/expected failure/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('only the frozen exact rank1 trial is instrumented in the outer headless wrapper',()=>{
  const headless={runMatch:req=>req.label};
  const rows=[TARGET,'not-rank1'];
  const runner=()=>rows.map(id=>headless.runMatch({label:
    'agent41-bilateral-v2-common-policy-development-'+id}));
  let calls=0;
  const r=runRank1MirrorOwnerPassHandCensus({headless,runner,
    observer:fn=>{calls++;return {result:fn(),audit:{foo:1}};}});
  assert.equal(calls,1);
  assert.equal(r.audit.foo,1);
  assert.equal(r.execution.length,2);
});
