'use strict';
// Developmental source-policy regression: duplicate-print Bomb enumeration.
// No native Store, prompt reducer, or field game is exercised here.
const test = require('node:test');
const assert = require('node:assert/strict');
const rank9 = require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');

const POOL = [
  'Prism Energy ASC 216', 'Prism Energy ASC 216',
  'Prism Energy ASC 216', 'Prism Energy ASC 216',
  'Darkness Energy MEE 15', 'Darkness Energy MEE 15',
  'Telepathic Psychic Energy POR 88'
];

function pokemon(printing, stage='BASIC') {
  return {
    printing,
    printed: {stage, subtypes: [stage==='BASIC'?'Basic':'Stage 1']},
    hp:280, damage:0, energies:[], tools:[],
    abilityDetails:[], abilitySuppressions:[]
  };
}
function state(seat, {
  benchExtras=[
    'Sableye V SSH 120','Voltorb ROS 21','Unown AOR 30',
    'Toedscool PAR 16'
  ], energy=POOL, activeBomb=false, opponentDamage=100
}={}) {
  const attacker=pokemon('Mega Absol ex MEG 86');
  const bomb=pokemon('Electrode-GX CES 48','STAGE_1');
  return {
    actorSeat:seat, globalTurn:4,
    ownPublic:{
      active:activeBomb?bomb:attacker,
      bench:[activeBomb?attacker:bomb,...benchExtras.map(x=>pokemon(x))],
      discard:energy.slice(),prizeCount:6,stadium:[]
    },
    opponentPublic:{
      active:{...pokemon('Mega Absol ex MEG 86'),damage:opponentDamage},
      bench:[pokemon('Dedenne-GX UNB 57')],prizeCount:6,stadium:[]
    },
    ownTurnResources:{
      energyPlayedTurn:true,supporterPlayedTurn:0,retreatedTurn:false,
      itemPlayLocked:false
    }, ownHand:[]
  };
}
function planKey(plan) {
  return plan?.assignments?.map(a=>a.printing+'|'+a.zone+a.index).sort()??null;
}
function offeredBombPrompt(observation, required=5) {
  const positions=[
    {zone:'active',index:0},
    {zone:'bench',index:1},{zone:'bench',index:2},
    {zone:'bench',index:3},{zone:'bench',index:4}
  ];
  return {
    promptType:'AttachEnergyPrompt',
    source:{
      sourceKind:'card-effect',classification:'actor-choice',
      sourcePrinting:'Electrode-GX CES 48',effectName:'Extra Energy Bomb'
    },
    publicMetadata:{
      selectionType:'energy-transfers',
      minimumCount:required,maximumCount:required
    },
    choices:observation.ownPublic.discard.flatMap((printing,di)=>
      positions.map(t=>({
        kind:'energy',printing,token:`e${di}-${t.zone}${t.index}`,
        publicMetadata:{
          ownerSeat:'actor',isOwnerVisible:true,sourceZone:'discard',
          selectionIndex:di,zone:t.zone,slotIndex:t.index
        }
      }))
    )
  };
}
function policy(seat) {
  return rank9.createPolicy({
    role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
  });
}
function root(seat,o,worker) {
  return worker.decide({
    role:'opponent',seat,observation:o,prompt:null,sequence:3,
    actionFrontier:{items:[
      {
        kind:'use-ability',printing:'Electrode-GX CES 48',
        token:'root-bomb',
        publicMetadata:{
          abilityName:'Extra Energy Bomb',sourceZone:'bench',sourceIndex:0
        }
      },
      {kind:'pass',token:'root-pass'}
    ]}
  });
}
test('all recipient choices preserve a five-card nonterminal Bomb payoff',()=>{
  const o=state(0);
  const plan=rank9.bombPlanner(o,0);
  assert.ok(plan);
  assert.equal(plan.required,5);
  assert.equal(plan.score,635);
  assert.equal(plan.mobility.kind,'direct');
  assert.equal(plan.mobility.score,610);
  assert.equal(plan.immediateWin,false);
  assert.deepEqual(planKey(plan),[
    'Darkness Energy MEE 15|bench1','Darkness Energy MEE 15|bench1',
    'Prism Energy ASC 216|active0','Prism Energy ASC 216|active0',
    'Telepathic Psychic Energy POR 88|active0'
  ]);
  assert.equal(new Set(plan.assignments.map(a=>a.discardIndex)).size,5);
});
for(const seat of [0,1]) {
  test(`seat ${seat}: real policy root selects Bomb, then resolves opaque transfer tokens`,()=>{
    const o=state(seat), worker=policy(seat);
    assert.deepEqual(root(seat,o,worker),{
      kind:'select-action',token:'root-bomb'
    });
    const prompt=offeredBombPrompt(o);
    assert.deepEqual(worker.decide({
      role:'opponent',seat,observation:o,prompt,sequence:4
    }),{
      kind:'select-choices',
      tokens:[
        'e0-active0','e1-active0','e4-bench1','e5-bench1','e6-active0'
      ]
    });
  });
  test(`seat ${seat}: wrong Bomb transfer cardinality fails closed`,()=>{
    const o=state(seat),worker=policy(seat);
    assert.equal(root(seat,o,worker).token,'root-bomb');
    const decision=worker.decide({
      role:'opponent',seat,observation:o,
      prompt:offeredBombPrompt(o,4),sequence:4
    });
    assert.deepEqual(decision,{
      kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'
    });
  });
}
for(const seat of [0,1]) {
  test(`seat ${seat}: Active Electrode's Bomb transfers and promotes in sequence`,()=>{
    const o=state(seat,{activeBomb:true}),worker=policy(seat);
    const b=rank9.bombPlanner(o,-1);
    assert.ok(b);
    assert.equal(b.score,635);
    assert.equal(b.mobility.promotionIndex,0);
    assert.deepEqual(worker.decide({
      role:'opponent',seat,observation:o,prompt:null,sequence:3,
      actionFrontier:{items:[
        {
          kind:'use-ability',printing:'Electrode-GX CES 48',
          token:'active-bomb',
          publicMetadata:{abilityName:'Extra Energy Bomb',sourceZone:'active'}
        },
        {kind:'pass',token:'root-pass'}
      ]}
    }),{kind:'select-action',token:'active-bomb'});
    // The Active source KOs itself, so the transfer targets are only Bench.
    const energyPrompt=offeredBombPrompt(o);
    energyPrompt.choices=o.ownPublic.discard.flatMap((printing,di)=>
      [0,1,2,3,4].map(index=>({
        kind:'energy',printing,token:`e${di}-bench${index}`,
        publicMetadata:{
          ownerSeat:'actor',isOwnerVisible:true,sourceZone:'discard',
          selectionIndex:di,zone:'bench',slotIndex:index
        }
      }))
    );
    assert.deepEqual(worker.decide({
      role:'opponent',seat,observation:o,prompt:energyPrompt,sequence:4
    }),{
      kind:'select-choices',
      tokens:['e0-bench0','e1-bench0','e4-bench1','e5-bench1','e6-bench0']
    });
    const after={...o,ownPublic:{...o.ownPublic,active:null}};
    const promotePrompt={
      promptType:'ChoosePokemonPrompt',
      source:{
        sourceKind:'engine',sourcePrinting:null,
        effectName:'CHOOSE_NEW_ACTIVE_POKEMON',classification:'actor-choice'
      },
      publicMetadata:{
        selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false
      },
      choices:o.ownPublic.bench.map((p,index)=>({
        kind:'pokemon',printing:p.printing,token:`promote${index}`,
        publicMetadata:{
          ownerSeat:'actor',isOwnerVisible:true,
          targetZone:'bench',benchIndex:index
        }
      }))
    };
    assert.deepEqual(worker.decide({
      role:'opponent',seat,observation:after,prompt:promotePrompt,sequence:5
    }),{kind:'select-choices',tokens:['promote0']});
  });
}

test('same-print discard copies use distinct physical source indices',()=>{
  // Nonadjacent copies confirm the symmetry rule is based on printing,
  // never on adjacency in the visible discard.
  const o=state(0,{energy:[
    'Prism Energy ASC 216','Darkness Energy MEE 15',
    'Prism Energy ASC 216','Telepathic Psychic Energy POR 88',
    'Prism Energy ASC 216','Darkness Energy MEE 15',
    'Prism Energy ASC 216'
  ]});
  const plan=rank9.bombPlanner(o,0);
  assert.ok(plan);
  assert.equal(plan.required,5);
  assert.equal(plan.score,635);
  for(const a of plan.assignments) {
    assert.equal(o.ownPublic.discard[a.discardIndex],a.printing);
  }
  assert.equal(new Set(plan.assignments.map(a=>a.discardIndex)).size,5);
});
test('without discard Energy, planner does not select an impossible Bomb',()=>{
  const o=state(1,{energy:[]});
  assert.equal(rank9.bombPlanner(o,0),null);
});
