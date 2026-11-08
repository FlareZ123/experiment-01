'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseHeldGuzmaMobility}=
  require('../../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs');
const {ownerGuzmaMobilityOption}=
  require('../../simulation/twinleaf/agent2-owner-guzma-mobility-frontier.cjs');
const {wouldLoseActivePositionAbility}=
  require('../../simulation/twinleaf/agent47-active-position-retreat-veto.cjs');

const PRINTING='Iron Thorns ex TWM';
const LOCK='As long as this Pokémon is in the Active Spot, Pokémon with a Rule Box in play (both yours and your opponent\'s) have no Abilities, except for Future Pokémon.';
const DETAIL=()=>({name:'Initialization',text:LOCK});
const CATALOG={
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};

/** Generic held-Guzma owner policy: one stranded, ability-locking Active. */
function heldView(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:9,
    ownHand:['Guzma BUS'],ownTurnResources:{
      supporterPlayedTurn:0,supporterPlayLocked:false
    },
    ownPublic:{
      active:{printing:PRINTING,abilityDetails:[DETAIL()],
        energies:['Psychic Energy MEE'],
        attacks:[{name:'Charged Hit',damage:70,cost:[5],gxAttack:false}],
        publicRestrictions:{cannotAttackNextTurn:true},specialConditions:[]},
      bench:[{printing:'Other Basic TWM',energies:['Psychic Energy MEE'],
        attacks:[{name:'Reliable Hit',damage:60,cost:[5],gxAttack:false}],
        publicRestrictions:{},specialConditions:[]}],
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{bench:[{printing:'Visible opposing Pokemon'}]}
  };
}

/** Legacy Guzma generic mobility vocabulary: stranded Active and one funded Bench. */
function legacyView(){
  const cost=n=>Array(n).fill(9);
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:9,
    ownHand:['Guzma BUS'],ownTurnResources:{supporterPlayedTurn:0,
      supporterPlayLocked:false},
    ownPublic:{
      active:{printing:PRINTING,abilityDetails:[DETAIL()],
        energies:['Psychic Energy MEE'],
        attacks:[{name:'Expensive',cost:cost(4)}],
        printed:{retreatCost:cost(3)},publicRestrictions:{}},
      bench:[{printing:'Other Basic TWM',energies:['Psychic Energy MEE'],
        attacks:[{name:'Burrow',cost:[9]}],
        printed:{retreatCost:cost(1)},publicRestrictions:{}}],
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{bench:[{
      printing:'Visible opposing Pokemon',energies:[],
      printed:{retreatCost:cost(2)}
    }]}
  };
}

for(const [label,select,targetField,makeView] of [
  ['current held-Guzma mobility',chooseHeldGuzmaMobility,'benchIndex',heldView],
  ['legacy Guzma mobility',ownerGuzmaMobilityOption,'ownerBenchIndex',legacyView]
]){
  test(label+' rejects retiring Initialization into a nonlocking attacker',()=>{
    const view=makeView();
    assert.equal(wouldLoseActivePositionAbility(view,0),true);
    assert.equal(select(view,CATALOG),null);
    assert.equal(view.ownHand[0],'Guzma BUS');
  });

  test(label+' permits the identical printed Initialization handoff',()=>{
    const view=makeView(),recipient=view.ownPublic.bench[0];
    recipient.printing=PRINTING;recipient.abilityDetails=[DETAIL()];
    assert.equal(wouldLoseActivePositionAbility(view,0),false);
    const plan=select(view,CATALOG);
    assert.equal(plan?.[targetField],0);
    assert.equal(plan?.kind,
      label==='current held-Guzma mobility'?
        'play-held-guzma-mobility':'paper-unqualified-guzma-rescue-option');
  });
}

test('held-Guzma scans past a lock-losing Bench to a lock-equivalent target',()=>{
  const view=heldView();
  const replacement={...view.ownPublic.bench[0],printing:PRINTING,
    abilityDetails:[DETAIL()]};
  view.ownPublic.bench.push(replacement);
  assert.equal(wouldLoseActivePositionAbility(view,0),true);
  assert.equal(wouldLoseActivePositionAbility(view,1),false);
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG)?.benchIndex,1);
});

test('legacy Guzma mobility independently scans a second equivalent Bench',()=>{
  const view=legacyView();
  const replacement={...view.ownPublic.bench[0],printing:PRINTING,
    abilityDetails:[DETAIL()]};
  view.ownPublic.bench.push(replacement);
  assert.equal(ownerGuzmaMobilityOption(view)?.ownerBenchIndex,1);
});

test('Guzma owner-only active-lock check never reads opponent hidden data',()=>{
  const view=heldView();
  Object.defineProperty(view.opponentPublic,'hand',{
    get(){throw Error('opponent hand is not accessible');}
  });
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
});
