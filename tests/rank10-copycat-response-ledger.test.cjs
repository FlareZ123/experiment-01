'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {responseLedger}=
  require('../simulation/twinleaf/rank10-copycat-response-ledger.cjs');

test('includes copied attack, opponent promotion and published Prize count',()=>{
  const before={turn:28,activePlayer:1,prizesRemaining:[3,4]};
  const after={turn:28,activePlayer:1,prizesRemaining:[3,2]};
  const trace=[
    {action:'AttackAction',before,after,
      parameters:{name:'Copycat'}},
    {action:'ResolvePromptAction',before,after,
      pendingPrompt:{kind:'ChooseAttackPrompt',playerId:202},
      promptReplayAction:{selection:{selection:{
        printing:'Dialga-GX UPR',attackName:'Shred'
      }}}},
    {action:'ResolvePromptAction',before,after,
      pendingPrompt:{kind:'ChoosePokemonPrompt',playerId:101},
      promptReplayAction:{selection:{selections:[
        {zone:'bench',playerId:101,index:2,signature:['Wobbuffet PHF']}
      ]}}},
    {action:'PassTurnAction',
      before:{turn:29,activePlayer:0,prizesRemaining:[3,2]},
      after:{turn:29,activePlayer:0,prizesRemaining:[3,2]}}
  ];
  const result=responseLedger(trace,{startOrdinal:0});
  assert.equal(result.length,4);
  assert.equal(result[0].attackingMove,'Copycat');
  assert.equal(result[1].selectedCopiedAttack,'Shred');
  assert.equal(result[2].promptPlayerId,101);
  assert.deepEqual(result[2].promotions[0].publicCards,['Wobbuffet PHF']);
  assert.deepEqual(result[0].prizesAfter,[3,2]);
});
test('never publishes hidden full prompt catalogs or unrevealed prizes',()=>{
  const hidden='SECRET_UNREVEALED_CARD_ID';
  const root={
    action:'ResolvePromptAction',
    before:{turn:28,activePlayer:1,prizesRemaining:[3,4]},
    after:{turn:28,activePlayer:1,prizesRemaining:[3,2]},
    pendingPrompt:{kind:'ChoosePrizePrompt',playerId:202},
    promptReplayAction:{selection:{
      sourceCatalog:[{signature:[hidden]}],
      selections:[{zone:'prizes',signature:[hidden]}]
    }},
    choiceReferences:{secret: hidden},
    sourceZoneSnapshot:{ownDeck:[hidden]}
  };
  const result=responseLedger([root],{startOrdinal:0});
  assert.equal(result[0].prizeCountSelected,1);
  assert.equal(JSON.stringify(result).includes(hidden),false);
  assert.equal(Object.hasOwn(result[0],'sourceCatalog'),false);
});
test('honors bounded turn horizon and fails on absent source fork',()=>{
  const row=turn=>({action:'AttackAction',
    before:{turn,activePlayer:1,prizesRemaining:[4,4]},
    after:{turn,activePlayer:1,prizesRemaining:[4,4]},
    parameters:{name:'Copycat'}});
  assert.equal(responseLedger([row(28),row(29),row(30)],
    {startOrdinal:0,horizonTurns:1}).length,2);
  assert.throws(()=>responseLedger([],{}),/ordinal/);
});


test('reads original source Store attack-choice and public Bench-promotion codecs',()=>{
  const base={turn:28,activePlayer:1,prizesRemaining:[3,4]};
  const result=responseLedger([
    {action:'ResolvePromptAction',before:base,after:base,
      pendingPrompt:{kind:'ChooseAttackPrompt',playerId:202},
      attackChoice:{
        sources:[{printing:'SECRET_OTHER_DISCARDED_DRAGON'}],
        selection:{printing:'Dialga-GX UPR',attackName:'Shred'}
      }},
    {action:'ResolvePromptAction',before:base,after:base,
      pendingPrompt:{kind:'ChoosePokemonPrompt',playerId:101},
      slotChoice:{
        sourceCatalog:[{zone:'prizes',signature:['SECRET_PRIZE']}],
        selections:[{playerId:101,zone:'bench',index:1,
          signature:['Regidrago VSTAR SIT']}]}}
  ],{startOrdinal:0});
  assert.equal(result[0].selectedSource,'Dialga-GX UPR');
  assert.equal(result[0].selectedCopiedAttack,'Shred');
  assert.deepEqual(result[1].promotions,[{
    playerId:101,zone:'bench',position:1,
    publicCards:['Regidrago VSTAR SIT']
  }]);
  assert.equal(JSON.stringify(result).includes('SECRET'),false);
});
test('source Prize selection counts never include hidden selected card identity',()=>{
  const base={turn:28,activePlayer:1,prizesRemaining:[3,2]};
  const result=responseLedger([{
    action:'ResolvePromptAction',before:base,after:base,
    pendingPrompt:{kind:'ChoosePrizePrompt',playerId:202},
    slotChoice:{sourceCatalog:[{signature:['HIDDEN_POOL']}],
      selections:[{zone:'prizes',signature:['HIDDEN_ACE_SPEC']},
        {zone:'prizes',signature:['HIDDEN_ITEM']}]}
  }],{startOrdinal:0});
  assert.equal(result[0].prizeCountSelected,2);
  assert.equal(JSON.stringify(result).includes('HIDDEN'),false);
});

test('exposes a generic real-prompt capture failure without leaking catalogs',()=>{
  const hidden='UNREVEALED_SOURCE_DECK_CARD';
  const base={turn:28,activePlayer:1,prizesRemaining:[3,4]};
  const event={
    action:'ResolvePromptAction',before:base,after:base,
    pendingPrompt:{kind:'ChooseAttackPrompt',playerId:202},
    attackChoiceCaptureError:'Selected attack is not a member of the prompt',
    choiceReferences:{hidden},
    promptSourceCatalog:[{printing:hidden}]
  };
  const out=responseLedger([event],{startOrdinal:0});
  assert.equal(out.length,1);
  assert.equal(out[0].choiceCaptureStatus,'capture-error');
  assert.equal(out[0].choiceCaptureError,
    'Selected attack is not a member of the prompt');
  assert.equal(out[0].selectedCopiedAttack,null);
  assert.equal(JSON.stringify(out).includes(hidden),false);
  const absent=responseLedger([{...event,attackChoiceCaptureError:undefined}],
    {startOrdinal:0});
  assert.equal(absent[0].choiceCaptureStatus,'absent');
});
