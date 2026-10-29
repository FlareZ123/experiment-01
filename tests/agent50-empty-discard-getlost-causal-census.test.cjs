'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,SCHEMA}=
  require('../simulation/evaluation/agent50-empty-discard-getlost-causal-census.cjs');

/** @returns {object} */
function record(){
  const roots=Array.from({length:6},(_,i)=>({actionOrdinal:i,
    action:i===3?'AttackAction':'PassTurnAction',
    attack:i===3?'Get Lost':undefined,
    playerSlot:i===3?0:1}));
  return {trial:{id:'6:0:A:champion-reference',rank:6,
      candidateId:'champion-reference'},
    sourceSeat:1,candidateSeat:0,finished:false,
    rootActionLedger:roots,
    nativePromptChoices:{events:[{ordinal:4,turn:3,actorSeat:0,
      sourcePlayerSlot:1,sourceZone:'discard',kind:'ChooseCardsPrompt',
      sourceZoneCardCountBefore:0,selectedCards:null}]}};
}
test('native zero-target prompts match immediately preceding Get Lost root',()=>{
  const result=audit([record()]);
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.affectedArms,1);
  assert.equal(result.emptyOpponentDiscardPrompts,1);
  assert.equal(result.opponentDiscardPromptsSelectingCards,0);
  assert.equal(result.affected[0].actionCap,true);
  assert.equal(result.competitiveQualifiedGames,0);
});
test('nonempty opponent discard preserves provenance but cannot claim empty',()=>{
  const row=record();
  row.nativePromptChoices.events[0].sourceZoneCardCountBefore=3;
  row.nativePromptChoices.events[0].selectedCards=['Trainer SVI'];
  const result=audit([row]);
  assert.equal(result.emptyOpponentDiscardPrompts,0);
  assert.equal(result.nonemptyOpponentDiscardPrompts,1);
  assert.equal(result.opponentDiscardPromptsSelectingCards,1);
});
test('wrong owner, changed ordering and missing native choices fail closed',()=>{
  const x=record();
  x.rootActionLedger[3].playerSlot=1;
  assert.throws(()=>audit([x]),/Prompt must follow same owner/);
  x.rootActionLedger[3].playerSlot=0;
  x.rootActionLedger[3].attack='Mind Shock';
  assert.throws(()=>audit([x]),/Get Lost/);
  x.rootActionLedger[3].attack='Get Lost';
  x.nativePromptChoices.events[0].sourceZone='deck';
  assert.throws(()=>audit([x]),/expose every Get Lost/);
  x.nativePromptChoices.events[0].sourceZone='discard';
  x.nativePromptChoices.events[0].selectedCards=['Impossible card'];
  assert.throws(()=>audit([x]),/Zero-card native prompt selected a card/);
});
