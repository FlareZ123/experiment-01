'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseMarshadowCounterRoot,chooseMarshadowFogTarget}=
  require('../simulation/twinleaf/agent5-owner-visible-marshadow-chain-policy.cjs');

const M='Marshadow UNB';
const S='Shadow Rider Calyrex V CRE';
const E='Psychic Energy SVE';
const F='Float Stone BKT';
const G='Fog Crystal CRE';
const T='Thunder Mountain Prism Star LOT';

/** @param {'float'|'energy'} payment @param {0|1} seat */
function view(payment,seat=0) {
  return {
    actorSeat:seat,globalTurn:2,decisionKind:'owner-root',
    ownHand:[G,payment==='float'?F:E],
    ownPublic:{
      active:{printing:M,energies:[],tools:[],
        specialConditions:[],publicRestrictions:{}},
      bench:Array(5).fill(null),
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'},
      stadium:[T]},
    ownTurnResources:{
      retreatedTurn:0,energyPlayedTurn:0,
      itemPlayLocked:false,toolPlayLocked:false,
      energyPlayLocked:false,pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false
    }
  };
}

test('both seats and payment branches choose five rooted visible actions',()=>{
  for(const seat of [0,1]){
    for(const payment of ['float','energy']){
      const v=view(payment,seat);
      const pay=payment==='float'?F:E;
      assert.deepEqual(chooseMarshadowCounterRoot(v),{
        kind:'fog-search-shadow',handIndex:0,printing:G});
      v.ownHand=[pay,S];
      assert.deepEqual(chooseMarshadowCounterRoot(v),{
        kind:'bench-shadow',handIndex:1,benchIndex:0,printing:S});
      v.ownHand=[pay];
      v.ownPublic.bench[0]={printing:S};
      assert.deepEqual(chooseMarshadowCounterRoot(v),{
        kind:payment==='float'?'attach-floatstone':'attach-psychic',
        handIndex:0,printing:pay});
      v.ownHand=[];
      v.ownPublic.active[payment==='float'?'tools':'energies']=[pay];
      assert.deepEqual(chooseMarshadowCounterRoot(v),{
        kind:'retreat-marshadow',benchIndex:0,printing:S});
      v.ownPublic.active={printing:S,energies:[],tools:[]};
      v.ownPublic.bench[0]={printing:M};
      assert.deepEqual(chooseMarshadowCounterRoot(v),{
        kind:'marshadow-resetting-hole',benchIndex:0,printing:M});
      v.opponentPublic.stadium=[];
      assert.equal(chooseMarshadowCounterRoot(v),null);
    }
  }
});

test('no invisible deck or prize knowledge is consulted',()=>{
  const v=view('float');
  v.opponentHiddenHand=['Clever card hidden'];
  v.ownHiddenDeck=['Unknown'];
  v.ownHiddenPrizes=['Hidden'];
  assert.deepEqual(chooseMarshadowCounterRoot(v),{
    kind:'fog-search-shadow',handIndex:0,printing:G});
});

test('item lock forbids initial Fog; searching player must own deck prompt',()=>{
  const v=view('energy');
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseMarshadowCounterRoot(v),null);
  v.decisionKind='owner-prompt';
  v.pendingOwnerDeckSearch=true;
  assert.equal(chooseMarshadowFogTarget(v,[
    {printing:S,permitted:true},{printing:E,permitted:true}]),S);
  assert.equal(chooseMarshadowFogTarget(v,[
    {printing:S,permitted:false},{printing:E,permitted:true}]),null);
  v.pendingOwnerDeckSearch=false;
  assert.throws(()=>chooseMarshadowFogTarget(v,[]));
});

test('competing held replacement Stadium is a deliberate source policy veto',()=>{
  const v=view('float');
  v.ownHand.push('Sky Field ROS');
  assert.equal(chooseMarshadowCounterRoot(v),null);
});

test('cannot retreat twice or through status',()=>{
  const v=view('energy');
  v.ownHand=[];
  v.ownPublic.bench[0]={printing:S};
  v.ownPublic.active.energies=[E];
  v.ownTurnResources.retreatedTurn=2;
  assert.equal(chooseMarshadowCounterRoot(v),null);
  v.ownTurnResources.retreatedTurn=0;
  v.ownPublic.active.specialConditions=[1];
  assert.equal(chooseMarshadowCounterRoot(v),null);
});

test('source and opponent must have the exact public printing',()=>{
  const v=view('energy');
  v.opponentPublic.active.printing='Iron Thorns ex Other';
  assert.equal(chooseMarshadowCounterRoot(v),null);
  v.opponentPublic.active.printing='Iron Thorns ex TWM';
  v.ownPublic.active.printing='Marshadow SLG';
  assert.equal(chooseMarshadowCounterRoot(v),null);
});

test('cannot bench through printed Pokémon play lock',()=>{
  const v=view('energy');
  v.ownHand=[S,E];
  v.ownTurnResources.pokemonPlayLocked=true;
  assert.equal(chooseMarshadowCounterRoot(v),null);
});

test('owner can activate non-Rule-Box Ability even when attacking is locked',()=>{
  const v=view('energy');
  v.ownPublic.active.printing=S;
  v.ownPublic.bench[0]={printing:M};
  v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseMarshadowCounterRoot(v)?.kind,
    'marshadow-resetting-hole');
});

test('an unresolved prompt cannot be treated as an ordinary root',()=>{
  const v=view('float');
  v.decisionKind='owner-prompt';
  assert.throws(()=>chooseMarshadowCounterRoot(v));
});
