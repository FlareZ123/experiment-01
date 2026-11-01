'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicAction,firstPublicRootDeviation}=
  require('../simulation/evaluation/agent41-rank6-native-plumeria-common-choice-pair.cjs');

function action(actionOrdinal,turnBefore,playerSlot,action,card){
  return {actionOrdinal,turnBefore,turnAfter:turnBefore,
    playerSlot,action,card,...(card?{}:{nativeCardId:17})};
}

test('native first differing public source action and later candidate continuation',()=>{
  const common=[action(0,0,0,'ResolvePromptAction'),
    action(1,0,1,'ResolvePromptAction'),
    action(2,1,0,'PlayCardAction','Fog Crystal')];
  const original=[...common,
    action(3,4,1,'PassTurnAction'),
    action(4,5,0,'AttackAction'),
    action(5,6,1,'PassTurnAction')];
  const intervention=[...common,
    action(3,4,1,'PlayCardAction','Plumeria'),
    action(4,4,1,'ResolvePromptAction'),
    action(5,4,1,'ResolvePromptAction'),
    action(6,4,1,'ResolvePromptAction'),
    action(7,5,0,'PassTurnAction'),
    action(8,6,1,'PassTurnAction')];
  const r=firstPublicRootDeviation(original,intervention,1);
  assert.equal(r.matchedPublicActionPrefixLength,3);
  assert.equal(r.firstControlDeviation.action,'PassTurnAction');
  assert.equal(r.firstTreatmentDeviation.card,'Plumeria');
  assert.equal(r.firstDeviationIsSourceOwned,true);
  assert.equal(r.firstOpposingCandidateContinuation.control[0].action,
    'AttackAction');
  assert.equal(r.firstOpposingCandidateContinuation.treatment[0].action,
    'PassTurnAction');
  assert.equal(r.firstSourceContinuation.control[0].turnBefore,6);
  assert.equal(r.firstSourceContinuation.treatment[0].turnBefore,6);
});

test('public root comparison excludes card identity and hidden local metadata',()=>{
  const raw=action(2,3,0,'PlayCardAction','Plumeria');
  raw.nativeCardId=44;raw.opponentFaceDownDeck=['secret'];
  const selected=publicAction(raw);
  assert.deepEqual(selected,{actionOrdinal:2,turnBefore:3,turnAfter:3,
    playerSlot:0,action:'PlayCardAction',card:'Plumeria'});
  assert.equal(JSON.stringify(selected).includes('secret'),false);
});

test('same full public ledger reports no artificial divergence',()=>{
  const log=[action(0,0,0,'ResolvePromptAction'),
    action(1,1,1,'PassTurnAction')];
  const x=firstPublicRootDeviation(log,log,1);
  assert.equal(x.matchedPublicActionPrefixLength,2);
  assert.equal(x.firstControlDeviation,null);
  assert.equal(x.firstTreatmentDeviation,null);
});

test('missing public action ledger is explicitly unverified',()=>{
  assert.equal(firstPublicRootDeviation(null,[],0),null);
  assert.equal(firstPublicRootDeviation([],undefined,0),null);
});
