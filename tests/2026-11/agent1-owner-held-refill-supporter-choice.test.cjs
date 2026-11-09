'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerHeldRefillSupporter:choose,refillMode}=
  require('../../simulation/twinleaf/agent1-owner-held-refill-supporter-choice.cjs');

/** @returns {object} Detached owner-only actor observation. */
function view(hand=["Lillie's Determination M1L",'Fog Crystal CRE']){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:hand,
    ownPublic:{prizeCount:6,deckCount:35,
      publicTurnRestrictions:{supporterPlayLocked:false}},
    ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0},
    opponentPublic:{handCount:5,deckCount:42}};
}

test('refills when Lillie is legal and the hand is low',()=>{
  assert.deepEqual(choose(view()),{kind:'play-owner-held-refill-supporter',
    handIndex:0,printing:"Lillie's Determination M1L",drawTarget:8});
  assert.equal(choose(view(['Fog Crystal CRE'])),null);
  assert.equal(choose(view(['A','B','C','D',"Lillie's Determination M1L"])),null);
});

test('chooses highest draw target under actual own Prize state',()=>{
  const v=view(['N FCO','Cynthia UPR',"Lillie's Determination M1L"]);
  assert.equal(choose(v).printing,"Lillie's Determination M1L");
  v.ownPublic.prizeCount=3;
  assert.equal(choose(v).printing,'Cynthia UPR');
  assert.equal(choose(v).drawTarget,6);
});

test('Professor Research discards only itself and never another card',()=>{
  const p="Professor's Research SVI";
  assert.deepEqual(choose(view([p])),{kind:'play-owner-held-refill-supporter',
    handIndex:0,printing:p,drawTarget:7});
  assert.equal(choose(view([p,'Unfair Stamp TWM'])),null);
  assert.equal(refillMode(p,6,2),null);
});

test('declines when Supporter used/locked, first turn or no deck',()=>{
  const v=view();
  v.globalTurn=1;assert.equal(choose(v),null);
  v.globalTurn=2;v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(choose(v),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.supporterPlayLocked=true;
  assert.equal(choose(v),null);
  v.ownTurnResources.supporterPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(choose(v),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.ownPublic.deckCount=0;
  assert.equal(choose(v),null);
});

test('does not touch opponent hidden hand, deck or Prize identities',()=>{
  const v=view();
  for(const field of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,field,{
      get(){throw Error('opponent hidden-zone read');}
    });
  assert.equal(choose(v)?.drawTarget,8);
});
