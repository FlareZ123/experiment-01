'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  publicAcceptedRoot,firstPublicDifference,publicFailure,VERSION
}=require('../simulation/evaluation/agent3-issue25-v12-public-first-difference.cjs');

test('post-Store public-card projection cannot leak owner hands or deck cards',()=>{
  const raw={
    actionOrdinal:12,action:'PlayCardAction',turnBefore:2,playerSlot:0,
    card:'Guzma BUS 115',ownerHandBefore:['ACE SPEC','secret'],
    opponentHand:['Secret'],privateDeckOrder:['Secret'],
    cardIndexInHand:4,firstDrawnCard:'Secret'
  };
  const projected=publicAcceptedRoot(raw);
  assert.deepEqual(projected,{
    actionOrdinal:12,action:'PlayCardAction',playerSlot:0,turnBefore:2,
    publicPlayedCard:'Guzma BUS 115'
  });
  const text=JSON.stringify(projected);
  for(const forbidden of ['Secret','ownerHand','opponentHand','DeckOrder',
    'cardIndex','firstDrawnCard'])assert.ok(!text.includes(forbidden));
});

test('same PlayCardAction class but differing post-Store public cards is seen',()=>{
  const common={actionOrdinal:9,turnBefore:2,playerSlot:0,
    action:'PlayCardAction',card:'Quick Ball SSH 179'};
  const old={...common,actionOrdinal:10,card:'Guzma BUS 115'};
  const next={...common,actionOrdinal:10,card:'Float Stone PLF 99'};
  const diff=firstPublicDifference([common,old],[common,next]);
  assert.equal(diff.zeroBasedRootIndex,1);
  assert.equal(diff.baseline.action,'PlayCardAction');
  assert.equal(diff.baseline.publicPlayedCard,'Guzma BUS 115');
  assert.equal(diff.protected.publicPlayedCard,'Float Stone PLF 99');
  assert.equal(diff.identicalPreviousPublicRoots.length,1);
});

test('public root trace handles missing roots and retains safe prompt classes',()=>{
  const same={action:'PassTurnAction',turnBefore:3,playerSlot:1,actionOrdinal:7};
  const delta=firstPublicDifference([same],[same,
    {action:'ResolvePromptAction',turnBefore:3,playerSlot:1,
      pendingPrompt:'ChoosePokemonPrompt',
      chosenHiddenCard:'Private',ownerHand:['Private'],actionOrdinal:8}]);
  assert.equal(delta.zeroBasedRootIndex,1);
  assert.equal(delta.baseline,null);
  assert.equal(delta.protected.publicPromptKind,'ChoosePokemonPrompt');
  assert.ok(!JSON.stringify(delta).includes('Private'));
});

test('native error projection rejects raw exception and hidden-zone text',()=>{
  const safe=publicFailure({
    status:'engine-error',actualFirstPlayer:1,originalSourceSeat:0,
    abortActionOrdinal:11,abortFailureStage:'dispatch',
    abortActionName:'ResolvePromptAction',abortPendingPrompt:'WaitPrompt',
    nativeFailure:{message:'private opponent hand is Secret'},
    ownerHand:['Secret'],publicRootActionCount:1,
    publicRootActionsTruncated:false,publicRootActions:[{action:'PassTurnAction'}]
  });
  assert.deepEqual(safe,{
    status:'engine-error',firstPlayer:1,originalSourceSeat:0,
    nativeAbortActionOrdinal:11,nativeAbortFailureStage:'dispatch',
    nativeAbortActionName:'ResolvePromptAction',
    nativeAbortPendingPrompt:'WaitPrompt',publicRootActionsComplete:true
  });
  assert.ok(!JSON.stringify(safe).includes('Secret'));
});

test('empty public root difference and version are stable',()=>{
  assert.equal(firstPublicDifference([],[]),null);
  assert.ok(VERSION.startsWith('agent3-issue25-v12-'));
});
