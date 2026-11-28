'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  classifyPrintedGXAttack,isMimikyuCopycatEligibleAttack,
  installCopycatMultiAttackHistory
}=require('./copycat-multiattack-history.cjs');

const restriction="(You can't use more than 1 GX attack in a game.)";
const missing=[
  ['Trevenant & Dusknoir-GX','Trevenant & Dusknoir-GX SMP',
    'Pale Moon-GX',restriction],
  ['Dedenne-GX','Dedenne GX UNB','Tingly Return-GX',restriction],
  ['Oricorio-GX','Oricorio GX CEC','Strafe-GX',restriction],
  ['Arceus & Dialga & Palkia-GX','Arceus & Dialga & Palkia GX CEC',
    'Altered Creation-GX',restriction]
];
// Same shape as actual card arrays at pinned Twinleaf commit.
// All four have printed GX restrictions but lack attack.gxAttack:true.
for(const [name,fullName,attackName,text] of missing){
  test('printed missing-flag GX is not Copycat eligible: '+attackName,()=>{
    const attack={name:attackName,text};
    assert.equal(classifyPrintedGXAttack(attack),true);
    assert.equal(classifyPrintedGXAttack({name:attackName}),true);
    assert.equal(isMimikyuCopycatEligibleAttack({
      gxAttack:false,attackName,sourceCardName:name,
      sourceCardFullName:fullName,attack
    }),false);
  });
}

test('metadata true, printed suffix, or exact rule clause each imply GX',()=>{
  assert.equal(classifyPrintedGXAttack({name:'Any Attack',gxAttack:true}),true);
  assert.equal(classifyPrintedGXAttack({name:'Some Attack-GX'}),true);
  assert.equal(classifyPrintedGXAttack({name:'Ordinary Name',text:restriction}),true);
  assert.equal(classifyPrintedGXAttack({name:'Tapu Cure-GX',gxAttack:false}),true);
});

test('non-GX Apex Dragon stays copyable; Mimikyu Copycat itself never does',()=>{
  const apex={name:'Apex Dragon',copycatAttack:true,text:'Choose an attack.'};
  const outer={attackName:'Apex Dragon',gxAttack:false,
    sourceCardName:'Regidrago VSTAR',sourceCardFullName:'Regidrago VSTAR SIT',
    attack:apex};
  assert.equal(classifyPrintedGXAttack(apex),false);
  assert.equal(isMimikyuCopycatEligibleAttack(outer),true);
  assert.equal(isMimikyuCopycatEligibleAttack({
    ...outer,sourceCardName:'Mimikyu',sourceCardFullName:'Mimikyu GRI',
    attackName:'Copycat',attack:{name:'Copycat',copycatAttack:true}
  }),false);
  assert.equal(isMimikyuCopycatEligibleAttack({
    ...outer,attack:{name:'Tingly Return-GX'},attackName:'Tingly Return-GX'
  }),false);
});

test('malformed attack with missing printed identity is unknown, not benign',()=>{
  assert.equal(classifyPrintedGXAttack({}),null);
  assert.equal(isMimikyuCopycatEligibleAttack({gxAttack:false}),false);
  assert.equal(isMimikyuCopycatEligibleAttack({gxAttack:false,
    attack:{gxAttack:false}}),false);
});

function runAttack(seat,card,attackName){
  const {AttackAction}=require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const players=[0,1].map(n=>({
    id:n===0?'seatA':'seatB',
    active:{getPokemonCard:()=>n===seat?card:null}
  }));
  const store={state:{turn:2,activePlayer:seat,players},
    dispatch(action){
      assert.ok(action instanceof AttackAction);
      this.state.turn+=1;
      this.state.activePlayer=1-seat;
      return this.state;
    }};
  const orig=store.dispatch;
  const tracker=installCopycatMultiAttackHistory(store);
  const attack=new AttackAction(players[seat].id,attackName);
  store.dispatch(attack);
  const snapshot=tracker.getPreviousTurnSnapshot(players[seat].id);
  tracker.restore();
  assert.strictEqual(store.dispatch,orig);
  assert.equal(snapshot.turn,2);
  assert.equal(snapshot.attacks.length,1);
  return {row:snapshot.attacks[0],tracker};
}

for(const seat of [0,1]){
  for(const [name,fullName,attackName,text] of missing){
    test('native-shaped AttackAction row closes GX false flag seat '+seat+
      ': '+attackName,()=>{
      const card={name,fullName,attacks:[{name:attackName,text}]};
      const {row,tracker}=runAttack(seat,card,attackName);
      assert.equal(row.gxAttack,true);
      assert.equal(row.attackName,attackName);
      assert.equal(tracker.getCopycatChoices(seat===0?'seatA':'seatB').length,0);
    });
  }
  test('native-shaped Apex AttackAction remains eligible seat '+seat,()=>{
    const card={name:'Regidrago VSTAR',fullName:'Regidrago VSTAR SIT',
      attacks:[{name:'Apex Dragon',copycatAttack:true}]};
    const {row,tracker}=runAttack(seat,card,'Apex Dragon');
    assert.equal(row.gxAttack,false);
    assert.equal(row.copycatAttack,true);
    const choices=tracker.getCopycatChoices(seat===0?'seatA':'seatB');
    assert.equal(choices.length,1);
    assert.strictEqual(choices[0].attack,row.attack);
  });
}

const alreadyFlagged=[
  'Tapu Cure-GX','Timeless-GX','Allergic Explosion-GX',
  'Cold Crush-GX','Crash and Burn-GX','Horror House-GX'
];
for(const name of alreadyFlagged){
  test('native gxAttack true remains GX under source fallback: '+name,()=>{
    assert.equal(classifyPrintedGXAttack({name,gxAttack:true}),true);
    assert.equal(isMimikyuCopycatEligibleAttack({attackName:name,
      gxAttack:false,attack:{name,gxAttack:true}}),false);
  });
}

test('Foul Play remains a non-GX copy attack, including copycatAttack:true',()=>{
  assert.equal(isMimikyuCopycatEligibleAttack({
    attackName:'Foul Play',gxAttack:false,
    sourceCardName:'Zoroark BREAK',
    attack:{name:'Foul Play',copycatAttack:true}
  }),true);
});
