'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registered,options,PHASES,run}=
  require('../../simulation/evaluation/2026-11/agent8-source-mew-funding-v6.cjs');
const {chooseActorRootIntent,actorSpecialEnergyEnabled}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

test('all original physical v6 group deals were sealed before execution',()=>{
  const groups=registered();
  assert.equal(groups.length,8);
  assert.equal(new Set(groups.map(x=>x.seed)).size,8);
  assert.equal(new Set(groups.map(x=>x.id)).size,8);
  for(const rank of [5,13])
    for(const seat of ['A','B'])
      assert.equal(groups.filter(g=>g.rank===rank&&g.candidateSlot===seat).length,2);
  assert.deepEqual(PHASES.map(p=>p.id),['P0S0','P1S0','P0S1','P1S1']);
});

test('source funding is the entire new treatment; v5 Mew combat stays common',()=>{
  const base=options(false),treatment=options(true);
  assert.equal(base.actorDceMewMobilityRoot,true);
  assert.equal(treatment.actorDceMewMobilityRoot,true);
  assert.equal(base.actorMewGenesectTechnoBlast,true);
  assert.equal(treatment.actorMewGenesectTechnoBlast,true);
  assert.equal(base.actorNaturalEvolutionRoot,true);
  assert.equal(base.actorNaturalEvolutionSourceOnly,true);
  assert.equal(base.actorMewDceRecipientRoot,false);
  assert.equal(base.actorMewDceRecipientSourceOnly,false);
  assert.equal(treatment.actorMewDceRecipientRoot,true);
  assert.equal(treatment.actorMewDceRecipientSourceOnly,true);
  delete base.actorMewDceRecipientRoot;
  delete base.actorMewDceRecipientSourceOnly;
  delete treatment.actorMewDceRecipientRoot;
  delete treatment.actorMewDceRecipientSourceOnly;
  assert.deepEqual(base,treatment);
});

test('source-only DCE funding is strictly isolated in both physical orientations',()=>{
  for(const sourceSeat of [0,1]){
    assert.equal(actorSpecialEnergyEnabled(true,sourceSeat,sourceSeat),true);
    assert.equal(actorSpecialEnergyEnabled(true,sourceSeat,1-sourceSeat),false);
  }
});

test('native-neutral owner root targets visible Mew V before active off-axis Genesect',()=>{
  const DCE='Double Colorless Energy SUM';
  const view={
    decisionKind:'owner-root',actorSeat:1,globalTurn:3,
    ownHand:[DCE],
    ownTurnResources:{
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      energyPlayedTurn:2
    },
    ownPublic:{
      active:{printing:'Genesect V FST',energies:[],attacks:[]},
      bench:[{printing:'Mew V FST',energies:[]},null,null,null,null],
      stadium:[]
    },
    opponentPublic:{stadium:[]}
  };
  const catalog={
    specialEnergies:new Set([DCE]),
    colorlessEnergyType:0,
    basics:new Set(),basicEnergies:new Set(),
    basicEnergyTypes:{},specialConditions:{}
  };
  const intent=chooseActorRootIntent(view,catalog,{mewDceRecipientRoot:true});
  assert.equal(intent.kind,'attach-special-energy');
  assert.equal(intent.printing,DCE);
  assert.equal(intent.slot,'bench');
  assert.equal(intent.index,0);
});

test('empty synthetic native ledger cannot be interpreted as positive attack or win',()=>{
  const groups=registered();
  const result=run({runPhase:()=>({
    selected:{rawDevelopment:{rows:groups.map(group=>({
      trial:group,rootActionLedger:[],
      error:'controlled native failure'
    }))}}
  })});
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.totals.nativeErrors,32);
  assert.equal(result.totals.fourWayNaturalTerminalGroups,0);
  assert.deepEqual(result.totals.sourceDcePlays,{control:0,sourceFunding:0});
  assert.equal(result.paperCompetitiveGames,0);
});
