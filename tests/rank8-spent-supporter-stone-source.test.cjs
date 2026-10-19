'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {stonePromptLifecycle}=
  require('../simulation/twinleaf/rank8-spent-supporter-stone-source.cjs');

test('only candidate Star Alchemy roots anchor nearby deck-search choices',()=>{
  const rows=[
    {actionOrdinal:30,turnBefore:16,playerSlot:0,
      action:'UseAbilityAction',ability:'Star Alchemy'},
    {actionOrdinal:32,turnBefore:16,playerSlot:1,
      action:'UseAbilityAction',ability:'Star Alchemy'},
    {actionOrdinal:33,turnBefore:16,playerSlot:1,
      action:'ResolvePromptAction',cardSelection:{
        sourceZone:'deck',message:'CHOOSE_CARD_TO_HAND',
        selectedCards:['Acerola BUS']
      }},
    {actionOrdinal:38,turnBefore:16,playerSlot:1,
      action:'ResolvePromptAction',cardSelection:{
        sourceZone:'hand',selectedCards:['Psychic Energy MEE']
      }},
    {actionOrdinal:46,turnBefore:18,playerSlot:1,
      action:'ResolvePromptAction',cardSelection:{
        sourceZone:'deck',selectedCards:['Crispin SCR']
      }}
  ];
  const out=stonePromptLifecycle({decisionTrace:rows});
  assert.equal(out.length,1);
  assert.equal(out[0].rootOrdinal,32);
  assert.deepEqual(out[0].candidateSubsequentChoices.map(x=>x.selectedCards),
    [['Acerola BUS']]);
  assert.equal(out[0].temporalAssociationOnly,true);
});
test('no Star activation never invents one',()=>{
  assert.deepEqual(stonePromptLifecycle({decisionTrace:[
    {playerSlot:1,action:'PassTurnAction',actionOrdinal:44}
  ]}),[]);
});
