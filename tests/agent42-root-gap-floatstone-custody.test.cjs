'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {findSettledSourceFloatStoneLines} =
  require('../simulation/evaluation/agent42-root-gap-floatstone-custody.cjs');

function fixture() {
  const active = {pokemon:'Shadow Rider Calyrex VMAX CRE',
    energies:['Psychic Energy MEE','Psychic Energy MEE'],
    tools:['Float Stone BKT']};
  const promoted = {pokemon:'Shadow Rider Calyrex VMAX CRE',
    energies:['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'],
    tools:[]};
  return {
    rootActionLedger:[
      {actionOrdinal:10,playerSlot:1,turnBefore:34,
        action:'PlayCardAction',card:'Float Stone'},
      {actionOrdinal:11,playerSlot:1,turnBefore:34,action:'RetreatAction'},
      {actionOrdinal:12,playerSlot:1,turnBefore:34,action:'UseAbilityAction'},
      {actionOrdinal:13,playerSlot:1,turnBefore:34,
        action:'ResolvePromptAction'},
      {actionOrdinal:14,playerSlot:1,turnBefore:34,action:'AttackAction',
        attack:'Max Geist'},
      {actionOrdinal:15,playerSlot:0,turnBefore:34,
        action:'ResolvePromptAction'},
      {actionOrdinal:16,playerSlot:0,turnBefore:35,
        action:'PlayCardAction',card:'Unown'}
    ],
    nativeAcceptedTargetSidecar:{events:[
      {rootActionOrdinal:10,playerSlot:1,action:'PlayCardAction',
       storeAccepted:true,declared:{ownerHandPrinting:'Float Stone BKT',
         target:{slot:1,index:0}},
       publicBoardChanges:[{seat:1,position:'active',
         before:{pokemon:active.pokemon,energies:active.energies,tools:[]},
         after:active}]},
      {rootActionOrdinal:11,playerSlot:1,action:'RetreatAction',
       storeAccepted:true,declared:{benchIndex:2},publicBoardChanges:[
         {seat:1,position:'active',before:active,after:promoted},
         {seat:1,position:'bench',index:2,before:promoted,after:active}
       ]}
    ]},
    sourceAttackSettlement:{attacks:[
      {actionOrdinal:14,attackName:'Max Geist',settledPromptChain:true,
       settlementCrossesClockReset:false,completionRootOrdinal:15,
       prizesBefore:[6,6],prizesAfter:[6,5],
       publicBoardBefore:[
         {active:{name:'Unown',energyCards:[]}},
         {active:{name:'Shadow Rider Calyrex VMAX',
           energyCards:['Psychic Energy','Psychic Energy','Psychic Energy']}}
       ]}
    ]}
  };
}
test('intervening same-turn Ability and prompt do not erase paid rescue', () => {
  const lines=findSettledSourceFloatStoneLines(fixture(),1);
  assert.equal(lines.length,1);
  assert.deepEqual(lines[0].interveningActionOrdinals,[12,13]);
  assert.equal(lines[0].prizeGain,1);
  assert.equal(lines[0].opponentFirstNonPrompt.action,'PlayCardAction');
});
test('durable extracted real source receipt survives archive expiry', () => {
  const observed=require('../results/aichi-2026/2026-11/agent42-rank1-rootgap-projected-native-fixture.json');
  const lines=findSettledSourceFloatStoneLines(observed,observed.trial.sourceSeat);
  assert.equal(observed.baselineRoot163.action,'UseAbilityAction');
  assert.equal(lines.length,1);
  assert.equal(lines[0].toolOrdinal,163);
  assert.equal(lines[0].retreatOrdinal,164);
  assert.equal(lines[0].attackOrdinal,168);
  assert.deepEqual(lines[0].interveningActionOrdinals,[165,166,167]);
  assert.equal(lines[0].prizeGain,1);
  assert.equal(lines[0].opponentFirstNonPrompt.actionOrdinal,174);
  assert.deepEqual(observed.sameBenchIndexTypedDoorPrompts.map(p=>p.benchIndex),[2,2]);
});
test('later native source Prize trajectory is stored without paper promotion', () => {
  const observed=require('../results/aichi-2026/2026-11/agent42-rank1-rootgap-projected-native-fixture.json');
  const settled=observed.sourceMaxGeistPrizeFollowthrough;
  assert.deepEqual(settled.map(a=>a.actionOrdinal),[168,179,191,202]);
  assert.equal(settled.reduce((sum,a)=>
    sum+a.sourcePrizesBefore-a.sourcePrizesAfter,0),6);
  assert.equal(observed.nativeTerminal.finished,true);
  assert.equal(observed.nativeTerminal.winnerSeat,1);
  assert.deepEqual(observed.nativeTerminal.finalPrizes,[6,0]);
});
test('durable genuine prior retrospective root172-174 still settles', () => {
  const observed=require('../results/aichi-2026/2026-11/agent42-rank1-retrospective-paid-chain-fixture.json');
  const lines=findSettledSourceFloatStoneLines(observed,observed.trial.sourceSeat);
  assert.equal(lines.length,1);
  assert.equal(lines[0].toolOrdinal,172);
  assert.equal(lines[0].retreatOrdinal,173);
  assert.equal(lines[0].attackOrdinal,174);
  assert.deepEqual(lines[0].interveningActionOrdinals,[]);
  assert.equal(lines[0].prizeGain,2);
  assert.equal(lines[0].opponentFirstNonPrompt.actionOrdinal,180);
});
test('older consecutive-root native witness is still recognized', () => {
  const r=fixture();
  r.rootActionLedger.splice(2,2);
  const lines=findSettledSourceFloatStoneLines(r,1);
  assert.equal(lines.length,1);
  assert.deepEqual(lines[0].interveningActionOrdinals,[]);
});
test('prompt alone cannot qualify as substantive opponent response', () => {
  const r=fixture();r.rootActionLedger.pop();
  const lines=findSettledSourceFloatStoneLines(r,1);
  assert.equal(lines.length,1);
  assert.equal(lines[0].opponentFirstNonPrompt,null);
});
test('Store-rejected Tool cannot become a paid chain', () => {
  const r=fixture();r.nativeAcceptedTargetSidecar.events[0].storeAccepted=false;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('unpaid or unrecorded Retreat cannot become a paid chain', () => {
  const r=fixture();r.nativeAcceptedTargetSidecar.events[1].storeAccepted=false;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('declared Tool Active target must match real source physical seat', () => {
  const r=fixture();
  r.nativeAcceptedTargetSidecar.events[0].declared.target.slot=0;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('Retreat Bench target index must match accepted public board swap', () => {
  const r=fixture();
  r.nativeAcceptedTargetSidecar.events[1].declared.benchIndex=4;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('unsettled attack and clock reset must not qualify', () => {
  const r=fixture();r.sourceAttackSettlement.attacks[0].settledPromptChain=false;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
  r.sourceAttackSettlement.attacks[0].settledPromptChain=true;
  r.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('missing or decreasing evidence of source Prize payment is rejected', () => {
  const r=fixture();
  const packet=r.sourceAttackSettlement.attacks[0];
  delete packet.prizesBefore;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
  packet.prizesBefore=[6,4];
  packet.prizesAfter=[6,5];
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('missing or retrograde attack completion root fails closed', () => {
  const r=fixture();
  const packet=r.sourceAttackSettlement.attacks[0];
  delete packet.completionRootOrdinal;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
  packet.completionRootOrdinal=13;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('intervening public Active change invalidates presumed custody', () => {
  const r=fixture();
  r.nativeAcceptedTargetSidecar.events.push({
    rootActionOrdinal:12,playerSlot:1,action:'PlayCardAction',
    storeAccepted:true,publicBoardChanges:[{
      seat:1,position:'active',
      before:{pokemon:'Shadow Rider Calyrex VMAX CRE',energies:[]},
      after:{pokemon:'Shadow Rider Calyrex VMAX CRE',
        energies:['Psychic Energy MEE']}
    }]
  });
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('attack on a later turn cannot be attributed to current Tool/Retreat', () => {
  const r=fixture();r.rootActionLedger[4].turnBefore=36;
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('Tool on a different Pokémon fails same-physical-board custody', () => {
  const r=fixture();
  const change=r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0];
  change.after={...change.after,energies:['Psychic Energy MEE']};
  assert.equal(findSettledSourceFloatStoneLines(r,1).length,0);
});
test('symmetry: physical source in seat zero preserves settlement and reply', () => {
  const r=fixture();
  for(const root of r.rootActionLedger)root.playerSlot=1-root.playerSlot;
  for(const event of r.nativeAcceptedTargetSidecar.events){
    event.playerSlot=0;
    if(event.declared.target)event.declared.target.slot=0;
    for(const change of event.publicBoardChanges)change.seat=0;
  }
  const packet=r.sourceAttackSettlement.attacks[0];
  packet.publicBoardBefore.reverse();
  packet.prizesBefore.reverse();
  packet.prizesAfter.reverse();
  const lines=findSettledSourceFloatStoneLines(r,0);
  assert.equal(lines.length,1);
  assert.equal(lines[0].prizeGain,1);
  assert.equal(lines[0].opponentFirstNonPrompt.playerSlot,1);
});
test('source player seat must be explicit', () => {
  assert.throws(()=>findSettledSourceFloatStoneLines(fixture(),null),TypeError);
});
