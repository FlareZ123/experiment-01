'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {preferFasterNominalCopy} =
  require('../simulation/twinleaf/agent8-public-flat-copy-turns.cjs');

/** @param {object} [options] @returns {object} */
function fixture(options={}) {
  const first = {index:0,name:'Covert Flight',damage:70,
    damageCalculation:null,blocked:false,gxAttack:false};
  const second = {index:1,name:'Phantom Dive',damage:200,
    damageCalculation:null,blocked:false,gxAttack:false};
  return {actor:{decisionKind:'owner-prompt',
    ownPublic:{publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{active:{hp:options.hp??320,damage:options.damage??0}},
    opponentHiddenHand:['SECRET_CARD']},
    prompt:{kind:'ChooseAttackPrompt',offered:[
      {index:0,printing:'Noivern ex PAL',attacks:[first]},
      {index:1,printing:'Dragapult ex TWM',attacks:[
        {index:0,name:'Jet Headbutt',damage:70,damageCalculation:null,
          blocked:false,gxAttack:false},second]}]},
    ...options.override};
}
const selected={sourceIndex:0,attackIndex:0};
test('public defender: 70 versus 200 nominal copy improves printed hit count',()=>{
  const input=fixture();
  const before=JSON.stringify(input);
  assert.deepEqual(preferFasterNominalCopy(input,selected),
    {sourceIndex:1,attackIndex:1});
  assert.equal(JSON.stringify(input),before);
});
test('no defender or invalid damage fields means unchanged',()=>{
  const x=fixture(); x.actor.opponentPublic.active=null;
  assert.equal(preferFasterNominalCopy(x,selected),null);
  x.actor.opponentPublic.active={hp:320,damage:0};
  x.prompt.offered[1].attacks[1].damage='20+';
  assert.equal(preferFasterNominalCopy(x,selected),null);
});
test('does not replace non-flat control or already-optimal choice',()=>{
  const x=fixture();
  x.prompt.offered[0].attacks[0].damageCalculation='conditional';
  assert.equal(preferFasterNominalCopy(x,selected),null);
  x.prompt.offered[0].attacks[0].damageCalculation=null;
  assert.equal(preferFasterNominalCopy(x,{sourceIndex:1,attackIndex:1}),null);
});
test('requires meaningful damage improvement and fewer nominal turns',()=>{
  const x=fixture({hp:70});
  assert.equal(preferFasterNominalCopy(x,selected),null);
  x.actor.opponentPublic.active.hp=320;
  x.prompt.offered[1].attacks[1].damage=120;
  assert.equal(preferFasterNominalCopy(x,selected),null);
});
test('genuine menu blocks and GX usage restrictions are respected',()=>{
  const x=fixture();
  x.prompt.offered[1].attacks[1].blocked=true;
  assert.equal(preferFasterNominalCopy(x,selected),null);
  x.prompt.offered[1].attacks[1].blocked=false;
  x.prompt.offered[1].attacks[1].name='Phantom-GX';
  x.actor.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(preferFasterNominalCopy(x,selected),null);
});
test('opponent concealed hand identities do not affect deterministic priority',()=>{
  const x=fixture();
  const expected=preferFasterNominalCopy(x,selected);
  x.actor.opponentHiddenHand=['DIFFERENT SECRET'];
  assert.deepEqual(preferFasterNominalCopy(x,selected),expected);
});
