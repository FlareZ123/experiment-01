'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {nativeCopiedAttackChoiceLedger}=
  require('../simulation/evaluation/agent8-native-copied-attack-choice-ledger.cjs');

function prompt(selection){
  return {
    schema:'choose-attack-reference-v1',
    promptKind:'ChooseAttackPrompt',
    message:'Choose an attack',
    sources:[{printing:'Dragapult ex TWM',attackNames:['Phantom Dive']}],
    selection
  };
}

test('reads real native source ResolvePromptAction after Apex declaration',()=>{
  const trace=[
    {playerSlot:0,action:'AttackAction',turnBefore:6,actionOrdinal:30,
      attack:'Apex Dragon',attacker:'Regidrago VSTAR'},
    {playerSlot:0,action:'ResolvePromptAction',turnBefore:6,actionOrdinal:31,
      attackChoice:prompt({printing:'Dragapult ex TWM',index:0,
        attackIndex:0,attackName:'Phantom Dive'})},
    {playerSlot:1,action:'ResolvePromptAction',turnBefore:6,actionOrdinal:32,
      attackChoice:prompt(null)}
  ];
  assert.deepEqual(nativeCopiedAttackChoiceLedger(trace,0),[{
    turn:6,actionOrdinal:31,sourceAttackActionOrdinal:30,
    sourceAttackName:'Apex Dragon',sourceAttacker:'Regidrago VSTAR',
    apexInitiationObserved:true,promptMessage:'Choose an attack',
    sourceOptions:[{printing:'Dragapult ex TWM',attackNames:['Phantom Dive']}],
    selection:{printing:'Dragapult ex TWM',sourceIndex:0,
      attackIndex:0,attackName:'Phantom Dive'}
  }]);
});

test('retains native canceled choice without calling it a selected payload',()=>{
  const trace=[
    {playerSlot:1,action:'AttackAction',turnBefore:4,actionOrdinal:10,
      attack:'Apex Dragon'},
    {playerSlot:1,action:'ResolvePromptAction',turnBefore:4,actionOrdinal:11,
      attackChoice:prompt(null)}
  ];
  const rows=nativeCopiedAttackChoiceLedger(trace,1);
  assert.equal(rows.length,1);
  assert.equal(rows[0].apexInitiationObserved,true);
  assert.equal(rows[0].selection,null);
});

test('does not attribute an unrelated turn or owner prompt to prior Apex',()=>{
  const trace=[
    {playerSlot:0,action:'AttackAction',turnBefore:2,actionOrdinal:10,
      attack:'Apex Dragon'},
    {playerSlot:0,action:'ResolvePromptAction',turnBefore:4,actionOrdinal:15,
      attackChoice:prompt(null)},
    {playerSlot:0,action:'ResolvePromptAction',turnBefore:4,actionOrdinal:16},
    {playerSlot:1,action:'ResolvePromptAction',turnBefore:4,actionOrdinal:17,
      attackChoice:prompt(null)}
  ];
  const rows=nativeCopiedAttackChoiceLedger(trace,0);
  assert.equal(rows.length,1);
  assert.equal(rows[0].sourceAttackActionOrdinal,null);
  assert.equal(rows[0].apexInitiationObserved,false);
});

test('rejects nonplayer physical source seat',()=>{
  assert.throws(()=>nativeCopiedAttackChoiceLedger([],2));
});
