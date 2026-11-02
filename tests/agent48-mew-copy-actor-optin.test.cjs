'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorCopiedAttack}=require(
  '../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/**
 * Entirely detached owner-only fixture. The Store is the authority for
 * accepting or rejecting the selected, exact native Attack object.
 * @param {boolean} blocked
 * @returns {object}
 */
function originalOwnerPrompt(blocked=false){
  return {
    actor:{
      decisionKind:'owner-prompt',
      ownPublic:{active:{printing:'Mew VMAX FST'},
        publicTurnRestrictions:{gxUsed:false}},
      opponentPublic:{handCount:5}
    },
    prompt:{
      kind:'ChooseAttackPrompt',allowCancel:false,
      offered:[
        {index:0,printing:'Mew V FST',attacks:[
          {index:0,name:'Energy Mix',damage:0,
            gxAttack:false,blocked:false}]},
        {index:1,printing:'Genesect V FST',attacks:[
          {index:0,name:'Techno Blast',damage:210,
            gxAttack:false,blocked}]}
      ]
    }
  };
}

test('original default is unchanged; opt-in picks exact Genesect donor',()=>{
  const offered=originalOwnerPrompt();
  assert.deepEqual(chooseActorCopiedAttack(offered),
    {sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(offered,{
    preferMewGenesectTechnoBlast:true}),
    {sourceIndex:1,attackIndex:0});
});

test('no illegal blocked donor or unrelated active Pokémon selection',()=>{
  const blocked=originalOwnerPrompt(true);
  assert.deepEqual(chooseActorCopiedAttack(blocked,{
    preferMewGenesectTechnoBlast:true}),
    {sourceIndex:0,attackIndex:0});
  const unrelated=originalOwnerPrompt();
  unrelated.actor.ownPublic.active.printing='Mew V FST';
  assert.deepEqual(chooseActorCopiedAttack(unrelated,{
    preferMewGenesectTechnoBlast:true}),
    {sourceIndex:0,attackIndex:0});
});

test('opponent hidden identities never affect the pure chosen donor',()=>{
  const root=originalOwnerPrompt();
  const policy={preferMewGenesectTechnoBlast:true};
  const a=chooseActorCopiedAttack({...root,
    opponentHiddenHand:['NEVER_READ_THIS']},policy);
  const b=chooseActorCopiedAttack({...root,
    opponentHiddenHand:['DIFFERENT_SECRET']},policy);
  assert.deepEqual(a,b);
});
