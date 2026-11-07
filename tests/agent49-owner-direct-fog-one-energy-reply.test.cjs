'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json');
const {proposeOwnerDirectFogOneEnergyKo}=
  require('../simulation/twinleaf/agent49-owner-direct-fog-one-energy-reply.cjs');

function source60(rank){
  const deck=roster.decks.find(x=>x.rank===rank);
  assert.ok(deck,'Must use authenticated original rank');
  const original=deck.cards.flatMap(row=>Array(row.count)
    .fill(row.name+' '+row.printing.set));
  assert.equal(original.length,60);
  return original;
}

function actorRoot(turn=14){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:turn,
    ownHand:['Fog Crystal CRE','Rescue Carrier EVS'],
    ownTurnResources:{energyPlayedTurn:0,itemPlayLocked:false,
      energyPlayLocked:false},
    ownPublic:{
      active:{
        printing:'Unown AOR',
        evolutionPrintings:['Unown AOR'],
        energies:[],tools:[],specialConditions:[],
        publicRestrictions:{},
        attacks:[{name:'Hidden Power',cost:[9],
          damage:10,gxAttack:false}]
      },
      bench:[null,null,null,null,null],
      stadium:[],discard:[],lostZone:[],
      resolvingSupporter:[],
      publicTurnRestrictions:{
        itemPlayLocked:false,attackLockTurnsRemaining:0
      }
    },
    opponentPublic:{
      active:{printing:'Trubbish FST',hp:70,damage:60}
    }
  };
}

test('source rank31 contains real Fog+Unown+two Basic Psychic without Box',()=>{
  const source=source60(31);
  assert.equal(source.filter(x=>x==='Fog Crystal CRE').length,4);
  assert.equal(source.filter(x=>x==='Unown AOR').length,3);
  assert.equal(source.filter(x=>x.startsWith('Psychic Energy ')).length,2);
  assert.equal(source.filter(x=>x==='Secret Box TWM').length,0);
  const root=actorRoot();
  const p=proposeOwnerDirectFogOneEnergyKo(root,source,
    {psychic:5,colorless:9});
  assert.ok(p);
  assert.equal(p.attackName,'Hidden Power');
  assert.equal(p.heldSearchPrinting,'Fog Crystal CRE');
  assert.equal(p.printedDamage,10);
  assert.equal(p.opponentRemainingHp,10);
  assert.equal(p.needsRealNativeItemPaymentAndPrompt,true);
  assert.equal(p.prizeTakeCertified,false);
  assert.equal(p.qualifiedCompetitiveGame,false);
});

test('public Basic depletion, own Energy attachment and first-turn veto',()=>{
  const registered=source60(31);
  const root=actorRoot();
  const exhausted={...root,ownPublic:{...root.ownPublic,
    discard:['Psychic Energy MEE','Psychic Energy MEE']}};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(exhausted,registered),null);
  assert.equal(proposeOwnerDirectFogOneEnergyKo(actorRoot(1),registered),null);
  const used={...root,ownTurnResources:{
    ...root.ownTurnResources,energyPlayedTurn:14}};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(used,registered),null);
  const accessible={...root,ownHand:[
    'Fog Crystal CRE','Psychic Energy MEE']};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(accessible,registered),null);
});

test('known damage, attack/Item lock and opponent hidden privacy preserved',()=>{
  const original=source60(31);
  const root=actorRoot(14);
  Object.defineProperty(root,'opponentHiddenCards',{get(){
    throw Error('No reading hidden opponent hand');
  }});
  const highHP={...root,opponentPublic:{
    active:{printing:'Trubbish FST',hp:70,damage:0}}};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(highHP,original),null);
  const blocked={...root,ownPublic:{...root.ownPublic,
    publicTurnRestrictions:{
      itemPlayLocked:true,attackLockTurnsRemaining:0
    }}};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(blocked,original),null);
  const other={...root,ownPublic:{...root.ownPublic,
    active:{...root.ownPublic.active,
      publicRestrictions:{cannotAttackNextTurn:true}}}};
  assert.equal(proposeOwnerDirectFogOneEnergyKo(other,original),null);
  assert.ok(proposeOwnerDirectFogOneEnergyKo(root,original));
});

test('authenticated same-seat K1 missing Basic vetoes; stale K1 abstains',()=>{
  const sixty=source60(31),root=actorRoot();
  const fresh={
    ownerSeat:1,observedAt:{turn:10,promptId:'k1-10'},
    exactMembershipKnown:true,deckMembershipStale:false,
    knownPrintings:[{printing:'Fog Crystal CRE',copies:1}],
    prizeInferenceCertified:true,knownPrized:[
      {printing:'Psychic Energy MEE',copies:2}]
  };
  assert.equal(proposeOwnerDirectFogOneEnergyKo(
    root,sixty,{psychic:5,colorless:9},fresh),null);
  const present={...fresh,knownPrintings:[
    {printing:'Fog Crystal CRE',copies:1},
    {printing:'Psychic Energy MEE',copies:1}]};
  const positive=proposeOwnerDirectFogOneEnergyKo(
    root,sixty,{psychic:5,colorless:9},present);
  assert.ok(positive);
  assert.equal(positive.authenticatedOwnerK1Used,true);
  const stale={...fresh,exactMembershipKnown:false,
    deckMembershipStale:true,knownPrintings:[]};
  const uncertain=proposeOwnerDirectFogOneEnergyKo(
    root,sixty,{psychic:5,colorless:9},stale);
  assert.ok(uncertain);
  assert.equal(uncertain.authenticatedOwnerK1Used,false);
  assert.throws(()=>proposeOwnerDirectFogOneEnergyKo(
    root,sixty,{psychic:5,colorless:9},
    {...fresh,ownerSeat:0}),/same acting physical seat/);
  assert.throws(()=>proposeOwnerDirectFogOneEnergyKo(
    root,sixty,{psychic:5,colorless:9},
    {...fresh,observedAt:{turn:15}}),
  /Future or unauthenticated K1/);
});
