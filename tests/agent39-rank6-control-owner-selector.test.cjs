'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {LUSAMINE,HANDIWORK,chooseRank6ControlRoot}=
  require('../simulation/twinleaf/agent39-rank6-control-owner-selector.cjs');

function view(hand=[LUSAMINE],discard=[HANDIWORK,LUSAMINE]){
  return {decisionKind:'owner-root',globalTurn:12,ownHand:hand,
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{active:{name:'Iron Thorns ex'},bench:[null,null,null,null,null],
      discard,deckCount:11,resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{active:{name:'Regidrago VSTAR',energies:[]},
      deckCount:20}};
}

test('owner root chooses physically held Lusamine and two discard pieces',()=>{
  assert.deepEqual(chooseRank6ControlRoot(view()),{
    kind:'lusamine-recover-distinct-loop-pair',handIndex:0,
    printing:LUSAMINE,projected:3302/4096,
    ownerDeckAtRoot:11,opponentDeckAtRoot:20
  });
});

test('physically held Handiwork has a direct root channel',()=>{
  assert.deepEqual(chooseRank6ControlRoot(view([LUSAMINE,HANDIWORK],[])),{
    kind:'handiwork-from-owner-hand',handIndex:1,printing:HANDIWORK,
    projected:3302/4096,ownerDeckAtRoot:11,opponentDeckAtRoot:20
  });
});

test('two physical recovery pieces and an unused Supporter are mandatory',()=>{
  assert.equal(chooseRank6ControlRoot(view([LUSAMINE],[HANDIWORK])),null);
  assert.equal(chooseRank6ControlRoot(view([LUSAMINE],[LUSAMINE])),null);
  const used=view();used.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseRank6ControlRoot(used),null);
  const locked=view();locked.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseRank6ControlRoot(locked),null);
  const first=view();first.globalTurn=1;
  assert.equal(chooseRank6ControlRoot(first),null);
});

test('only unenergized opponent Active with solo source Iron Thorns qualifies',()=>{
  const energized=view();energized.opponentPublic.active.energies=['Psychic Energy MEE'];
  assert.equal(chooseRank6ControlRoot(energized),null);
  const benched=view();benched.ownPublic.bench[0]={name:'Iron Thorns ex'};
  assert.equal(chooseRank6ControlRoot(benched),null);
  const swapped=view();swapped.ownPublic.active.name='Dedenne-GX';
  assert.equal(chooseRank6ControlRoot(swapped),null);
});

test('explicit projection threshold, owner draw offset, no view mutation',()=>{
  const v=view();
  assert.equal(chooseRank6ControlRoot(v,{minIllustrativeDepletion:0.81}),null);
  assert.ok(chooseRank6ControlRoot(v,{minIllustrativeDepletion:0.8}));
  const low=view();low.ownPublic.deckCount=7;
  assert.equal(chooseRank6ControlRoot(low),null);
  assert.ok(chooseRank6ControlRoot(low,{minIllustrativeDepletion:0.03}));
  assert.throws(()=>chooseRank6ControlRoot(v,{minIllustrativeDepletion:2}),RangeError);
  assert.equal(v.ownPublic.deckCount,11);
});
